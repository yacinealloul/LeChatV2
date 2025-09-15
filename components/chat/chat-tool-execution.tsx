"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Settings, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react'

interface ToolExecution {
  id: string
  name: string
  description: string
  status: 'starting' | 'running' | 'completed' | 'error' | 'hidden'
  progress?: number
  message?: string
  error?: string
}

interface ToolExecutionProps {
  tools: ToolExecution[]
}

const ToolIcon = ({ name }: { name: string }) => {
  switch (name) {
    case 'generate_chart':
      return <Settings className="h-4 w-4" />
    default:
      return <Zap className="h-4 w-4" />
  }
}

const StatusIcon = ({ status }: { status: ToolExecution['status'] }) => {
  switch (status) {
    case 'starting':
    case 'running':
      return <Loader2 className="h-4 w-4 animate-spin text-white/60" />
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-400" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-400" />
    default:
      return <Loader2 className="h-4 w-4 animate-spin text-white/60" />
  }
}

export default function ToolExecutionComponent({ tools }: ToolExecutionProps) {
  if (!tools || tools.length === 0) return null

  // Only show tools that are active (hide completed/hidden ones)
  const activeTools = tools.filter(tool => 
    tool.status === 'starting' || 
    tool.status === 'running' || 
    tool.status === 'error'
  )

  if (activeTools.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      <AnimatePresence>
        {activeTools.map((tool) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 text-sm text-white/70 py-2 px-3 rounded-lg bg-white/5 border border-white/10"
          >
            <StatusIcon status={tool.status} />
            <span className="truncate font-medium">{tool.description}</span>
            {tool.progress !== undefined && tool.status === 'running' && (
              <div className="ml-auto flex items-center gap-2">
                <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${tool.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs text-white/50 min-w-[30px]">{tool.progress}%</span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}