import { afterEach, describe, expect, it, vi } from "vitest";

const sent: unknown[] = [];
vi.mock("nodemailer", () => ({ createTransport: () => ({ sendMail: async (m: unknown) => void sent.push(m) }) }));

describe("mail transport", () => {
  afterEach(() => {
    delete process.env.SMTP_URL;
    delete process.env.MAIL_FROM;
    sent.length = 0;
  });

  it("sends through SMTP when SMTP_URL is set, from MAIL_FROM", async () => {
    process.env.SMTP_URL = "smtps://user:pass@smtp.example.test:465";
    process.env.MAIL_FROM = "Aalim <hello@example.test>";
    const { sendMail } = await import("@/lib/mail");
    await sendMail({ to: "a@example.test", subject: "Hi", text: "Plain", html: "<p>Html</p>" });
    expect(sent).toEqual([{ from: "Aalim <hello@example.test>", to: "a@example.test", subject: "Hi", text: "Plain", html: "<p>Html</p>" }]);
  });

  it("writes to .mail/ when no SMTP is configured", async () => {
    const { sendMail } = await import("@/lib/mail");
    await sendMail({ to: "b@example.test", subject: "Hi", text: "Plain" });
    expect(sent).toEqual([]);
  });
});
