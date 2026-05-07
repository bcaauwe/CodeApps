import { Button, makeStyles, shorthands, tokens, Spinner, Body1Strong, Text } from '@fluentui/react-components'
import { DismissRegular, SendRegular, ArrowResetRegular } from '@fluentui/react-icons'
import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MicrosoftCopilotStudioService } from '../generated/services/MicrosoftCopilotStudioService'
import type { AgentPanelProps, ChatMessage } from '../types/AgentPanelTypes'

const useStyles = makeStyles({
  sidecarContainer: {
    position: 'fixed',
    top: '56px',
    right: 0,
    height: 'calc(100vh - 56px)',
    width: '500px',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: '0 0 28px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    '@media (max-width: 768px)': {
      width: '100%',
    },
  },
  sidecarOpen: {
    transform: 'translateX(0)',
  },
  sidecarOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    animation: 'fadeIn 0.3s ease-in-out',
  },
  sidecarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke1,
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  sidecarContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },
  webChatContainer: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  messagesContainer: {
    flex: '1 1 auto',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: 0,
    ...shorthands.padding('16px'),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  messageWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    flexShrink: 0,
  },
  messageUserWrapper: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '70%',
    minWidth: 0,
    overflow: 'hidden',
    ...shorthands.padding('12px'),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  messageUser: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  messageAgent: {
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: tokens.colorBrandForeground1,
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    ...shorthands.padding('12px'),
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke1,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    ...shorthands.padding('24px'),
    minHeight: '200px',
  },
  errorContainer: {
    ...shorthands.padding('16px'),
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    marginBottom: '12px',
  },
})

