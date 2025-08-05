'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, Loader2, RefreshCw, Target } from 'lucide-react'
import { CreateProductDialog } from '@/components/create-product-dialog'

interface Product {
  id: string
  name: string
  notes: string | null
  status: 'inactive' | 'details_generating' | 'details_generated' | 'angles_generating' | 'angles_generated'
  created_at: string
}

interface ProductsManagementProps {
  projectId: string
}

export function ProductsManagement({ projectId }: ProductsManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [generatingDetails, setGeneratingDetails] = useState<string | null>(null)
  const [generatingAngles, setGeneratingAngles] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [projectId])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductCreated = () => {
    fetchProducts()
    setShowCreateDialog(false)
  }

  const generateProductDetails = async (productId: string) => {
    setGeneratingDetails(productId)
    try {
      // Update status to generating
      await supabase
        .from('products')
        .update({ status: 'details_generating' })
        .eq('id', productId)

      // Call n8n webhook
      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateProjectDetails',
          data: {
            product_id: productId,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to trigger generation')

      // Refresh products to show updated status
      fetchProducts()
    } catch (error) {
      console.error('Error generating details:', error)
      // Reset status on error
      await supabase
        .from('products')
        .update({ status: 'inactive' })
        .eq('id', productId)
    } finally {
      setGeneratingDetails(null)
    }
  }

  const generateAngles = async (productId: string) => {
    setGeneratingAngles(productId)
    try {
      // Update status to generating
      await supabase
        .from('products')
        .update({ status: 'angles_generating' })
        .eq('id', productId)

      // Call n8n webhook
      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateAngles',
          data: {
            product_id: productId,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to trigger generation')

      // Refresh products to show updated status
      fetchProducts()
    } catch (error) {
      console.error('Error generating angles:', error)
      // Reset status on error
      await supabase
        .from('products')
        .update({ status: 'details_generated' })
        .eq('id', productId)
    } finally {
      setGeneratingAngles(null)
    }
  }

  const getStatusBadge = (status: Product['status']) => {
    const statusConfig = {
      inactive: { label: 'Inactive', variant: 'secondary' as const },
      details_generating: { label: 'Generating Details...', variant: 'default' as const },
      details_generated: { label: 'Details Ready', variant: 'outline' as const },
      angles_generating: { label: 'Generating Angles...', variant: 'default' as const },
      angles_generated: { label: 'Angles Ready', variant: 'default' as const },
    }
    
    return statusConfig[status] || statusConfig.inactive
  }

  if (loading) {
    return <div>Loading products...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Products</h3>
          <p className="text-sm text-muted-foreground">
            Manage products for this project
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first product to start generating marketing angles
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const statusConfig = getStatusBadge(product.status)
            return (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{product.name}</span>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                  </CardTitle>
                  {product.notes && (
                    <CardDescription>{product.notes}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(product.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    {product.status === 'inactive' && (
                      <Button
                        size="sm"
                        onClick={() => generateProductDetails(product.id)}
                        disabled={generatingDetails === product.id}
                      >
                        {generatingDetails === product.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Generate Details
                      </Button>
                    )}
                    
                    {product.status === 'details_generated' && (
                      <Button
                        size="sm"
                        onClick={() => generateAngles(product.id)}
                        disabled={generatingAngles === product.id}
                      >
                        {generatingAngles === product.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Target className="mr-2 h-4 w-4" />
                        )}
                        Generate Angles
                      </Button>
                    )}
                    
                    {product.status === 'angles_generated' && (
                      <Button size="sm" asChild>
                        <a href={`/products/${product.id}/angles`}>
                          <Target className="mr-2 h-4 w-4" />
                          View Angles
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CreateProductDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProductCreated={handleProductCreated}
        projectId={projectId}
      />
    </div>
  )
}