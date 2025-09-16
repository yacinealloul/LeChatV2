import type { ToolDefinition } from '@/types/chat'
export const tools: ToolDefinition[] = [
    {
        type: 'function',
        function: {
            name: 'generate_chart',
            description: 'Create a chart ONLY when explicitly asked for charts/graphs OR when presenting numeric data that needs visualization (GDP, statistics, financial data, etc.). Do NOT use for general questions about countries, politics, or non-numeric topics.',
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


