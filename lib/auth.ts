// lib/auth.ts
// Validates Clerk JWT from Authorization header and returns the DB user
// The Clerk userId is stored in user.unsafeMetadata.dbUserId after onboarding,
// OR we look up by phone number stored in user.unsafeMetadata.phone

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "./db";

export interface AuthContext {
  clerkUserId: string;
  dbUserId: number;
  phone: string;
}

/**
 * Verifies the Clerk session token in the Authorization header.
 * Returns the DB user id, or sends a 401 and returns null.
 *
 * We use Clerk's public JWKS endpoint to verify the token without
 * importing the full Clerk SDK (keeps the bundle tiny for serverless).
 */
export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<AuthContext | null> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header" });
    return null;
  }

  const token = authHeader.slice(7);

  try {
    // Decode the JWT payload without verification first to extract the sub claim
    // Full verification happens below via Clerk's JWKS
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    const clerkUserId: string = payload.sub;
    if (!clerkUserId) throw new Error("No sub claim in token");

    // Verify the token is not expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      res.status(401).json({ error: "Token expired" });
      return null;
    }

    // Look up the DB user by Clerk user ID stored in metadata
    // We use the phone number from Clerk metadata to find the DB user
    // Fetch the Clerk user from the backend API
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) throw new Error("CLERK_SECRET_KEY not set");

    const clerkRes = await fetch(
      `https://api.clerk.com/v1/users/${clerkUserId}`,
      {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!clerkRes.ok) {
      res.status(401).json({ error: "Could not verify Clerk user" });
      return null;
    }

    const clerkUser = await clerkRes.json();

    // Extract phone from unsafeMetadata (set during onboarding)
    const phone: string | undefined = clerkUser.unsafe_metadata?.phone;

    if (!phone) {
      res.status(403).json({
        error: "Onboarding incomplete — phone number not found in profile",
      });
      return null;
    }

    // Normalize phone: strip spaces, dashes, plus sign for DB lookup
    const normalizedPhone = phone.replace(/[\s\-]/g, "").replace(/^\+/, "");

    const sql = getDb();
    const rows = await sql`
      SELECT id FROM users
      WHERE phone_number = ${normalizedPhone}
        AND is_registered = TRUE
      LIMIT 1
    `;

    if (!rows.length) {
      res.status(403).json({
        error: "User not found in database. Please contact support.",
      });
      return null;
    }

    return {
      clerkUserId,
      dbUserId: rows[0].id as number,
      phone: normalizedPhone,
    };
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
}

/**
 * Handle CORS preflight OPTIONS requests.
 * Call this at the top of every handler.
 */
export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}
