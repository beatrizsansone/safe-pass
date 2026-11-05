import 'dotenv/config';
import { test, expect, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'node:crypto';
import { hashPassword, digest } from '../../src/lib/password';
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const suffix = randomUUID();
const password = 'Teste-' + randomUUID();
let adminId: string,
  managerId: string,
  clientId: string,
  freeId: string,
  hiddenBrandId: string,
  hiddenProjectId: string;
const emails = {
  admin: `admin-${suffix}@example.test`,
  manager: `manager-${suffix}@example.test`,
  client: `client-${suffix}@example.test`,
  free: `free-${suffix}@example.test`,
};
async function login(page: Page, kind: keyof typeof emails = 'admin', pass = password) {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(emails[kind]);
  await page.getByLabel('Senha', { exact: true }).fill(pass);
  await page.getByRole('button', { name: 'Entrar no workspace' }).click();
  await expect(page.getByRole('heading', { name: /Olá,/ })).toBeVisible();
}
test.beforeAll(async () => {
  const passwordHash = await hashPassword(password);
  for (const [kind, role] of [
    ['admin', 'ADMIN'],
    ['manager', 'PROJECT_MANAGER'],
    ['client', 'CLIENT'],
    ['free', 'FREELANCER'],
  ] as const) {
    const u = await db.user.create({
      data: { name: `Teste ${kind}`, email: emails[kind], passwordHash, role },
    });
    if (kind === 'admin') adminId = u.id;
    if (kind === 'manager') managerId = u.id;
    if (kind === 'client') clientId = u.id;
    if (kind === 'free') freeId = u.id;
  }
  const brand = await db.brand.create({ data: { name: `Sigilosa-${suffix}`, ownerId: adminId } });
  hiddenBrandId = brand.id;
  const p = await db.project.create({ data: { name: `Privado-${suffix}`, brandId: brand.id } });
  hiddenProjectId = p.id;
});
test.afterAll(async () => {
  const ids = [adminId, managerId, clientId, freeId].filter(Boolean);
  const brands = await db.brand.findMany({ where: { ownerId: { in: ids } }, select: { id: true } });
  const bs = brands.map((b) => b.id);
  const projects = await db.project.findMany({
    where: { brandId: { in: bs } },
    select: { id: true },
  });
  const ps = projects.map((p) => p.id);
  const os = await db.opportunity.findMany({
    where: { brandId: { in: bs } },
    select: { id: true },
  });
  const oi = os.map((o) => o.id);
  await db.$transaction([
    db.task.deleteMany({ where: { projectId: { in: ps } } }),
    db.projectMember.deleteMany({ where: { projectId: { in: ps } } }),
    db.project.deleteMany({ where: { id: { in: ps } } }),
    db.meeting.deleteMany({ where: { opportunityId: { in: oi } } }),
    db.briefing.deleteMany({ where: { opportunityId: { in: oi } } }),
    db.opportunity.deleteMany({ where: { id: { in: oi } } }),
    db.contact.deleteMany({ where: { brandId: { in: bs } } }),
    db.brand.deleteMany({ where: { id: { in: bs } } }),
    db.activity.deleteMany({ where: { actorId: { in: ids } } }),
    db.user.deleteMany({ where: { id: { in: ids } } }),
  ]);
  await db.$disconnect();
});
test('visitante é redirecionado para login', async ({ page }) => {
  await page.goto('/projetos');
  await expect(page).toHaveURL(/login/);
});
test('login, marca, contato, oportunidade, briefing, projeto e tarefa persistem', async ({
  page,
}) => {
  await login(page);
  await page.goto('/marcas');
  await page.getByText('+ Cadastrar marca', { exact: true }).click();
  await page.getByLabel('Nome comercial').fill(`Aurora-${suffix}`);
  await page.getByLabel('Segmento', { exact: true }).fill('Wellness');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Dados salvos com sucesso.');
  await page.reload();
  await page.getByRole('link', { name: `Aurora-${suffix}`, exact: true }).click();
  await page.getByText('+ Novo contato', { exact: true }).click();
  await page.getByLabel('Nome', { exact: true }).fill('Ana Brand');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText('Ana Brand', { exact: true })).toBeVisible();
  await page.goto('/crm');
  await page.getByText('+ Nova oportunidade', { exact: true }).click();
  await page.getByLabel('Marca', { exact: true }).selectOption({ label: `Aurora-${suffix}` });
  await page.getByLabel('Título', { exact: true }).fill(`Pilates-${suffix}`);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  const card = page.locator('.kanban-card').filter({ hasText: `Pilates-${suffix}` });
  await card.getByLabel('Etapa', { exact: true }).selectOption('5');
  await card.getByRole('button', { name: 'Mover' }).click();
  await page.getByRole('link', { name: `Pilates-${suffix}`, exact: true }).click();
  await page.getByLabel('Objetivo do evento').fill('Conectar a comunidade wellness');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Dados salvos com sucesso.');
  await page.reload();
  await expect(page.getByLabel('Objetivo do evento')).toHaveValue('Conectar a comunidade wellness');
  await page.getByText('+ Registrar reunião', { exact: true }).click();
  const meetingForm = page
    .locator('form')
    .filter({ has: page.getByLabel('Data e hora (Brasília)') });
  await meetingForm.getByLabel('Título', { exact: true }).fill(`Alinhamento-${suffix}`);
  await meetingForm
    .getByLabel('Data e hora (Brasília)')
    .fill(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  await meetingForm.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(meetingForm.locator('.success')).toHaveText('Dados salvos com sucesso.');
  await page.goto('/calendario');
  await expect(page.getByText(`Alinhamento-${suffix}`, { exact: true })).toBeVisible();
  await page.goto('/projetos');
  await page.getByText('+ Criar projeto', { exact: true }).click();
  await page.getByLabel('Marca', { exact: true }).selectOption({ label: `Aurora-${suffix}` });
  await page.getByLabel('Nome do projeto').fill(`Glow-${suffix}`);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page
    .getByRole('link')
    .filter({ hasText: `Glow-${suffix}` })
    .click();
  await page.getByText('+ Nova tarefa', { exact: true }).click();
  await page.getByLabel('Título', { exact: true }).fill('Confirmar espaço');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.locator('.form .success')).toHaveText('Dados salvos com sucesso.');
  await page.reload();
  await expect(page.getByText('Confirmar espaço', { exact: true })).toBeVisible();
  await page.getByLabel('Status da tarefa').selectOption('Concluída');
  await page.getByRole('button', { name: 'Atualizar', exact: true }).click();
  await expect(page.locator('.inline-form .success')).toHaveText('Dados salvos com sucesso.');
  await page.reload();
  await expect(page.getByLabel('Status da tarefa')).toHaveValue('Concluída');
});
test('gestor não lê nem altera marca de outro responsável', async ({ page }) => {
  await login(page, 'manager');
  await page.goto('/marcas');
  await expect(page.getByText(`Sigilosa-${suffix}`)).toHaveCount(0);
  await page.goto(`/marcas/${hiddenBrandId}`);
  await expect(page.getByText(`Sigilosa-${suffix}`)).toHaveCount(0);
});
test('freelancer não acessa projeto sem autorização, inclusive por URL direta', async ({
  page,
}) => {
  await login(page, 'free');
  await page.goto(`/projetos/${hiddenProjectId}`);
  await expect(page.getByText(`Privado-${suffix}`)).toHaveCount(0);
});
test('cliente não acessa dados de outra marca ou projetos internos', async ({ page }) => {
  await login(page, 'client');
  await page.goto('/projetos');
  await expect(page.getByText(`Privado-${suffix}`)).toHaveCount(0);
  await page.goto(`/marcas/${hiddenBrandId}`);
  await expect(page.getByText(`Sigilosa-${suffix}`)).toHaveCount(0);
});
test('recuperação usa token único e invalida sessões', async ({ page }) => {
  const raw = randomUUID().replaceAll('-', '').repeat(2);
  await db.passwordReset.create({
    data: { tokenHash: digest(raw), userId: clientId, expiresAt: new Date(Date.now() + 60000) },
  });
  await login(page, 'client');
  await page.goto(`/redefinir?token=${raw}`);
  await page.getByLabel('Senha (mínimo 12 caracteres)').fill(password + '-novo');
  await page.getByRole('button', { name: 'Redefinir senha' }).click();
  await expect(page.getByRole('status')).toContainText('Senha atualizada');
  await page.goto('/');
  await expect(page).toHaveURL(/login/);
  await page.goto(`/redefinir?token=${raw}`);
  await page.getByLabel('Senha (mínimo 12 caracteres)').fill(password + '-novo');
  await page.getByRole('button', { name: 'Redefinir senha' }).click();
  await expect(page.locator('.feedback[role=alert]')).toContainText('já utilizado');
});
test('interface móvel mantém navegação e formulário acessíveis', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.goto('/marcas');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('servidor recusa IDs de projeto adulterados em formulários', async ({ page }) => {
  const brand = await db.brand.create({ data: { name: `Gestor-${suffix}`, ownerId: managerId } });
  const project = await db.project.create({
    data: {
      name: `Autorizado-${suffix}`,
      brandId: brand.id,
      members: { create: { userId: managerId, canManage: true } },
    },
  });
  await login(page, 'manager');
  await page.goto(`/projetos/${project.id}`);
  await page.getByText('+ Nova tarefa', { exact: true }).click();
  await page.getByLabel('Título', { exact: true }).fill(`Adulterada-${suffix}`);
  await page.locator('input[name=projectId]').evaluate((el, target) => {
    (el as HTMLInputElement).value = target;
  }, hiddenProjectId);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.locator('.feedback[role=alert]')).toContainText('Não foi possível salvar');
  expect(await db.task.count({ where: { title: `Adulterada-${suffix}` } })).toBe(0);
});

test('cookie de sessão é HttpOnly e logout revoga o token no banco', async ({ page, context }) => {
  await login(page);
  const cookie = (await context.cookies()).find((c) => c.name === 'offgrid_session');
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe('Lax');
  expect(cookie).toBeDefined();
  const hash = digest(cookie!.value);
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(/login/);
  expect(await db.session.count({ where: { tokenHash: hash } })).toBe(0);
  await context.addCookies([
    { name: 'offgrid_session', value: cookie!.value, domain: '127.0.0.1', path: '/' },
  ]);
  await page.goto('/');
  await expect(page).toHaveURL(/login/);
});
