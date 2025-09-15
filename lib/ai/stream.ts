import { mistral } from './client'
import { sse, SseController } from '@/lib/sse'
import { toolHandlers } from './tools/handlers'
import type { ToolDefinition } from '@/types/chat'

type Msg = { role: 'system' | 'user' | 'assistant', content: string }

export async function streamChat(params: {
    controller: SseController,
    system: string,
    history: Msg[],
    userMessage: string,
    tools: ToolDefinition[],
}) {
    const { controller, system, history, userMessage, tools } = params
    const out = sse(controller)

    const result = await mistral.chat.stream({
        model: 'mistral-large-latest',
        messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: userMessage }],
        tools,
        toolChoice: 'auto' as any
    })

    for await (const event of result) {
        const delta = event.data?.choices?.[0]?.delta

        if (delta?.content) out.content(delta.content as string)

        const toolCalls = (delta as any)?.toolCalls || (delta as any)?.tool_calls
        if (toolCalls) {
            for (const toolCall of toolCalls) {
                const name = toolCall.function?.name
                if (!name) continue
                out.toolStart({ name, description: 'Working...', id: `tool_${Date.now()}` })
                try {
                    const args = JSON.parse(toolCall.function.arguments || '{}')
                    await toolHandlers[name]?.({ args, out })
                    out.toolComplete({ name, message: 'Chart generated successfully' })
                    setTimeout(() => out.toolHide({ name }), 800)
                } catch (e: any) {
                    out.toolError({ name, message: 'Error generating chart', error: e?.message })
                }
            }
        }

        if (event.data?.choices?.[0]?.finishReason === 'stop') {
            out.done()
            break
        }
    }
}


