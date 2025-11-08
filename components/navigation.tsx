"use client"

import { BarChart3, Receipt, CreditCard, Wallet, TrendingUp, PieChart, Calendar, ShoppingCart } from "lucide-react"

interface NavigationProps {
  currentPage: string
  onPageChange: (page: any) => void
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Painel", icon: BarChart3 },
    { id: "bills", label: "Contas", icon: Receipt },
    { id: "cards", label: "Cartões", icon: CreditCard },
    { id: "transactions", label: "Transações", icon: Wallet },
    { id: "recurring", label: "Rendas", icon: TrendingUp },
    { id: "installments", label: "Parceladas", icon: ShoppingCart },
    { id: "calendar", label: "Vencimentos", icon: Calendar },
    { id: "investments", label: "Investimentos", icon: TrendingUp },
    { id: "reports", label: "Relatórios", icon: PieChart },
  ]

  return (
    <nav className="w-56 bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-8 text-sidebar-primary">FinGest</h1>

      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="pt-6 border-t border-sidebar-border text-sm text-sidebar-accent-foreground">
        <p>Gerencie suas finanças juntos</p>
      </div>
    </nav>
  )
}
