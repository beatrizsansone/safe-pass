import type { Role } from '@prisma/client';
export type Actor = { id: string; role: Role };
export const canCRM = (user: Actor) => user.role === 'ADMIN' || user.role === 'PROJECT_MANAGER';
export function canProject(
  user: Actor,
  members: { userId: string; canManage: boolean; canFinance: boolean }[],
) {
  return (
    user.role === 'ADMIN' || (user.role !== 'CLIENT' && members.some((m) => m.userId === user.id))
  );
}
export function canManageProject(
  user: Actor,
  members: { userId: string; canManage: boolean; canFinance: boolean }[],
) {
  return (
    user.role === 'ADMIN' ||
    (user.role === 'PROJECT_MANAGER' && members.some((m) => m.userId === user.id && m.canManage))
  );
}
export function canFinance(user: Actor, members: { userId: string; canFinance: boolean }[]) {
  return (
    user.role === 'ADMIN' ||
    (user.role === 'PROJECT_MANAGER' && members.some((m) => m.userId === user.id && m.canFinance))
  );
}
