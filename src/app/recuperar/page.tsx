import Link from 'next/link';
import { ActionForm, Field } from '@/components/form';
import { requestReset } from '@/server/actions';
export default function Page() {
  return (
    <main className="auth-small panel">
      <p className="eyebrow">OFFGRID WORKSPACE</p>
      <h1>Recuperar acesso</h1>
      <p>Enviaremos um link com validade de 30 minutos.</p>
      <ActionForm action={requestReset} label="Enviar instruções">
        <Field name="email" label="E-mail" type="email" required />
      </ActionForm>
      <Link href="/login">Voltar para o login</Link>
    </main>
  );
}
