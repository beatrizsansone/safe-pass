'use server';
import { z } from 'zod';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { digest, hashPassword, newToken, verifyPassword } from '@/lib/password';
import { createSession, rateLimit, requireUser } from './auth';
import { brandScope, requireBrand, requireCRM, requireProject } from './access';
import { projectStatuses, taskStatuses } from '@/lib/format';
export type Result = { error?: string; success?: string };
const text = z.string().trim().max(5000);
const name = z.string().trim().min(2, 'Use pelo menos 2 caracteres.').max(160);
const uuid = z.string().uuid();
const email = z.string().trim().toLowerCase().email('E-mail inválido.').max(254);
const optionalEmail = z.union([email, z.literal('')]);
const optionalUrl = z.union([
  z.url().refine((v) => /^https?:\/\//.test(v), 'Use http ou https.'),
  z.literal(''),
]);
const data = (f: FormData) => Object.fromEntries(f.entries());
async function mutation(run: () => Promise<void>): Promise<Result> {
  try {
    await run();
    refresh();
    return { success: 'Dados salvos com sucesso.' };
  } catch (e) {
    if (e instanceof z.ZodError) return { error: e.issues[0].message };
    console.error('Operação de negócio recusada ou indisponível.');
    return { error: 'Não foi possível salvar. Verifique os dados e sua permissão.' };
  }
}
export async function login(_: Result, f: FormData): Promise<Result> {
  const parsed = z.object({ email, password: z.string().min(1).max(256) }).safeParse(data(f));
  if (!parsed.success) return { error: 'Confira o e-mail e a senha.' };
  const p = parsed.data;
  if (!(await rateLimit('login:' + p.email)))
    return { error: 'Muitas tentativas. Aguarde 15 minutos.' };
  const u = await db.user.findUnique({ where: { email: p.email } });
  // Run the expensive hash even for unknown e-mails to reduce account enumeration.
  const valid = await verifyPassword(
    p.password,
    u?.passwordHash ?? 'scrypt:00000000000000000000000000000000:' + '0'.repeat(128),
  );
  if (!u || !valid || !u.active) return { error: 'E-mail ou senha inválidos.' };
  await createSession(u.id);
  redirect('/');
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get('offgrid_session')?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: digest(token) } });
  jar.delete('offgrid_session');
  redirect('/login');
}
export async function requestReset(_: Result, f: FormData): Promise<Result> {
  const parsed = email.safeParse(f.get('email'));
  const generic = {
    success: 'Se o e-mail estiver cadastrado, você receberá instruções de recuperação.',
  };
  if (!parsed.success) return { error: 'Informe um e-mail válido.' };
  if (!(await rateLimit('reset:' + parsed.data, 3))) return generic;
  const u = await db.user.findUnique({ where: { email: parsed.data } });
  if (!u || !u.active) return generic;
  if (!process.env.SMTP_URL || !process.env.MAIL_FROM) {
    console.error('Recuperação indisponível: configure SMTP_URL e MAIL_FROM.');
    return generic;
  }
  const token = newToken();
  await db.passwordReset.create({
    data: {
      userId: u.id,
      tokenHash: digest(token),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
  try {
    await nodemailer.createTransport(process.env.SMTP_URL).sendMail({
      from: process.env.MAIL_FROM,
      to: u.email,
      subject: 'OFFGRID · Recuperação de acesso',
      text: `Para redefinir sua senha, acesse ${process.env.APP_URL}/redefinir?token=${token}\nO link expira em 30 minutos. Se não solicitou, ignore esta mensagem.`,
    });
  } catch {
    console.error('Falha no envio da recuperação.');
    await db.passwordReset.deleteMany({ where: { tokenHash: digest(token) } });
  }
  return generic;
}
export async function resetPassword(_: Result, f: FormData): Promise<Result> {
  const p = z
    .object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: z.string().min(12).max(128) })
    .safeParse(data(f));
  if (!p.success) return { error: 'Confira o link e use uma senha de 12 a 128 caracteres.' };
  if (!(await rateLimit('consume:' + p.data.token))) return { error: 'Muitas tentativas.' };
  const passwordHash = await hashPassword(p.data.password);
  try {
    await db.$transaction(async (tx) => {
      const reset = await tx.passwordReset.findUnique({
        where: { tokenHash: digest(p.data.token) },
      });
      if (!reset || reset.expiresAt < new Date()) throw new Error('expired');
      await tx.passwordReset.delete({ where: { id: reset.id } });
      await tx.user.update({ where: { id: reset.userId }, data: { passwordHash } });
      await tx.session.deleteMany({ where: { userId: reset.userId } });
      await tx.passwordReset.deleteMany({ where: { userId: reset.userId } });
    });
  } catch {
    return { error: 'Link inválido, expirado ou já utilizado.' };
  }
  return { success: 'Senha atualizada. Você já pode entrar.' };
}
export async function saveBrand(_: Result, f: FormData) {
  return mutation(async () => {
    const u = await requireCRM();
    const p = z
      .object({
        name,
        legalName: text,
        cnpj: z.string().trim().max(18),
        segment: text,
        website: optionalUrl,
        instagram: text,
        email: optionalEmail,
        phone: text,
        city: text,
        notes: text,
      })
      .parse(data(f));
    await db.$transaction(async (tx) => {
      const b = await tx.brand.create({ data: { ...p, ownerId: u.id } });
      await tx.activity.create({
        data: { actorId: u.id, entityId: b.id, action: 'Marca cadastrada' },
      });
    });
  });
}
export async function archiveBrand(_: Result, f: FormData) {
  return mutation(async () => {
    const id = uuid.parse(f.get('id'));
    const { u } = await requireBrand(id);
    if (f.get('confirm') !== 'on') throw new Error('confirm');
    await db.$transaction(async (tx) => {
      await tx.brand.update({ where: { id }, data: { archivedAt: new Date() } });
      await tx.activity.create({
        data: { actorId: u.id, entityId: id, action: 'Marca arquivada' },
      });
    });
  });
}
export async function saveContact(_: Result, f: FormData) {
  return mutation(async () => {
    const p = z
      .object({ brandId: uuid, name, title: text, email: optionalEmail, phone: text })
      .parse(data(f));
    const { u } = await requireBrand(p.brandId);
    await db.$transaction(async (tx) => {
      const c = await tx.contact.create({ data: p });
      await tx.activity.create({
        data: { actorId: u.id, entityId: c.id, action: 'Contato cadastrado' },
      });
    });
  });
}
export async function saveOpportunity(_: Result, f: FormData) {
  return mutation(async () => {
    const p = z.object({ brandId: uuid, title: name, notes: text }).parse(data(f));
    const { u } = await requireBrand(p.brandId);
    await db.$transaction(async (tx) => {
      const o = await tx.opportunity.create({ data: p });
      await tx.activity.create({
        data: { actorId: u.id, entityId: o.id, action: 'Oportunidade criada' },
      });
    });
  });
}
export async function moveOpportunity(_: Result, f: FormData) {
  return mutation(async () => {
    const id = uuid.parse(f.get('id'));
    const stage = z.coerce.number().int().min(0).max(11).parse(f.get('stage'));
    const u = await requireCRM();
    const o = await db.opportunity.findFirst({
      where: { id, brand: { ...brandScope(u), archivedAt: null } },
    });
    if (!o) throw new Error('denied');
    await db.$transaction(async (tx) => {
      await tx.opportunity.update({ where: { id }, data: { stage } });
      await tx.activity.create({
        data: {
          actorId: u.id,
          entityId: id,
          action: `Etapa comercial alterada: ${o.stage} → ${stage}`,
        },
      });
    });
  });
}
export async function saveBriefing(_: Result, f: FormData) {
  return mutation(async () => {
    const p = z
      .object({
        opportunityId: uuid,
        objective: name,
        audience: text,
        experience: text,
        city: text,
        references: text,
        restrictions: text,
        notes: text,
        status: z.enum(['Rascunho', 'Recebido', 'Incompleto', 'Validado']),
      })
      .parse(data(f));
    const u = await requireCRM();
    const o = await db.opportunity.findFirst({
      where: { id: p.opportunityId, brand: { ...brandScope(u), archivedAt: null } },
    });
    if (!o) throw new Error('denied');
    await db.$transaction(async (tx) => {
      await tx.briefing.upsert({ where: { opportunityId: p.opportunityId }, create: p, update: p });
      await tx.activity.create({
        data: { actorId: u.id, entityId: o.id, action: `Briefing salvo: ${p.status}` },
      });
    });
  });
}
export async function saveMeeting(_: Result, f: FormData) {
  return mutation(async () => {
    const p = z
      .object({
        opportunityId: uuid,
        title: name,
        startsAt: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
          .refine((v) => !Number.isNaN(Date.parse(v + '-03:00')), 'Data inválida.'),
        notes: text,
      })
      .parse(data(f));
    const u = await requireCRM();
    const o = await db.opportunity.findFirst({
      where: { id: p.opportunityId, brand: { ...brandScope(u), archivedAt: null } },
    });
    if (!o) throw new Error('denied');
    await db.$transaction(async (tx) => {
      await tx.meeting.create({ data: { ...p, startsAt: new Date(p.startsAt + '-03:00') } });
      await tx.activity.create({
        data: { actorId: u.id, entityId: o.id, action: 'Reunião registrada' },
      });
    });
  });
}
export async function saveProject(_: Result, f: FormData) {
  return mutation(async () => {
    const p = z.object({ brandId: uuid, name, description: text, location: text }).parse(data(f));
    const { u } = await requireBrand(p.brandId);
    await db.$transaction(async (tx) => {
      const pr = await tx.project.create({
        data: { ...p, members: { create: { userId: u.id, canManage: true, canFinance: true } } },
      });
      await tx.activity.create({
        data: { actorId: u.id, entityId: pr.id, action: 'Projeto criado' },
      });
    });
  });
}
export async function updateProject(_: Result, f: FormData) {
  return mutation(async () => {
    const p = z
      .object({ id: uuid, status: z.enum(projectStatuses as [string, ...string[]]) })
      .parse(data(f));
    const { u } = await requireProject(p.id, true);
    await db.$transaction(async (tx) => {
      await tx.project.update({ where: { id: p.id }, data: { status: p.status } });
      await tx.activity.create({
        data: { actorId: u.id, entityId: p.id, action: `Status de projeto: ${p.status}` },
      });
    });
  });
}
export async function saveTask(_: Result, f: FormData) {
  return mutation(async () => {
    const p = z
      .object({
        projectId: uuid,
        title: name,
        description: text,
        priority: z.enum(['Baixa', 'Normal', 'Alta']),
      })
      .parse(data(f));
    const { u } = await requireProject(p.projectId, true);
    await db.$transaction(async (tx) => {
      const t = await tx.task.create({ data: p });
      await tx.activity.create({
        data: { actorId: u.id, entityId: t.id, action: 'Tarefa criada' },
      });
    });
  });
}
export async function updateTask(_: Result, f: FormData) {
  return mutation(async () => {
    const id = uuid.parse(f.get('id'));
    const status = z.enum(taskStatuses as [string, ...string[]]).parse(f.get('status'));
    const task = await db.task.findUnique({ where: { id } });
    if (!task) throw new Error('missing');
    const { u } = await requireProject(task.projectId, true);
    await db.$transaction(async (tx) => {
      await tx.task.update({ where: { id }, data: { status } });
      await tx.activity.create({
        data: { actorId: u.id, entityId: id, action: `Tarefa: ${status}` },
      });
    });
  });
}
export async function createUser(_: Result, f: FormData) {
  return mutation(async () => {
    const u = await requireUser();
    if (u.role !== 'ADMIN') throw new Error('denied');
    const p = z
      .object({
        name,
        email,
        password: z.string().min(12).max(128),
        role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'FREELANCER', 'CLIENT']),
      })
      .parse(data(f));
    const passwordHash = await hashPassword(p.password);
    await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { name: p.name, email: p.email, role: p.role, passwordHash },
      });
      await tx.activity.create({
        data: { actorId: u.id, entityId: created.id, action: 'Usuário criado' },
      });
    });
  });
}
export async function assignMember(_: Result, f: FormData) {
  return mutation(async () => {
    const p = z.object({ projectId: uuid, userId: uuid }).parse(data(f));
    const { u } = await requireProject(p.projectId, true);
    const target = await db.user.findUnique({ where: { id: p.userId } });
    if (!target || !target.active || target.role === 'CLIENT') throw new Error('denied');
    if (u.role !== 'ADMIN' && target.role === 'ADMIN') throw new Error('denied');
    // Only an administrator may grant internal management/finance access.
    const canManage =
      u.role === 'ADMIN' && target.role === 'PROJECT_MANAGER' && f.get('canManage') === 'on';
    const canFinance = canManage && f.get('canFinance') === 'on';
    await db.$transaction(async (tx) => {
      await tx.projectMember.upsert({
        where: { userId_projectId: p },
        create: { ...p, canManage, canFinance },
        update: { canManage, canFinance },
      });
      await tx.activity.create({
        data: { actorId: u.id, entityId: p.projectId, action: 'Permissões de membro atualizadas' },
      });
    });
  });
}
