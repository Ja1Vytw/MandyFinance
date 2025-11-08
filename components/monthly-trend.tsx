"use client"

import type { FinancialData } from "@/lib/storage"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface MonthlyTrendProps {
  data: FinancialData
}

export default function MonthlyTrend({ data }: MonthlyTrendProps) {
  const chartData = [
    { month: "Semana 1", income: 0, expenses: 0 },
    { month: "Semana 2", income: 0, expenses: 0 },
    { month: "Semana 3", income: 0, expenses: 0 },
    { month: "Semana 4", income: 0, expenses: 0 },
  ]

  data.transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    const day = date.getDate()
    const week = Math.floor((day - 1) / 7)

    if (week < 4) {
      if (transaction.type === "income") {
        chartData[week].income += transaction.amount
      } else {
        chartData[week].expenses += transaction.amount
      }
    }
  })

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Tendência Mensal</h2>
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
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="hsl(var(--chart-2))" />
            <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
