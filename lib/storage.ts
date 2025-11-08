export interface User {
  id: string
  name: string
  role: "partner1" | "partner2"
}

export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  origin: "partner1" | "partner2" | "joint"
  type: "income" | "expense"
}

export interface Bill {
  id: string
  name: string
  dueDate: string
  amount: number
  status: "pending" | "paid"
  owner: "partner1" | "partner2" | "joint"
}

export interface CreditCard {
  id: string
  holder: "partner1" | "partner2"
  cardName: string
  limit: number
  available: number
  invoiceAmount: number
  invoiceDueDate: string
  invoiceStatus?: "pending" | "paid" // Status da fatura (pendente ou paga)
  color?: string // Cor do cartão para visualização
}

export interface Investment {
  id: string
  name: string
  type: string
  amount: number
  currentValue: number
  owner: "partner1" | "partner2" | "joint"
}

export interface RecurringIncome {
  id: string
  description: string
  amount: number
  category: string
  dayOfMonth: number // 1-28 (para evitar problemas com meses diferentes)
  origin: "partner1" | "partner2" | "joint"
  enabled: boolean
  createdAt: string
}

export interface InstallmentPurchase {
  id: string
  description: string
  totalAmount: number
  installments: number
  installmentAmount: number
  origin: "partner1" | "partner2" | "joint"
  category: string
  startDate: string // Data da primeira parcela
  status: "active" | "completed"
  creditCardId?: string // ID do cartão de crédito usado (opcional)
}

export interface Installment {
  id: string
  purchaseId: string
  amount: number
  dueDate: string
  paid: boolean
  paidDate?: string
}

export interface DueDate {
  id: string
  name: string
  dayOfMonth: number
  amount: number
  type: "bill" | "installment" | "income"
  owner: "partner1" | "partner2" | "joint"
  referenceId?: string // ID da conta/renda recorrente
}

export interface FinancialData {
  users: User[]
  transactions: Transaction[]
  bills: Bill[]
  creditCards: CreditCard[]
  investments: Investment[]
  recurringIncomes: RecurringIncome[]
  installmentPurchases: InstallmentPurchase[]
  installments: Installment[]
  dueDates: DueDate[]
}

import * as api from './api'

// Funções auxiliares que não dependem de dados
export function calculateInvestmentYield(investment: Investment): number {
  if (investment.type === "CDB") {
    // CDB rende 120% do CDI. Usando 13% como taxa CDI média anual
    const annualRate = 0.13 * 1.2
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1

    const months = 1 // Calcular rendimento do mês
    const yield_value = investment.amount * (Math.pow(1 + monthlyRate, months) - 1)

    return yield_value
  } else if (investment.type === "Renda Fixa") {
    // Renda Fixa genérica: 0.8% ao mês (9.6% ao ano)
    return investment.amount * 0.008
  } else if (investment.type === "Poupança") {
    // Poupança: 0.5% ao mês (6% ao ano)
    return investment.amount * 0.005
  }

  // Para outros tipos, usar a diferença entre currentValue e amount como rendimento
  return Math.max(0, investment.currentValue - investment.amount)
}

export const INVESTMENT_TYPES = [
  "Ações",
  "Títulos",
  "Fundo Mútuo",
  "ETF",
  "Imóvel",
  "Criptomoeda",
  "Renda Fixa",
  "Poupança",
  "CDB",
  "Outro",
]

export const TRANSACTION_CATEGORIES = {
  income: ["Salário", "Auxílio", "VR", "Vale-Refeição", "Freelancer", "Retorno de Investimento", "Outra Renda"],
  expense: [
    "Supermercado",
    "Transporte",
    "Utilidades",
    "Entretenimento",
    "Refeições",
    "Saúde",
    "Compras",
    "Assinaturas",
    "Seguros",
    "Educação",
    "Aluguel",
    "Outras Despesas",
  ],
}

// Funções que usam API
export async function getFinancialData(): Promise<FinancialData> {
  return api.getFinancialData()
}

export async function addTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction> {
  return api.createTransaction(transaction)
}

export async function addBill(bill: Omit<Bill, "id">): Promise<Bill> {
  return api.createBill(bill)
}

export async function deleteBill(id: string): Promise<void> {
  return api.deleteBill(id)
}

export async function updateBill(id: string, updates: Partial<Bill>): Promise<Bill> {
  return api.updateBill(id, updates)
}

export async function getBills(): Promise<Bill[]> {
  return api.getBills()
}

export async function getCreditCards(): Promise<CreditCard[]> {
  return api.getCreditCards()
}

export async function addCreditCard(card: Omit<CreditCard, "id">): Promise<CreditCard> {
  return api.createCreditCard(card)
}

export async function updateCreditCard(id: string, updates: Partial<CreditCard>): Promise<CreditCard> {
  return api.updateCreditCard(id, updates)
}

