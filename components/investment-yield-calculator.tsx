"use client"

import { useState, useEffect } from "react"
import { getFinancialData, calculateInvestmentYield, updateInvestmentWithYield } from "@/lib/storage"
import type { Investment } from "@/lib/storage"
import { TrendingUp, BarChart3 } from "lucide-react"

export default function InvestmentYieldCalculator() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [yields, setYields] = useState<Record<string, { monthly: number; annual: number }>>({})

  useEffect(() => {
    loadInvestments()
  }, [])

  const loadInvestments = () => {
    const data = getFinancialData()
    setInvestments(data.investments || [])

    // Calculate yields for each investment
    const calculatedYields: Record<string, { monthly: number; annual: number }> = {}
    data.investments?.forEach((inv) => {
      const monthlyYield = calculateInvestmentYield(inv)
      calculatedYields[inv.id] = {
        monthly: monthlyYield,
        annual: monthlyYield * 12,
      }
    })
    setYields(calculatedYields)
  }

  const handleApplyYield = (investmentId: string) => {
    updateInvestmentWithYield(investmentId)
    loadInvestments()
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalYield = totalCurrent - totalInvested

  const getYieldColor = (type: string) => {
    switch (type) {
      case "CDB":
        return "text-blue-600"
      case "Renda Fixa":
        return "text-green-600"
      case "Poupança":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Total Investido</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Valor Atual</p>
          <p className="text-2xl font-bold text-primary">
            R$ {totalCurrent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Rendimento Total</p>
          <p className={`text-2xl font-bold ${totalYield >= 0 ? "text-green-600" : "text-destructive"}`}>
            R$ {totalYield.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <BarChart3 size={20} />
          Simulador de Rendimento
        </h3>

        {investments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
            Nenhum investimento configurado
          </div>
        ) : (
          investments.map((inv) => {
            const yield_data = yields[inv.id]
            const roi = ((inv.currentValue - inv.amount) / inv.amount) * 100

            return (
              <div key={inv.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">{inv.name}</h4>
                    <p className={`text-sm font-medium ${getYieldColor(inv.type)}`}>{inv.type}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {inv.owner === "partner1" ? "João" : inv.owner === "partner2" ? "Amanda" : "Conjunta"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Investido</p>
                    <p className="font-bold text-foreground">
                      R$ {inv.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Atual</p>
                    <p className="font-bold text-primary">
                      R$ {inv.currentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rendimento Mês</p>
                    <p className="font-bold text-green-600">
                      R$ {(yield_data?.monthly || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className={`font-bold ${roi >= 0 ? "text-green-600" : "text-destructive"}`}>{roi.toFixed(2)}%</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    Rendimento anualizado: R${" "}
                    {(yield_data?.annual || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => handleApplyYield(inv.id)}
                    className="w-full bg-primary text-primary-foreground text-sm px-3 py-1 rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={14} />
                    Aplicar Rendimento do Mês
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
