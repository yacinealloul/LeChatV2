"use client"

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: any[]
  labels?: string[]
  id: string
}

interface ChartProps {
  chart: ChartData
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-white/20 rounded-lg px-3 py-2 text-sm">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-white/80">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const chartColors = [
  'rgba(255, 255, 255, 0.9)', // white glass
  'rgba(255, 255, 255, 0.7)', // lighter white glass
  'rgba(255, 255, 255, 0.5)', // medium white glass
  'rgba(255, 255, 255, 0.3)', // light white glass
  'rgba(255, 255, 255, 0.8)', // strong white glass
  'rgba(255, 255, 255, 0.6)', // medium-light white glass
  'rgba(255, 255, 255, 0.4)', // soft white glass
  'rgba(255, 255, 255, 0.2)', // very light white glass
  'rgba(255, 255, 255, 0.1)', // ultra light white glass
  'rgba(255, 255, 255, 0.15)' // subtle white glass
]

export default function Chart({ chart }: ChartProps) {
  const safeData = Array.isArray(chart.data) ? chart.data : []

  // Memoize the chart to prevent unnecessary re-renders
  const chartKey = `${chart.type}-${chart.id || ''}-${JSON.stringify(chart.data)}`

  const parseNumber = (raw: any): number => {
    if (raw === null || raw === undefined) return NaN
    if (typeof raw === 'number') return raw
    if (typeof raw !== 'string') return NaN
    let s = raw.trim()
    // Remove currency and separators
    s = s.replace(/[$€£,\s]/g, '')
    // Percent
    s = s.replace(/%$/, '')
    // Handle trillions/billions/millions suffixes
    const match = s.match(/^(-?\d*\.?\d+)([TtBbMmKk])?$/)
    if (match) {
      const num = parseFloat(match[1])
      const unit = match[2]?.toLowerCase()
      const mul = unit === 't' ? 1e12 : unit === 'b' ? 1e9 : unit === 'm' ? 1e6 : unit === 'k' ? 1e3 : 1
      return num * mul
    }
    const n = parseFloat(s)
    return isNaN(n) ? NaN : n
  }

  const transformedData = safeData.map((item, index) => {
    // Handle different data formats
    const name = item.label || item.name || item.ticker || item.symbol || item.x || item.category || item.key || `Item ${index + 1}`
    const candidates = [
      item.value,
      item.y,
      item.amount,
      item.count,
      item.market_cap,
      item.marketCap,
      item.cap,
      item.percentage,
      item.percent,
      item.share,
      item.weight,
    ]
    let value = NaN
    for (const c of candidates) {
      const v = parseNumber(c)
      if (!isNaN(v)) { value = v; break }
    }
    // Fallback: first numeric-like field
    if (isNaN(value)) {
      for (const key of Object.keys(item)) {
        const v = parseNumber((item as any)[key])
        if (!isNaN(v)) { value = v; break }
      }
    }
    if (isNaN(value)) value = 0
    return { name: String(name), value }
  })

  // Remove debug logs to prevent console spam causing flickering
  // console.log('📊 Chart Debug - Type:', chart.type)

  const renderChart = () => {
    // Return error message if no data
    if (!transformedData || transformedData.length === 0) {
      return <div className="text-white/60 text-center py-8">No data to display</div>
    }
    const total = transformedData.reduce((sum, d) => sum + (typeof d.value === 'number' ? d.value : 0), 0)
    if (chart.type === 'pie' && total <= 0) {
      return <div className="text-white/60 text-center py-8">No valid numeric data for pie chart</div>
    }
    const commonProps = {
      data: transformedData,
      margin: { top: 10, right: 10, left: 10, bottom: 10 }
    }

    switch (chart.type) {
      case 'line':
        return (
          <LineChart data={transformedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.6)"
              fontSize={14}
              tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
              angle={0}
              textAnchor="middle"
              height={30}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.6)"
              fontSize={14}
              tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={transformedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.6)"
              fontSize={14}
              tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
              angle={0}
              textAnchor="middle"
              height={30}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.6)"
              fontSize={14}
              tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              fill="rgba(16, 185, 129, 0.2)"
              strokeWidth={3}
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart data={transformedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.6)"
              fontSize={14}
              tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
              angle={0}
              textAnchor="middle"
              height={30}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.6)"
              fontSize={14}
              tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart width={1600} height={420}>
            <Pie
              data={transformedData}
              cx="50%"
              cy="55%"
              outerRadius={140}
              innerRadius={0}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              fontSize={16}
              isAnimationActive={false}
            >
              {transformedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        )

      default:
        return <div className="text-white/60">Unsupported chart type</div>
    }
  }

  return (
    <div key={chartKey} className="w-full mt-4 mb-1">
      {chart.title && (
        <h3 className="text-white/90 font-medium text-lg tracking-tight mb-2">{chart.title}</h3>
      )}
      <div className={chart.type === 'pie' ? "h-[405px] w-full" : "h-80 w-full"}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
