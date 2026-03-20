// src/store/useAppStore.ts
import { create } from 'zustand'

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  name: string
  category: string
  amount: number
  date: string
  type: TransactionType
  icon: string
}

export interface BudgetCategory {
  id: number
  name: string
  spent: number
  limit: number
  icon: string
}

interface AppState {
  isTransactionSheetOpen: boolean
  openTransactionSheet: () => void
  closeTransactionSheet: () => void

  currentNetWorth: number
  monthlyBudget: number
  monthlySpent: number
  transactions: Transaction[]
  categories: BudgetCategory[]
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  addCategory: (category: Omit<BudgetCategory, 'id' | 'spent'>) => void // <-- NEW ACTION
}

export const useAppStore = create<AppState>((set) => ({
  isTransactionSheetOpen: false,
  openTransactionSheet: () => set({ isTransactionSheetOpen: true }),
  closeTransactionSheet: () => set({ isTransactionSheetOpen: false }),

  currentNetWorth: 2260000,
  monthlyBudget: 60000,
  monthlySpent: 45200,
  
  categories: [
    { id: 1, name: "Housing & Rent", spent: 25000, limit: 25000, icon: "🏠" },
    { id: 2, name: "Food & Dining", spent: 8500, limit: 12000, icon: "🍔" },
    { id: 3, name: "Transport", spent: 4200, limit: 5000, icon: "🚗" },
    { id: 4, name: "Shopping", spent: 5000, limit: 4000, icon: "🛍️" },
    { id: 5, name: "Entertainment", spent: 1500, limit: 4000, icon: "🎬" },
    { id: 6, name: "Utilities", spent: 1000, limit: 10000, icon: "⚡" },
  ],

  transactions: [
    { id: '1', name: "Amazon", category: "Shopping", amount: 4500, date: "Today", type: "expense", icon: "🛒" },
    { id: '2', name: "Salary", category: "Income", amount: 125000, date: "Yesterday", type: "income", icon: "💰" },
    { id: '3', name: "Uber", category: "Transport", amount: 450, date: "Yesterday", type: "expense", icon: "🚗" },
  ],

  addTransaction: (tx) => set((state) => {
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) }
    const isExpense = tx.type === 'expense'
    
    const updatedCategories = state.categories.map(cat => {
      const isMatch = cat.name.includes(tx.category) || tx.category.includes(cat.name.split(' ')[0]);
      if (isExpense && isMatch) {
        return { ...cat, spent: cat.spent + tx.amount }
      }
      return cat
    })

    return {
      transactions: [newTx, ...state.transactions],
      currentNetWorth: isExpense ? state.currentNetWorth - tx.amount : state.currentNetWorth + tx.amount,
      monthlySpent: isExpense ? state.monthlySpent + tx.amount : state.monthlySpent,
      categories: updatedCategories
    }
  }),

  // NEW: Add a category and optionally increase the overall monthly budget limit
  addCategory: (newCategory) => set((state) => {
    const category: BudgetCategory = {
      ...newCategory,
      id: Math.max(0, ...state.categories.map(c => c.id)) + 1,
      spent: 0
    }
    return {
      categories: [...state.categories, category],
      monthlyBudget: state.monthlyBudget + newCategory.limit // Expands your total budget
    }
  })
}))