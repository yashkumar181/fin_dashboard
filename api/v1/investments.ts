// api/v1/investments.ts
// GET    /api/v1/investments          — list all holdings with P&L calculations
// POST   /api/v1/investments          — add a new holding
// PUT    /api/v1/investments?id=X     — update current_price or shares_owned
// DELETE /api/v1/investments?id=X    — remove holding
//
// Note: investments.user_id is TEXT (Clerk user ID) in your schema,
// so we use the Clerk user ID directly here, not the numeric DB user ID.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db";
import { requireAuth, handleOptions } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (handleOptions(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const clerkUid = auth.clerkUserId;

  // ───────────────── GET ─────────────────
  if (req.method === "GET") {

    const rowsRaw = await sql`
      SELECT id, symbol, asset_name, asset_type,
             shares_owned, average_buy_price, current_price,
             created_at, updated_at
      FROM investments
      WHERE user_id = ${clerkUid}
      ORDER BY asset_type, symbol
    `;

    const rows = rowsRaw as any[];

    let totalValue = 0;
    let totalInvested = 0;

    const holdings = rows.map((r) => {

      const shares = parseFloat(r.shares_owned);
      const avgPrice = parseFloat(r.average_buy_price);
      const currentPrice = parseFloat(r.current_price);

      const invested = shares * avgPrice;
      const current = shares * currentPrice;
      const profit = current - invested;

      const profitPct =
        invested > 0 ? (profit / invested) * 100 : 0;

      totalValue += current;
      totalInvested += invested;

      return {
        id: r.id,
        symbol: r.symbol,
        name: r.asset_name,
        type: r.asset_type,
        shares,
        avgPrice,
        currentPrice,
        invested,
        currentValue: current,
        profit,
        profitPercent: profitPct,
        updatedAt: r.updated_at,
      };
    });

    const totalProfit = totalValue - totalInvested;

    const totalProfitPct =
      totalInvested > 0
        ? (totalProfit / totalInvested) * 100
        : 0;

    const allocationMap: Record<string, number> = {};

    for (const h of holdings) {
      allocationMap[h.type] =
        (allocationMap[h.type] || 0) + h.currentValue;
    }

    const allocation = Object.entries(allocationMap).map(
      ([type, value]) => ({
        type,
        value,
        percentage:
          totalValue > 0
            ? Math.round((value / totalValue) * 100)
            : 0,
      })
    );

    return res.status(200).json({
      holdings,
      summary: {
        totalValue,
        totalInvested,
        totalProfit,
        totalProfitPercent: totalProfitPct,
        holdingCount: holdings.length,
      },
      allocation,
    });
  }

  // ───────────────── POST ─────────────────
  if (req.method === "POST") {

    const {
      symbol,
      assetName,
      assetType,
      sharesOwned,
      averageBuyPrice,
      currentPrice,
    } = req.body;

    if (
      !symbol ||
      !assetName ||
      !assetType ||
      !sharesOwned ||
      !averageBuyPrice
    ) {
      return res.status(400).json({
        error:
          "symbol, assetName, assetType, sharesOwned, averageBuyPrice are required",
      });
    }

    const insertRaw = await sql`
      INSERT INTO investments
        (user_id, symbol, asset_name, asset_type,
         shares_owned, average_buy_price, current_price)
      VALUES
        (${clerkUid},
         ${symbol.toUpperCase()},
         ${assetName},
         ${assetType},
         ${parseFloat(sharesOwned)},
         ${parseFloat(averageBuyPrice)},
         ${parseFloat(currentPrice || averageBuyPrice)})
      RETURNING id, symbol, asset_name, asset_type,
                shares_owned, average_buy_price, current_price
    `;

    const row = (insertRaw as any[])[0];

    return res.status(201).json({
      id: row.id,
      symbol: row.symbol,
      name: row.asset_name,
      type: row.asset_type,
      shares: parseFloat(row.shares_owned),
      avgPrice: parseFloat(row.average_buy_price),
      currentPrice: parseFloat(row.current_price),
    });
  }

  // ───────────────── PUT ─────────────────
  if (req.method === "PUT") {

    const holdingId = req.query.id as string;

    if (!holdingId)
      return res.status(400).json({ error: "id required" });

    const {
      currentPrice,
      sharesOwned,
      averageBuyPrice,
    } = req.body;

    const updateRaw = await sql`
      UPDATE investments
      SET
        current_price =
          COALESCE(${currentPrice ? parseFloat(currentPrice) : null}, current_price),

        shares_owned =
          COALESCE(${sharesOwned ? parseFloat(sharesOwned) : null}, shares_owned),

        average_buy_price =
          COALESCE(${averageBuyPrice ? parseFloat(averageBuyPrice) : null}, average_buy_price),

        updated_at = NOW()

      WHERE id = ${holdingId}
        AND user_id = ${clerkUid}

      RETURNING id, symbol, shares_owned,
                average_buy_price, current_price
    `;

    const updated = (updateRaw as any[])[0];

    if (!updated)
      return res.status(404).json({ error: "Holding not found" });

    return res.status(200).json({
      id: updated.id,
      symbol: updated.symbol,
      shares: parseFloat(updated.shares_owned),
      avgPrice: parseFloat(updated.average_buy_price),
      currentPrice: parseFloat(updated.current_price),
    });
  }

  // ───────────────── DELETE ─────────────────
  if (req.method === "DELETE") {

    const holdingId = req.query.id as string;

    if (!holdingId)
      return res.status(400).json({ error: "id required" });

    await sql`
      DELETE FROM investments
      WHERE id = ${holdingId}
      AND user_id = ${clerkUid}
    `;

    return res.status(200).json({ deleted: holdingId });
  }

  res.status(405).json({ error: "Method not allowed" });
}