import { z } from "zod";

/**
 * Scenario materials shown in the document viewer. The Item Generator returns
 * these (validated with Zod), so the shapes are the contract between the AI
 * and the UI. Emails look like emails; tables look like spreadsheets.
 */

const personRef = z.object({ name: z.string(), role: z.string().optional() });

export const emailMaterial = z.object({
  kind: z.literal("email"),
  id: z.string(),
  title: z.string(),
  from: personRef,
  to: z.array(personRef).min(1),
  cc: z.array(personRef).optional(),
  subject: z.string(),
  sentAt: z.string(),
  body: z.string(),
  footnote: z.string().optional(),
});

export const memoMaterial = z.object({
  kind: z.literal("memo"),
  id: z.string(),
  title: z.string(),
  author: personRef,
  date: z.string().optional(),
  body: z.string(),
});

export const tableMaterial = z.object({
  kind: z.literal("table"),
  id: z.string(),
  title: z.string(),
  caption: z.string().optional(),
  columns: z.array(z.object({ key: z.string(), label: z.string(), numeric: z.boolean().optional() })).min(1),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))),
});

export const chartMaterial = z.object({
  kind: z.literal("chart"),
  id: z.string(),
  title: z.string(),
  caption: z.string().optional(),
  chartType: z.enum(["bar", "line"]),
  xKey: z.string(),
  unit: z.string().optional(),
  series: z.array(z.object({ key: z.string(), label: z.string() })).min(1).max(4),
  data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
});

export const material = z.discriminatedUnion("kind", [emailMaterial, memoMaterial, tableMaterial, chartMaterial]);

export type EmailMaterial = z.infer<typeof emailMaterial>;
export type MemoMaterial = z.infer<typeof memoMaterial>;
export type TableMaterial = z.infer<typeof tableMaterial>;
export type ChartMaterial = z.infer<typeof chartMaterial>;
export type Material = z.infer<typeof material>;
