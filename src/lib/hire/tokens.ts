import { createHash, randomBytes } from "node:crypto";

/** A URL-safe random token. Only its hash is stored. */
export function generateToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
