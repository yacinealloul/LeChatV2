import type { ChatMessage } from '@/types/chat'

export function mapConversation(messages: ChatMessage[]): Array<{ role: 'user' | 'assistant', content: string }> {
    const mapped: Array<{ role: 'user' | 'assistant', content: string }> = []
    for (const m of messages || []) {
        if ((m.role === 'user' || m.role === 'assistant') && m.content) {
            mapped.push({ role: m.role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) })
        }
    }
    return mapped.slice(-40) // No budget illimited
}


