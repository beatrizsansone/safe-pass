import Link from 'next/link';
import { ActionForm, Field } from '@/components/form';
import { login } from '@/server/actions';
export default function Login() {
  return (
    <div className="auth-page">
      <div className="auth-story">
        <span className="logo">
          OFFGRID<span>WORKSPACE</span>
        </span>
        <div>
          <p className="eyebrow">CONEXÕES QUE MOVEM</p>
          <h1>
            Grandes experiências
            <br />
            começam com
            <br />
            <em>boas conexões.</em>
          </h1>
          <p>
            Um espaço para organizar ideias, aproximar pessoas
            <br />e transformar o wellness em experiências memoráveis.
          </p>
        </div>
        <small>ESTRATÉGIA. CRIATIVIDADE. MOVIMENTO.</small>
      </div>
      <div className="auth-card">
        <p className="eyebrow">BEM-VINDO À OFFGRID</p>
        <h2>Entre no seu workspace.</h2>
        <p className="muted">Suas marcas, projetos e próximos movimentos.</p>
        <ActionForm action={login} label="Entrar no workspace">
          <Field name="email" label="E-mail" type="email" required />
          <label>
            Senha
            <input
              type="password"
              name="password"
              required
              maxLength={128}
              autoComplete="current-password"
            />
          </label>
        </ActionForm>
        <Link className="subtle-link" href="/recuperar">
          Esqueci minha senha
        </Link>
        <p className="auth-help">
          Acesso exclusivo para usuários convidados.
          <br />
          Solicite seu acesso ao administrador.
        </p>
      </div>
    </div>
  );
}
