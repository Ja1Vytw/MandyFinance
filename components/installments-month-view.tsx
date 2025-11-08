"use client"

import { useState, useEffect } from "react"
import { getInstallmentPurchases, getInstallmentsByPurchase } from "@/lib/storage"
import type { InstallmentPurchase, Installment } from "@/lib/storage"
import { Calendar } from "lucide-react"

export default function InstallmentsMonthView() {
  const [purchases, setPurchases] = useState<InstallmentPurchase[]>([])
  const [installmentsByMonth, setInstallmentsByMonth] = useState<Record<string, Installment[]>>({})
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await getInstallmentPurchases()
      setPurchases(data)

      // Organize installments by month
      const byMonth: Record<string, Installment[]> = {}
      for (const purchase of data) {
        const installments = await getInstallmentsByPurchase(purchase.id)
        installments.forEach((inst) => {
          const monthKey = inst.dueDate.substring(0, 7) // YYYY-MM
          if (!byMonth[monthKey]) byMonth[monthKey] = []
          byMonth[monthKey].push(inst)
        })
      }
      setInstallmentsByMonth(byMonth)
    } catch (error) {
      console.error('Error loading installments data:', error)
      setPurchases([])
      setInstallmentsByMonth({})
    }
  }

  const monthInstallments = Array.isArray(installmentsByMonth[selectedMonth]) ? installmentsByMonth[selectedMonth] : []
  const totalMonth = monthInstallments.reduce((sum, inst) => sum + inst.amount, 0)
  const paidMonth = monthInstallments.filter((inst) => inst.paid).reduce((sum, inst) => sum + inst.amount, 0)

  const months = Array.from(new Set(Object.keys(installmentsByMonth))).sort()
  const currentMonthIndex = months.indexOf(selectedMonth)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Calendar size={24} className="text-primary" />
        <h3 className="text-lg font-bold text-foreground">Visualizar por Mês</h3>
      </div>

      <div className="flex gap-2">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedMonth === month
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
          </button>
        ))}
      </div>

      {monthInstallments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
          Nenhuma parcela para este mês
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Total do Mês</p>
              <p className="text-xl font-bold text-foreground">
                R$ {totalMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Já Pago</p>
              <p className="text-xl font-bold text-green-600">
                R$ {paidMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="text-xl font-bold text-orange-600">
                R$ {(totalMonth - paidMonth).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="divide-y divide-border">
            {monthInstallments.map((inst) => (
              <div key={inst.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium">{inst.dueDate}</p>
                  <p
                    className={`text-xs ${inst.paid ? "line-through text-muted-foreground" : "text-muted-foreground"}`}
                  >
                    Parcela de compra
                  </p>
                </div>
                <p className={`font-bold ${inst.paid ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  R$ {inst.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
