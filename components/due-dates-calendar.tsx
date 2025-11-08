"use client"

import { useState, useEffect } from "react"
import { getDueDates, getBills, getCreditCards } from "@/lib/storage"
import type { DueDate, Bill, CreditCard } from "@/lib/storage"
import { Calendar, Check } from "lucide-react"

export default function DueDatesCalendar() {
  const [dueDates, setDueDates] = useState<DueDate[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dates, billsData, cardsData] = await Promise.all([getDueDates(), getBills(), getCreditCards()])
        setDueDates(dates)
        setBills(billsData)
        setCreditCards(cardsData)
      } catch (error) {
        console.error('Error loading data:', error)
        setDueDates([])
        setBills([])
        setCreditCards([])
      }
    }
    loadData()
  }, [])

  // Converter bills em formato de vencimento
  const billsAsDueDates = bills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    dayOfMonth: new Date(bill.dueDate).getDate(),
    amount: bill.amount,
    type: 'bill' as const,
    owner: bill.owner,
    referenceId: bill.id,
    status: bill.status,
    dueDate: bill.dueDate, // Manter a data completa para exibição
  }))

  // Converter faturas de cartões em formato de vencimento (apenas pendentes)
  const creditCardsAsDueDates = creditCards
    .filter((card) => card.invoiceAmount > 0 && (card.invoiceStatus === 'pending' || !card.invoiceStatus))
    .map((card) => ({
      id: `credit-card-${card.id}`,
      name: `Fatura ${card.cardName}`,
      dayOfMonth: new Date(card.invoiceDueDate).getDate(),
      amount: card.invoiceAmount,
      type: 'credit_card' as const,
      owner: card.holder,
      referenceId: card.id,
      status: card.invoiceStatus || 'pending',
      dueDate: card.invoiceDueDate,
    }))

  // Combinar dueDates, bills e faturas de cartões, ordenar por dia do mês
  const allDueDates = [...dueDates, ...billsAsDueDates, ...creditCardsAsDueDates]
  const sortedDates = Array.isArray(allDueDates) 
    ? [...allDueDates].sort((a, b) => a.dayOfMonth - b.dayOfMonth) 
    : []

  const getTypeColor = (type: string, status?: string) => {
    if (status === 'paid') {
      return "bg-gray-100 text-gray-600"
    }
    switch (type) {
      case "income":
        return "bg-green-100 text-green-800"
      case "bill":
        return "bg-blue-100 text-blue-800"
      case "installment":
        return "bg-orange-100 text-orange-800"
      case "credit_card":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string, status?: string) => {
    if (status === 'paid') {
      return "Paga"
    }
    switch (type) {
      case "income":
        return "Receita"
      case "bill":
        return "Conta"
      case "installment":
        return "Parcela"
      case "credit_card":
        return "Fatura"
      default:
        return "Outro"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Calendar size={24} className="text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Calendário de Vencimentos</h2>
      </div>

      <div className="grid gap-3">
        {sortedDates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
            Nenhum vencimento configurado
          </div>
        ) : (
          sortedDates.map((due) => (
            <div
              key={due.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{due.dayOfMonth}</p>
                  <p className="text-xs text-muted-foreground">dia</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{due.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(due as any).dueDate 
                      ? `Vencimento: ${new Date((due as any).dueDate).toLocaleDateString("pt-BR")}`
                      : `${due.owner === "partner1" ? "João" : due.owner === "partner2" ? "Amanda" : "Conjunta"}`
                    }
                    {(due as any).status === 'paid' && (due as any).dueDate && (
                      <span className="ml-2 text-gray-500">• Paga</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  {(due as any).status === 'paid' && <Check size={16} className="text-gray-600" />}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(due.type, (due as any).status)}`}>
                    {getTypeLabel(due.type, (due as any).status)}
                  </span>
                </div>
                {due.amount > 0 && (
                  <p className={`font-bold ${due.type === "income" ? "text-green-600" : (due as any).status === 'paid' ? "text-gray-500 line-through" : "text-foreground"}`}>
                    R$ {due.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
