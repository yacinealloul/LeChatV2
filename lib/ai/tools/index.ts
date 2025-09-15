import type { ToolDefinition } from '@/types/chat'
export const tools: ToolDefinition[] = [
    {
        type: 'function',
        function: {
            name: 'generate_chart',
            description: 'Create a chart when asked or when numeric data visualization improves clarity.',
            parameters: {
                type: 'object',
                properties: {
                    type: { type: 'string', enum: ['line', 'bar', 'pie', 'area'] },
                    title: { type: 'string' },
                    data: { type: 'array', description: 'Array of {label, value}' },
                    labels: { type: 'array', description: 'Optional axis/category labels' }
                },
                required: ['type', 'title', 'data']
            }
        }
    }
]


