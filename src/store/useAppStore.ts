// src/store/useAppStore.ts
// Replaces hardcoded mock data with real API state.
// The store holds fetched data + loading/error flags.
// Pages call the fetch actions on mount; the store caches the result.

import { create } from "zustand";
import type {
  DashboardData,
  Account,
  Transaction,
  BudgetResponse,
  SubscriptionsResponse,
  InvestmentsResponse,
  UserProfile,
} from "@/lib/api";

export type TransactionType = "income" | "expense";

// ─── Store shape ──────────────────────────────────────────────────────────────

interface AppState {
  // ── Transaction sheet (quick-add UI) ──────────────────────────────────────
  isTransactionSheetOpen: boolean;
  openTransactionSheet: () => void;
  closeTransactionSheet: () => void;

  // ── User ──────────────────────────────────────────────────────────────────
  user: UserProfile | null;
  userLoading: boolean;
  setUser: (u: UserProfile | null) => void;

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: DashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
  setDashboard: (d: DashboardData) => void;
  setDashboardLoading: (v: boolean) => void;
  setDashboardError: (e: string | null) => void;

  // ── Accounts ──────────────────────────────────────────────────────────────
  accounts: Account[];
  accountsLoading: boolean;
  setAccounts: (a: Account[]) => void;
  setAccountsLoading: (v: boolean) => void;

  // ── Transactions ──────────────────────────────────────────────────────────
  transactions: Transaction[];
  transactionsLoading: boolean;
  setTransactions: (t: Transaction[]) => void;
  setTransactionsLoading: (v: boolean) => void;

  // ── Subscriptions ─────────────────────────────────────────────────────────
  subscriptions: SubscriptionsResponse | null;
  subscriptionsLoading: boolean;
  setSubscriptions: (s: SubscriptionsResponse) => void;
  setSubscriptionsLoading: (v: boolean) => void;

  // ── Budget ────────────────────────────────────────────────────────────────
  budget: BudgetResponse | null;
  budgetLoading: boolean;
  setBudget: (b: BudgetResponse) => void;
  setBudgetLoading: (v: boolean) => void;

  // ── Investments ───────────────────────────────────────────────────────────
  investments: InvestmentsResponse | null;
  investmentsLoading: boolean;
  setInvestments: (i: InvestmentsResponse) => void;
  setInvestmentsLoading: (v: boolean) => void;

  // ── Legacy computed values (derived from dashboard data) ──────────────────
  // These keep compatibility with components that read from the store directly
  currentNetWorth: number;
  monthlyBudget: number;
  monthlySpent: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  // Transaction sheet
  isTransactionSheetOpen: false,
  openTransactionSheet: () => set({ isTransactionSheetOpen: true }),
  closeTransactionSheet: () => set({ isTransactionSheetOpen: false }),

  // User
  user: null,
  userLoading: false,
  setUser: (u) => set({ user: u }),

  // Dashboard
  dashboard: null,
  dashboardLoading: false,
  dashboardError: null,
  setDashboard: (d) =>
    set({
      dashboard: d,
      // Keep legacy fields in sync so existing components keep working
      currentNetWorth: d.netWorth,
      monthlyBudget: d.monthlyBudget,
      monthlySpent: d.monthlySpent,
    }),
  setDashboardLoading: (v) => set({ dashboardLoading: v }),
  setDashboardError: (e) => set({ dashboardError: e }),

  // Accounts
  accounts: [],
  accountsLoading: false,
  setAccounts: (a) => set({ accounts: a }),
  setAccountsLoading: (v) => set({ accountsLoading: v }),

  // Transactions
  transactions: [],
  transactionsLoading: false,
  setTransactions: (t) => set({ transactions: t }),
  setTransactionsLoading: (v) => set({ transactionsLoading: v }),

  // Subscriptions
  subscriptions: null,
  subscriptionsLoading: false,
  setSubscriptions: (s) => set({ subscriptions: s }),
  setSubscriptionsLoading: (v) => set({ subscriptionsLoading: v }),

  // Budget
  budget: null,
  budgetLoading: false,
  setBudget: (b) => set({ budget: b }),
  setBudgetLoading: (v) => set({ budgetLoading: v }),

  // Investments
  investments: null,
  investmentsLoading: false,
  setInvestments: (i) => set({ investments: i }),
  setInvestmentsLoading: (v) => set({ investmentsLoading: v }),

  // Legacy computed fields (populated when dashboard loads)
  currentNetWorth: 0,
  monthlyBudget: 0,
  monthlySpent: 0,
}));
