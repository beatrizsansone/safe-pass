import Link from 'next/link';
import { ActionForm, Field } from '@/components/form';
import { resetPassword } from '@/server/actions';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <main className="auth-small panel">
      <h1>Nova senha</h1>
      <ActionForm action={resetPassword} label="Redefinir senha">
        <input type="hidden" name="token" value={token || ''} />
        <Field name="password" label="Senha (mínimo 12 caracteres)" type="password" required />
      </ActionForm>
      <Link href="/login">Entrar</Link>
    </main>
  );
}
