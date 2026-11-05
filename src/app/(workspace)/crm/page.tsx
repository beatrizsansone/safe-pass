import Link from 'next/link';
import { requireCRM, brandScope } from '@/server/access';
import { db } from '@/lib/db';
import { stages } from '@/lib/format';
import { saveOpportunity, moveOpportunity } from '@/server/actions';
import { ActionForm, Field, Notes, Select } from '@/components/form';
import { PageTitle, Empty } from '@/components/shell';
import { Search, Pagination, pageNumber } from '@/components/pagination';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; view?: string }>;
}) {
  const u = await requireCRM();
  const s = await searchParams;
  const q = (s.q || '').slice(0, 160);
  const page = pageNumber(s.page);
  const where = {
    brand: { ...brandScope(u), archivedAt: null },
    title: { contains: q, mode: 'insensitive' as const },
  };
  const [items, total, brands] = await Promise.all([
    db.opportunity.findMany({
      where,
      include: { brand: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    }),
    db.opportunity.count({ where }),
    db.brand.findMany({
      where: { ...brandScope(u), archivedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 200,
    }),
  ]);
  return (
    <>
      <PageTitle
        eyebrow="COMERCIAL"
        title="Cada conexão, uma possibilidade."
        description="Acompanhe o caminho do primeiro contato à contratação."
      />
      <div className="toolbar">
        <Search value={q} />
        <div className="tabs">
          <Link href={`/crm?view=kanban&q=${encodeURIComponent(q)}`}>Kanban</Link>
          <Link href={`/crm?view=lista&q=${encodeURIComponent(q)}`}>Lista</Link>
        </div>
      </div>
      {s.view === 'lista' ? (
        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Oportunidade</th>
                  <th>Marca</th>
                  <th>Etapa</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/crm/${o.id}`}>{o.title}</Link>
                    </td>
                    <td>{o.brand.name}</td>
                    <td>{stages[o.stage]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!items.length && <Empty />}
        </section>
      ) : (
        <div className="kanban" aria-label="Funil comercial">
          {stages.map((stage, index) => (
            <section className="kanban-column" key={stage}>
              <h3>
                <span className="dot" />
                {stage}
                <small>{items.filter((o) => o.stage === index).length}</small>
              </h3>
              {items
                .filter((o) => o.stage === index)
                .map((o) => (
                  <article className="kanban-card" key={o.id}>
                    <small>{o.brand.name}</small>
                    <Link href={`/crm/${o.id}`}>
                      <h3>{o.title}</h3>
                    </Link>
                    <ActionForm action={moveOpportunity} label="Mover" className="compact-form">
                      <input type="hidden" name="id" value={o.id} />
                      <Select
                        name="stage"
                        label="Etapa"
                        value={String(o.stage)}
                        options={stages.map((label, i) => ({ label, value: String(i) }))}
                      />
                    </ActionForm>
                  </article>
                ))}
            </section>
          ))}
        </div>
      )}
      <Pagination page={page} total={total} path="/crm" query={q} />
      <details className="panel">
        <summary>+ Nova oportunidade</summary>
        {brands.length ? (
          <ActionForm action={saveOpportunity}>
            <Select
              name="brandId"
              label="Marca"
              options={brands.map((b) => ({ label: b.name, value: b.id }))}
            />
            <Field name="title" label="Título" required />
            <Notes />
          </ActionForm>
        ) : (
          <p>
            Primeiro, <Link href="/marcas#nova">cadastre uma marca</Link>.
          </p>
        )}
      </details>
    </>
  );
}
