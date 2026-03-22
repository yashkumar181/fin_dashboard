// api/v1/user.ts
// GET  /api/v1/user   — return current user's DB profile + onboarding status
// POST /api/v1/user   — called after onboarding modal; upserts user by phone number
//                       links the Clerk profile to the DB users table

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db";
import { handleOptions } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (handleOptions(req,res)) return;

  const sql = getDb();

  if (req.method === "POST") {

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ error:"Missing token" });

    const token = authHeader.slice(7);

    let clerkUserId: string;

    try {

      const [,payloadB64] = token.split(".");
      const payload = JSON.parse(Buffer.from(payloadB64,"base64url").toString("utf8"));
      clerkUserId = payload.sub;

    } catch {

      return res.status(401).json({ error:"Invalid token" });
    }

    const { phone,name } = req.body;

    if (!phone)
      return res.status(400).json({ error:"phone required" });

    const normalizedPhone = phone.replace(/[\s\-]/g,"").replace(/^\+/,"");

    const insertRaw = await sql`
      INSERT INTO users (phone_number,name,is_registered)
      VALUES (${normalizedPhone},${name ?? null},TRUE)
      ON CONFLICT(phone_number)
      DO UPDATE SET
        name = COALESCE(${name ?? null},users.name),
        is_registered = TRUE
      RETURNING id,phone_number,name,is_registered,created_at
    `;

    const user = (insertRaw as any[])[0];

    return res.status(200).json({
      id:user.id,
      phone:user.phone_number,
      name:user.name,
      isRegistered:user.is_registered,
      createdAt:user.created_at
    });
  }

  if (req.method === "GET") {

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ error:"Missing token" });

    const token = authHeader.slice(7);

    try {

      const [,payloadB64] = token.split(".");
      const payload = JSON.parse(Buffer.from(payloadB64,"base64url").toString("utf8"));

      const clerkUserId = payload.sub;

      const clerkSecretKey = process.env.CLERK_SECRET_KEY;

      const clerkRes = await fetch(
        `https://api.clerk.com/v1/users/${clerkUserId}`,
        { headers:{ Authorization:`Bearer ${clerkSecretKey}` } }
      );

      const clerkUser = await clerkRes.json() as any;

      const phone: string | undefined = clerkUser.unsafe_metadata?.phone;

      if (!phone)
        return res.status(200).json({ onboardingRequired:true });

      const normalizedPhone = phone.replace(/[\s\-]/g,"").replace(/^\+/,"");

      const userRaw = await sql`
        SELECT id,phone_number,name,is_registered,created_at
        FROM users
        WHERE phone_number=${normalizedPhone}
        LIMIT 1
      `;

      const user = (userRaw as any[])[0];

      if (!user)
        return res.status(200).json({ onboardingRequired:true });

      return res.status(200).json({
        id:user.id,
        phone:user.phone_number,
        name:user.name,
        isRegistered:user.is_registered,
        createdAt:user.created_at,
        onboardingRequired:false
      });

    } catch(err) {

      console.error(err);

      return res.status(401).json({ error:"Invalid token" });
    }
  }

  res.status(405).json({ error:"Method not allowed" });
}