import Link from 'next/link';
import { requireCRM, brandScope } from '@/server/access';
import { db } from '@/lib/db';
import { saveBrand } from '@/server/actions';
import { ActionForm, Field, Notes } from '@/components/form';
import { PageTitle, Empty } from '@/components/shell';
import { Search, Pagination, pageNumber } from '@/components/pagination';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const u = await requireCRM();
  const s = await searchParams;
  const q = (s.q || '').slice(0, 160);
  const page = pageNumber(s.page);
  const where = {
    ...brandScope(u),
    archivedAt: null,
    name: { contains: q, mode: 'insensitive' as const },
  };
  const [brands, total] = await Promise.all([
    db.brand.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 20,
      take: 20,
      include: {
        owner: { select: { name: true } },
        _count: { select: { contacts: true, projects: true } },
      },
    }),
    db.brand.count({ where }),
  ]);
  return (
    <>
      <PageTitle
        eyebrow="CONEXÕES"
        title="Marcas"
        description="Relacionamentos que se transformam em experiências."
      />
      <Search value={q} />
      <section className="panel">
        {brands.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Marca</th>
                  <th>Segmento</th>
                  <th>Cidade</th>
                  <th>Responsável</th>
                  <th>Projetos</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link href={`/marcas/${b.id}`}>
                        <strong>{b.name}</strong>
                        <small>{b.email}</small>
                      </Link>
                    </td>
                    <td>{b.segment || '—'}</td>
                    <td>{b.city || '—'}</td>
                    <td>{b.owner.name}</td>
                    <td>{b._count.projects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="Nenhuma marca cadastrada." />
        )}
        <Pagination page={page} total={total} path="/marcas" query={q} />
      </section>
      <details className="panel" id="nova">
        <summary>+ Cadastrar marca</summary>
        <ActionForm action={saveBrand}>
          <div className="form-grid">
            <Field name="name" label="Nome comercial" required />
            <Field name="legalName" label="Razão social" />
            <Field name="cnpj" label="CNPJ (opcional)" />
            <Field name="segment" label="Segmento" />
            <Field name="email" label="E-mail" type="email" />
            <Field name="phone" label="Telefone" />
            <Field name="website" label="Website" type="url" />
            <Field name="instagram" label="Instagram" />
            <Field name="city" label="Cidade" />
          </div>
          <Notes />
        </ActionForm>
      </details>
    </>
  );
}
