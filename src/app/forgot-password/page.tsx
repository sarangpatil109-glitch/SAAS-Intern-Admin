import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black flex items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
            <p className="text-slate-400 text-sm">This feature is not implemented yet.</p>
          </div>
          
          <Link href="/login" className="inline-block py-3 px-6 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
