"use client"

import { Bot } from "lucide-react"

interface AIActionButtonProps {
  onClick?: () => void
}

export default function AIActionButton({ onClick }: AIActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir assistente de IA"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Bot size={24} />
    </button>
  )
}

