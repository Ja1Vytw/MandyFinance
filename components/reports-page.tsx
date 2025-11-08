"use client"

import { useState } from "react"
import type { FinancialData } from "@/lib/storage"
import { getFinancialData } from "@/lib/storage"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Download, RefreshCw } from "lucide-react"

interface ReportsPageProps {
  data: FinancialData
  onDataChange: (data: FinancialData) => void
}

export default function ReportsPage({ data, onDataChange }: ReportsPageProps) {
  const [dateRange, setDateRange] = useState<"all" | "3months" | "6months" | "1year">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const updatedData = await getFinancialData()
      onDataChange(updatedData)
    } catch (error) {
      console.error('Error refreshing data:', error)
      alert('Erro ao atualizar dados')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Renda recorrente ativa (mensal)
  const recurringIncome = (data.recurringIncomes || [])
    .filter((income) => income.enabled)
    .reduce((sum, income) => sum + income.amount, 0)

  // Expense breakdown by category
  const expensesByCategory = (data.transactions || [])
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        const existing = acc.find((item) => item.name === t.category)
        if (existing) {
          existing.value += t.amount
        } else {
          acc.push({ name: t.category, value: t.amount })
        }
        return acc
      },
      [] as Array<{ name: string; value: number }>,
    )
    .sort((a, b) => b.value - a.value)

  const incomeByCategory = (data.transactions || [])
    .filter((t) => t.type === "income")
    .reduce(
      (acc, t) => {
        const existing = acc.find((item) => item.name === t.category)
        if (existing) {
          existing.value += t.amount
        } else {
          acc.push({ name: t.category, value: t.amount })
        }
        return acc
      },
      [] as Array<{ name: string; value: number }>,
    )
    .sort((a, b) => b.value - a.value)

  // Adicionar rendas recorrentes à categoria
  if (recurringIncome > 0) {
    const recurringCategory = incomeByCategory.find((cat) => cat.name === "Salário")
    if (recurringCategory) {
      recurringCategory.value += recurringIncome
    } else {
      incomeByCategory.push({ name: "Salário", value: recurringIncome })
    }
    incomeByCategory.sort((a, b) => b.value - a.value)
  }

  // Income vs Expenses by partner (incluindo rendas recorrentes)
  const partnerComparison = [
    {
      name: "João",
      income:
        (data.transactions || [])
          .filter((t) => t.type === "income" && t.origin === "partner1")
          .reduce((sum, t) => sum + t.amount, 0) +
        (data.recurringIncomes || [])
          .filter((r) => r.enabled && r.origin === "partner1")
          .reduce((sum, r) => sum + r.amount, 0),
      expenses: (data.transactions || [])
        .filter((t) => t.type === "expense" && t.origin === "partner1")
        .reduce((sum, t) => sum + t.amount, 0),
    },
    {
      name: "Amanda",
      income:
        (data.transactions || [])
          .filter((t) => t.type === "income" && t.origin === "partner2")
          .reduce((sum, t) => sum + t.amount, 0) +
        (data.recurringIncomes || [])
          .filter((r) => r.enabled && r.origin === "partner2")
          .reduce((sum, r) => sum + r.amount, 0),
      expenses: (data.transactions || [])
        .filter((t) => t.type === "expense" && t.origin === "partner2")
        .reduce((sum, t) => sum + t.amount, 0),
    },
    {
      name: "Conjunta",
      income:
        (data.transactions || [])
          .filter((t) => t.type === "income" && t.origin === "joint")
          .reduce((sum, t) => sum + t.amount, 0) +
        (data.recurringIncomes || [])
          .filter((r) => r.enabled && r.origin === "joint")
          .reduce((sum, r) => sum + r.amount, 0),
      expenses: (data.transactions || [])
        .filter((t) => t.type === "expense" && t.origin === "joint")
        .reduce((sum, t) => sum + t.amount, 0),
    },
  ]

  const expenseTrend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    const month = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const monthExpenses = (data.transactions || [])
      .filter((t) => {
        const tDate = new Date(t.date)
        return t.type === "expense" && tDate >= monthStart && tDate <= monthEnd
      })
      .reduce((sum, t) => sum + t.amount, 0)

    // Incluir contas pagas do mês
    const monthPaidBills = (data.bills || [])
      .filter((b) => {
        if (b.status !== 'paid') return false
        const billDate = new Date(b.dueDate)
        return billDate >= monthStart && billDate <= monthEnd
      })
      .reduce((sum, b) => sum + b.amount, 0)

    const monthIncome = (data.transactions || [])
      .filter((t) => {
        const tDate = new Date(t.date)
        return t.type === "income" && tDate >= monthStart && tDate <= monthEnd
      })
      .reduce((sum, t) => sum + t.amount, 0)

    // Adicionar rendas recorrentes para cada mês
    const monthRecurringIncome = (data.recurringIncomes || [])
      .filter((r) => r.enabled)
      .reduce((sum, r) => sum + r.amount, 0)

    return { 
      month, 
      expenses: monthExpenses + monthPaidBills, 
      income: monthIncome + monthRecurringIncome 
    }
  })

  // Renda total incluindo rendas recorrentes
  const incomeFromTransactions = (data.transactions || [])
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalIncome = incomeFromTransactions + recurringIncome

  // Despesas totais incluindo contas pagas
  const expensesFromTransactions = (data.transactions || [])
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const paidBillsTotal = (data.bills || [])
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.amount, 0)
  
  const totalExpenses = expensesFromTransactions + paidBillsTotal

  const netBalance = totalIncome - totalExpenses

  const avgMonthlyExpense = totalExpenses / 12
  const highestExpenseCategory = expensesByCategory[0]
  const highestIncomeCategory = incomeByCategory[0]

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  const handleExportReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString("pt-BR"),
      summary: {
        totalIncome,
        totalExpenses,
        netBalance,
        avgMonthlyExpense,
      },
      partnerComparison,
      expensesByCategory,
      incomeByCategory,
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground mt-2">Análise abrangente de seus padrões de gastos e renda</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
            Atualizar
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download size={20} />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-medium mb-2">Renda Total</p>
          <p className="text-3xl font-bold text-green-600">R$ {totalIncome.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-medium mb-2">Despesas Totais</p>
          <p className="text-3xl font-bold text-red-600">R$ {totalExpenses.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-medium mb-2">Saldo Líquido</p>
          <p className={`text-3xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
            R$ {netBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-medium mb-2">Despesa Média Mensal</p>
          <p className="text-3xl font-bold text-accent">
            R$ {avgMonthlyExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Top Categories */}
      {(highestExpenseCategory || highestIncomeCategory) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highestExpenseCategory && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Categoria com Maior Despesa</h3>
              <p className="text-2xl font-bold text-destructive">{highestExpenseCategory.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                R$ {highestExpenseCategory.value.toLocaleString("pt-BR")}
              </p>
            </div>
          )}
          {highestIncomeCategory && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Categoria com Maior Renda</h3>
              <p className="text-2xl font-bold text-green-600">{highestIncomeCategory.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                R$ {highestIncomeCategory.value.toLocaleString("pt-BR")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expense Trend Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Tendência de 12 Meses</h2>
        <ChartContainer
          config={{
            income: {
              label: "Renda",
              color: "hsl(var(--chart-2))",
            },
            expenses: {
              label: "Despesas",
              color: "hsl(var(--destructive))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={expenseTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                name="Renda"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={false}
                name="Despesas"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Pie Chart - Expenses by Category */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Despesas por Categoria</h2>
        {expensesByCategory.length > 0 ? (
          <ChartContainer
            config={Object.fromEntries(
              expensesByCategory.map((cat) => [
                cat.name,
                { label: cat.name, color: COLORS[expensesByCategory.indexOf(cat) % COLORS.length] },
              ]),
            )}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <p className="text-muted-foreground">Nenhum dado de despesa disponível</p>
        )}
      </div>

      {/* Pie Chart - Income by Category */}
      {incomeByCategory.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Renda por Categoria</h2>
          <ChartContainer
            config={Object.fromEntries(
              incomeByCategory.map((cat) => [
                cat.name,
                { label: cat.name, color: COLORS[incomeByCategory.indexOf(cat) % COLORS.length] },
              ]),
            )}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}

      {/* Bar Chart - Income vs Expenses by Partner */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Renda vs Despesas por Parceiro</h2>
        {partnerComparison.some((p) => p.income > 0 || p.expenses > 0) ? (
          <ChartContainer
            config={{
              income: {
                label: "Renda",
                color: "hsl(var(--chart-2))",
              },
              expenses: {
                label: "Despesas",
                color: "hsl(var(--destructive))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={partnerComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Legend />
                <Bar dataKey="income" fill="hsl(var(--chart-2))" name="Renda" />
                <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <p className="text-muted-foreground">Nenhum dado de transação disponível</p>
        )}
      </div>
    </div>
  )
}
