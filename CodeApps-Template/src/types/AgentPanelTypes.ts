export interface AgentPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface ChatMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
}
