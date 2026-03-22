// lib/db.ts
// Neon serverless driver — works in Vercel Edge & Node runtimes
import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL environment variable is not set");
    _sql = neon(url);
  }
  return _sql;
}

// ─── Typed row shapes matching the Neon schema ──────────────────────────────

export interface DbUser {
  id: number;
  phone_number: string;
  name: string | null;
  is_registered: boolean;
  created_at: string;
}

export interface DbAccount {
  id: number;
  user_id: number;
  nickname: string;
  bank_name: string | null;
  account_category: "bank" | "card" | "digital" | "cash";
  account_type: string;
  balance: string;
  credit_limit: string | null;
  outstanding: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface DbTransaction {
  id: number;
  user_id: number;
  account_id: number | null;
  amount: string;
  type: "expense" | "income" | "transfer";
  category: string | null;
  sub_category: string | null;
  merchant: string | null;
  payment_method: string | null;
  is_essential: boolean;
  notes: string | null;
  transaction_date: string;
  to_account_id: number | null;
  subscription_id: number | null;
  created_at: string;
}

export interface DbSubscription {
  id: number;
  user_id: number;
  account_id: number | null;
  service_name: string;
  category: string | null;
  amount: string;
  billing_day: number | null;
  next_billing_date: string | null;
  status: "active" | "paused" | "cancelled" | "trial";
  trial_end_date: string | null;
  created_at: string;
}

export interface DbBudget {
  id: number;
  user_id: number;
  category: string;
  monthly_limit: string;
  month_year: string;
  created_at: string;
}

export interface DbInvestment {
  id: string;
  user_id: string;
  symbol: string;
  asset_name: string;
  asset_type: string;
  shares_owned: string;
  average_buy_price: string;
  current_price: string;
  created_at: string;
  updated_at: string;
}
