'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  FileText, 
  Loader2, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react'

interface Script {
  id: string
  content: string
  duration_minutes: number
  feedback: string | null
  version: number
  is_winner: boolean
  created_at: string
  updated_at: string
}

interface Angle {
  id: string
  title: string
  summary: string
  products: {
    name: string
  }
}

interface ScriptGenerationProps {
  angleId: string
  angle: Angle
}

export function ScriptGeneration({ angleId, angle }: ScriptGenerationProps) {
  const [scripts, setScripts] = useState<Script[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [duration, setDuration] = useState('2')
  const [feedback, setFeedback] = useState('')
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchScripts()
  }, [angleId])

  const fetchScripts = async () => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('angle_id', angleId)
        .order('version', { ascending: false })

      if (error) throw error
      setScripts(data || [])
    } catch (error) {
      console.error('Error fetching scripts:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateScript = async () => {
    setGenerating(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateScript',
          data: {
            angle_id: angleId,
            duration_minutes: parseInt(duration),
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to generate script')

      // Fetch updated scripts
      await fetchScripts()
    } catch (error) {
      console.error('Error generating script:', error)
    } finally {
      setGenerating(false)
    }
  }

  const regenerateScript = async (scriptId: string) => {
    if (!feedback.trim()) return
    
    setRegenerating(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'feedbackIteration',
          data: {
            script_id: scriptId,
            feedback: feedback.trim(),
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to regenerate script')

      setFeedback('')
      await fetchScripts()
    } catch (error) {
      console.error('Error regenerating script:', error)
    } finally {
      setRegenerating(false)
    }
  }

  const copyScript = async (content: string, scriptId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedScript(scriptId)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (error) {
      console.error('Failed to copy script:', error)
    }
  }

  if (loading) {
    return <div>Loading scripts...</div>
  }

  const latestScript = scripts[0]

  return (
    <div className="space-y-6">
      {/* Angle Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {angle.title}
          </CardTitle>
          <CardDescription>{angle.summary}</CardDescription>
        </CardHeader>
      </Card>

      {/* Script Generation */}
      {!latestScript ? (
        <Card>
          <CardHeader>
            <CardTitle>Generate VSL Script</CardTitle>
            <CardDescription>
              Create a video sales letter script based on this angle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="duration">Script Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="3">3 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={generateScript} disabled={generating}>
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {generating ? 'Generating Script...' : 'Generate Script'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Current Script */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Script</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {latestScript.duration_minutes} min
                  </Badge>
                  <Badge variant="outline">
                    v{latestScript.version}
                  </Badge>
                  {latestScript.is_winner && (
                    <Badge variant="default">Winner</Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Created {new Date(latestScript.created_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {latestScript.content}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyScript(latestScript.content, latestScript.id)}
                >
                  {copiedScript === latestScript.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feedback and Regeneration */}
          <Card>
            <CardHeader>
              <CardTitle>Improve Script</CardTitle>
              <CardDescription>
                Provide feedback to regenerate an improved version
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="e.g., Make it more emotional, add urgency, focus on benefits..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={() => regenerateScript(latestScript.id)}
                disabled={regenerating || !feedback.trim()}
              >
                {regenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {regenerating ? 'Regenerating...' : 'Regenerate Script'}
              </Button>
            </CardContent>
          </Card>

          {/* Script History */}
          {scripts.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Script History</CardTitle>
                <CardDescription>
                  Previous versions of this script
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scripts.slice(1).map((script) => (
                    <div key={script.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">v{script.version}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(script.created_at).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyScript(script.content, script.id)}
                        >
                          {copiedScript === script.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="bg-muted p-3 rounded text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {script.content}
                      </div>
                      {script.feedback && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Feedback: {script.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}