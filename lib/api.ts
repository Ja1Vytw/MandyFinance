import type {
  User,
  Transaction,
  Bill,
  CreditCard,
  Investment,
  RecurringIncome,
  InstallmentPurchase,
  Installment,
  DueDate,
  FinancialData,
} from './storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Financial Data
export async function getFinancialData(): Promise<FinancialData> {
  return fetchAPI<FinancialData>('/financial-data');
}

// Transactions
export async function getTransactions(): Promise<Transaction[]> {
  return fetchAPI<Transaction[]>('/transactions');
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  return fetchAPI<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
  return fetchAPI<Transaction>(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await fetchAPI(`/transactions/${id}`, {
    method: 'DELETE',
  });
}

// Bills
export async function getBills(): Promise<Bill[]> {
  return fetchAPI<Bill[]>('/bills');
}

export async function createBill(bill: Omit<Bill, 'id'>): Promise<Bill> {
  return fetchAPI<Bill>('/bills', {
    method: 'POST',
    body: JSON.stringify(bill),
  });
}

export async function updateBill(id: string, updates: Partial<Bill>): Promise<Bill> {
  return fetchAPI<Bill>(`/bills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteBill(id: string): Promise<void> {
  await fetchAPI(`/bills/${id}`, {
    method: 'DELETE',
  });
}

// Credit Cards
export async function getCreditCards(): Promise<CreditCard[]> {
  return fetchAPI<CreditCard[]>('/credit-cards');
}

export async function createCreditCard(card: Omit<CreditCard, 'id'>): Promise<CreditCard> {
  return fetchAPI<CreditCard>('/credit-cards', {
    method: 'POST',
    body: JSON.stringify(card),
  });
}

export async function updateCreditCard(id: string, updates: Partial<CreditCard>): Promise<CreditCard> {
  return fetchAPI<CreditCard>(`/credit-cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteCreditCard(id: string): Promise<void> {
  await fetchAPI(`/credit-cards/${id}`, {
    method: 'DELETE',
  });
}

// Investments
export async function getInvestments(): Promise<Investment[]> {
  return fetchAPI<Investment[]>('/investments');
}

export async function createInvestment(investment: Omit<Investment, 'id'>): Promise<Investment> {
  return fetchAPI<Investment>('/investments', {
    method: 'POST',
    body: JSON.stringify(investment),
  });
}

export async function updateInvestment(id: string, updates: Partial<Investment>): Promise<Investment> {
  return fetchAPI<Investment>(`/investments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteInvestment(id: string): Promise<void> {
  await fetchAPI(`/investments/${id}`, {
    method: 'DELETE',
  });
}

// Recurring Incomes
export async function getRecurringIncomes(): Promise<RecurringIncome[]> {
  return fetchAPI<RecurringIncome[]>('/recurring-incomes');
}

export async function createRecurringIncome(income: Omit<RecurringIncome, 'id' | 'createdAt'>): Promise<RecurringIncome> {
  return fetchAPI<RecurringIncome>('/recurring-incomes', {
    method: 'POST',
    body: JSON.stringify(income),
  });
}

export async function updateRecurringIncome(id: string, updates: Partial<RecurringIncome>): Promise<RecurringIncome> {
  return fetchAPI<RecurringIncome>(`/recurring-incomes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteRecurringIncome(id: string): Promise<void> {
  await fetchAPI(`/recurring-incomes/${id}`, {
    method: 'DELETE',
  });
}

// Installments
export async function getInstallmentPurchases(): Promise<InstallmentPurchase[]> {
  return fetchAPI<InstallmentPurchase[]>('/installments/purchases');
}

export async function createInstallmentPurchase(
  purchase: Omit<InstallmentPurchase, 'id'>
): Promise<{ purchase: InstallmentPurchase; installments: Installment[] }> {
  return fetchAPI<{ purchase: InstallmentPurchase; installments: Installment[] }>('/installments/purchases', {
    method: 'POST',
    body: JSON.stringify(purchase),
  });
}

export async function updateInstallmentPurchase(
  id: string,
  updates: Partial<InstallmentPurchase>
): Promise<InstallmentPurchase> {
  return fetchAPI<InstallmentPurchase>(`/installments/purchases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteInstallmentPurchase(id: string): Promise<void> {
  await fetchAPI(`/installments/purchases/${id}`, {
    method: 'DELETE',
  });
}

export async function getInstallments(purchaseId?: string): Promise<Installment[]> {
  const query = purchaseId ? `?purchaseId=${purchaseId}` : '';
  return fetchAPI<Installment[]>(`/installments/installments${query}`);
}

export async function updateInstallment(id: string, updates: Partial<Installment>): Promise<Installment> {
  return fetchAPI<Installment>(`/installments/installments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// Due Dates
export async function getDueDates(): Promise<DueDate[]> {
  return fetchAPI<DueDate[]>('/due-dates');
}

export async function createDueDate(dueDate: Omit<DueDate, 'id'>): Promise<DueDate> {
  return fetchAPI<DueDate>('/due-dates', {
    method: 'POST',
    body: JSON.stringify(dueDate),
  });
}

export async function updateDueDate(id: string, updates: Partial<DueDate>): Promise<DueDate> {
  return fetchAPI<DueDate>(`/due-dates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteDueDate(id: string): Promise<void> {
  await fetchAPI(`/due-dates/${id}`, {
    method: 'DELETE',
  });
}

// Users
export async function getUsers(): Promise<User[]> {
  return fetchAPI<User[]>('/users');
}

