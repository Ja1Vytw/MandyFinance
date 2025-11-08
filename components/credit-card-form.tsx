"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { CreditCard } from "@/lib/storage"
import { X } from "lucide-react"

interface CreditCardFormProps {
  onSubmit: (cardData: {
    holder: "partner1" | "partner2"
    cardName: string
    limit: number
    available: number
    invoiceAmount: number
    invoiceDueDate: string
    color?: string
  }) => void
  onCancel: () => void
  initialData?: CreditCard
}

const AVAILABLE_COLORS = [
  { value: "blue", label: "Azul", class: "bg-blue-600" },
  { value: "green", label: "Verde", class: "bg-green-600" },
  { value: "red", label: "Vermelho", class: "bg-red-600" },
  { value: "purple", label: "Roxo", class: "bg-purple-600" },
  { value: "orange", label: "Laranja", class: "bg-orange-600" },
  { value: "yellow", label: "Amarelo", class: "bg-yellow-500" },
  { value: "pink", label: "Rosa", class: "bg-pink-600" },
  { value: "indigo", label: "Índigo", class: "bg-indigo-600" },
  { value: "teal", label: "Verde-azulado", class: "bg-teal-600" },
  { value: "gray", label: "Cinza", class: "bg-gray-600" },
]

export default function CreditCardForm({ onSubmit, onCancel, initialData }: CreditCardFormProps) {
  const [formData, setFormData] = useState({
    holder: (initialData?.holder || "partner1") as "partner1" | "partner2",
    cardName: initialData?.cardName || "",
    limit: initialData?.limit.toString() || "",
    available: initialData?.available.toString() || "",
    invoiceAmount: initialData?.invoiceAmount.toString() || "0",
    invoiceDueDate: initialData?.invoiceDueDate || new Date().toISOString().split("T")[0],
    color: initialData?.color || "blue",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        holder: initialData.holder,
        cardName: initialData.cardName,
        limit: initialData.limit.toString(),
        available: initialData.available.toString(),
        invoiceAmount: initialData.invoiceAmount.toString(),
        invoiceDueDate: initialData.invoiceDueDate,
        color: initialData.color || "blue",
      })
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.cardName.trim()) {
      newErrors.cardName = "Nome do cartão é obrigatório"
    }

    if (!formData.limit || Number.parseFloat(formData.limit) <= 0) {
      newErrors.limit = "O limite deve ser maior que 0"
    }

    if (!formData.available || Number.parseFloat(formData.available) < 0) {
      newErrors.available = "O valor disponível não pode ser negativo"
    }

    if (Number.parseFloat(formData.available) > Number.parseFloat(formData.limit)) {
      newErrors.available = "O valor disponível não pode ser maior que o limite"
    }

    if (!formData.invoiceDueDate) {
      newErrors.invoiceDueDate = "Data de vencimento é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({
      holder: formData.holder,
      cardName: formData.cardName,
      limit: Number.parseFloat(formData.limit),
      available: Number.parseFloat(formData.available),
      invoiceAmount: Number.parseFloat(formData.invoiceAmount),
      invoiceDueDate: formData.invoiceDueDate,
      color: formData.color,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">
          {initialData ? "Editar Cartão" : "Adicionar Cartão de Crédito"}
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
          <label className="block text-sm font-medium text-foreground mb-2">Nome do Cartão</label>
          <input
            type="text"
            placeholder="Ex: Cartão Azul, Nubank, etc."
            value={formData.cardName}
            onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.cardName ? "border-destructive" : "border-input"
            }`}
          />
          {errors.cardName && <p className="text-xs text-destructive mt-1">{errors.cardName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Titular</label>
          <select
            value={formData.holder}
            onChange={(e) => setFormData({ ...formData, holder: e.target.value as "partner1" | "partner2" })}
            className="w-full px-4 py-2 border border-input rounded-lg bg-background"
          >
            <option value="partner1">João</option>
            <option value="partner2">Amanda</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Limite (R$)</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.limit}
            onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.limit ? "border-destructive" : "border-input"
            }`}
          />
          {errors.limit && <p className="text-xs text-destructive mt-1">{errors.limit}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Disponível (R$)</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.available}
            onChange={(e) => setFormData({ ...formData, available: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.available ? "border-destructive" : "border-input"
            }`}
          />
          {errors.available && <p className="text-xs text-destructive mt-1">{errors.available}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Valor da Fatura (R$)</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.invoiceAmount}
            onChange={(e) => setFormData({ ...formData, invoiceAmount: e.target.value })}
            className="w-full px-4 py-2 border border-input rounded-lg bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Data de Vencimento da Fatura</label>
          <input
            type="date"
            value={formData.invoiceDueDate}
            onChange={(e) => setFormData({ ...formData, invoiceDueDate: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
              errors.invoiceDueDate ? "border-destructive" : "border-input"
            }`}
          />
          {errors.invoiceDueDate && <p className="text-xs text-destructive mt-1">{errors.invoiceDueDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Cor do Cartão</label>
          <div className="grid grid-cols-5 gap-2">
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className={`w-full h-12 rounded-lg border-2 transition-all ${
                  formData.color === color.value
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-primary/50"
                }`}
                style={{ backgroundColor: color.value === "blue" ? "#2563eb" : 
                                 color.value === "green" ? "#16a34a" :
                                 color.value === "red" ? "#dc2626" :
                                 color.value === "purple" ? "#9333ea" :
                                 color.value === "orange" ? "#ea580c" :
                                 color.value === "yellow" ? "#eab308" :
                                 color.value === "pink" ? "#db2777" :
                                 color.value === "indigo" ? "#4f46e5" :
                                 color.value === "teal" ? "#0d9488" :
                                 color.value === "gray" ? "#4b5563" : "#2563eb" }}
                title={color.label}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Cor selecionada: <span className="font-medium">{AVAILABLE_COLORS.find(c => c.value === formData.color)?.label}</span>
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          {initialData ? "Atualizar" : "Adicionar"} Cartão
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

