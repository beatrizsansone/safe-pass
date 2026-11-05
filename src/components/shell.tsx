import Link from 'next/link';
import {
  LayoutDashboard,
  Columns3,
  Building2,
  FolderKanban,
  CalendarDays,
  Settings,
  ArrowUpRight,
  Leaf,
} from 'lucide-react';
import { logout } from '@/server/actions';
import { canCRM } from '@/lib/permissions';
import type { Actor } from '@/lib/permissions';
export function Shell({
  user,
  children,
}: {
  user: Actor & { name: string };
  children: React.ReactNode;
}) {
  const crm = canCRM(user);
  const links = [
    { href: '/', label: 'Visão geral', Icon: LayoutDashboard },
    ...(crm
      ? [
          { href: '/crm', label: 'CRM', Icon: Columns3 },
          { href: '/marcas', label: 'Marcas', Icon: Building2 },
        ]
      : []),
    { href: '/projetos', label: 'Projetos', Icon: FolderKanban },
    { href: '/calendario', label: 'Calendário', Icon: CalendarDays },
    { href: '/configuracoes', label: 'Configurações', Icon: Settings },
  ];
  return (
    <div className="workspace">
      <aside>
        <Link href="/" className="logo">
          OFFGRID<span>WORKSPACE</span>
        </Link>
        <div className="workspace-label">
          <span className="brand-icon">
            <Leaf size={18} />
          </span>
          OFFGRID Studio <span className="dot" />
        </div>
        <small className="nav-label">SEU ESPAÇO DE TRABALHO</small>
        <nav aria-label="Navegação principal">
          {links.map(({ href, label, Icon }) => (
            <Link key={href} href={href}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <Leaf size={22} />
          <p>
            Experiências que
            <br />
            criam conexões.
          </p>
          <small>Do primeiro contato ao último detalhe.</small>
        </div>
        <div className="user">
          <span className="avatar">{user.name[0]}</span>
          <div>
            <strong>{user.name}</strong>
            <small>{user.role === 'ADMIN' ? 'Sócio / Administrador' : user.role}</small>
          </div>
          <form action={logout}>
            <button className="text-button" aria-label="Sair da conta">
              Sair
            </button>
          </form>
        </div>
      </aside>
      <div className="main-column">
        <header>
          <span>
            Workspace <span className="muted">/ OFFGRID</span>
          </span>
          <span className="header-note">
            <span className="dot" /> Feito para conectar <ArrowUpRight size={14} />
          </span>
        </header>
        <main>{children}</main>
        <footer>
          OFFGRID WORKSPACE <span>Experiências com intenção.</span>
        </footer>
      </div>
    </div>
  );
}
export function PageTitle({
  eyebrow = 'WORKSPACE',
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Empty({ text = 'Nada por aqui ainda.' }: { text?: string }) {
  return (
    <div className="empty">
      <Leaf size={24} />
      <p>{text}</p>
      <small>Os registros aparecerão aqui após o cadastro.</small>
    </div>
  );
}
