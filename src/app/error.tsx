'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="auth-small panel">
      <h1>Não foi possível carregar.</h1>
      <p>Tente novamente. Se persistir, entre em contato com o administrador.</p>
      <button onClick={reset}>Tentar novamente</button>
    </div>
  );
}
