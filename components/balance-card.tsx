import type { ReactNode } from "react"

interface BalanceCardProps {
  title: string
  amount: number
  icon: ReactNode
}

export default function BalanceCard({ title, amount, icon }: BalanceCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 flex items-start justify-between">
      <div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground">
          R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="p-2 bg-secondary/10 rounded-lg">{icon}</div>
    </div>
  )
}
