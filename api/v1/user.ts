// api/v1/user.ts
// GET  /api/v1/user   — return current user's DB profile + onboarding status
// POST /api/v1/user   — called after onboarding modal; upserts user by phone number
//                       links the Clerk profile to the DB users table

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db";
import { handleOptions } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const sql = getDb();

  // ── POST: called from OnboardingModal after user submits phone + DOB ──────
  // Does NOT require full auth (user may not be in DB yet)
  if (req.method === "POST") {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.slice(7);
    let clerkUserId: string;

    try {
      const [, payloadB64] = token.split(".");
      const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
      clerkUserId = payload.sub;
      if (!clerkUserId) throw new Error("No sub");
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });

    // Normalize phone
    const normalizedPhone = phone.replace(/[\s\-]/g, "").replace(/^\+/, "");

    // Upsert user by phone number
    const [user] = await sql`
      INSERT INTO users (phone_number, name, is_registered)
      VALUES (${normalizedPhone}, ${name ?? null}, TRUE)
      ON CONFLICT (phone_number)
      DO UPDATE SET
        name = COALESCE(${name ?? null}, users.name),
        is_registered = TRUE
      RETURNING id, phone_number, name, is_registered, created_at
    `;

    return res.status(200).json({
      id: user.id,
      phone: user.phone_number,
      name: user.name,
      isRegistered: user.is_registered,
      createdAt: user.created_at,
    });
  }

  // ── GET: return profile for the authenticated user ────────────────────────
  if (req.method === "GET") {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.slice(7);

    try {
      const [, payloadB64] = token.split(".");
      const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
      const clerkUserId: string = payload.sub;

      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (!clerkSecretKey) throw new Error("CLERK_SECRET_KEY not set");

      // Fetch Clerk user to get stored phone
      const clerkRes = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
        headers: { Authorization: `Bearer ${clerkSecretKey}` },
      });
      const clerkUser = await clerkRes.json();
      const phone: string | undefined = clerkUser.unsafe_metadata?.phone;

      if (!phone) {
        // User hasn't completed onboarding yet
        return res.status(200).json({ onboardingRequired: true });
      }

      const normalizedPhone = phone.replace(/[\s\-]/g, "").replace(/^\+/, "");

      const [user] = await sql`
        SELECT id, phone_number, name, is_registered, created_at
        FROM users
        WHERE phone_number = ${normalizedPhone}
        LIMIT 1
      `;

      if (!user) {
        return res.status(200).json({ onboardingRequired: true });
      }

      return res.status(200).json({
        id: user.id,
        phone: user.phone_number,
        name: user.name,
        isRegistered: user.is_registered,
        createdAt: user.created_at,
        onboardingRequired: false,
      });
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