export async function deleteCreditCard(id: string): Promise<void> {
  return api.deleteCreditCard(id)
}

export async function getBillsByStatus(status: "pending" | "paid"): Promise<Bill[]> {
  const bills = await api.getBills()
  return bills.filter((b) => b.status === status)
}

export async function getBillsByOwner(owner: "partner1" | "partner2" | "joint"): Promise<Bill[]> {
  const bills = await api.getBills()
  return bills.filter((b) => b.owner === owner)
}

export async function getUpcomingBills(daysAhead = 30): Promise<Bill[]> {
  const bills = await api.getBills()
  const today = new Date()
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000)

  return bills
    .filter((b) => b.status === "pending")
    .filter((b) => {
      const billDate = new Date(b.dueDate)
      return billDate >= today && billDate <= futureDate
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}

export async function getOverdueBills(): Promise<Bill[]> {
  const bills = await api.getBills()
  const today = new Date()

  return bills
    .filter((b) => b.status === "pending")
    .filter((b) => {
      const billDate = new Date(b.dueDate)
      return billDate < today
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}

export async function addRecurringIncome(income: Omit<RecurringIncome, "id" | "createdAt">): Promise<RecurringIncome> {
  return api.createRecurringIncome(income)
}

export async function updateRecurringIncome(id: string, updates: Partial<RecurringIncome>): Promise<RecurringIncome> {
  return api.updateRecurringIncome(id, updates)
}

export async function deleteRecurringIncome(id: string): Promise<void> {
  return api.deleteRecurringIncome(id)
}

export async function getRecurringIncomes(): Promise<RecurringIncome[]> {
  return api.getRecurringIncomes()
}

export async function addInstallmentPurchase(purchase: Omit<InstallmentPurchase, "id">): Promise<{ purchase: InstallmentPurchase; installments: Installment[] }> {
  return api.createInstallmentPurchase(purchase)
}

export async function updateInstallmentStatus(installmentId: string, paid: boolean): Promise<Installment> {
  const updates: Partial<Installment> = { paid }
  if (paid) {
    updates.paidDate = new Date().toISOString().split("T")[0]
  }
  return api.updateInstallment(installmentId, updates)
}

export async function getInstallmentsByPurchase(purchaseId: string): Promise<Installment[]> {
  return api.getInstallments(purchaseId)
}

export async function getActiveInstallments(): Promise<Installment[]> {
  const installments = await api.getInstallments()
  return installments.filter((i) => !i.paid)
}

export async function getInstallmentPurchases(): Promise<InstallmentPurchase[]> {
  return api.getInstallmentPurchases()
}

export async function addDueDate(dueDate: Omit<DueDate, "id">): Promise<DueDate> {
  return api.createDueDate(dueDate)
}

export async function getDueDates(): Promise<DueDate[]> {
  return api.getDueDates()
}

export async function getDueDatesByDay(dayOfMonth: number): Promise<DueDate[]> {
  const dueDates = await api.getDueDates()
  return dueDates.filter((d) => d.dayOfMonth === dayOfMonth)
}

export async function updateInvestmentWithYield(id: string): Promise<Investment> {
  const investments = await api.getInvestments()
  const investment = investments.find((i) => i.id === id)
  if (investment) {
    const monthlyYield = calculateInvestmentYield(investment)
    return api.updateInvestment(id, { currentValue: investment.amount + monthlyYield })
  }
  throw new Error('Investment not found')
}

export async function addInvestment(investment: Omit<Investment, "id">): Promise<Investment> {
  return api.createInvestment(investment)
}

export async function updateInvestment(id: string, updates: Partial<Investment>): Promise<Investment> {
  return api.updateInvestment(id, updates)
}

export async function deleteInvestment(id: string): Promise<void> {
  return api.deleteInvestment(id)
}

export async function getInvestmentsByOwner(owner: "partner1" | "partner2" | "joint"): Promise<Investment[]> {
  const investments = await api.getInvestments()
  return investments.filter((i) => i.owner === owner)
}

export async function getInvestmentsByType(type: string): Promise<Investment[]> {
  const investments = await api.getInvestments()
  return investments.filter((i) => i.type === type)
}

export async function getTransactionsByCategory(category: string): Promise<Transaction[]> {
  const transactions = await api.getTransactions()
  return transactions.filter((t) => t.category === category)
}

export async function getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
  const transactions = await api.getTransactions()
  return transactions.filter((t) => {
    const tDate = new Date(t.date)
    return tDate >= startDate && tDate <= endDate
  })
}

export async function getCategoryTotals(type: "income" | "expense"): Promise<Record<string, number>> {
  const transactions = await api.getTransactions()
  const totals: Record<string, number> = {}

  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount
    })

  return totals
}
