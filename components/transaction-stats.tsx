"use client"

import type { FinancialData } from "@/lib/storage"
import { TrendingUp, TrendingDown } from "lucide-react"

interface TransactionStatsProps {
  data: FinancialData
  filterType: "all" | "income" | "expense"
  filterOrigin: "all" | "partner1" | "partner2" | "joint"
}

export default function TransactionStats({ data, filterType, filterOrigin }: TransactionStatsProps) {
  // Renda de transações registradas
  const incomeFromTransactions = (data.transactions || [])
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  
  // Renda recorrente ativa (mensal)
  const recurringIncome = (data.recurringIncomes || [])
    .filter((income) => income.enabled)
    .reduce((sum, income) => sum + income.amount, 0)
  
  // Renda total (transações + rendas recorrentes)
  const incomeTotal = incomeFromTransactions + recurringIncome

  // Despesas de transações
  const expensesFromTransactions = (data.transactions || [])
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  
  // Contas pagas do mês atual
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const paidBillsThisMonth = (data.bills || [])
    .filter((bill) => {
      if (bill.status !== 'paid') return false
      const billDate = new Date(bill.dueDate)
      return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear
    })
    .reduce((sum, bill) => sum + bill.amount, 0)

  // Faturas de cartões pagas do mês atual
  const paidCreditCardInvoicesThisMonth = (data.creditCards || [])
    .filter((card) => {
      if (card.invoiceStatus !== 'paid') return false
      const invoiceDate = new Date(card.invoiceDueDate)
      return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear
    })
    .reduce((sum, card) => sum + card.invoiceAmount, 0)
  
  // Despesas totais (transações + contas pagas + faturas de cartões pagas do mês)
  const expenseTotal = expensesFromTransactions + paidBillsThisMonth + paidCreditCardInvoicesThisMonth

  // Saldo líquido = Renda - Despesas
  const netBalance = incomeTotal - expenseTotal

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Renda Total</p>
            <p className="text-3xl font-bold text-green-600">
              R$ {incomeTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <TrendingUp className="text-green-600" size={28} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Despesas Totais</p>
            <p className="text-3xl font-bold text-red-600">
              R$ {expenseTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <TrendingDown className="text-red-600" size={28} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Saldo Líquido</p>
            <p className={`text-3xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {netBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <TrendingUp className={netBalance >= 0 ? "text-green-600" : "text-red-600"} size={28} />
        </div>
      </div>
    </div>
  )
}
