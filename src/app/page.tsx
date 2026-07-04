import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();
  
  if (session) {
    // ALWAYS fetch the user's role from the database
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    
    if (user) {
      if (user.role === 'Admin') {
        redirect('/admin');
      } else if (user.role === 'Sales Executive') {
        redirect('/dashboard');
      }
    }
  }
  
  redirect('/login');
}
