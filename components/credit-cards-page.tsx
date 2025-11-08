"use client"

import { useState } from "react"
import type { FinancialData } from "@/lib/storage"
import { addCreditCard, updateCreditCard, deleteCreditCard, getFinancialData } from "@/lib/storage"
import CreditCardDisplay from "./credit-card"
import CreditCardsSummary from "./credit-cards-summary"
import CreditCardForm from "./credit-card-form"
import { Plus, Edit2, Trash2, Check } from "lucide-react"

interface CreditCardsPageProps {
  data: FinancialData
  onDataChange: (data: FinancialData) => void
}

export default function CreditCardsPage({ data, onDataChange }: CreditCardsPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const partner1Cards = (data.creditCards || []).filter((c) => c.holder === "partner1")
  const partner2Cards = (data.creditCards || []).filter((c) => c.holder === "partner2")

  const handleFormSubmit = async (cardData: {
    holder: "partner1" | "partner2"
    cardName: string
    limit: number
    available: number
    invoiceAmount: number
    invoiceDueDate: string
    color?: string
  }) => {
    try {
      if (editingId) {
        await updateCreditCard(editingId, cardData)
        setEditingId(null)
      } else {
        await addCreditCard(cardData)
      }
      setShowForm(false)
      // Recarregar dados do backend
      const updatedData = await getFinancialData()
      onDataChange(updatedData)
    } catch (error) {
      console.error('Error saving credit card:', error)
      alert('Erro ao salvar cartão')
    }
  }

  const handleEdit = (card: (typeof data.creditCards)[0]) => {
    setEditingId(card.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar este cartão?')) {
      return
    }
    try {
      await deleteCreditCard(id)
      // Recarregar dados do backend
      const updatedData = await getFinancialData()
      onDataChange(updatedData)
    } catch (error) {
      console.error('Error deleting credit card:', error)
      alert('Erro ao deletar cartão')
    }
  }

  const handleMarkInvoicePaid = async (cardId: string, currentStatus?: string) => {
    const isPaid = currentStatus === 'paid'
    const newStatus = isPaid ? 'pending' : 'paid'
    
    try {
      await updateCreditCard(cardId, { invoiceStatus: newStatus })
      // Recarregar dados do backend
      const updatedData = await getFinancialData()
      onDataChange(updatedData)
    } catch (error) {
      console.error('Error updating invoice status:', error)
      alert('Erro ao atualizar status da fatura')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const editingCard = editingId ? (data.creditCards || []).find((c) => c.id === editingId) : undefined

  const renderCardSection = (cards: typeof data.creditCards, partnerLabel: string) => {
    if (cards.length === 0) {
      return null
    }

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">{partnerLabel}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="relative">
              <CreditCardDisplay card={card} />
              <div className="absolute top-2 right-2 flex gap-2">
                {card.invoiceAmount > 0 && (
                  <button
                    onClick={() => handleMarkInvoicePaid(card.id, card.invoiceStatus)}
                    className={`p-2 bg-background/80 backdrop-blur-sm rounded-lg transition-colors ${
                      card.invoiceStatus === 'paid'
                        ? 'hover:bg-orange-500/20 text-orange-600'
                        : 'hover:bg-green-500/20 text-green-600'
                    }`}
                    title={card.invoiceStatus === 'paid' ? 'Marcar fatura como pendente' : 'Marcar fatura como paga'}
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleEdit(card)}
                  className="p-2 bg-background/80 backdrop-blur-sm rounded-lg hover:bg-secondary transition-colors"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="p-2 bg-background/80 backdrop-blur-sm rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                  title="Deletar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Cartões de Crédito</h1>
          <p className="text-muted-foreground mt-2">Rastreie e gerencie cartões de crédito individuais e conjuntos</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            Adicionar Cartão
          </button>
        )}
      </div>

      {showForm && (
        <CreditCardForm onSubmit={handleFormSubmit} onCancel={handleCancelForm} initialData={editingCard} />
      )}

      <CreditCardsSummary data={data} />

      {/* João Cards */}
      {renderCardSection(partner1Cards, "João - Cartões")}

      {/* Amanda Cards */}
      {renderCardSection(partner2Cards, "Amanda - Cartões")}

      {/* Empty State */}
      {!showForm && (data.creditCards || []).length === 0 && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Nenhum cartão de crédito adicionado ainda</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity mx-auto"
          >
            <Plus size={20} />
            Adicionar Primeiro Cartão
          </button>
        </div>
      )}
    </div>
  )
}
