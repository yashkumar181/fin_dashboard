// api/v1/transactions.ts
// GET    /api/v1/transactions              — list with optional ?limit=&type=&month=
// POST   /api/v1/transactions              — create + update account balance
// DELETE /api/v1/transactions?id=N         — delete + reverse balance update

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

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const type = req.query.type as string | undefined;
    const month = req.query.month as string | undefined;
    const category = req.query.category as string | undefined;

    const rowsRaw = await sql`
      SELECT t.id, t.amount, t.type, t.category, t.sub_category,
             t.merchant, t.payment_method, t.is_essential, t.notes,
             t.transaction_date, t.account_id,
             a.nickname AS account_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = ${uid}
        AND (${type ?? null} IS NULL OR t.type = ${type ?? null})
        AND (${month ?? null} IS NULL OR TO_CHAR(t.transaction_date,'YYYY-MM')=${month ?? null})
        AND (${category ?? null} IS NULL OR t.category=${category ?? null})
      ORDER BY t.transaction_date DESC
      LIMIT ${limit}
    `;

    const rows = rowsRaw as any[];

    return res.status(200).json(
      rows.map((t) => ({
        id: t.id,
        amount: parseFloat(t.amount),
        type: t.type,
        category: t.category,
        subCategory: t.sub_category,
        merchant: t.merchant,
        paymentMethod: t.payment_method,
        isEssential: t.is_essential,
        notes: t.notes,
        date: t.transaction_date,
        accountId: t.account_id,
        accountName: t.account_name,
      }))
    );
  }

  if (req.method === "POST") {

    const {
      accountId,
      amount,
      type,
      category,
      subCategory,
      merchant,
      paymentMethod,
      isEssential = true,
      notes,
    } = req.body;

    if (!amount || !type)
      return res.status(400).json({ error: "amount and type required" });

    if (!["expense","income","transfer"].includes(type))
      return res.status(400).json({ error: "invalid type" });

    const amountNum = parseFloat(amount);

    const txnRaw = await sql`
      INSERT INTO transactions
        (user_id, account_id, amount, type, category, sub_category,
         merchant, payment_method, is_essential, notes)
      VALUES
        (${uid}, ${accountId ?? null}, ${amountNum}, ${type},
         ${category ?? null}, ${subCategory ?? null},
         ${merchant ?? null}, ${paymentMethod ?? null},
         ${isEssential}, ${notes ?? null})
      RETURNING id, amount, type, category, transaction_date
    `;

    const txn = (txnRaw as any[])[0];

    if (accountId) {

      const accRaw = await sql`
        SELECT account_type FROM accounts
        WHERE id=${accountId} AND user_id=${uid}
      `;

      const acc = (accRaw as any[])[0];

      if (acc) {

        if (acc.account_type === "credit_card") {

          const delta = type === "expense" ? amountNum : -amountNum;

          await sql`
            UPDATE accounts
            SET outstanding = GREATEST(0,outstanding + ${delta})
            WHERE id=${accountId}
          `;

        } else {

          const delta = type === "income" ? amountNum : -amountNum;

          await sql`
            UPDATE accounts
            SET balance = balance + ${delta}
            WHERE id=${accountId}
          `;
        }
      }
    }

    return res.status(201).json({
      id: txn.id,
      amount: parseFloat(txn.amount),
      type: txn.type,
      category: txn.category,
      date: txn.transaction_date,
    });
  }

  if (req.method === "DELETE") {

    const txnId = parseInt(req.query.id as string);
    if (!txnId)
      return res.status(400).json({ error: "id required" });

    const txnRaw = await sql`
      SELECT amount,type,account_id
      FROM transactions
      WHERE id=${txnId} AND user_id=${uid}
    `;

    const txn = (txnRaw as any[])[0];

    if (!txn)
      return res.status(404).json({ error:"Transaction not found" });

    await sql`DELETE FROM transactions WHERE id=${txnId}`;

    if (txn.account_id) {

      const accRaw = await sql`
        SELECT account_type FROM accounts WHERE id=${txn.account_id}
      `;

      const acc = (accRaw as any[])[0];

      if (acc) {

        const amountNum = parseFloat(txn.amount);

        if (acc.account_type === "credit_card") {

          const delta = txn.type === "expense" ? -amountNum : amountNum;

          await sql`
            UPDATE accounts
            SET outstanding = GREATEST(0,outstanding + ${delta})
            WHERE id=${txn.account_id}
          `;

        } else {

          const delta = txn.type === "income" ? -amountNum : amountNum;

          await sql`
            UPDATE accounts
            SET balance = balance + ${delta}
            WHERE id=${txn.account_id}
          `;
        }
      }
    }

    return res.status(200).json({ deleted: txnId });
  }

  res.status(405).json({ error:"Method not allowed" });
}