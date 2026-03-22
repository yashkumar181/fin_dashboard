// api/v1/subscriptions.ts
// GET    /api/v1/subscriptions        — list active/all subscriptions
// POST   /api/v1/subscriptions        — create subscription
// PUT    /api/v1/subscriptions?id=N   — update (pause, cancel, edit amount)
// DELETE /api/v1/subscriptions?id=N   — hard delete

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db";
import { requireAuth, handleOptions } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (handleOptions(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  if (req.method === "GET") {

    const status = (req.query.status as string) || "active";

    const rowsRaw = await sql`
      SELECT s.id, s.service_name, s.category, s.amount, s.billing_day,
             s.next_billing_date, s.status, s.trial_end_date, s.created_at,
             a.nickname AS account_name, a.account_type,
             EXISTS (
               SELECT 1 FROM transactions t
               WHERE t.subscription_id = s.id
                 AND t.type = 'expense'
                 AND TO_CHAR(t.transaction_date,'YYYY-MM') = TO_CHAR(NOW(),'YYYY-MM')
             ) AS paid_this_month
      FROM subscriptions s
      LEFT JOIN accounts a ON s.account_id = a.id
      WHERE s.user_id = ${uid}
      AND (${status} = 'all' OR s.status = ${status})
      ORDER BY s.billing_day NULLS LAST, s.service_name
    `;

    const rows = rowsRaw as any[];

    const now = new Date();
    const today = now.getDate();

    const subs = rows.map((s) => {

      const billingDay = s.billing_day as number | null;

      let daysUntil: number | null = null;
      let dueLabel: string | null = null;

      if (billingDay) {

        daysUntil =
          billingDay >= today
            ? billingDay - today
            : 28 - today + billingDay;

        dueLabel =
          daysUntil === 0
            ? "Today"
            : daysUntil === 1
            ? "Tomorrow"
            : `In ${daysUntil} days`;
      }

      return {
        id: s.id,
        name: s.service_name,
        category: s.category,
        amount: parseFloat(s.amount),
        billingDay,
        dueLabel,
        daysUntil,
        status: s.status,
        paidThisMonth: s.paid_this_month,
        accountName: s.account_name,
        accountType: s.account_type,
        trialEndDate: s.trial_end_date,
        createdAt: s.created_at,
      };
    });

    const monthlyTotal = subs
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.amount, 0);

    return res.status(200).json({
      subscriptions: subs,
      summary: {
        count: subs.filter((s) => s.status === "active").length,
        monthlyTotal,
        annualTotal: monthlyTotal * 12,
      },
    });
  }

  if (req.method === "POST") {

    const { serviceName, category, amount, billingDay, accountId, status = "active" } =
      req.body;

    if (!serviceName || !amount)
      return res.status(400).json({ error: "serviceName and amount required" });

    const insertRaw = await sql`
      INSERT INTO subscriptions
      (user_id, account_id, service_name, category, amount, billing_day, status)
      VALUES
      (${uid}, ${accountId ?? null}, ${serviceName}, ${category ?? null},
       ${parseFloat(amount)}, ${billingDay ?? null}, ${status})
      RETURNING id, service_name, amount, billing_day, status
    `;

    const row = (insertRaw as any[])[0];

    return res.status(201).json({
      id: row.id,
      name: row.service_name,
      amount: parseFloat(row.amount),
      billingDay: row.billing_day,
      status: row.status,
    });
  }

  if (req.method === "PUT") {

    const subId = parseInt(req.query.id as string);
    if (!subId)
      return res.status(400).json({ error: "id required" });

    const { serviceName, amount, billingDay, status, category } = req.body;

    const existingRaw = await sql`
      SELECT id FROM subscriptions WHERE id = ${subId} AND user_id = ${uid}
    `;

    const existing = (existingRaw as any[])[0];

    if (!existing)
      return res.status(404).json({ error: "Subscription not found" });

    const updateRaw = await sql`
      UPDATE subscriptions
      SET
        service_name = COALESCE(${serviceName ?? null}, service_name),
        amount = COALESCE(${amount ? parseFloat(amount) : null}, amount),
        billing_day = COALESCE(${billingDay ?? null}, billing_day),
        status = COALESCE(${status ?? null}, status),
        category = COALESCE(${category ?? null}, category)
      WHERE id = ${subId} AND user_id = ${uid}
      RETURNING id, service_name, amount, billing_day, status
    `;

    const updated = (updateRaw as any[])[0];

    return res.status(200).json({
      id: updated.id,
      name: updated.service_name,
      amount: parseFloat(updated.amount),
      billingDay: updated.billing_day,
      status: updated.status,
    });
  }

  if (req.method === "DELETE") {

    const subId = parseInt(req.query.id as string);
    if (!subId)
      return res.status(400).json({ error: "id required" });

    await sql`
      DELETE FROM subscriptions
      WHERE id = ${subId} AND user_id = ${uid}
    `;

    return res.status(200).json({ deleted: subId });
  }

  res.status(405).json({ error: "Method not allowed" });
}