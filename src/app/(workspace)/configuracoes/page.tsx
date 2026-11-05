import { requireUser } from '@/server/auth';
import { db } from '@/lib/db';
import { createUser } from '@/server/actions';
import { ActionForm, Field, Select } from '@/components/form';
import { PageTitle } from '@/components/shell';
export default async function Page() {
  const u = await requireUser();
  const users =
    u.role === 'ADMIN'
      ? await db.user.findMany({
          select: { id: true, name: true, email: true, role: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
        })
      : [];
  return (
    <>
      <PageTitle title="Configurações" description="Seu perfil e os acessos ao workspace." />
      <section className="panel">
        <h2>Seu perfil</h2>
        <p>
          {u.name} · {u.email}
        </p>
        <span className="badge">{u.role}</span>
        <p className="muted">Português (Brasil) · BRL · America/Sao_Paulo</p>
      </section>
      {u.role === 'ADMIN' && (
        <>
          <section className="panel">
            <h2>Usuários</h2>
            <ul className="records">
              {users.map((x) => (
                <li key={x.id}>
                  <strong>{x.name}</strong>
                  <span>
                    {x.email} · {x.role}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <details className="panel">
            <summary>+ Criar usuário</summary>
            <p>
              Entregue a senha inicial por um canal seguro. Clientes são cadastrados sem acesso a
              dados internos.
            </p>
            <ActionForm action={createUser}>
              <Field name="name" label="Nome" required />
              <Field name="email" label="E-mail" type="email" required />
              <Field
                name="password"
                label="Senha inicial (mínimo 12 caracteres)"
                type="password"
                required
              />
              <Select
                name="role"
                label="Perfil"
                value="TEAM_MEMBER"
                options={['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'FREELANCER', 'CLIENT'].map(
                  (label) => ({ label, value: label }),
                )}
              />
            </ActionForm>
          </details>
        </>
      )}
    </>
  );
}
