import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) {
    throw new Error('Unauthorized');
  }
  return { id: session.user.id as string, email: session.user.email as string };
}
