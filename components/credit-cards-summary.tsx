"use client"

import type { FinancialData } from "@/lib/storage"
import { AlertCircle } from "lucide-react"

interface CreditCardsSummaryProps {
  data: FinancialData
}

export default function CreditCardsSummary({ data }: CreditCardsSummaryProps) {
  const totalLimit = data.creditCards.reduce((sum, card) => sum + card.limit, 0)
  const totalUsed = data.creditCards.reduce((sum, card) => sum + (card.limit - card.available), 0)
  const totalInvoice = data.creditCards.reduce((sum, card) => sum + card.invoiceAmount, 0)
  const totalAvailable = data.creditCards.reduce((sum, card) => sum + card.available, 0)

  const utilizationPercent = (totalUsed / totalLimit) * 100
  const highUtilizationCards = data.creditCards.filter((c) => ((c.limit - c.available) / c.limit) * 100 > 80)

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Resumo de Cartões de Crédito</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Limite Total</p>
          <p className="text-2xl font-bold text-foreground">R$ {totalLimit.toLocaleString("pt-BR")}</p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Utilizado</p>
          <p className="text-2xl font-bold text-primary">R$ {totalUsed.toLocaleString("pt-BR")}</p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Disponível</p>
          <p className="text-2xl font-bold text-accent">R$ {totalAvailable.toLocaleString("pt-BR")}</p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Faturas Vencendo</p>
          <p className="text-2xl font-bold text-destructive">R$ {totalInvoice.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Utilização Geral</span>
          <span className="text-sm font-bold text-foreground">{utilizationPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${utilizationPercent > 80 ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
        </div>
      </div>

      {highUtilizationCards.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-destructive text-sm mb-1">Alerta de Alta Utilização</h3>
              <p className="text-xs text-destructive/80">
                {highUtilizationCards.length} cartão{highUtilizationCards.length !== 1 ? "es" : ""}{" "}
                {highUtilizationCards.length !== 1 ? "possuem" : "possui"} mais de 80% de utilização
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
