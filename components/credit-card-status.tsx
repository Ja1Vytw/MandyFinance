"use client"

import type { FinancialData } from "@/lib/storage"
import { CreditCard } from "lucide-react"

interface CreditCardStatusProps {
  data: FinancialData
}

export default function CreditCardStatus({ data }: CreditCardStatusProps) {
  const totalLimit = data.creditCards.reduce((sum, card) => sum + card.limit, 0)
  const totalAvailable = data.creditCards.reduce((sum, card) => sum + card.available, 0)
  const totalInvoice = data.creditCards.reduce((sum, card) => sum + card.invoiceAmount, 0)
  const utilizationPercent = ((totalLimit - totalAvailable) / totalLimit) * 100

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Visão Geral de Cartões</h2>
        <CreditCard className="text-primary" size={24} />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Utilização Geral</span>
            <span className="text-sm font-bold text-foreground">{utilizationPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${utilizationPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Limite Total</p>
            <p className="text-lg font-bold text-foreground">R$ {totalLimit.toLocaleString("pt-BR")}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Disponível</p>
            <p className="text-lg font-bold text-accent">R$ {totalAvailable.toLocaleString("pt-BR")}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Fatura Atual</p>
            <p className="text-lg font-bold text-destructive">R$ {totalInvoice.toLocaleString("pt-BR")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
