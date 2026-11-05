import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireBrand } from '@/server/access';
import { db } from '@/lib/db';
import { saveContact, archiveBrand } from '@/server/actions';
import { ActionForm, Field } from '@/components/form';
import { Empty, PageTitle } from '@/components/shell';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { brand } = await requireBrand(id);
  const contacts = await db.contact.findMany({
    where: { brandId: id },
    take: 100,
    orderBy: { createdAt: 'desc' },
  });
  return (
    <>
      <Link href="/marcas" className="subtle-link">
        ← Marcas
      </Link>
      <PageTitle
        eyebrow="RELACIONAMENTO"
        title={brand.name}
        description={
          [brand.segment, brand.city, brand.email].filter(Boolean).join(' · ') ||
          'Detalhes da marca'
        }
      />
      <div className="panel">
        <h2>Sobre a marca</h2>
        <p>{brand.notes || 'Nenhuma observação registrada.'}</p>
        <p className="muted">
          {brand.legalName} {brand.cnpj}
        </p>
      </div>
      <section className="panel">
        <h2>Contatos</h2>
        {contacts.length ? (
          <ul className="records">
            {contacts.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong>
                <span>
                  {c.title} · {c.email} · {c.phone}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Cadastre o primeiro contato." />
        )}
        <details>
          <summary>+ Novo contato</summary>
          <ActionForm action={saveContact}>
            <input type="hidden" name="brandId" value={id} />
            <div className="form-grid">
              <Field name="name" label="Nome" required />
              <Field name="title" label="Cargo" />
              <Field name="email" label="E-mail" type="email" />
              <Field name="phone" label="WhatsApp" />
            </div>
          </ActionForm>
        </details>
      </section>
      <details className="panel danger">
        <summary>Arquivar marca</summary>
        <p>A marca será removida das listas ativas. Os dados serão preservados.</p>
        <ActionForm action={archiveBrand} label="Confirmar arquivamento">
          <input type="hidden" name="id" value={id} />
          <label className="check">
            <input type="checkbox" name="confirm" required /> Confirmo o arquivamento desta marca.
          </label>
        </ActionForm>
      </details>
    </>
  );
}
