import Link from 'next/link';
import {
  ArrowUpRight,
  FolderKanban,
  Columns3,
  CheckCheck,
  CalendarDays,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { requireUser } from '@/server/auth';
import { brandScope, projectScope } from '@/server/access';
import { canCRM } from '@/lib/permissions';
import { db } from '@/lib/db';
import { date } from '@/lib/format';
import { Empty, PageTitle } from '@/components/shell';
export default async function Dashboard() {
  const u = await requireUser();
  const crm = canCRM(u);
  const scope = projectScope(u);
  const [projects, opportunities, pending, done, activities, upcoming] = await Promise.all([
    db.project.count({
      where: { ...scope, archivedAt: null, status: { notIn: ['Finalizado', 'Cancelado'] } },
    }),
    crm
      ? db.opportunity.count({
          where: { brand: { ...brandScope(u), archivedAt: null }, stage: { gte: 7, lte: 9 } },
        })
      : 0,
    db.task.count({
      where: { project: { ...scope, archivedAt: null }, status: { not: 'Concluída' } },
    }),
    db.task.count({ where: { project: { ...scope, archivedAt: null }, status: 'Concluída' } }),
    db.activity.findMany({
      where: u.role === 'ADMIN' ? {} : { actorId: u.id },
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    db.project.findMany({
      where: { ...scope, archivedAt: null },
      include: { brand: { select: { name: true } }, _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);
  const stats = [
    {
      label: 'Projetos ativos',
      value: projects,
      Icon: FolderKanban,
      caption: 'Experiências em movimento',
    },
    ...(crm
      ? [
          {
            label: 'Propostas em negociação',
            value: opportunities,
            Icon: Columns3,
            caption: 'Oportunidades nas etapas 8–10',
          },
        ]
      : []),
    {
      label: 'Tarefas pendentes',
      value: pending,
      Icon: CalendarDays,
      caption: 'Próximos passos da equipe',
    },
    {
      label: 'Tarefas concluídas',
      value: done,
      Icon: CheckCheck,
      caption: 'Cada detalhe faz a diferença',
    },
  ];
  return (
    <>
      <PageTitle
        eyebrow="SEU DIA, COM INTENÇÃO"
        title={`Olá, ${u.name.split(' ')[0]}.`}
        description="Uma visão do que está acontecendo e do que vem por aí."
      >
        {crm && (
          <Link className="button" href="/projetos#novo">
            <Plus size={16} /> Novo projeto
          </Link>
        )}
      </PageTitle>
      <div className="welcome-banner">
        <div>
          <span className="eyebrow">CRIAR. CONECTAR. TRANSFORMAR.</span>
          <h2>Ideias que ganham movimento.</h2>
          <p>Cuide das conexões. Acompanhe cada experiência.</p>
        </div>
        <div className="orb" aria-hidden="true">
          <span>O</span>
          <ArrowUpRight size={42} />
        </div>
      </div>
      <div className="stats">
        {stats.map(({ label, value, Icon, caption }) => (
          <article className="stat" key={label}>
            <div>
              {label}
              <Icon size={18} />
            </div>
            <strong>{value}</strong>
            <small>{caption}</small>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EM MOVIMENTO</p>
              <h2>Seus projetos</h2>
            </div>
            <Link href="/projetos">
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>
          {upcoming.length ? (
            <div className="project-list">
              {upcoming.map((p) => (
                <Link href={`/projetos/${p.id}`} key={p.id} className="project-row">
                  <span className="project-symbol">{p.brand.name.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {p.brand.name} · {p._count.tasks} tarefas
                    </small>
                  </div>
                  <span className="badge">{p.status}</span>
                  <ArrowUpRight size={17} />
                </Link>
              ))}
            </div>
          ) : (
            <Empty text="Seu próximo projeto começa aqui." />
          )}
        </section>
        <section className="panel activity">
          <div className="section-heading">
            <div>
              <p className="eyebrow">O QUE ACONTECEU</p>
              <h2>Atividades recentes</h2>
            </div>
            <span className="badge neutral">Histórico</span>
          </div>
          {activities.length ? (
            <ul>
              {activities.map((a) => (
                <li key={a.id}>
                  <span className="activity-dot" />
                  <div>
                    <strong>{a.action}</strong>
                    <p>
                      {a.actor.name} <span>· {date(a.createdAt)}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="As primeiras conexões estão por vir." />
          )}
        </section>
      </div>
      <div className="bottom-note">
        <span className="dot" /> Tudo começa com uma boa conexão.<span>OFFGRID / WORKSPACE</span>
      </div>
    </>
  );
}
