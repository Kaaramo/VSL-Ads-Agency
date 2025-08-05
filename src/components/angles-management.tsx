'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Target, 
  FileText, 
  CheckCircle, 
  Circle,
  Filter
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AngleDetailDialog } from '@/components/angle-detail-dialog'

interface Angle {
  id: string
  title: string
  summary: string
  vsl_structure: any
  video_idea: string
  emotional_triggers: any
  cognitive_biases: any
  direct_response_techniques: any
  is_selected: boolean
  created_at: string
}

interface AnglesManagementProps {
  productId: string
}

export function AnglesManagement({ productId }: AnglesManagementProps) {
  const [angles, setAngles] = useState<Angle[]>([])
  const [filteredAngles, setFilteredAngles] = useState<Angle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedAngle, setSelectedAngle] = useState<Angle | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchAngles()
  }, [productId])

  useEffect(() => {
    filterAngles()
  }, [angles, filter])

  const fetchAngles = async () => {
    try {
      const { data, error } = await supabase
        .from('angles')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAngles(data || [])
    } catch (error) {
      console.error('Error fetching angles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAngles = () => {
    let filtered = angles
    switch (filter) {
      case 'selected':
        filtered = angles.filter(angle => angle.is_selected)
        break
      case 'unselected':
        filtered = angles.filter(angle => !angle.is_selected)
        break
      default:
        filtered = angles
    }
    setFilteredAngles(filtered)
  }

  const toggleAngleSelection = async (angleId: string) => {
    try {
      const angle = angles.find(a => a.id === angleId)
      if (!angle) return

      const { error } = await supabase
        .from('angles')
        .update({ is_selected: !angle.is_selected })
        .eq('id', angleId)

      if (error) throw error

      setAngles(angles.map(a => 
        a.id === angleId ? { ...a, is_selected: !a.is_selected } : a
      ))
    } catch (error) {
      console.error('Error updating angle selection:', error)
    }
  }

  if (loading) {
    return <div>Loading angles...</div>
  }

  if (angles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No angles generated yet</h3>
          <p className="text-sm text-muted-foreground">
            Generate product details first, then create angles for this product
          </p>
        </CardContent>
      </Card>
    )
  }

  const selectedCount = angles.filter(a => a.is_selected).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter angles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Angles ({angles.length})</SelectItem>
                <SelectItem value="selected">Selected ({selectedCount})</SelectItem>
                <SelectItem value="unselected">Unselected ({angles.length - selectedCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedCount > 0 && (
          <Badge variant="default">
            {selectedCount} selected for script generation
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAngles.map((angle) => (
          <Card key={angle.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium">{angle.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAngleSelection(angle.id)}
                  className="h-8 w-8 p-0"
                >
                  {angle.is_selected ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {angle.summary}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Video Idea: {angle.video_idea.substring(0, 100)}...
              </div>
              
              <Separator />
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAngle(angle)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                
                {angle.is_selected && (
                  <Button size="sm" asChild>
                    <a href={`/angles/${angle.id}/script`}>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Script
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAngle && (
        <AngleDetailDialog
          angle={selectedAngle}
          open={!!selectedAngle}
          onOpenChange={(open) => !open && setSelectedAngle(null)}
        />
      )}
    </div>
  )
}