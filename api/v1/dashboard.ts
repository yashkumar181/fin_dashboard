// api/v1/dashboard.ts
// GET /api/v1/dashboard
// Returns everything the Dashboard page needs in a single request:
// net worth, monthly spend vs budget, recent transactions, upcoming bills,
// 6-month wealth history, and active debt summary.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db";
import { requireAuth, handleOptions } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Run all queries in parallel for speed
  const [
    accountsRows,
    monthlySpentRow,
    totalBudgetRow,
    recentTxns,
    upcomingBills,
    wealthHistory,
    creditCards,
  ] = await Promise.all([
    // All active non-credit accounts for net worth
    sql`
      SELECT id, nickname, account_type, balance, outstanding, credit_limit
      FROM accounts
      WHERE user_id = ${uid} AND is_active = TRUE
    `,

    // Total expenses this month
    sql`
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE user_id = ${uid}
        AND type = 'expense'
        AND TO_CHAR(transaction_date, 'YYYY-MM') = ${currentMonth}
    `,

    // Total budget limit this month
    sql`
      SELECT COALESCE(SUM(monthly_limit), 0) AS total
      FROM budgets
      WHERE user_id = ${uid} AND month_year = ${currentMonth}
    `,

    // Last 5 transactions
    sql`
      SELECT t.id, t.amount, t.type, t.category, t.sub_category,
             t.merchant, t.transaction_date, t.payment_method,
             a.nickname AS account_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = ${uid}
      ORDER BY t.transaction_date DESC
      LIMIT 5
    `,

    // Active subscriptions due in the next 7 days (upcoming bills)
    sql`
      SELECT s.service_name, s.amount, s.billing_day,
             a.nickname AS account_name
      FROM subscriptions s
      LEFT JOIN accounts a ON s.account_id = a.id
      WHERE s.user_id = ${uid} AND s.status = 'active'
      ORDER BY s.billing_day
      LIMIT 5
    `,

    // 6-month expense + income history for the chart
    sql`
      SELECT
        TO_CHAR(transaction_date, 'Mon') AS month,
        TO_CHAR(transaction_date, 'YYYY-MM') AS month_key,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses
      FROM transactions
      WHERE user_id = ${uid}
        AND transaction_date >= NOW() - INTERVAL '6 months'
      GROUP BY month, month_key
      ORDER BY month_key ASC
    `,

    // Credit card outstanding balances
    sql`
      SELECT nickname, outstanding, credit_limit
      FROM accounts
      WHERE user_id = ${uid}
        AND account_type = 'credit_card'
        AND is_active = TRUE
    `,
  ]);

  // --- Compute net worth ---
  let bankBalance = 0;
  let creditDebt = 0;

  for (const acc of accountsRows) {
    if (acc.account_type === "credit_card") {
      creditDebt += parseFloat(acc.outstanding as string) || 0;
    } else {
      bankBalance += parseFloat(acc.balance as string) || 0;
    }
  }

  const netWorth = bankBalance - creditDebt;

  // --- Monthly spend vs budget ---
  const monthlySpent = parseFloat(monthlySpentRow[0]?.total as string) || 0;
  const monthlyBudget = parseFloat(totalBudgetRow[0]?.total as string) || 0;

  // --- Active debt summary (first credit card) ---
  const primaryCard = creditCards[0] || null;

  // --- Wealth history: build cumulative running balance ---
  // For the chart we show income - expenses per month
  const wealthChartData = (wealthHistory as any[]).map((row) => ({
    month: row.month,
    income: parseFloat(row.income) || 0,
    expenses: parseFloat(row.expenses) || 0,
    net: (parseFloat(row.income) || 0) - (parseFloat(row.expenses) || 0),
  }));

  // --- Format recent transactions ---
  const transactions = (recentTxns as any[]).map((t) => ({
    id: t.id,
    name: t.merchant || t.category || t.type,
    category: t.sub_category || t.category || t.type,
    amount: parseFloat(t.amount),
    date: t.transaction_date,
    type: t.type,
    account: t.account_name,
    icon:
      t.type === "income"
        ? "💰"
        : t.category === "Food & Dining"
        ? "🍔"
        : t.category === "Transport"
        ? "🚗"
        : t.category === "Shopping"
        ? "🛒"
        : t.category === "Entertainment"
        ? "🎬"
        : "💸",
  }));

  // --- Format upcoming bills ---
  const bills = (upcomingBills as any[]).map((s) => {
    const day = s.billing_day as number;
    const today = now.getDate();
    const daysUntil = day >= today ? day - today : 28 - today + day;
    const dueLabel =
      daysUntil === 0
        ? "Today"
        : daysUntil === 1
        ? "Tomorrow"
        : `In ${daysUntil} days`;

    return {
      name: s.service_name,
      amount: parseFloat(s.amount),
      dueDate: dueLabel,
      daysUntil,
      account: s.account_name,
    };
  });

  res.status(200).json({
    netWorth,
    bankBalance,
    creditDebt,
    monthlySpent,
    monthlyBudget,
    spendingPercentage: monthlyBudget > 0 ? Math.round((monthlySpent / monthlyBudget) * 100) : 0,
    primaryCard: primaryCard
      ? {
          name: primaryCard.nickname,
          outstanding: parseFloat(primaryCard.outstanding as string) || 0,
          limit: parseFloat(primaryCard.credit_limit as string) || 0,
        }
      : null,
    transactions,
    upcomingBills: bills,
    wealthHistory: wealthChartData,
  });
}
