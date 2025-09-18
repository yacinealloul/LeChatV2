"use client"

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts'

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: any[]
  labels?: string[]
  id: string
  series?: string[] // Array of keys for multiple data series in line charts
}

interface ChartProps {
  chart: ChartData
}

const CustomLegend = ({ payload }: any) => {
  if (!payload || payload.length === 0) return null

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4 mb-2">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/80 text-sm font-medium">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Check if this is a single-series chart (dataKey = "value")
    const isSingleSeries = payload.length === 1 && payload[0].dataKey === 'value'

    return (
      <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-sm shadow-2xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        {isSingleSeries ? (
          // Single series: just show the value without "value:" label
          <div className="flex items-center justify-center">
            <span className="font-mono text-white text-lg">
              {typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}
            </span>
          </div>
        ) : (
          // Multi-series: show each series with its name
          payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 text-white/90 mb-1 last:mb-0">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium min-w-0 flex-1">{entry.dataKey}:</span>
              <span className="font-mono text-white">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </div>
          ))
        )}
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

const lineColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6366f1', // indigo
]

export default function Chart({ chart }: ChartProps) {
  const safeData = Array.isArray(chart.data) ? chart.data : []

  // Stable key to prevent unnecessary re-renders
  const chartKey = `${chart.type}-${chart.id || ''}-${chart.data?.length || 0}`

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

    // For line charts with multiple series
    if (chart.type === 'line' && chart.series && chart.series.length > 0) {
      const dataPoint: any = { name: String(name) }

      // Extract values for each series
      chart.series.forEach(seriesKey => {
        const value = parseNumber(item[seriesKey])
        dataPoint[seriesKey] = isNaN(value) ? 0 : value
      })

      return dataPoint
    }

    // For single-value charts (bar, pie, area, single-line)
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
          <LineChart data={transformedData} margin={{ top: 16, right: 36, left: 28, bottom: 16 }}>
            <XAxis
              dataKey="name"
              axisLine={true}
              tickLine={false}
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
              angle={0}
              textAnchor="middle"
              height={36}
            />
            <YAxis
              axisLine={true}
              tickLine={false}
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {chart.series && chart.series.length > 0 && (
              <Legend content={<CustomLegend />} />
            )}
            {chart.series && chart.series.length > 0 ? (
              // Multiple lines
              chart.series.map((seriesKey, index) => (
                <Line
                  key={seriesKey}
                  type="monotone"
                  dataKey={seriesKey}
                  stroke={lineColors[index % lineColors.length]}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: lineColors[index % lineColors.length], strokeWidth: 0 }}
                />
              ))
            ) : (
              // Single line (backward compatibility)
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
              />
            )}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={transformedData} margin={{ top: 16, right: 36, left: 28, bottom: 16 }}>
            <XAxis
              dataKey="name"
              axisLine={true}
              tickLine={false}
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
              angle={0}
              textAnchor="middle"
              height={36}
            />
            <YAxis
              axisLine={true}
              tickLine={false}
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
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
          <BarChart data={transformedData} margin={{ top: 16, right: 36, left: 28, bottom: 16 }}>
            <XAxis
              dataKey="name"
              axisLine={true}
              tickLine={false}
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
              angle={0}
              textAnchor="middle"
              height={36}
            />
            <YAxis
              axisLine={true}
              tickLine={false}
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
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
      <div className={chart.type === 'pie' ? "h-[405px] w-full pl-2 pr-6 sm:pl-3 sm:pr-8 pt-2 pb-2" : "h-80 w-full pl-2 pr-6 sm:pl-3 sm:pr-8 pt-2 pb-2"}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
