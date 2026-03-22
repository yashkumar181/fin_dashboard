// api/v1/accounts.ts
// GET    /api/v1/accounts          — list all accounts for auth'd user
// POST   /api/v1/accounts          — create a new account
// PUT    /api/v1/accounts?id=N     — update account (balance, nickname etc.)
// DELETE /api/v1/accounts?id=N     — soft-delete (set is_active = false)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db";
import { requireAuth, handleOptions } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  // ── GET: list all accounts ────────────────────────────────────────────────
  if (req.method === "GET") {
    const rows = await sql`
      SELECT id, nickname, bank_name, account_category, account_type,
             balance, credit_limit, outstanding, is_default, is_active, created_at
      FROM accounts
      WHERE user_id = ${uid} AND is_active = TRUE
      ORDER BY is_default DESC, account_category, nickname
    `;

    const accounts = (rows as any[]).map((a) => ({
      id: a.id,
      nickname: a.nickname,
      bankName: a.bank_name,
      category: a.account_category,
      type: a.account_type,
      balance: parseFloat(a.balance) || 0,
      creditLimit: a.credit_limit ? parseFloat(a.credit_limit) : null,
      outstanding: parseFloat(a.outstanding) || 0,
      isDefault: a.is_default,
      availableCredit:
        a.account_type === "credit_card" && a.credit_limit
          ? parseFloat(a.credit_limit) - (parseFloat(a.outstanding) || 0)
          : null,
    }));

    return res.status(200).json(accounts);
  }

  // ── POST: create account ──────────────────────────────────────────────────
  if (req.method === "POST") {
    const {
      nickname,
      bankName,
      category,
      type,
      balance = 0,
      creditLimit = null,
      outstanding = 0,
      isDefault = false,
    } = req.body;

    if (!nickname || !category || !type) {
      return res.status(400).json({ error: "nickname, category and type are required" });
    }

    // If setting as default, unset previous default first
    if (isDefault) {
      await sql`
        UPDATE accounts SET is_default = FALSE
        WHERE user_id = ${uid}
      `;
    }

    const [row] = await sql`
      INSERT INTO accounts
        (user_id, nickname, bank_name, account_category, account_type,
         balance, credit_limit, outstanding, is_default)
      VALUES
        (${uid}, ${nickname}, ${bankName ?? null}, ${category}, ${type},
         ${balance}, ${creditLimit}, ${outstanding}, ${isDefault})
      RETURNING id, nickname, account_category, account_type, balance,
                credit_limit, outstanding, is_default
    `;

    return res.status(201).json({
      id: row.id,
      nickname: row.nickname,
      category: row.account_category,
      type: row.account_type,
      balance: parseFloat(row.balance) || 0,
      creditLimit: row.credit_limit ? parseFloat(row.credit_limit) : null,
      outstanding: parseFloat(row.outstanding) || 0,
      isDefault: row.is_default,
    });
  }

  // ── PUT: update account ───────────────────────────────────────────────────
  if (req.method === "PUT") {
    const accountId = parseInt(req.query.id as string);
    if (!accountId) return res.status(400).json({ error: "id query param required" });

    const { nickname, bankName, balance, outstanding, isDefault } = req.body;

    // Verify ownership
    const [existing] = await sql`
      SELECT id FROM accounts WHERE id = ${accountId} AND user_id = ${uid}
    `;
    if (!existing) return res.status(404).json({ error: "Account not found" });

    if (isDefault) {
      await sql`UPDATE accounts SET is_default = FALSE WHERE user_id = ${uid}`;
    }

    const [updated] = await sql`
      UPDATE accounts
      SET
        nickname    = COALESCE(${nickname ?? null}, nickname),
        bank_name   = COALESCE(${bankName ?? null}, bank_name),
        balance     = COALESCE(${balance ?? null}, balance),
        outstanding = COALESCE(${outstanding ?? null}, outstanding),
        is_default  = COALESCE(${isDefault ?? null}, is_default)
      WHERE id = ${accountId} AND user_id = ${uid}
      RETURNING id, nickname, account_category, account_type, balance,
                credit_limit, outstanding, is_default
    `;

    return res.status(200).json({
      id: updated.id,
      nickname: updated.nickname,
      category: updated.account_category,
      type: updated.account_type,
      balance: parseFloat(updated.balance) || 0,
      creditLimit: updated.credit_limit ? parseFloat(updated.credit_limit) : null,
      outstanding: parseFloat(updated.outstanding) || 0,
      isDefault: updated.is_default,
    });
  }

  // ── DELETE: soft delete ───────────────────────────────────────────────────
  if (req.method === "DELETE") {
    const accountId = parseInt(req.query.id as string);
    if (!accountId) return res.status(400).json({ error: "id query param required" });

    await sql`
      UPDATE accounts SET is_active = FALSE
      WHERE id = ${accountId} AND user_id = ${uid}
    `;

    return res.status(200).json({ deleted: accountId });
  }

  res.status(405).json({ error: "Method not allowed" });
}
