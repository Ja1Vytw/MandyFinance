"use client"

import type React from "react"
import { useState } from "react"
import type { Bill } from "@/lib/storage"
import { X } from "lucide-react"

interface BillFormProps {
  onSubmit: (billData: {
    name: string
    amount: number
    dueDate: string
    owner: "partner1" | "partner2" | "joint"
  }) => void
  onCancel: () => void
  initialData?: Bill
}

export default function BillForm({ onSubmit, onCancel, initialData }: BillFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    amount: initialData?.amount.toString() || "",
    dueDate: initialData?.dueDate || "",
    owner: (initialData?.owner || "joint") as "partner1" | "partner2" | "joint",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome da conta é obrigatório"
    }

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "O valor deve ser maior que 0"
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Data de vencimento é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({
      name: formData.name,
      amount: Number.parseFloat(formData.amount),
      dueDate: formData.dueDate,
      owner: formData.owner,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">{initialData ? "Editar Conta" : "Adicionar Nova Conta"}</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nome da Conta</label>
          <input
            type="text"
            placeholder="Ex: Aluguel, Energia, Internet"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.name ? "border-destructive" : "border-input"
            }`}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
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
          <label className="block text-sm font-medium text-foreground mb-2">Data de Vencimento</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.dueDate ? "border-destructive" : "border-input"
            }`}
          />
          {errors.dueDate && <p className="text-xs text-destructive mt-1">{errors.dueDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Proprietário</label>
          <select
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value as any })}
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
          {initialData ? "Atualizar Conta" : "Adicionar Conta"}
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
