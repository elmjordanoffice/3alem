import { beforeAll, describe, expect, it } from "vitest";
import { aggregateFairness, pearson, MIN_GROUP, type FairnessRow } from "@/lib/fairness-core";
import { validateWebhookUrl } from "@/lib/webhook-url";

describe("at-rest encryption and webhook signatures", () => {
  let crypto: typeof import("@/lib/crypto");
  beforeAll(async () => {
    process.env.BETTER_AUTH_SECRET ??= "test-secret-for-unit-tests-only";
    crypto = await import("@/lib/crypto");
  });

  it("round-trips and never stores the plain text", () => {
    const token = crypto.encrypt("whsec_abc123");
    expect(token).not.toContain("whsec_abc123");
    expect(crypto.decrypt(token)).toBe("whsec_abc123");
    expect(crypto.encrypt("whsec_abc123")).not.toBe(token); // random IV
  });

  it("rejects tampered ciphertext", () => {
    const [iv, tag, body] = crypto.encrypt("secret").split(".");
    const flipped = Buffer.from(body!, "base64url");
    flipped[0]! ^= 1;
    expect(() => crypto.decrypt([iv, tag, flipped.toString("base64url")].join("."))).toThrow();
  });

  it("signs bodies with HMAC-SHA256", () => {
    expect(crypto.sign("k", '{"a":1}')).toMatch(/^sha256=[0-9a-f]{64}$/);
    expect(crypto.sign("k", "x")).not.toBe(crypto.sign("k2", "x"));
  });
});

describe("webhook URL guard", () => {
  it("accepts public HTTPS", () => {
    expect(validateWebhookUrl("https://ats.example.com/hooks").ok).toBe(true);
  });
  it.each(["http://ats.example.com", "ftp://x.com", "not a url"])("rejects %s", (u) => {
    expect(validateWebhookUrl(u).ok).toBe(false);
  });
  it.each(["https://10.0.0.5/h", "https://192.168.1.1", "https://172.20.0.1", "https://169.254.169.254/latest", "https://127.0.0.1", "https://[::1]/", "https://db.internal", "https://printer.local"])(
    "blocks private address %s",
    (u) => {
      expect(validateWebhookUrl(u)).toMatchObject({ ok: false });
    },
  );
});

describe("fairness monitoring", () => {
  const rows = (group: string, n: number, selected: number): FairnessRow[] =>
    Array.from({ length: n }, (_, i) => ({ gender: group, roleFit: i < selected ? "GOOD" : "PARTIAL", margin: 0 }));

  it("suppresses groups under the minimum size", () => {
    const r = aggregateFairness([...rows("woman", 6, 3), ...rows("another", MIN_GROUP - 1, 1)]);
    expect(r.byField.gender.groups.map((g) => g.value)).toEqual(["woman"]);
    expect(r.byField.gender.suppressed).toBe(MIN_GROUP - 1);
  });

  it("flags a group below four-fifths of the highest selection rate", () => {
    const r = aggregateFairness([...rows("man", 10, 6), ...rows("woman", 10, 4)]);
    const woman = r.byField.gender.groups.find((g) => g.value === "woman")!;
    expect(woman.impactRatio).toBeCloseTo(4 / 6);
    expect(woman.flagged).toBe(true);
    expect(r.byField.gender.groups.find((g) => g.value === "man")!.flagged).toBe(false);
  });

  it("does not flag at or above 80%", () => {
    const r = aggregateFairness([...rows("man", 10, 5), ...rows("woman", 10, 4)]);
    expect(r.byField.gender.groups.every((g) => !g.flagged)).toBe(true);
  });

  it("ignores unanswered fields", () => {
    const r = aggregateFairness([{ roleFit: "GOOD", margin: 0 }]);
    expect(r.total).toBe(1);
    expect(r.byField.gender.groups).toHaveLength(0);
  });

  it("computes a correlation", () => {
    expect(pearson([[0, 1], [1, 2], [2, 3]])).toBeCloseTo(1);
    expect(pearson([[0, 3], [1, 2], [2, 1]])).toBeCloseTo(-1);
    expect(pearson([[1, 1], [1, 2]])).toBeNull();
  });
});
