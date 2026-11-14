"use server";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCALE_COOKIE, NUMERALS_COOKIE, LOCALES, NUMERAL_SYSTEMS } from "@/i18n/config";
import { auth } from "@/lib/auth/auth";
import { systemDb } from "@/lib/db";

const ONE_YEAR = 60 * 60 * 24 * 365;

async function currentUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

/** Language: stored in a cookie and, when signed in, on the profile. */
export async function setLocale(locale: string) {
  const value = z.enum(LOCALES).parse(locale);
  (await cookies()).set(LOCALE_COOKIE, value, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  const userId = await currentUserId();
  if (userId) await systemDb.user.update({ where: { id: userId }, data: { locale: value } });
  revalidatePath("/", "layout");
}

export async function setNumerals(numerals: string) {
  const value = z.enum(NUMERAL_SYSTEMS).parse(numerals);
  (await cookies()).set(NUMERALS_COOKIE, value, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  const userId = await currentUserId();
  if (userId) await systemDb.user.update({ where: { id: userId }, data: { numerals: value } });
  revalidatePath("/", "layout");
}

export async function setTextSize(size: string) {
  const value = z.enum(["default", "large"]).parse(size);
  const jar = await cookies();
  if (value === "large") jar.set("AALIM_TEXT_SIZE", "large", { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  else jar.delete("AALIM_TEXT_SIZE");
  revalidatePath("/", "layout");
}

/** After sign-in, bring the person's saved preferences into cookies. */
export async function syncPreferencesFromProfile() {
  const userId = await currentUserId();
  if (!userId) return;
  const user = await systemDb.user.findUnique({ where: { id: userId }, select: { locale: true, numerals: true } });
  if (!user) return;
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, user.locale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  jar.set(NUMERALS_COOKIE, user.numerals, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
}

const profileSchema = z.object({ name: z.string().trim().min(1).max(120) });

export async function updateProfile(input: { name: string }) {
  const userId = await currentUserId();
  if (!userId) return { ok: false as const, error: "unauthenticated" };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid" };
  await systemDb.user.update({ where: { id: userId }, data: { name: parsed.data.name } });
  revalidatePath("/app", "layout");
  return { ok: true as const };
}
