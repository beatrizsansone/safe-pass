import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { digest, newToken } from '@/lib/password';
export async function currentUser() {
  const token = (await cookies()).get('offgrid_session')?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: digest(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date() || !session.user.active) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}
export async function createSession(userId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12);
  await db.session.create({ data: { userId, tokenHash: digest(token), expiresAt } });
  (await cookies()).set('offgrid_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}
export async function rateLimit(key: string, limit = 8) {
  // A single atomic UPSERT prevents concurrent requests from bypassing the limit.
  const rows = await db.$queryRaw<
    { count: number }[]
  >`INSERT INTO "AuthAttempt" ("key", "count", "resetAt") VALUES (${digest(key)}, 1, NOW() + INTERVAL '15 minutes') ON CONFLICT ("key") DO UPDATE SET "count" = CASE WHEN "AuthAttempt"."resetAt" < NOW() THEN 1 ELSE "AuthAttempt"."count" + 1 END, "resetAt" = CASE WHEN "AuthAttempt"."resetAt" < NOW() THEN NOW() + INTERVAL '15 minutes' ELSE "AuthAttempt"."resetAt" END RETURNING "count"`;
  return rows[0].count <= limit;
}
