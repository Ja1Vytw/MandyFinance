"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  addInstallmentPurchase,
  getInstallmentPurchases,
  getInstallmentsByPurchase,
  updateInstallmentStatus,
  getCreditCards,
} from "@/lib/storage"
import type { InstallmentPurchase, Installment, CreditCard } from "@/lib/storage"
import { Plus, Check } from "lucide-react"
import InstallmentsMonthView from "./installments-month-view"

export default function InstallmentsPage() {
  const [purchases, setPurchases] = useState<InstallmentPurchase[]>([])
  const [installmentsByPurchase, setInstallmentsByPurchase] = useState<Record<string, Installment[]>>({})
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"purchases" | "monthly">("purchases")
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [formData, setFormData] = useState({
    description: "",
    totalAmount: "",
    installments: "3",
    origin: "joint" as const,
    category: "Compras",
    startDate: new Date().toISOString().split("T")[0],
    creditCardId: "" as string | undefined,
  })

  useEffect(() => {
    loadPurchases()
    loadCreditCards()
  }, [])

  const loadCreditCards = async () => {
    try {
      const cards = await getCreditCards()
      setCreditCards(cards)
    } catch (error) {
      console.error('Error loading credit cards:', error)
      setCreditCards([])
    }
  }

  const loadPurchases = async () => {
    try {
      const data = await getInstallmentPurchases()
      setPurchases(data)

      const installments: Record<string, Installment[]> = {}
      for (const purchase of data) {
        installments[purchase.id] = await getInstallmentsByPurchase(purchase.id)
      }
      setInstallmentsByPurchase(installments)
    } catch (error) {
      console.error('Error loading purchases:', error)
      setPurchases([])
      setInstallmentsByPurchase({})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description || !formData.totalAmount || !formData.installments) {
      alert("Preencha todos os campos")
      return
    }

    try {
      const installmentAmount = Number(formData.totalAmount) / Number(formData.installments)

      await addInstallmentPurchase({
        description: formData.description,
        totalAmount: Number(formData.totalAmount),
        installments: Number(formData.installments),
        installmentAmount,
        origin: formData.origin,
        category: formData.category,
        startDate: formData.startDate,
        status: "active",
        creditCardId: formData.creditCardId || undefined,
      })

      setFormData({
        description: "",
        totalAmount: "",
        installments: "3",
        origin: "joint",
        category: "Compras",
        startDate: new Date().toISOString().split("T")[0],
        creditCardId: "",
      })
      setShowForm(false)
      await loadPurchases()
    } catch (error) {
      console.error('Error saving purchase:', error)
      alert('Erro ao salvar compra parcelada')
    }
  }

  const handleCheckInstallment = async (installmentId: string, currentStatus: boolean) => {
    try {
      await updateInstallmentStatus(installmentId, !currentStatus)
      await loadPurchases()
    } catch (error) {
      console.error('Error updating installment:', error)
      alert('Erro ao atualizar parcela')
    }
  }

  const getMonthName = (date: string) => {
    const d = new Date(date + "T00:00:00")
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(d)
  }

  const totalToSpend = Array.isArray(purchases) ? purchases.filter((p) => p.status === "active").reduce((sum, p) => sum + p.totalAmount, 0) : 0

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Compras Parceladas</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Total a gastar:{" "}
            <span className="text-orange-600 font-bold">
              R$ {totalToSpend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Compra
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Adicionar Compra Parcelada</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
              <input
                type="text"
                placeholder="Ex: TV 55 polegadas"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Valor Total (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Número de Parcelas</label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              />
              {formData.totalAmount && formData.installments && (
                <p className="text-xs text-muted-foreground mt-1">
                  R${" "}
                  {(Number(formData.totalAmount) / Number(formData.installments)).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  por parcela
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Data da 1ª Parcela</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                <option value="joint">Conjunta</option>
                <option value="partner1">João</option>
                <option value="partner2">Amanda</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cartão de Crédito (Opcional)</label>
              <select
                value={formData.creditCardId || ""}
                onChange={(e) => setFormData({ ...formData, creditCardId: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              >
                <option value="">Nenhum (Pagamento à vista ou outro método)</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.cardName} ({card.holder === "partner1" ? "João" : "Amanda"}) - Disponível: R${" "}
                    {card.available.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
              {formData.creditCardId && formData.totalAmount && (
                <p className="text-xs text-muted-foreground mt-1">
                  O cartão será atualizado automaticamente: disponível diminuirá e fatura aumentará em R${" "}
                  {Number(formData.totalAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90">
              Adicionar Compra
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:opacity-90"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "purchases"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Compras
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "monthly"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Visão por Mês
        </button>
      </div>

      {activeTab === "monthly" ? (
        <InstallmentsMonthView />
      ) : (
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
              Nenhuma compra parcelada registrada
            </div>
          ) : (
            purchases.map((purchase) => (
              <div key={purchase.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{purchase.description}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {purchase.installments}x R${" "}
                        {purchase.installmentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} = R${" "}
                        {purchase.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        purchase.status === "active" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {purchase.status === "active" ? "Ativa" : "Concluída"}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {installmentsByPurchase[purchase.id]?.map((installment, index) => (
                    <div
                      key={installment.id}
                      className="p-4 flex items-center justify-between hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => handleCheckInstallment(installment.id, installment.paid)}
                          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            installment.paid ? "bg-green-600 border-green-600" : "border-input hover:border-primary"
                          }`}
                        >
                          {installment.paid && <Check size={16} className="text-white" />}
                        </button>
                        <div>
                          <p
                            className={`text-sm ${installment.paid ? "line-through text-muted-foreground" : "text-foreground"}`}
                          >
                            Parcela {index + 1} - {getMonthName(installment.dueDate)}
                          </p>
                          <p
                            className={`text-xs ${installment.paid ? "text-muted-foreground" : "text-foreground font-medium"}`}
                          >
                            R$ {installment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{installment.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
