import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../src/lib/password';
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12)
    throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (mínimo de 12 caracteres).');
  await db.user.create({
    data: {
      name: process.env.ADMIN_NAME || 'Administrador',
      email,
      passwordHash: await hashPassword(password),
      role: 'ADMIN',
    },
  });
  console.log('Administrador criado. Nenhuma senha foi exibida.');
}
main()
  .catch(() => {
    console.error(
      'Não foi possível criar administrador. Verifique as variáveis, o banco e se o e-mail já existe.',
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
