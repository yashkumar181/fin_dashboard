// src/lib/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed API client for the Finance Tracker backend.
// Uses Clerk's useAuth() to attach the Bearer token to every request.
// 
// USAGE:
//   const { getToken } = useAuth()
//   const api = createApiClient(getToken)
//   const dashboard = await api.getDashboard()
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "";
// If deploying API in same Vercel project as frontend, BASE_URL stays empty
// and calls go to /api/v1/... on the same domain (no CORS needed).
// If deploying separately, set VITE_API_URL=https://your-api.vercel.app

type GetToken = () => Promise<string | null>;

// ─── Shared fetch wrapper ─────────────────────────────────────────────────────

async function apiFetch<T>(
  getToken: GetToken,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }

  return res.json();
}

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface DashboardData {
  netWorth: number;
  bankBalance: number;
  creditDebt: number;
  monthlySpent: number;
  monthlyBudget: number;
  spendingPercentage: number;
  primaryCard: { name: string; outstanding: number; limit: number } | null;
  transactions: {
    id: number;
    name: string;
    category: string;
    amount: number;
    date: string;
    type: "expense" | "income";
    account: string;
    icon: string;
  }[];
  upcomingBills: {
    name: string;
    amount: number;
    dueDate: string;
    daysUntil: number;
    account: string;
  }[];
  wealthHistory: { month: string; income: number; expenses: number; net: number }[];
}

export interface Account {
  id: number;
  nickname: string;
  bankName: string | null;
  category: "bank" | "card" | "digital" | "cash";
  type: string;
  balance: number;
  creditLimit: number | null;
  outstanding: number;
  isDefault: boolean;
  availableCredit: number | null;
}

export interface Transaction {
  id: number;
  amount: number;
  type: "expense" | "income" | "transfer";
  category: string | null;
  subCategory: string | null;
  merchant: string | null;
  paymentMethod: string | null;
  isEssential: boolean;
  notes: string | null;
  date: string;
  accountId: number | null;
  accountName: string | null;
}

export interface Subscription {
  id: number;
  name: string;
  category: string | null;
  amount: number;
  billingDay: number | null;
  dueLabel: string | null;
  daysUntil: number | null;
  status: "active" | "paused" | "cancelled" | "trial";
  paidThisMonth: boolean;
  accountName: string | null;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  summary: { count: number; monthlyTotal: number; annualTotal: number };
}

export interface BudgetCategory {
  id: number;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  monthYear: string;
  isOverBudget: boolean;
}

export interface BudgetResponse {
  month: string;
  categories: BudgetCategory[];
  summary: {
    totalLimit: number;
    totalSpent: number;
    totalRemaining: number;
    overallPercentage: number;
  };
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  type: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  profit: number;
  profitPercent: number;
}

export interface InvestmentsResponse {
  holdings: Holding[];
  summary: {
    totalValue: number;
    totalInvested: number;
    totalProfit: number;
    totalProfitPercent: number;
    holdingCount: number;
  };
  allocation: { type: string; value: number; percentage: number }[];
}

export interface UserProfile {
  id?: number;
  phone?: string;
  name?: string | null;
  isRegistered?: boolean;
  onboardingRequired?: boolean;
}

// ─── API Client Factory ───────────────────────────────────────────────────────

