import { sse } from '@/lib/sse'

type Out = ReturnType<typeof sse>

export const toolHandlers: Record<string, (ctx: { args: any, out: Out }) => Promise<void>> = {
    async generate_chart({ args, out }) {
        out.toolProgress({ name: 'generate_chart', message: `Creating ${args.type} chart...`, progress: 50 })
        await new Promise(r => setTimeout(r, 400))
        out.chart({
            id: `chart_${Date.now()}`,
            type: args.type,
            title: args.title,
            data: args.data,
            labels: args.labels
        })
    }
}


