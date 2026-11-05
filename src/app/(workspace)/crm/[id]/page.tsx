import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireCRM, brandScope } from '@/server/access';
import { stages, date } from '@/lib/format';
import { saveBriefing, saveMeeting } from '@/server/actions';
import { ActionForm, Field, Notes, Select } from '@/components/form';
import { Empty, PageTitle } from '@/components/shell';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireCRM();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const o = await db.opportunity.findFirst({
    where: { id, brand: { ...brandScope(u), archivedAt: null } },
    include: { brand: true, briefing: true, meetings: { orderBy: { startsAt: 'desc' }, take: 50 } },
  });
  if (!o) notFound();
  const b = o.briefing;
  return (
    <>
      <Link href="/crm">← CRM</Link>
      <PageTitle eyebrow={o.brand.name} title={o.title} description={stages[o.stage]} />
      <p>{o.notes}</p>
      <section className="panel">
        <h2>Briefing</h2>
        <ActionForm action={saveBriefing}>
          <input type="hidden" name="opportunityId" value={id} />
          <div className="form-grid">
            <Field name="objective" label="Objetivo do evento" value={b?.objective} required />
            <Field name="audience" label="Público-alvo" value={b?.audience} />
            <Field name="experience" label="Tipo de experiência" value={b?.experience} />
            <Field name="city" label="Cidade" value={b?.city} />
          </div>
          <Notes name="references" label="Links e referências" value={b?.references} />
          <Notes name="restrictions" label="Restrições" value={b?.restrictions} />
          <Notes value={b?.notes} />
          <Select
            name="status"
            label="Status"
            value={b?.status || 'Rascunho'}
            options={['Rascunho', 'Recebido', 'Incompleto', 'Validado'].map((label) => ({
              value: label,
              label,
            }))}
          />
        </ActionForm>
      </section>
      <section className="panel">
        <h2>Reuniões</h2>
        {o.meetings.length ? (
          <ul className="records">
            {o.meetings.map((m) => (
              <li key={m.id}>
                <strong>{m.title}</strong>
                <span>
                  {date(m.startsAt)} ·{' '}
                  {new Intl.DateTimeFormat('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    timeStyle: 'short',
                  }).format(m.startsAt)}
                </span>
                <p>{m.notes}</p>
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Nenhuma reunião registrada." />
        )}
        <details>
          <summary>+ Registrar reunião</summary>
          <ActionForm action={saveMeeting}>
            <input type="hidden" name="opportunityId" value={id} />
            <Field name="title" label="Título" required />
            <Field name="startsAt" label="Data e hora (Brasília)" type="datetime-local" required />
            <Notes />
          </ActionForm>
        </details>
      </section>
    </>
  );
}
