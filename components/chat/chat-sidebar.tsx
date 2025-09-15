"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Plus, Trash2, Menu, X, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "date-fns"
interface Message {
  role: "user" | "assistant"
  content: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  conversations: Conversation[]
  currentConversationId: string | null
  onNewConversation: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
}

export function Sidebar({
  isOpen,
  onToggle,
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation
}: SidebarProps) {


  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 left-6 z-50"
      >
        {
          !isOpen && (
            <Button
              onClick={onToggle}
              variant="ghost"
              size="sm"
              className="relative h-12 w-12 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/20 text-white hover:bg-black/50 hover:text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden group"
            >

              <div className="pointer-events-none absolute inset-px rounded-[inherit] bg-gradient-to-b from-white/10 to-transparent" />
              <motion.div
                animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {!isOpen && <Menu className="h-5 w-5" />}
              </motion.div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl transition-opacity duration-300" />
            </Button>
          )
        }

      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
            className="fixed left-0 top-0 h-full w-80 lg:w-80 md:w-72 sm:w-64 bg-black/30 backdrop-blur-3xl border-r border-white/15 z-40 flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px) saturate(180%)'
            }}
          >
            <div className="pointer-events-none absolute inset-px bg-gradient-to-br from-white/8 via-transparent to-white/4 rounded-r-lg" />
            <div className="pointer-events-none absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent" />

            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-medium">Conversations</h2>
                <Button
                  onClick={onToggle}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={() => {
                  onNewConversation()
                  onToggle()
                }}
                className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl h-10"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>

            {/* Conversations list */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-3">
                {conversations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4 inline-block">
                      <MessageSquare className="h-8 w-8 text-white/40" />
                    </div>
                    <p className="text-white/50 text-sm font-medium mb-2">No conversations</p>
                    <p className="text-white/30 text-xs">Start a new conversation</p>
                  </motion.div>
                ) : (
                  conversations
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map((conversation, index) => (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`group relative rounded-xl p-3 cursor-pointer transition-all ${currentConversationId === conversation.id
                          ? 'bg-white/15 border border-white/20'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
                          }`}
                        onClick={() => {
                          onSelectConversation(conversation.id)
                          onToggle()
                        }}
                      >

                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-4 w-4 text-white/60 mt-0.5 shrink-0" />

                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium ">
                              {conversation.title.slice(0, 20)}
                              {conversation.title.length > 24 && '...'}
                            </p>
                            <p className="text-white/50 text-xs mt-1">
                              {formatDate(conversation.updatedAt, 'HH:mm')}
                            </p>
                            <p className="text-white/40 text-xs mt-1 truncate">
                              {conversation.messages.length} message{conversation.messages.length > 1 ? 's' : ''}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-70 group-hover:opacity-100 h-6 w-6 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/20 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteConversation(conversation.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-6 border-t border-white/8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-400/80" />
                  <span className="text-white/60 text-xs font-medium">
                    {conversations.length} conversation{conversations.length > 1 ? 's' : ''} saved
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}