import type { Transaction } from "@/lib/storage"

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Transações Recentes</h2>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma transação ainda</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex-1">
                <p className="font-medium text-foreground">{t.description}</p>
                <p className="text-sm text-muted-foreground">
                  {t.category} • {t.origin === "partner1" ? "João" : t.origin === "partner2" ? "Amanda" : "Conjunta"}
                </p>
              </div>
              <p className={`font-bold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {t.type === "income" ? "+" : "-"} R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
