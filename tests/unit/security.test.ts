import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, digest, newToken } from '../../src/lib/password';
import { canProject, canFinance, canManageProject, canCRM } from '../../src/lib/permissions';
import type { Role } from '@prisma/client';
describe('senhas e tokens', () => {
  it('usa salt único e verifica sem armazenar a senha', async () => {
    const a = await hashPassword('senha-longa-e-única');
    const b = await hashPassword('senha-longa-e-única');
    expect(a).not.toBe(b);
    expect(a).not.toContain('senha-longa');
    expect(await verifyPassword('senha-longa-e-única', a)).toBe(true);
    expect(await verifyPassword('incorreta', a)).toBe(false);
  });
  it('rejeita hashes inválidos', async () => {
    expect(await verifyPassword('x', 'inválido')).toBe(false);
  });
  it('gera tokens aleatórios e hash irreversível', () => {
    const a = newToken();
    expect(a).toHaveLength(64);
    expect(a).not.toBe(newToken());
    expect(digest(a)).not.toBe(a);
  });
});
describe('políticas de acesso', () => {
  const member = { userId: 'user', canManage: true, canFinance: true };
  it.each(['TEAM_MEMBER', 'FREELANCER', 'CLIENT'] as Role[])(
    '%s não acessa financeiro nem CRM',
    (role) => {
      const u = { id: 'user', role };
      expect(canFinance(u, [member])).toBe(false);
      expect(canCRM(u)).toBe(false);
      expect(canManageProject(u, [member])).toBe(false);
    },
  );
  it('freelancer não acessa projeto sem atribuição', () => {
    expect(canProject({ id: 'other', role: 'FREELANCER' }, [member])).toBe(false);
    expect(canProject({ id: 'user', role: 'FREELANCER' }, [member])).toBe(true);
  });
  it('cliente nunca recebe projeto interno por associação acidental', () => {
    expect(canProject({ id: 'user', role: 'CLIENT' }, [member])).toBe(false);
  });
  it('gestor só acessa financeiro autorizado explicitamente', () => {
    const u = { id: 'user', role: 'PROJECT_MANAGER' as const };
    expect(canFinance(u, [])).toBe(false);
    expect(canFinance(u, [{ ...member, canFinance: false }])).toBe(false);
    expect(canFinance(u, [member])).toBe(true);
  });
});
