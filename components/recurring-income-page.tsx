"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getRecurringIncomes, addRecurringIncome, updateRecurringIncome, deleteRecurringIncome } from "@/lib/storage"
import type { RecurringIncome } from "@/lib/storage"
import { Plus, Trash2, Edit2 } from "lucide-react"

export default function RecurringIncomePage() {
  const [incomes, setIncomes] = useState<RecurringIncome[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Salário",
    dayOfMonth: "5",
    origin: "partner1" as const,
    enabled: true,
  })

  useEffect(() => {
    loadIncomes()
  }, [])

  const loadIncomes = async () => {
    try {
      const data = await getRecurringIncomes()
      setIncomes(data)
    } catch (error) {
      console.error('Error loading recurring incomes:', error)
      setIncomes([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description || !formData.amount) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    try {
      if (editingId) {
        await updateRecurringIncome(editingId, {
          description: formData.description,
          amount: Number(formData.amount),
          category: formData.category,
          dayOfMonth: Number(formData.dayOfMonth),
          origin: formData.origin,
          enabled: formData.enabled,
        } as any)
      } else {
        await addRecurringIncome({
          description: formData.description,
          amount: Number(formData.amount),
          category: formData.category,
          dayOfMonth: Number(formData.dayOfMonth),
          origin: formData.origin,
          enabled: formData.enabled,
        })
      }

      resetForm()
      await loadIncomes()
    } catch (error) {
      console.error('Error saving recurring income:', error)
      alert('Erro ao salvar renda recorrente')
    }
  }

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      category: "Salário",
      dayOfMonth: "5",
      origin: "partner1",
      enabled: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (income: RecurringIncome) => {
    setFormData({
      description: income.description,
      amount: income.amount.toString(),
      category: income.category,
      dayOfMonth: income.dayOfMonth.toString(),
      origin: income.origin,
      enabled: income.enabled,
    })
    setEditingId(income.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja deletar esta renda recorrente?")) {
      try {
        await deleteRecurringIncome(id)
        await loadIncomes()
      } catch (error) {
        console.error('Error deleting recurring income:', error)
        alert('Erro ao deletar renda recorrente')
      }
    }
  }

  const totalMonthly = Array.isArray(incomes) ? incomes.filter((i) => i.enabled).reduce((sum, i) => sum + i.amount, 0) : 0

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Rendas Recorrentes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Total mensal:{" "}
            <span className="text-green-600 font-bold">
              R$ {totalMonthly.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Renda
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">
            {editingId ? "Editar Renda Recorrente" : "Adicionar Renda Recorrente"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Salário, Auxílio"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Valor (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              >
                <option>Salário</option>
                <option>Auxílio</option>
                <option>VR</option>
                <option>Vale-Refeição</option>
                <option>Outra Renda</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Dia do Mês</label>
              <input
                type="number"
                min="1"
                max="28"
                value={formData.dayOfMonth}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Origem</label>
              <select
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value as any })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              >
                <option value="partner1">João</option>
                <option value="partner2">Amanda</option>
                <option value="joint">Conjunta</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="enabled" className="text-sm font-medium text-foreground">
                Ativo
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90">
              {editingId ? "Atualizar" : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:opacity-90"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {incomes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
            Nenhuma renda recorrente configurada
          </div>
        ) : (
          incomes.map((income) => (
            <div
              key={income.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary transition-colors"
            >
              <div>
                <h3 className="font-medium text-foreground">{income.description}</h3>
                <p className="text-sm text-muted-foreground">
                  {income.enabled ? "✓ Ativo" : "✗ Inativo"} • Dia {income.dayOfMonth} •{" "}
                  {income.origin === "partner1" ? "João" : income.origin === "partner2" ? "Amanda" : "Conjunta"}
                </p>
                <p className="text-green-600 font-bold mt-1">
                  R$ {income.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(income)}
                  className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(income.id)}
                  className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
