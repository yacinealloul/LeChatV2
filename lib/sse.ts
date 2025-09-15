export type SseController = ReadableStreamDefaultController<Uint8Array>

function encode(data: unknown): Uint8Array {
    return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

export function sse(controller: SseController) {
    const send = (payload: unknown) => controller.enqueue(encode(payload))
    return {
        content: (content: string) => send({ content }),
        toolStart: (tool_start: any) => send({ tool_start }),
        toolProgress: (tool_progress: any) => send({ tool_progress }),
        chart: (chart: any) => send({ chart }),
        toolComplete: (tool_complete: any) => send({ tool_complete }),
        toolHide: (tool_hide: any) => send({ tool_hide }),
        toolError: (tool_error: any) => send({ tool_error }),
        done: () => send({ done: true })
    }
}


