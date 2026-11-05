require('dotenv/config');
const { Client } = require('pg');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    await db.query('SELECT pg_advisory_lock(94817421)');
    await db.query(
      'CREATE TABLE IF NOT EXISTS offgrid_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())',
    );
    const dir = path.resolve(__dirname, '../prisma/migrations');
    for (const name of fs
      .readdirSync(dir)
      .filter((n) => fs.statSync(path.join(dir, n)).isDirectory())
      .sort()) {
      const sql = fs.readFileSync(path.join(dir, name, 'migration.sql'), 'utf8');
      if (!sql.trim()) throw Error('Empty migration');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const applied = await db.query('SELECT checksum FROM offgrid_migrations WHERE name=$1', [
        name,
      ]);
      if (applied.rows.length) {
        if (applied.rows[0].checksum !== checksum) throw Error('Applied migration changed');
        continue;
      }
      await db.query('BEGIN');
      try {
        await db.query(sql);
        await db.query('INSERT INTO offgrid_migrations(name,checksum) VALUES($1,$2)', [
          name,
          checksum,
        ]);
        await db.query('COMMIT');
        console.log('Migration aplicada:', name);
      } catch (e) {
        await db.query('ROLLBACK');
        throw e;
      }
    }
    console.log('Banco atualizado.');
  } finally {
    await db.end();
  }
}
main().catch(() => {
  console.error(
    'Migration recusada. Verifique a conexão, o histórico e o esquema. Nenhuma migration parcial é mantida.',
  );
  process.exitCode = 1;
});
