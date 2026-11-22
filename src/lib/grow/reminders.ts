import "server-only";
import { systemDb } from "@/lib/db";
import { brandedEmail } from "@/lib/mail/templates";
import { sendMail } from "@/lib/mail";
import { createTranslator } from "use-intl/core";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import { DOMAINS } from "@/lib/framework/data";
import { practiceEvents } from "./momentum-data";
import { habit } from "./habit";
import { nextStep } from "./next-step";

/**
 * The opt-in daily reminder: at the hour the person chose, one short email
 * with today's 2-minute rep, unless they've already practised today. At most
 * one a day, never a guilt message, and off with one click (D-059).
 * Called by an external scheduler every hour (`/api/cron/reminders`).
 */
export async function sendRepReminders(now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const due = await systemDb.growProfile.findMany({
    where: { reminderHour: now.getUTCHours(), OR: [{ lastRemindedAt: null }, { lastRemindedAt: { lt: new Date(`${today}T00:00:00Z`) } }] },
  });
  const users = await systemDb.user.findMany({ where: { id: { in: due.map((d) => d.userId) } }, select: { id: true, email: true, name: true, locale: true } });
  let sent = 0;
  for (const p of due) {
    const user = users.find((u) => u.id === p.userId);
    if (!user) continue;
    const locale = user.locale === "ar" ? "ar" : "en";
    const events = await practiceEvents(p.userId);
    const h = habit(events, { locale, now });
    if (h.doneToday) continue;
    const report = await systemDb.report.findFirst({ where: { subjectUserId: p.userId, kind: "GROW", status: "READY" }, orderBy: { createdAt: "desc" }, select: { content: true } });
    const plan = ((report?.content as { narrative?: { plan?: { skillKey: string }[] } } | null)?.narrative?.plan ?? []).map((x) => x.skillKey);
    const skillKey = nextStep(plan, events.map((e) => ({ skillKeys: e.skillKeys, completedAt: e.completedAt, scores: e.skillKeys.map((k, i) => ({ competencyKey: k, level: e.levels[i] ?? e.levels[0] ?? 0 })) })), now)?.skillKey ?? plan[0];
    const skill = DOMAINS.flatMap((d) => d.subSkills).find((s) => s.key === skillKey)?.name[locale] ?? (locale === "ar" ? "مهارة من خطتك" : "a skill from your plan");
    const t = createTranslator({ locale, messages: locale === "ar" ? ar : en, namespace: "emails.repStreak" });
    const streak = h.streak > 1 ? t("keep", { n: h.streak }) : t("start");
    const base = (process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const mail = brandedEmail("rep", locale, { name: user.name.split(" ")[0] ?? user.name, skill: locale === "en" ? skill.toLowerCase() : skill, streak }, { url: `${base}/app/grow` });
    await sendMail({ to: user.email, ...mail });
    await systemDb.growProfile.update({ where: { id: p.id }, data: { lastRemindedAt: now } });
    sent++;
  }
  return { due: due.length, sent };
}
