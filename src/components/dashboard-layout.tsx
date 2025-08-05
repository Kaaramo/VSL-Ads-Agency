'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  FolderOpen, 
  Package, 
  Target, 
  FileText, 
  BarChart3, 
  LogOut,
  Home
} from 'lucide-react'
import Link from 'next/link'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Angles', href: '/angles', icon: Target },
    { name: 'Scripts', href: '/scripts', icon: FileText },
    { name: 'Performance', href: '/performance', icon: BarChart3 },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Card className="w-64 rounded-none border-r">
        <div className="flex h-full flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold">VSL Ads Agency</h1>
            <p className="text-sm text-muted-foreground">Marketing Automation</p>
          </div>
          
          <Separator />
          
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          <Separator />
          
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}