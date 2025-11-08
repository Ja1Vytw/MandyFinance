"use client"

import type React from "react"
import { useState } from "react"
import type { Investment } from "@/lib/storage"
import { INVESTMENT_TYPES } from "@/lib/storage"
import { X } from "lucide-react"

interface InvestmentFormProps {
  onSubmit: (investmentData: {
    name: string
    type: string
    amount: number
    currentValue: number
    owner: "partner1" | "partner2" | "joint"
  }) => void
  onCancel: () => void
  initialData?: Investment
}

export default function InvestmentForm({ onSubmit, onCancel, initialData }: InvestmentFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "",
    amount: initialData?.amount.toString() || "",
    currentValue: initialData?.currentValue.toString() || "",
    owner: (initialData?.owner || "joint") as "partner1" | "partner2" | "joint",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome do investimento é obrigatório"
    }

    if (!formData.type) {
      newErrors.type = "Tipo é obrigatório"
    }

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "O valor deve ser maior que 0"
    }

    if (!formData.currentValue || Number.parseFloat(formData.currentValue) < 0) {
      newErrors.currentValue = "Valor atual deve ser 0 ou maior"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({
      name: formData.name,
      type: formData.type,
      amount: Number.parseFloat(formData.amount),
      currentValue: Number.parseFloat(formData.currentValue),
      owner: formData.owner,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">
          {initialData ? "Editar Investimento" : "Adicionar Novo Investimento"}
        </h3>
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
          <label className="block text-sm font-medium text-foreground mb-2">Nome do Investimento</label>
          <input
            type="text"
            placeholder="Ex: Ações da Apple, Fundo Tech"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.name ? "border-destructive" : "border-input"
            }`}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.type ? "border-destructive" : "border-input"
            }`}
          >
            <option value="">Selecione tipo</option>
            {INVESTMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && <p className="text-xs text-destructive mt-1">{errors.type}</p>}
          {formData.type === "CDB" && (
            <p className="text-xs text-muted-foreground mt-1">
              CDB rende 120% do CDI. Rendimento calculado automaticamente.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Valor Investido (R$)</label>
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
          <label className="block text-sm font-medium text-foreground mb-2">Valor Atual (R$)</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.currentValue}
            onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.currentValue ? "border-destructive" : "border-input"
            }`}
          />
          {errors.currentValue && <p className="text-xs text-destructive mt-1">{errors.currentValue}</p>}
        </div>

        <div className="md:col-span-2">
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
          {initialData ? "Atualizar Investimento" : "Adicionar Investimento"}
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
