import { sse } from '@/lib/sse'

type Out = ReturnType<typeof sse>

export const toolHandlers: Record<string, (ctx: { args: any, out: Out }) => Promise<void>> = {
    // generate_chart permet 
    async generate_chart({ args, out }) {
        const isMultiLine = args.type === 'line' && args.series && args.series.length > 0
        const progressMessage = isMultiLine
            ? `Creating multi-line ${args.type} chart with ${args.series.length} series...`
            : `Creating ${args.type} chart...`

        out.toolProgress({ name: 'generate_chart', message: progressMessage, progress: 50 })
        await new Promise(r => setTimeout(r, 400))

        out.chart({
            id: `chart_${Date.now()}`,
            type: args.type,
            title: args.title,
            data: args.data,
            labels: args.labels,
            series: args.series // Pass the series parameter to the frontend
        })
    }
}


