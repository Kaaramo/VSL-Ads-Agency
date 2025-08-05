import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignUpForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default async function SignUpPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-400/20 to-violet-600/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-purple-500/5 via-transparent to-indigo-500/5"></div>
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-indigo-600 bg-clip-text text-transparent mb-2">
              Rejoignez l'élite
            </h1>
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              L'automatisation marketing nouvelle génération pour agences
            </p>
          </div>

          <SignUpForm />

          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm mb-3">Votre agence a déjà un compte ?</p>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Accéder à mon espace
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}