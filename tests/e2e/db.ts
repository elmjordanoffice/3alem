import { createHash, randomBytes } from "node:crypto";
import pg from "pg";
import "dotenv/config";

/** Direct database helpers for end-to-end tests (owner connection). */
export async function withDb<T>(fn: (c: pg.Client) => Promise<T>): Promise<T> {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}

/** A fresh invitation to the demo role; returns the raw token. */
export async function freshInvitation(email = `cand-${Date.now()}@test.aalim`, name = "Test Candidate") {
  const token = randomBytes(24).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  await withDb(async (c) => {
    const t = await c.query(`SELECT id, "organizationId", "createdById" FROM assessment_template WHERE title = 'Operations Team Lead' LIMIT 1`);
    const row = t.rows[0];
    await c.query(
      `INSERT INTO invitation (id, "organizationId", "templateId", email, name, "tokenHash", status, accommodations, "expiresAt", "invitedById", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', '{}', now() + interval '7 days', $7, now(), now())`,
      [`inv_${randomBytes(8).toString("hex")}`, row.organizationId, row.id, email, name, hash, row.createdById],
    );
  });
  return token;
}
