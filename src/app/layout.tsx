import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'OFFGRID Workspace',
  description: 'Gestão de experiências, marcas e conexões.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
