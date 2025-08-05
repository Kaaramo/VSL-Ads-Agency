import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AnglesManagement } from '@/components/angles-management'

interface AnglesPageProps {
  params: Promise<{ id: string }>
}

export default async function AnglesPage({ params }: AnglesPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify product exists and belongs to user
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      projects!inner(user_id)
    `)
    .eq('id', id)
    .eq('projects.user_id', user.id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Angles for {product.name}</h2>
            <p className="text-muted-foreground">
              Select and manage marketing angles for your campaigns
            </p>
          </div>
        </div>
        <AnglesManagement productId={id} />
      </div>
    </DashboardLayout>
  )
}