"use client"

import { useSearchParams } from "next/navigation"
import { ChatClient } from "@/components/chat/chat-client"
import { motion } from "framer-motion"



export default function ChatPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('query') || '' // Faire attention a bien mettre ce que j'ai mit dans ligne 1
  return (


    <motion.div
      // Pour faire une transition sympa puisqu'on change de page pour que l'user ne voit pas 
      // To make sure that the transition is good and the user don't feel that we have changed the page.
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <ChatClient initialQuery={initialQuery} />
    </motion.div>
  )
}
