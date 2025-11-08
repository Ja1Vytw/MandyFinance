"use client"

import type { CreditCard as CreditCardType } from "@/lib/storage"
import { CreditCardIcon, AlertCircle } from "lucide-react"

interface CreditCardProps {
  card: CreditCardType
}

// Mapeamento de cores para gradientes
const colorGradients: Record<string, { from: string; to: string; text: string }> = {
  blue: { from: "from-blue-600", to: "to-blue-400", text: "text-white" },
  green: { from: "from-green-600", to: "to-green-400", text: "text-white" },
  red: { from: "from-red-600", to: "to-red-400", text: "text-white" },
  purple: { from: "from-purple-600", to: "to-purple-400", text: "text-white" },
  orange: { from: "from-orange-600", to: "to-orange-400", text: "text-white" },
  yellow: { from: "from-yellow-500", to: "to-yellow-300", text: "text-gray-900" },
  pink: { from: "from-pink-600", to: "to-pink-400", text: "text-white" },
  indigo: { from: "from-indigo-600", to: "to-indigo-400", text: "text-white" },
  teal: { from: "from-teal-600", to: "to-teal-400", text: "text-white" },
  gray: { from: "from-gray-600", to: "to-gray-400", text: "text-white" },
}

export default function CreditCardDisplay({ card }: CreditCardProps) {
  const utilizationPercent = ((card.limit - card.available) / card.limit) * 100
  const isHighUtilization = utilizationPercent > 80
  const lastDigits = card.id.slice(-4) || "0000"
  const cardColor = card.color || "blue"
  const colorConfig = colorGradients[cardColor] || colorGradients.blue

  return (
    <div
      className={`relative rounded-lg p-6 overflow-hidden transition-all ${
        isHighUtilization
          ? "bg-gradient-to-br from-destructive/20 to-destructive/10 text-foreground"
          : `bg-gradient-to-br ${colorConfig.from} ${colorConfig.to} ${colorConfig.text}`
      }`}
    >
      <div className="absolute inset-0 opacity-10" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">{card.cardName}</p>
            <p className="text-xs opacity-75">Titular: {card.holder === "partner1" ? "João" : "Amanda"}</p>
          </div>
          <CreditCardIcon size={28} />
        </div>

        <div className="border-t border-current opacity-20 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Número do Cartão</span>
            <span className="font-mono text-lg font-bold">**** {lastDigits}</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Utilização de Crédito</span>
                <span className="font-bold">{utilizationPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-current opacity-20 rounded-full h-2.5">
                <div
                  className={`rounded-full h-2.5 transition-all ${
                    isHighUtilization 
                      ? "bg-destructive" 
                      : colorConfig.text === "text-white" 
                        ? "bg-white" 
                        : "bg-gray-900"
                  }`}
                  style={{ width: `${utilizationPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs opacity-75">Disponível</p>
                <p className="font-bold">R$ {card.available.toLocaleString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-xs opacity-75">Limite</p>
                <p className="font-bold">R$ {card.limit.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-current opacity-20 mt-4 pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs opacity-75">Fatura Atual</p>
                <p className={`font-bold text-lg ${card.invoiceStatus === 'paid' ? 'line-through opacity-60' : ''}`}>
                  R$ {card.invoiceAmount.toLocaleString("pt-BR")}
                </p>
                {card.invoiceStatus === 'paid' && (
                  <p className="text-xs text-green-400 font-semibold mt-1">✓ Paga</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Data de Vencimento</p>
                <p className="font-bold">{new Date(card.invoiceDueDate).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isHighUtilization && (
        <div className="mt-4 flex items-center gap-2 bg-destructive/20 text-destructive px-3 py-2 rounded-lg">
          <AlertCircle size={16} />
          <span className="text-xs font-semibold">Alta utilização</span>
        </div>
      )}
    </div>
  )
}
