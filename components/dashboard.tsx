"use client"

import type { FinancialData } from "@/lib/storage"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import BalanceCard from "./balance-card"
import RecentTransactions from "./recent-transactions"
import SpendingBreakdown from "./spending-breakdown"
import MonthlyTrend from "./monthly-trend"
import CreditCardStatus from "./credit-card-status"

interface DashboardProps {
  data: FinancialData
  onDataChange: (data: FinancialData) => void
}

export default function Dashboard({ data }: DashboardProps) {
  // Renda de transações registradas
  const incomeFromTransactions = (data.transactions || [])
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  
  // Renda recorrente ativa (mensal)
  const recurringIncome = (data.recurringIncomes || [])
    .filter((income) => income.enabled)
    .reduce((sum, income) => sum + income.amount, 0)
  
  // Renda mensal total (transações + rendas recorrentes)
  const monthlyIncome = incomeFromTransactions + recurringIncome

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

  // Despesas mensais totais (transações + contas pagas + faturas de cartões pagas do mês)
  const monthlyExpenses = expensesFromTransactions + paidBillsThisMonth + paidCreditCardInvoicesThisMonth

  const totalCash = 0 // Valor de caixa - pode ser implementado futuramente
  const totalInvestments = (data.investments || []).reduce((sum, inv) => sum + inv.currentValue, 0)
  
  // Saldo líquido = Renda - Despesas
  const netBalance = monthlyIncome - monthlyExpenses

  const pendingBills = (data.bills || []).filter((b) => b.status === "pending")
  const pendingBillsAmount = pendingBills.reduce((sum, b) => sum + b.amount, 0)

  // Faturas pendentes dos cartões
  const pendingCreditCardInvoices = (data.creditCards || [])
    .filter((card) => card.invoiceAmount > 0 && (card.invoiceStatus === 'pending' || !card.invoiceStatus))
    .reduce((sum, card) => sum + card.invoiceAmount, 0)

  // Total de contas pendentes (bills + faturas de cartões)
  const totalPendingAmount = pendingBillsAmount + pendingCreditCardInvoices

  const budgetAlerts = (data.creditCards || [])
    .filter((card) => {
      const utilization = (card.limit - card.available) / card.limit
      return utilization > 0.8
    })
    .map((card) => ({
      type: "credit_card",
      message: `${card.cardName} está com ${(((card.limit - card.available) / card.limit) * 100).toFixed(0)}% de utilização`,
      severity: "warning",
    }))

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visão Geral Financeira</h1>
        <p className="text-muted-foreground mt-2">Gerencie suas finanças individuais e em conjunto</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard
          title="Renda Mensal"
          amount={monthlyIncome}
          icon={<TrendingUp className="text-green-600" size={24} />}
        />
        <BalanceCard
          title="Despesas Mensais"
          amount={monthlyExpenses}
          icon={<TrendingDown className="text-red-600" size={24} />}
        />
        <BalanceCard
          title="Saldo Líquido"
          amount={netBalance}
          icon={<TrendingUp className={netBalance >= 0 ? "text-chart-1" : "text-destructive"} size={24} />}
        />
        <BalanceCard
          title="Total de Ativos"
          amount={totalInvestments}
          icon={<TrendingUp className="text-chart-1" size={24} />}
        />
      </div>

      {budgetAlerts.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Alertas de Orçamento</h3>
              <ul className="space-y-1">
                {budgetAlerts.map((alert, idx) => (
                  <li key={idx} className="text-sm text-destructive/80">
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-medium mb-2">Investimentos</p>
          <p className="text-3xl font-bold text-accent">R$ {totalInvestments.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-medium mb-2">Contas Pendentes</p>
          <p className="text-3xl font-bold text-destructive">R$ {totalPendingAmount.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Contas: R$ {pendingBillsAmount.toLocaleString("pt-BR")} • Faturas: R$ {pendingCreditCardInvoices.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingBreakdown data={data} />
        <CreditCardStatus data={data} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <MonthlyTrend data={data} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={data.transactions.slice(-5)} />
    </div>
  )
}
