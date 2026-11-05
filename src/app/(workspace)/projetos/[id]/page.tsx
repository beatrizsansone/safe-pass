import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireProject } from '@/server/access';
import { canManageProject } from '@/lib/permissions';
import { db } from '@/lib/db';
import { projectStatuses, taskStatuses } from '@/lib/format';
import { updateProject, saveTask, updateTask, assignMember } from '@/server/actions';
import { ActionForm, Field, Notes, Select } from '@/components/form';
import { Empty, PageTitle } from '@/components/shell';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { u, project } = await requireProject(id);
  const manage = canManageProject(u, project.members);
  const [tasks, members, users] = await Promise.all([
    db.task.findMany({ where: { projectId: id }, orderBy: { createdAt: 'desc' }, take: 100 }),
    db.projectMember.findMany({
      where: { projectId: id },
      include: { user: { select: { name: true, role: true } } },
    }),
    u.role === 'ADMIN'
      ? db.user.findMany({
          where: { active: true, role: { not: 'CLIENT' } },
          select: { id: true, name: true },
          take: 200,
        })
      : [],
  ]);
  return (
    <>
      <Link href="/projetos">← Projetos</Link>
      <PageTitle
        eyebrow="EXPERIÊNCIA EM MOVIMENTO"
        title={project.name}
        description={project.description || project.location}
      />
      <span className="badge">{project.status}</span>
      {manage && (
        <details className="panel">
          <summary>Alterar status</summary>
          <ActionForm action={updateProject}>
            <input type="hidden" name="id" value={id} />
            <Select
              name="status"
              label="Status"
              value={project.status}
              options={projectStatuses.map((label) => ({ label, value: label }))}
            />
          </ActionForm>
        </details>
      )}
      <section className="panel">
        <h2>Tarefas</h2>
        {tasks.length ? (
          <ul className="records">
            {tasks.map((t) => (
              <li key={t.id}>
                <div>
                  <strong>{t.title}</strong>
                  <p>{t.description}</p>
                  <small>
                    {t.priority} · {t.status}
                  </small>
                </div>
                {manage && (
                  <ActionForm action={updateTask} className="inline-form" label="Atualizar">
                    <input type="hidden" name="id" value={t.id} />
                    <Select
                      name="status"
                      label="Status da tarefa"
                      value={t.status}
                      options={taskStatuses.map((label) => ({ label, value: label }))}
                    />
                  </ActionForm>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Um novo projeto, novas possibilidades." />
        )}
        {manage && (
          <details>
            <summary>+ Nova tarefa</summary>
            <ActionForm action={saveTask}>
              <input type="hidden" name="projectId" value={id} />
              <Field name="title" label="Título" required />
              <Notes name="description" label="Descrição" />
              <Select
                name="priority"
                label="Prioridade"
                value="Normal"
                options={['Baixa', 'Normal', 'Alta'].map((label) => ({ label, value: label }))}
              />
            </ActionForm>
          </details>
        )}
      </section>
      <section className="panel">
        <h2>Equipe autorizada</h2>
        <ul className="records">
          {members.map((m) => (
            <li key={m.id}>
              <strong>{m.user.name}</strong>
              <span>
                {m.user.role} {m.canManage ? '· Responsável' : ''}
              </span>
            </li>
          ))}
        </ul>
        {u.role === 'ADMIN' && (
          <details>
            <summary>Adicionar / atualizar acesso</summary>
            <ActionForm action={assignMember}>
              <input type="hidden" name="projectId" value={id} />
              <Select
                name="userId"
                label="Usuário"
                options={users.map((x) => ({ label: x.name, value: x.id }))}
              />
              <label className="check">
                <input type="checkbox" name="canManage" /> Gestão (apenas PROJECT_MANAGER)
              </label>
              <label className="check">
                <input type="checkbox" name="canFinance" /> Financeiro interno (requer gestão)
              </label>
            </ActionForm>
          </details>
        )}
      </section>
    </>
  );
}
