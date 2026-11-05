import 'server-only';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser } from './auth';
import { canCRM, canManageProject } from '@/lib/permissions';
import type { Actor } from '@/lib/permissions';
export const brandScope = (u: Actor) => (u.role === 'ADMIN' ? {} : { ownerId: u.id });
export const projectScope = (u: Actor) =>
  u.role === 'ADMIN'
    ? {}
    : u.role === 'CLIENT'
      ? { id: '00000000-0000-0000-0000-000000000000' }
      : { members: { some: { userId: u.id } } };
export async function requireCRM() {
  const u = await requireUser();
  if (!canCRM(u)) notFound();
  return u;
}
export async function requireBrand(id: string) {
  const u = await requireCRM();
  const brand = await db.brand.findFirst({ where: { id, ...brandScope(u), archivedAt: null } });
  if (!brand) notFound();
  return { u, brand };
}
export async function requireProject(id: string, manage = false) {
  const u = await requireUser();
  const project = await db.project.findFirst({
    where: { id, ...projectScope(u), archivedAt: null },
    include: { members: true },
  });
  if (!project || (manage && !canManageProject(u, project.members))) notFound();
  return { u, project };
}
