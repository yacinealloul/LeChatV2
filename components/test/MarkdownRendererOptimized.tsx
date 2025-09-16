"use client"

import React, { memo, useMemo, useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface MarkdownRendererOptimizedProps {
  content: string
  className?: string
  isStreaming?: boolean
  streamingThrottle?: number // ms to throttle updates during streaming
}

// Memoized components (same as main component)
const CodeComponent = memo(({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '')

  if (!inline && match) {
    return (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        customStyle={{
          margin: '1rem 0',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    )
  }

  return (
    <code className="bg-black/30 px-1 py-0.5 rounded text-sm" {...props}>
      {children}
    </code>
  )
})

const createSimpleComponent = (tag: string, className: string) =>
  memo(({ children }: any) => React.createElement(tag, { className }, children))

// Pre-create all components to avoid recreation
const components = {
  code: CodeComponent,
  table: memo(({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-white/20 rounded-lg">
        {children}
      </table>
    </div>
  )),
  th: createSimpleComponent('th', 'border border-white/20 px-3 py-2 bg-white/5 font-semibold text-left'),
  td: createSimpleComponent('td', 'border border-white/20 px-3 py-2'),
  blockquote: createSimpleComponent('blockquote', 'border-l-4 border-white/30 pl-4 my-4 italic text-white/80'),
  h1: createSimpleComponent('h1', 'text-xl font-bold my-4'),
  h2: createSimpleComponent('h2', 'text-lg font-semibold my-3'),
  h3: createSimpleComponent('h3', 'text-base font-medium my-2'),
  p: createSimpleComponent('p', 'my-2 leading-relaxed'),
  ul: createSimpleComponent('ul', 'list-disc ml-4 my-2'),
  ol: createSimpleComponent('ol', 'list-decimal ml-4 my-2'),
  li: createSimpleComponent('li', 'my-1'),
}

// Pre-create plugin arrays
const remarkPlugins = [remarkGfm]
const rehypePlugins = [rehypeRaw, rehypeHighlight]

function MarkdownRendererOptimized({
  content,
  className = "",
  isStreaming = false,
  streamingThrottle = 100
}: MarkdownRendererOptimizedProps) {
  const [displayContent, setDisplayContent] = useState(content)
  const throttleRef = useRef<NodeJS.Timeout>(null)
  const lastUpdateRef = useRef<number>(0)

  // Advanced throttling for streaming content
  useEffect(() => {
    if (!isStreaming) {
      setDisplayContent(content)
      return
    }

    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    // Clear existing timeout
    if (throttleRef.current) {
      clearTimeout(throttleRef.current)
    }

    // If enough time has passed, update immediately
    if (timeSinceLastUpdate >= streamingThrottle) {
      setDisplayContent(content)
      lastUpdateRef.current = now
    } else {
      // Otherwise, schedule an update
      throttleRef.current = setTimeout(() => {
        setDisplayContent(content)
        lastUpdateRef.current = Date.now()
      }, streamingThrottle - timeSinceLastUpdate)
    }

    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }
    }
  }, [content, isStreaming, streamingThrottle])

  const memoizedClassName = useMemo(() =>
    `prose prose-invert prose-sm max-w-none ${className}`,
    [className]
  )

  return (
    <div className={memoizedClassName}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
        skipHtml={false}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  )
}

// Enhanced memoization with content length tracking
export default memo(MarkdownRendererOptimized, (prevProps, nextProps) => {
  // Skip re-render if props haven't meaningfully changed
  if (
    prevProps.content === nextProps.content &&
    prevProps.className === nextProps.className &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.streamingThrottle === nextProps.streamingThrottle
  ) {
    return true
  }

  // During streaming, be more selective about when to re-render
  if (prevProps.isStreaming && nextProps.isStreaming) {
    const contentLengthDiff = Math.abs(nextProps.content.length - prevProps.content.length)

    // Skip re-render for very small changes
    if (contentLengthDiff < 5) {
      return true
    }

    // Also skip if content only grew by whitespace
    if (nextProps.content.trim() === prevProps.content.trim()) {
      return true
    }
  }

  return false
})