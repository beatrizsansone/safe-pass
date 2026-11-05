'use client';
import { useActionState } from 'react';
import type { Result } from '@/server/actions';
export function ActionForm({
  action,
  children,
  label = 'Salvar',
  className = 'form',
}: {
  action: (s: Result, f: FormData) => Promise<Result>;
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={className}>
      {children}
      <button type="submit" disabled={pending}>
        {pending ? 'Salvando…' : label}
      </button>
      {state.error && (
        <p className="feedback error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="feedback success" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
export function Field({
  label,
  name,
  type = 'text',
  required = false,
  value = '',
  placeholder = '',
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value?: string;
  placeholder?: string;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={value}
        placeholder={placeholder}
        maxLength={type === 'password' ? 128 : 5000}
        minLength={type === 'password' ? 12 : undefined}
      />
    </label>
  );
}
export function Notes({
  name = 'notes',
  label = 'Observações',
  value = '',
}: {
  name?: string;
  label?: string;
  value?: string;
}) {
  return (
    <label>
      {label}
      <textarea name={name} defaultValue={value} maxLength={5000} rows={3} />
    </label>
  );
}
export function Select({
  name,
  label,
  options,
  value,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value?: string;
}) {
  return (
    <label>
      {label}
      <select aria-label={label} name={name} defaultValue={value} required>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
