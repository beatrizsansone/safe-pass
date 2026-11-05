import { requireUser } from '@/server/auth';
import { brandScope, projectScope } from '@/server/access';
import { canCRM } from '@/lib/permissions';
import { db } from '@/lib/db';
import { PageTitle, Empty } from '@/components/shell';
import { date } from '@/lib/format';
export default async function Page() {
  const u = await requireUser();
  const [meetings, projects] = await Promise.all([
    canCRM(u)
      ? db.meeting.findMany({
          where: {
            opportunity: { brand: { ...brandScope(u), archivedAt: null } },
            startsAt: { gte: new Date() },
          },
          orderBy: { startsAt: 'asc' },
          take: 100,
        })
      : [],
    db.project.findMany({
      where: { ...projectScope(u), archivedAt: null, eventDate: { gte: new Date() } },
      orderBy: { eventDate: 'asc' },
      take: 100,
    }),
  ]);
  const events = [
    ...meetings.map((m) => ({ id: m.id, title: m.title, when: m.startsAt, type: 'Reunião' })),
    ...projects.map((p) => ({ id: p.id, title: p.name, when: p.eventDate!, type: 'Evento' })),
  ].sort((a, b) => a.when.getTime() - b.when.getTime());
  return (
    <>
      <PageTitle title="Calendário" description="Sua agenda de reuniões e experiências." />
      <section className="panel">
        {events.length ? (
          <ul className="records">
            {events.map((e) => (
              <li key={e.id}>
                <span className="badge">{e.type}</span>
                <strong>{e.title}</strong>
                <span>
                  {date(e.when)} ·{' '}
                  {new Intl.DateTimeFormat('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    timeStyle: 'short',
                  }).format(e.when)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Agenda livre por enquanto." />
        )}
      </section>
    </>
  );
}
