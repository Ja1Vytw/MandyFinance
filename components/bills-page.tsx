"use client"
import { useState } from "react"
import { type FinancialData, addBill, updateBill, deleteBill, getFinancialData } from "@/lib/storage"
import { Plus, Trash2, Check, AlertTriangle, Clock } from "lucide-react"
import BillForm from "./bill-form"

interface BillsPageProps {
  data: FinancialData
  onDataChange: (data: FinancialData) => void
}

export default function BillsPage({ data, onDataChange }: BillsPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOwner, setFilterOwner] = useState<"all" | "joint" | "partner1" | "partner2">("all")
  const [editingId, setEditingId] = useState<string | null>(null)

  const pendingBills = data.bills.filter((b) => b.status === "pending")
  const paidBills = data.bills.filter((b) => b.status === "paid")

  const overdueBills = pendingBills.filter((b) => new Date(b.dueDate) < new Date())
  const upcomingBills = pendingBills.filter((b) => new Date(b.dueDate) >= new Date())

  const pendingTotal = pendingBills.reduce((sum, b) => sum + b.amount, 0)
  const overdueTotal = overdueBills.reduce((sum, b) => sum + b.amount, 0)

  const filteredPendingBills = pendingBills
    .filter((b) => filterOwner === "all" || b.owner === filterOwner)
    .filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const handleFormSubmit = async (billData: {
    name: string
    amount: number
    dueDate: string
    owner: "partner1" | "partner2" | "joint"
  }) => {
    try {
      if (editingId) {
        await updateBill(editingId, billData)
        setEditingId(null)
      } else {
        await addBill({
          ...billData,
          status: "pending",
        })
      }
      setShowForm(false)
      // Recarregar dados do backend
      const updatedData = await getFinancialData()
      onDataChange(updatedData)
    } catch (error) {
      console.error('Error saving bill:', error)
      alert('Erro ao salvar conta')
    }
  }

  const handleEdit = (bill: (typeof data.bills)[0]) => {
    setEditingId(bill.id)
    setShowForm(true)
  }

  const handleMarkPaid = async (id: string) => {
    try {
      await updateBill(id, { status: "paid" })
      // Recarregar dados do backend
      const updatedData = await getFinancialData()
      onDataChange(updatedData)
    } catch (error) {
      console.error('Error updating bill:', error)
      alert('Erro ao atualizar conta')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar esta conta?')) {
      return
    }
    try {
      await deleteBill(id)
      // Recarregar dados do backend
      const updatedData = await getFinancialData()
      onDataChange(updatedData)
    } catch (error) {
      console.error('Error deleting bill:', error)
      alert('Erro ao deletar conta')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const editingBill = editingId ? data.bills.find((b) => b.id === editingId) : undefined

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Contas</h1>
          <p className="text-muted-foreground mt-2">Rastreie e gerencie suas contas</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            Adicionar Conta
          </button>
        )}
      </div>

      {showForm && <BillForm onSubmit={handleFormSubmit} onCancel={handleCancelForm} initialData={editingBill} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium mb-2">Total Pendente</p>
              <p className="text-3xl font-bold text-foreground">
                R$ {pendingTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Clock className="text-primary" size={24} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium mb-2">Vencidas</p>
              <p className="text-3xl font-bold text-destructive">
                R$ {overdueTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <AlertTriangle className="text-destructive" size={24} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium mb-2">Quantidade de Contas</p>
              <p className="text-3xl font-bold text-accent">{pendingBills.length}</p>
            </div>
            <Clock className="text-accent" size={24} />
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueBills.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Contas Vencidas</h3>
              <p className="text-sm text-destructive/80">
                Você tem {overdueBills.length} conta{overdueBills.length !== 1 ? "s" : ""} vencida
                {overdueBills.length !== 1 ? "s" : ""} totalizando R${" "}
                {overdueTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Pesquisar contas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-input rounded-lg bg-background"
        />
        <select
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value as any)}
          className="px-4 py-2 border border-input rounded-lg bg-background min-w-[200px]"
        >
          <option value="all">Todos os Proprietários</option>
          <option value="joint">Conjunta</option>
          <option value="partner1">João</option>
          <option value="partner2">Amanda</option>
        </select>
      </div>

      {/* Pending Bills */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Contas Pendentes ({filteredPendingBills.length})</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {filteredPendingBills.length === 0 ? (
            <p className="p-6 text-muted-foreground">Nenhuma conta pendente</p>
          ) : (
            filteredPendingBills.map((bill) => {
              const dueDate = new Date(bill.dueDate)
              const today = new Date()
              const isOverdue = dueDate < today
              const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

              return (
                <div
                  key={bill.id}
                  className={`flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-secondary/5 transition-colors ${
                    isOverdue ? "bg-destructive/5" : ""
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{bill.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bill.dueDate).toLocaleDateString("pt-BR")} • {bill.owner}
                      {isOverdue && <span className="ml-2 text-destructive font-semibold">VENCIDA</span>}
                      {!isOverdue && daysUntilDue <= 3 && (
                        <span className="ml-2 text-yellow-600 font-semibold">
                          Vence em {daysUntilDue} dia{daysUntilDue !== 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-foreground min-w-fit">
                      R$ {bill.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => handleEdit(bill)}
                      className="px-3 py-1 text-sm bg-secondary text-foreground rounded hover:bg-secondary/80 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleMarkPaid(bill.id)}
                      className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors"
                      title="Marcar como paga"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(bill.id)}
                      className="p-2 hover:bg-destructive/20 rounded-lg text-destructive transition-colors"
                      title="Deletar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Paid Bills */}
      {paidBills.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Contas Pagas ({paidBills.length})</h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {paidBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 border-b border-border last:border-0 opacity-60"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground line-through">{bill.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Paga: {new Date(bill.dueDate).toLocaleDateString("pt-BR")} • {bill.owner}
                  </p>
                </div>
                <p className="font-bold text-foreground">
                  R$ {bill.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
