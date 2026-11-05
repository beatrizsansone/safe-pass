import Link from 'next/link';
export function pageNumber(p?: string) {
  const n = Number(p);
  return Number.isSafeInteger(n) && n > 0 ? Math.min(n, 100000) : 1;
}
export function Pagination({
  page,
  total,
  path,
  query = '',
}: {
  page: number;
  total: number;
  path: string;
  query?: string;
}) {
  return (
    <div className="pagination">
      <small>
        {total} registros · Página {page}
      </small>
      <div>
        {page > 1 && (
          <Link href={`${path}?page=${page - 1}&q=${encodeURIComponent(query)}`}>← Anterior</Link>
        )}
        {page * 20 < total && (
          <Link href={`${path}?page=${page + 1}&q=${encodeURIComponent(query)}`}>Próxima →</Link>
        )}
      </div>
    </div>
  );
}
export function Search({
  value = '',
  placeholder = 'Buscar por nome…',
}: {
  value?: string;
  placeholder?: string;
}) {
  return (
    <form className="search" method="get">
      <input
        aria-label="Buscar"
        name="q"
        defaultValue={value}
        placeholder={placeholder}
        maxLength={160}
      />
      <button className="secondary">Buscar</button>
    </form>
  );
}
