import type { ChatMessage } from '@/types/chat'

export function mapConversation(messages: any[]): Array<{ role: 'user' | 'assistant', content: string }> {
    const mapped: Array<{ role: 'user' | 'assistant', content: string }> = []
    for (const m of messages || []) {
        if ((m.role === 'user' || m.role === 'assistant') && m.content && m.content.trim()) {
            mapped.push({ role: m.role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) })
        }
    }
    console.log('🔄 Mapped conversation:', mapped.map(m => ({ role: m.role, content: m.content.slice(0, 50) + '...' })))
    return mapped.slice(-40) // No budget illimited
}


