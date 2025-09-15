export type ChatMessage = {
    role: 'user' | 'assistant'
    content: string
}

export type SseEvents =
    | { content: string }
    | { tool_start: { id: string, name: string, description?: string } }
    | { tool_progress: { name: string, message?: string, progress?: number } }
    | { chart: { id: string, type: 'line' | 'bar' | 'pie' | 'area', title: string, data: any[], labels?: any[] } }
    | { tool_complete: { name: string, message?: string } }
    | { tool_hide: { name: string } }
    | { tool_error: { name: string, message?: string, error?: string } }
    | { done: true }

export type ToolDefinition = {
    type: 'function'
    function: {
        name: string
        description: string
        parameters: any
    }
}



