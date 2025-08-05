import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ScriptGeneration } from '@/components/script-generation'

interface ScriptPageProps {
  params: Promise<{ id: string }>
}

export default async function ScriptPage({ params }: ScriptPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify angle exists and belongs to user
  const { data: angle, error } = await supabase
    .from('angles')
    .select(`
      *,
      products!inner(
        name,
        projects!inner(user_id)
      )
    `)
    .eq('id', id)
    .eq('products.projects.user_id', user.id)
    .single()

  if (error || !angle) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Script Generation</h2>
            <p className="text-muted-foreground">
              Generate VSL script for "{angle.title}" - {angle.products.name}
            </p>
          </div>
        </div>
        <ScriptGeneration angleId={id} angle={angle} />
      </div>
    </DashboardLayout>
  )
}