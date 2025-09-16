import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt } from '@/lib/ai/prompt'
import { mapConversation } from '@/lib/ai/conversation'
import { tools } from '@/lib/ai/tools'
import { streamChat } from '@/lib/ai/stream'

export async function POST(req: NextRequest) {
    console.log('🚀 Chat API called')
    try {
        const { message, messages = [] } = await req.json()
        console.log('📨 Message received:', message)
        console.log('📚 Messages history length:', messages.length)
        console.log('📚 Last 2 messages:', messages.slice(-2))

        if (!message) {
            console.log('❌ No message provided')
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        const systemPrompt = buildSystemPrompt()

        console.log('🔄 Creating stream...')
        // Create a ReadableStream for streaming response
        const stream = new ReadableStream({
            async start(controller) {
                console.log('🎯 Stream started')
                try {
                    const history = mapConversation(messages)
                    await streamChat({ controller, system: systemPrompt, history, userMessage: message, tools })
                } catch (streamError: any) {
                    console.error('Streaming error:', streamError)
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: `API Error: ${streamError.message || streamError}` })}\n\n`))
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`))
                }

                controller.close()
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error) {
        console.error('Chat API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
