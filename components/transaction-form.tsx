"use client"

import type React from "react"
import { useState } from "react"
import { TRANSACTION_CATEGORIES } from "@/lib/storage"
import { X } from "lucide-react"

interface TransactionFormProps {
  onSubmit: (transactionData: {
    description: string
    amount: number
    category: string
    origin: "partner1" | "partner2" | "joint"
    type: "income" | "expense"
  }) => void
  onCancel: () => void
}

export default function TransactionForm({ onSubmit, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    origin: "joint" as const,
    type: "expense" as const,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = formData.type === "income" ? TRANSACTION_CATEGORIES.income : TRANSACTION_CATEGORIES.expense

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória"
    }

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "O valor deve ser maior que 0"
    }

    if (!formData.category) {
      newErrors.category = "Categoria é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({
      description: formData.description,
      amount: Number.parseFloat(formData.amount),
      category: formData.category,
      origin: formData.origin,
      type: formData.type,
    })

    setFormData({ description: "", amount: "", category: "", origin: "joint", type: "expense" })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Adicionar Transação</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Transaction Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
          className={`py-2 px-4 rounded-lg font-medium transition-colors ${
            formData.type === "expense"
              ? "bg-destructive text-destructive-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: "income", category: "" })}
          className={`py-2 px-4 rounded-lg font-medium transition-colors ${
            formData.type === "income"
              ? "bg-green-600 text-white"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          Renda
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
          <input
            type="text"
            placeholder="Ex: Compras no supermercado"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.description ? "border-destructive" : "border-input"
            }`}
          />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Valor (R$)</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.amount ? "border-destructive" : "border-input"
            }`}
          />
          {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Categoria</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.category ? "border-destructive" : "border-input"
            }`}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Origem</label>
          <select
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value as any })}
            className="w-full px-4 py-2 border border-input rounded-lg bg-background"
          >
            <option value="joint">Conjunta</option>
            <option value="partner1">João</option>
            <option value="partner2">Amanda</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Adicionar Transação
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
