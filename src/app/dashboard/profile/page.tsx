import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session || session.role !== 'Sales Executive') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id as number }
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
          Profile Management
        </h2>
        <p className="text-slate-400 text-sm mt-1">Update your personal and payment information.</p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
