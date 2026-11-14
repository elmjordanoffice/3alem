import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { systemDb } from "@/lib/db";
import { sendMail } from "@/lib/mail";

export const auth = betterAuth({
  appName: "Aalim",
  baseURL: process.env.BETTER_AUTH_URL,
  // Extra origins allowed to call the auth API (comma-separated), e.g. a preview URL.
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean),
  database: prismaAdapter(systemDb, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset your Aalim password",
        text: `Use this link to choose a new password. It expires in one hour.\n\n${url}\n\nIf you did not ask for this, you can ignore this email.`,
      });
    },
  },
  session: {
    modelName: "authSession",
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    additionalFields: {
      activeOrganizationId: { type: "string", required: false, input: false },
    },
  },
  user: {
    additionalFields: {
      locale: { type: "string", required: false, defaultValue: "en", input: true },
      numerals: { type: "string", required: false, defaultValue: "latn", input: true },
      isPlatformAdmin: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  // On in production. AUTH_RATE_LIMIT=off exists only for the end-to-end suite,
  // which signs in many times a minute from one address.
  rateLimit: {
    enabled: process.env.NODE_ENV === "production" && process.env.AUTH_RATE_LIMIT !== "off",
    window: 60,
    max: 30,
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
