"use client"

import { useState, useEffect } from "react"
import Dashboard from "@/components/dashboard"
import BillsPage from "@/components/bills-page"
import CreditCardsPage from "@/components/credit-cards-page"
import TransactionsPage from "@/components/transactions-page"
import InvestmentsPage from "@/components/investments-page"
import ReportsPage from "@/components/reports-page"
import RecurringIncomePage from "@/components/recurring-income-page"
import InstallmentsPage from "@/components/installments-page"
import DueDatesCalendar from "@/components/due-dates-calendar"
import Navigation from "@/components/navigation"
import AIActionButton from "@/components/ai-action-button/ai-action-button"
import { type FinancialData, getFinancialData } from "@/lib/storage"

type Page =
  | "dashboard"
  | "bills"
  | "cards"
  | "transactions"
  | "recurring"
  | "installments"
  | "calendar"
  | "investments"
  | "reports"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const financialData = await getFinancialData()
        setData(financialData)
        setError(null)
      } catch (err) {
        console.error('Error loading financial data:', err)
        setError('Erro ao carregar dados. Verifique se o backend está rodando.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleDataChange = (newData: FinancialData) => {
    setData(newData)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-screen">Nenhum dado disponível</div>
  }

  return (
    <div className="flex h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <Dashboard data={data} onDataChange={handleDataChange} />}
        {currentPage === "bills" && <BillsPage data={data} onDataChange={handleDataChange} />}
        {currentPage === "cards" && <CreditCardsPage data={data} onDataChange={handleDataChange} />}
        {currentPage === "transactions" && <TransactionsPage data={data} onDataChange={handleDataChange} />}
        {currentPage === "recurring" && <RecurringIncomePage />}
        {currentPage === "installments" && <InstallmentsPage />}
        {currentPage === "calendar" && (
          <div className="p-8">
            <DueDatesCalendar />
          </div>
        )}
        {currentPage === "investments" && <InvestmentsPage data={data} onDataChange={handleDataChange} />}
        {currentPage === "reports" && <ReportsPage data={data} onDataChange={handleDataChange} />}
      </main>
      <AIActionButton />
    </div>
  )
}
