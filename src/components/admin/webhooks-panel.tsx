"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, Plug, Send, Trash2 } from "lucide-react";
import { createWebhook, deleteWebhook, sendTestWebhook, setWebhookActive } from "@/app/actions/admin";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Checkbox, Switch } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const EVENTS = ["candidate.started", "candidate.completed", "report.ready"] as const;

interface Hook { id: string; url: string; events: string[]; active: boolean; createdAt: string }
interface Delivery { id: string; webhookId: string; event: string; status: string; responseCode: number | null; error: string | null; createdAt: string }

export function WebhooksPanel({ hooks, deliveries }: { hooks: Hook[]; deliveries: Delivery[] }) {
  const t = useTranslations("integrations");
  const locale = useLocale();
  const router = useRouter();
  const [url, setUrl] = React.useState("");
  const [events, setEvents] = React.useState<string[]>(["report.ready"]);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [secret, setSecret] = React.useState<string | null>(null);
  const time = (iso: string) => new Date(iso).toLocaleString(locale === "ar" ? "ar" : "en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const res = await createWebhook({ url, events: events as (typeof EVENTS)[number][] });
            setPending(false);
            if (!res.ok) {
              setError(t(`errors.${res.error}` as "errors.invalid"));
              return;
            }
            setError(null);
            setUrl("");
            setSecret(res.secret);
            router.refresh();
          }}
        >
          <CardHeader>
            <CardTitle>{t("addTitle")}</CardTitle>
            <CardDescription>{t("addDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {error ? <Alert tone="critical">{error}</Alert> : null}
            {secret ? (
              <Alert tone="success" title={t("secretTitle")}>
                <p className="mb-2">{t("secretBody")}</p>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-control bg-surface px-2 py-1.5 font-mono text-xs text-text ring-1 ring-border" dir="ltr">{secret}</code>
                  <Button type="button" size="sm" variant="secondary" onClick={() => void navigator.clipboard.writeText(secret).then(() => toast.success(t("copied")))}>
                    <Copy aria-hidden /> {t("copy")}
                  </Button>
                </div>
              </Alert>
            ) : null}
            <Field label={t("url")} hint={t("urlHint")}>
              {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} type="url" required dir="ltr" placeholder="https://ats.example.com/hooks/aalim" value={url} onChange={(e) => setUrl(e.target.value)} />}
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-text">{t("events")}</legend>
              <div className="flex flex-col gap-2.5">
                {EVENTS.map((ev) => (
                  <label key={ev} className="flex items-start gap-2.5 text-sm">
                    <Checkbox checked={events.includes(ev)} onCheckedChange={(c) => setEvents((x) => (c ? [...x, ev] : x.filter((y) => y !== ev)))} className="mt-0.5" />
                    <span>
                      <code className="font-mono text-xs text-text" dir="ltr">{ev}</code>
                      <span className="block text-secondary">{t(`eventHelp.${ev.replace(".", "_")}` as "eventHelp.report_ready")}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" loading={pending} disabled={!url || events.length === 0}>{t("add")}</Button>
          </CardFooter>
        </form>
      </Card>

      <section aria-labelledby="hooks-title" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="hooks-title" className="text-base font-semibold">{t("endpoints")}</h2>
          {hooks.some((h) => h.active) ? (
            <Button size="sm" variant="secondary" onClick={async () => { await sendTestWebhook(); toast.success(t("testSent")); router.refresh(); }}>
              <Send aria-hidden /> {t("sendTest")}
            </Button>
          ) : null}
        </div>
        {hooks.length === 0 ? (
          <EmptyState icon={Plug} title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-card bg-surface shadow-card">
            {hooks.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-text" dir="ltr">{h.url}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">{h.events.map((e) => <Badge key={e}><span dir="ltr">{e}</span></Badge>)}</div>
                </div>
                <label className="flex items-center gap-2 text-sm text-secondary">
                  <Switch checked={h.active} onCheckedChange={async (c) => { await setWebhookActive(h.id, c); router.refresh(); }} aria-label={t("activeFor", { url: h.url })} />
                  {h.active ? t("active") : t("paused")}
                </label>
                <Button variant="ghost" size="icon-sm" aria-label={t("deleteFor", { url: h.url })} onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteWebhook(h.id); router.refresh(); } }}>
                  <Trash2 aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="deliveries-title" className="flex flex-col gap-3">
        <h2 id="deliveries-title" className="text-base font-semibold">{t("deliveries")}</h2>
        {deliveries.length === 0 ? (
          <p className="text-sm text-secondary">{t("noDeliveries")}</p>
        ) : (
          <div className="overflow-x-auto rounded-card bg-surface shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-surface-subtle text-xs text-secondary">
                <tr>
                  <th className="px-4 py-2.5 text-start font-medium">{t("event")}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t("result")}</th>
                  <th className="px-4 py-2.5 text-end font-medium">{t("when")}</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-t border-border">
                    <td className="px-4 py-2.5"><code className="font-mono text-xs" dir="ltr">{d.event}</code></td>
                    <td className="px-4 py-2.5">
                      <Badge tone={d.status === "delivered" ? "success" : "critical"}>{d.status === "delivered" ? t("delivered") : t("failed")}</Badge>
                      {d.responseCode ? <span className="ms-2 text-xs text-tertiary tabular" dir="ltr">HTTP {d.responseCode}</span> : null}
                      {d.error ? <span className="ms-2 text-xs text-tertiary" dir="ltr">{d.error}</span> : null}
                    </td>
                    <td className="px-4 py-2.5 text-end text-xs text-tertiary"><time dateTime={d.createdAt}>{time(d.createdAt)}</time></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("verifyTitle")}</CardTitle>
          <CardDescription>{t("verifyBody")}</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-control bg-surface-subtle p-4 font-mono text-xs leading-relaxed text-text" dir="ltr">{`const expected = "sha256=" + crypto
  .createHmac("sha256", process.env.AALIM_WEBHOOK_SECRET)
  .update(rawBody)
  .digest("hex");
const ok = crypto.timingSafeEqual(
  Buffer.from(expected),
  Buffer.from(req.headers["x-aalim-signature"]),
);`}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
