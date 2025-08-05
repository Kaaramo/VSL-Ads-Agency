'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

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

interface AngleDetailDialogProps {
  angle: Angle
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AngleDetailDialog({ angle, open, onOpenChange }: AngleDetailDialogProps) {
  const renderJsonArray = (data: any, title: string) => {
    if (!data || !Array.isArray(data)) return null
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <div className="flex flex-wrap gap-1">
          {data.map((item: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {item}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  const renderVslStructure = (structure: any) => {
    if (!structure || typeof structure !== 'object') return null
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm">VSL Structure</h4>
        <div className="space-y-2 text-sm">
          {Object.entries(structure).map(([key, value], index) => (
            <div key={index} className="p-2 bg-muted rounded-md">
              <div className="font-medium capitalize">{key.replace(/_/g, ' ')}</div>
              <div className="text-muted-foreground mt-1">{String(value)}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {angle.title}
            <Badge variant={angle.is_selected ? "default" : "secondary"}>
              {angle.is_selected ? "Selected" : "Not Selected"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed view of the marketing angle and its components
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-full max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="font-medium text-sm mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">{angle.summary}</p>
            </div>
            
            <Separator />
            
            {/* Video Idea */}
            <div>
              <h4 className="font-medium text-sm mb-2">Video Idea</h4>
              <p className="text-sm text-muted-foreground">{angle.video_idea}</p>
            </div>
            
            <Separator />
            
            {/* VSL Structure */}
            {renderVslStructure(angle.vsl_structure)}
            
            <Separator />
            
            {/* Emotional Triggers */}
            {renderJsonArray(angle.emotional_triggers, "Emotional Triggers")}
            
            <Separator />
            
            {/* Cognitive Biases */}
            {renderJsonArray(angle.cognitive_biases, "Cognitive Biases")}
            
            <Separator />
            
            {/* Direct Response Techniques */}
            {renderJsonArray(angle.direct_response_techniques, "Direct Response Techniques")}
            
            <Separator />
            
            <div className="text-xs text-muted-foreground">
              Created {new Date(angle.created_at).toLocaleString()}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}