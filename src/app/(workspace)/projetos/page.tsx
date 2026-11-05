import Link from 'next/link';
import { requireUser } from '@/server/auth';
import { brandScope, projectScope } from '@/server/access';
import { canCRM } from '@/lib/permissions';
import { db } from '@/lib/db';
import { saveProject } from '@/server/actions';
import { ActionForm, Field, Notes, Select } from '@/components/form';
import { PageTitle, Empty } from '@/components/shell';
import { Search, Pagination, pageNumber } from '@/components/pagination';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const u = await requireUser();
  const s = await searchParams;
  const q = (s.q || '').slice(0, 160);
  const page = pageNumber(s.page);
  const where = {
    ...projectScope(u),
    archivedAt: null,
    name: { contains: q, mode: 'insensitive' as const },
  };
  const [projects, total, brands] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 20,
      take: 20,
      include: { brand: { select: { name: true } }, tasks: { select: { status: true } } },
    }),
    db.project.count({ where }),
    canCRM(u)
      ? db.brand.findMany({
          where: { ...brandScope(u), archivedAt: null },
          select: { id: true, name: true },
          take: 200,
          orderBy: { name: 'asc' },
        })
      : [],
  ]);
  return (
    <>
      <PageTitle
        eyebrow="EXPERIÊNCIAS"
        title="Projetos"
        description="Da ideia ao último detalhe. Tudo em um só lugar."
      />
      <Search value={q} />
      {u.role === 'CLIENT' && (
        <p className="notice">
          Seu acesso ao portal será liberado em uma próxima etapa. Nenhum projeto interno é
          compartilhado automaticamente.
        </p>
      )}
      <div className="project-cards">
        {projects.map((p) => (
          <Link className="panel project-card" key={p.id} href={`/projetos/${p.id}`}>
            <p className="eyebrow">{p.brand.name}</p>
            <h2>{p.name}</h2>
            <p className="muted">{p.description || 'Uma nova experiência em construção.'}</p>
            <span className="badge">{p.status}</span>
            <div className="progress">
              <span
                style={{
                  width: `${p.tasks.length ? Math.round((p.tasks.filter((t) => t.status === 'Concluída').length / p.tasks.length) * 100) : 0}%`,
                }}
              />
            </div>
            <small>
              {p.tasks.filter((t) => t.status === 'Concluída').length} de {p.tasks.length} tarefas
              concluídas
            </small>
          </Link>
        ))}
      </div>
      {!projects.length && (
        <section className="panel">
          <Empty text="Nenhum projeto disponível." />
        </section>
      )}
      <Pagination page={page} total={total} path="/projetos" query={q} />
      {canCRM(u) && (
        <details className="panel" id="novo">
          <summary>+ Criar projeto</summary>
          {brands.length ? (
            <ActionForm action={saveProject}>
              <Select
                name="brandId"
                label="Marca"
                options={brands.map((b) => ({ label: b.name, value: b.id }))}
              />
              <Field name="name" label="Nome do projeto" required />
              <Field name="location" label="Local" />
              <Notes name="description" label="Descrição" />
            </ActionForm>
          ) : (
            <p>
              <Link href="/marcas#nova">Cadastre uma marca</Link> para começar.
            </p>
          )}
        </details>
      )}
    </>
  );
}
