"use client"

import { useState } from "react"
import type { FinancialData } from "@/lib/storage"
import { addInvestment, updateInvestment, deleteInvestment, getFinancialData } from "@/lib/storage"
import { TrendingUp, TrendingDown, Plus, Trash2 } from "lucide-react"
import InvestmentForm from "./investment-form"
import InvestmentYieldCalculator from "./investment-yield-calculator"

interface InvestmentsPageProps {
  data: FinancialData
  onDataChange: (data: FinancialData) => void
}

export default function InvestmentsPage({ data, onDataChange }: InvestmentsPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterOwner, setFilterOwner] = useState<"all" | "partner1" | "partner2" | "joint">("all")
  const [activeTab, setActiveTab] = useState<"list" | "yield">("list")

  const totalInvested = data.investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalCurrentValue = data.investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalProfit = totalCurrentValue - totalInvested
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

  const partner1Invested = data.investments
    .filter((i) => i.owner === "partner1")
    .reduce((sum, inv) => sum + inv.amount, 0)
  const partner2Invested = data.investments
    .filter((i) => i.owner === "partner2")
    .reduce((sum, inv) => sum + inv.amount, 0)
  const jointInvested = data.investments.filter((i) => i.owner === "joint").reduce((sum, inv) => sum + inv.amount, 0)

  const investmentsByType = Array.from(new Set(data.investments.map((i) => i.type)))
    .map((type) => {
      const investments = data.investments.filter((i) => i.type === type)
      const amount = investments.reduce((sum, inv) => sum + inv.amount, 0)
      return { type, amount, count: investments.length }
    })
    .sort((a, b) => b.amount - a.amount)

  const filteredInvestments =
    filterOwner === "all" ? data.investments : data.investments.filter((i) => i.owner === filterOwner)

  const handleFormSubmit = async (investmentData: any) => {
    try {
      if (editingId) {
        await updateInvestment(editingId, investmentData)
        setEditingId(null)
      } else {
        await addInvestment(investmentData)
      }
      setShowForm(false)
      // Recarregar dados do backend
      const updatedData = await getFinancialData()
      onDataChange(updatedData)
    } catch (error) {
      console.error('Error saving investment:', error)
      alert('Erro ao salvar investimento')
    }
  }

  const handleEdit = (investment: (typeof data.investments)[0]) => {
    setEditingId(investment.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar este investimento?')) {
      return
    }
    try {
      await deleteInvestment(id)
      // Recarregar dados do backend
      const updatedData = await getFinancialData()
      onDataChange(updatedData)
    } catch (error) {
      console.error('Error deleting investment:', error)
      alert('Erro ao deletar investimento')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const editingInvestment = editingId ? data.investments.find((i) => i.id === editingId) : undefined

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investimentos</h1>
          <p className="text-muted-foreground mt-2">Rastreie sua carteira de investimentos</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            Adicionar Investimento
          </button>
        )}
      </div>

      {showForm && (
        <InvestmentForm onSubmit={handleFormSubmit} onCancel={handleCancelForm} initialData={editingInvestment} />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-medium mb-2">Total Investido</p>
          <p className="text-3xl font-bold text-foreground">R$ {totalInvested.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-medium mb-2">Valor Atual</p>
          <p className="text-3xl font-bold text-accent">R$ {totalCurrentValue.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-medium mb-2">Lucro/Prejuízo Total</p>
          <div className="flex items-center gap-2">
            {totalProfit >= 0 ? (
              <TrendingUp className="text-green-600" size={24} />
            ) : (
              <TrendingDown className="text-red-600" size={24} />
            )}
            <p className={`text-3xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {totalProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-medium mb-2">ROI</p>
          <p className={`text-3xl font-bold ${profitPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
            {profitPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "list"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Lista de Investimentos
        </button>
        <button
          onClick={() => setActiveTab("yield")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "yield"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Simulador de Rendimento
        </button>
      </div>

      {activeTab === "yield" ? (
        <InvestmentYieldCalculator />
      ) : (
        <>
          {/* Ownership & Type Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Investimentos por Proprietário</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">João</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    R$ {partner1Invested.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Amanda</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    R$ {partner2Invested.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Conjunta</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    R$ {jointInvested.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Investimentos por Tipo</h3>
              <div className="space-y-3 max-h-32 overflow-y-auto">
                {investmentsByType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-foreground">
                      {item.type} ({item.count})
                    </span>
                    <span className="text-sm font-mono text-muted-foreground">
                      R$ {item.amount.toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Filtrar por Proprietário</label>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value as any)}
              className="px-4 py-2 border border-input rounded-lg bg-background text-foreground min-w-[200px]"
            >
              <option value="all">Todos os Investimentos</option>
              <option value="partner1">João</option>
              <option value="partner2">Amanda</option>
              <option value="joint">Conjunta</option>
            </select>
          </div>

          {/* Investments List */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-4 font-bold text-foreground">Investimento</th>
                    <th className="text-left p-4 font-bold text-foreground">Tipo</th>
                    <th className="text-right p-4 font-bold text-foreground">Investido</th>
                    <th className="text-right p-4 font-bold text-foreground">Valor Atual</th>
                    <th className="text-right p-4 font-bold text-foreground">Lucro/Prejuízo</th>
                    <th className="text-right p-4 font-bold text-foreground">Retorno %</th>
                    <th className="text-left p-4 font-bold text-foreground">Proprietário</th>
                    <th className="text-center p-4 font-bold text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInvestments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-muted-foreground">
                        Nenhum investimento encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredInvestments.map((inv) => {
                      const profit = inv.currentValue - inv.amount
                      const returnPercentage = inv.amount > 0 ? (profit / inv.amount) * 100 : 0

                      return (
                        <tr key={inv.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="p-4 font-medium text-foreground">{inv.name}</td>
                          <td className="p-4 text-muted-foreground">{inv.type}</td>
                          <td className="p-4 text-right font-medium text-foreground">
                            R$ {inv.amount.toLocaleString("pt-BR")}
                          </td>
                          <td className="p-4 text-right font-medium text-foreground">
                            R$ {inv.currentValue.toLocaleString("pt-BR")}
                          </td>
                          <td className={`p-4 text-right font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            R$ {profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td
                            className={`p-4 text-right font-bold ${returnPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {returnPercentage.toFixed(2)}%
                          </td>
                          <td className="p-4 text-muted-foreground capitalize">{inv.owner}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(inv)}
                                className="px-2 py-1 text-xs bg-secondary text-foreground rounded hover:bg-secondary/80 transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(inv.id)}
                                className="p-1 hover:bg-destructive/20 rounded text-destructive transition-colors"
                                title="Deletar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results count */}
          {filteredInvestments.length > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Exibindo {filteredInvestments.length} investimento{filteredInvestments.length !== 1 ? "s" : ""}
            </p>
          )}
        </>
      )}
    </div>
  )
}
