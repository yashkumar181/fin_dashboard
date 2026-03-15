import { create } from 'zustand'

interface AppState {
  isTransactionSheetOpen: boolean
  openTransactionSheet: () => void
  closeTransactionSheet: () => void
}

export const useAppStore = create<AppState>((set) => ({
  isTransactionSheetOpen: false,
  openTransactionSheet: () => set({ isTransactionSheetOpen: true }),
  closeTransactionSheet: () => set({ isTransactionSheetOpen: false }),
}))