export function createApiClient(getToken: GetToken) {
  const get = <T>(path: string) => apiFetch<T>(getToken, path);
  const post = <T>(path: string, body: unknown) =>
    apiFetch<T>(getToken, path, { method: "POST", body: JSON.stringify(body) });
  const put = <T>(path: string, body: unknown) =>
    apiFetch<T>(getToken, path, { method: "PUT", body: JSON.stringify(body) });
  const del = <T>(path: string) =>
    apiFetch<T>(getToken, path, { method: "DELETE" });

  return {
    // ── User / onboarding ──────────────────────────────────────────────────
    getUser: () => get<UserProfile>("/api/v1/user"),
    syncUser: (body: { phone: string; name?: string }) =>
      post<UserProfile>("/api/v1/user", body),

    // ── Dashboard ──────────────────────────────────────────────────────────
    getDashboard: () => get<DashboardData>("/api/v1/dashboard"),

    // ── Accounts ───────────────────────────────────────────────────────────
    getAccounts: () => get<Account[]>("/api/v1/accounts"),
    createAccount: (body: {
      nickname: string;
      bankName?: string;
      category: string;
      type: string;
      balance?: number;
      creditLimit?: number;
      outstanding?: number;
      isDefault?: boolean;
    }) => post<Account>("/api/v1/accounts", body),
    updateAccount: (id: number, body: Partial<Account>) =>
      put<Account>(`/api/v1/accounts?id=${id}`, body),
    deleteAccount: (id: number) => del<{ deleted: number }>(`/api/v1/accounts?id=${id}`),

    // ── Transactions ───────────────────────────────────────────────────────
    getTransactions: (params?: {
      limit?: number;
      type?: string;
      month?: string;
      category?: string;
    }) => {
      const qs = new URLSearchParams(
        Object.entries(params || {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString();
      return get<Transaction[]>(`/api/v1/transactions${qs ? "?" + qs : ""}`);
    },
    createTransaction: (body: {
      accountId?: number;
      amount: number;
      type: "expense" | "income" | "transfer";
      category?: string;
      subCategory?: string;
      merchant?: string;
      paymentMethod?: string;
      isEssential?: boolean;
      notes?: string;
    }) => post<Transaction>("/api/v1/transactions", body),
    deleteTransaction: (id: number) =>
      del<{ deleted: number }>(`/api/v1/transactions?id=${id}`),

    // ── Subscriptions ──────────────────────────────────────────────────────
    getSubscriptions: (status?: "active" | "all") =>
      get<SubscriptionsResponse>(
        `/api/v1/subscriptions${status ? "?status=" + status : ""}`
      ),
    createSubscription: (body: {
      serviceName: string;
      category?: string;
      amount: number;
      billingDay?: number;
      accountId?: number;
    }) => post<Subscription>("/api/v1/subscriptions", body),
    updateSubscription: (id: number, body: Partial<Subscription & { status: string }>) =>
      put<Subscription>(`/api/v1/subscriptions?id=${id}`, body),
    deleteSubscription: (id: number) =>
      del<{ deleted: number }>(`/api/v1/subscriptions?id=${id}`),

    // ── Budget ─────────────────────────────────────────────────────────────
    getBudget: (month?: string) =>
      get<BudgetResponse>(`/api/v1/budget${month ? "?month=" + month : ""}`),
    createBudgetCategory: (body: {
      category: string;
      monthlyLimit: number;
      monthYear?: string;
    }) => post<BudgetCategory>("/api/v1/budget", body),
    updateBudgetCategory: (id: number, monthlyLimit: number) =>
      put<BudgetCategory>(`/api/v1/budget?id=${id}`, { monthlyLimit }),
    deleteBudgetCategory: (id: number) =>
      del<{ deleted: number }>(`/api/v1/budget?id=${id}`),

    // ── Investments ────────────────────────────────────────────────────────
    getInvestments: () => get<InvestmentsResponse>("/api/v1/investments"),
    createHolding: (body: {
      symbol: string;
      assetName: string;
      assetType: string;
      sharesOwned: number;
      averageBuyPrice: number;
      currentPrice?: number;
    }) => post<Holding>("/api/v1/investments", body),
    updateHolding: (
      id: string,
      body: { currentPrice?: number; sharesOwned?: number; averageBuyPrice?: number }
    ) => put<Holding>(`/api/v1/investments?id=${id}`, body),
    deleteHolding: (id: string) =>
      del<{ deleted: string }>(`/api/v1/investments?id=${id}`),
  };
}

// ─── React hook ───────────────────────────────────────────────────────────────
// Import this in any page component:
//   const api = useApi()
//   const data = await api.getDashboard()

import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

export function useApi() {
  const { getToken } = useAuth();
  return useMemo(() => createApiClient(getToken), [getToken]);
}
