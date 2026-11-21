import { describe, expect, it } from "vitest";
import { decisionSummary } from "@/lib/assessment/response-schema";
import type { ItemContent } from "@/lib/assessment/item-schema";

const item = { title: "عيب الفوترة", task: { options: [{ id: "a", label: "تأجيل الإطلاق يومين" }] } } as unknown as ItemContent;

describe("decision summaries follow the session's language", () => {
  it("Arabic", () => {
    expect(decisionSummary({ kind: "choice", optionId: "a", justification: "" }, item, "ar")).toBe("عيب الفوترة: اخترت «تأجيل الإطلاق يومين»");
  });
  it("English by default", () => {
    expect(decisionSummary({ kind: "choice", optionId: "a", justification: "" }, item)).toBe('عيب الفوترة: chose "تأجيل الإطلاق يومين"');
  });
});