export function AgentPanel({ open, onOpenChange }: AgentPanelProps) {
  const styles = useStyles()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string>('')

  const AGENT_NAME = 'gbb_CodeAppsAgent'
  const NOTIFICATION_URL = 'https://notificationurlplaceholder'

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize conversation ID once on component mount
  useEffect(() => {
    setConversationId(Math.random().toString(36).substring(7))
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsSending(true)
    setError(null)

    try {
      const response = await MicrosoftCopilotStudioService.ExecuteCopilotAsyncV2(
        AGENT_NAME,
        {
          message: userMessage.content,
          notificationUrl: NOTIFICATION_URL,
        },
        conversationId
      )

      if ((response as any)?.success && (response as any)?.data) {
        const responseData = (response as any).data
        let agentResponseText = ''

        // Extract response from the data.responses array
        if (Array.isArray(responseData.responses) && responseData.responses.length > 0 && typeof responseData.responses[0] === 'string') {
          agentResponseText = responseData.responses[0]
        } else if (responseData.lastResponse) {
          agentResponseText = responseData.lastResponse
        } else {
          agentResponseText = 'Agent response received but no content was found.'
        }

        // Update conversation ID from response for subsequent messages
        const convId = responseData.conversationId ?? responseData.ConversationId ?? responseData.conversationID
        if (convId && !conversationId) {
          setConversationId(convId)
        }

        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: agentResponseText,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, agentMessage])
      } else {
        setError('No response from agent')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message to agent'
      setError(errorMessage)
      console.error('Error sending message to agent:', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleResetConversation = () => {
    setMessages([])
    setInputValue('')
    setError(null)
    setConversationId(Math.random().toString(36).substring(7))
  }

  return (
    <>
      {open && <div className={styles.sidecarOverlay} onClick={() => onOpenChange(false)} />}
      <div className={`${styles.sidecarContainer} ${open ? styles.sidecarOpen : ''}`}>
        <div className={styles.sidecarHeader}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <img
              src="/CopilotStudio-26.png"
              alt="Copilot Studio"
              style={{ width: '28px', height: '28px' }}
            />
            <Body1Strong style={{ fontSize: tokens.fontSizeBase400, color: tokens.colorBrandForeground1 }}>Code Apps Agent</Body1Strong>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              appearance="subtle"
              icon={<ArrowResetRegular />}
              onClick={handleResetConversation}
              title="Reset conversation"
            >
              Reset
            </Button>
            <Button
              appearance="subtle"
              icon={<DismissRegular />}
              onClick={() => onOpenChange(false)}
              title="Close agent"
            >
              Close
            </Button>
          </div>
        </div>
        <div className={styles.sidecarContent}>
          {error && (
            <div className={styles.errorContainer}>
              <Body1Strong>Error:</Body1Strong>
              <div style={{ fontSize: tokens.fontSizeBase300, marginTop: '8px' }}>{error}</div>
            </div>
          )}

          <div className={styles.webChatContainer}>
            <div className={styles.messagesContainer}>
              {messages.length === 0 && !isSending && (
                <div style={{ textAlign: 'center', color: tokens.colorNeutralForeground3, marginTop: '24px' }}>
                  <Text>Start a conversation with the Code Apps Agent</Text>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageWrapper} ${msg.type === 'user' ? styles.messageUserWrapper : ''}`}
                >
                  <div className={`${styles.messageBubble} ${msg.type === 'user' ? styles.messageUser : styles.messageAgent}`}>
                    {msg.type === 'agent' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ ...props }) => <p style={{ margin: '8px 0', lineHeight: '1.5', wordBreak: 'break-word' }} {...props} />,
                          strong: ({ ...props }) => <strong style={{ fontWeight: 600 }} {...props} />,
                          em: ({ ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
                          ul: ({ ...props }) => <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: '8px', wordBreak: 'break-word' }} {...props} />,
                          ol: ({ ...props }) => <ol style={{ marginLeft: '20px', marginTop: '8px', marginBottom: '8px', wordBreak: 'break-word' }} {...props} />,
                          li: ({ ...props }) => <li style={{ marginBottom: '4px', wordBreak: 'break-word' }} {...props} />,
                          code: ({ ...props }) => <code style={{ backgroundColor: tokens.colorNeutralBackground3, padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em', wordBreak: 'break-all' }} {...props} />,
                          pre: ({ ...props }) => <pre style={{ backgroundColor: tokens.colorNeutralBackground3, padding: '8px', borderRadius: '4px', overflow: 'auto', marginTop: '8px', marginBottom: '8px', maxWidth: '100%', overflowX: 'auto' }} {...props} />,
                          blockquote: ({ ...props }) => <blockquote style={{ borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: tokens.colorBrandForeground1, paddingLeft: '12px', marginLeft: '0', marginTop: '8px', marginBottom: '8px', opacity: 0.8, wordBreak: 'break-word' }} {...props} />,
                          table: ({ ...props }) => <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '8px', marginBottom: '8px', fontSize: '0.9em' }} {...props} />,
                          thead: ({ ...props }) => <thead style={{ backgroundColor: tokens.colorNeutralBackground3 }} {...props} />,
                          th: ({ ...props }) => <th style={{ border: `1px solid ${tokens.colorNeutralStroke1}`, padding: '6px 10px', textAlign: 'left', fontWeight: 600 }} {...props} />,
                          td: ({ ...props }) => <td style={{ border: `1px solid ${tokens.colorNeutralStroke1}`, padding: '6px 10px' }} {...props} />,
                          tr: ({ ...props }) => <tr {...props} />,
                          a: ({ href, ...props }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: tokens.colorBrandForeground1, textDecoration: 'underline', wordBreak: 'break-all' }}
                              {...props}
                            />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <Text>{msg.content}</Text>
                    )}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className={styles.loadingContainer}>
                  <Spinner size="small" />
                  <Text>Agent is thinking...</Text>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputContainer}>
              <textarea
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: tokens.fontSizeBase300,
                  fontFamily: tokens.fontFamilyBase,
                  backgroundColor: tokens.colorNeutralBackground1,
                  border: `1px solid ${tokens.colorNeutralStroke1}`,
                  borderRadius: tokens.borderRadiusMedium,
                  color: tokens.colorNeutralForeground1,
                  resize: 'none',
                  maxHeight: '32px',
                  lineHeight: '1.2',
                }}
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <Button
                appearance="primary"
                icon={<SendRegular />}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isSending}
                title="Send message"
                style={{ minWidth: '100px', height: '32px' }}
                size="small"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
