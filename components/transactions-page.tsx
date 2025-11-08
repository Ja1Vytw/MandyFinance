"use client"

import { useState } from "react"
import type { FinancialData } from "@/lib/storage"
import { addTransaction, getFinancialData } from "@/lib/storage"
import { Plus, Search } from "lucide-react"
import TransactionForm from "./transaction-form"
import TransactionStats from "./transaction-stats"

interface TransactionsPageProps {
  data: FinancialData
  onDataChange: (data: FinancialData) => void
}

export default function TransactionsPage({ data, onDataChange }: TransactionsPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterOrigin, setFilterOrigin] = useState<"all" | "partner1" | "partner2" | "joint">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTransactions = (data.transactions || [])
    .filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false
      if (filterOrigin !== "all" && t.origin !== filterOrigin) return false
      if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleFormSubmit = async (transactionData: any) => {
    try {
      await addTransaction({
        ...transactionData,
        date: new Date().toISOString(),
      })
      setShowForm(false)
      // Recarregar dados do backend
      const updatedData = await getFinancialData()
      onDataChange(updatedData)
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert('Erro ao salvar transação')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transações</h1>
          <p className="text-muted-foreground mt-2">Rastreie todas as suas transações financeiras</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            Adicionar Transação
          </button>
        )}
      </div>

      {showForm && <TransactionForm onSubmit={handleFormSubmit} onCancel={handleCancelForm} />}

      {/* Transaction Statistics */}
      <TransactionStats data={data} filterType={filterType} filterOrigin={filterOrigin} />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Pesquisar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border border-input rounded-lg bg-background text-foreground min-w-[200px]"
        >
          <option value="all">Todos os Tipos</option>
          <option value="income">Renda</option>
          <option value="expense">Despesas</option>
        </select>
        <select
          value={filterOrigin}
          onChange={(e) => setFilterOrigin(e.target.value as any)}
          className="px-4 py-2 border border-input rounded-lg bg-background text-foreground min-w-[200px]"
        >
          <option value="all">Todas as Origens</option>
          <option value="partner1">João</option>
          <option value="partner2">Amanda</option>
          <option value="joint">Conjunta</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <p className="p-6 text-muted-foreground text-center">Nenhuma transação encontrada</p>
        ) : (
          <div className="divide-y divide-border">
            {filteredTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 hover:bg-secondary/5 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.category} • {t.origin} • {new Date(t.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <p
                  className={`font-bold whitespace-nowrap ml-4 ${
                    t.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"} R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground text-center">
        Exibindo {filteredTransactions.length} transação{filteredTransactions.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
