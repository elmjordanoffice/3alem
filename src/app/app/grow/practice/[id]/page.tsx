import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import type { PracticeItem, StoredFeedback } from "@/lib/grow/practice";
import { PracticeRunner } from "@/components/grow/practice-runner";
import { responseContentSchema, responseText } from "@/lib/assessment/response-schema";

export const metadata: Metadata = { title: "Practice" };
export const dynamic = "force-dynamic";

export default async function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireViewer();
  const { id } = await params;
  const s = await withTenant({ userId: viewer.user.id }, (tx) => tx.practiceSession.findFirst({ where: { id, userId: viewer.user.id } }));
  if (!s) notFound();
  return (
    <PracticeRunner
      id={s.id}
      item={s.item as unknown as PracticeItem}
      feedback={(s.feedback as unknown as StoredFeedback) ?? null}
      response={s.response}
      answerText={(() => {
        const parsed = responseContentSchema.safeParse(s.response);
        return parsed.success ? responseText(parsed.data, (s.item as unknown as PracticeItem).content) : null;
      })()}
      reflection={s.reflectionNote ?? ""}
    />
  );
}
