"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { syncPreferencesFromProfile } from "@/app/actions/preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

function Heading({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <h1 className="text-[2rem] font-semibold leading-tight text-text">{title}</h1>
      {subtitle ? <p className="text-[15px] leading-relaxed text-secondary">{subtitle}</p> : null}
    </div>
  );
}

/** Only allow same-site relative redirects. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/app";
}

export function SignInForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setPending(false);
      setError(error.status === 429 ? t("errors.rateLimited") : t("errors.invalidCredentials"));
      return;
    }
    await syncPreferencesFromProfile();
    router.replace(safeNext(params.get("next")));
    router.refresh();
  }

  return (
    <>
      <Heading title={t("signIn.title")} subtitle={t("signIn.subtitle")} />
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {params.get("reset") && !error ? <Alert tone="success">{t("reset.done")}</Alert> : null}
        {error ? <Alert tone="critical">{error}</Alert> : null}
        <Field label={t("fields.email")}>
          {({ id, describedBy }) => (
            <Input id={id} name="email" type="email" autoComplete="email" required aria-describedby={describedBy} />
          )}
        </Field>
        <Field label={t("fields.password")}>
          {({ id, describedBy }) => (
            <Input id={id} name="password" type="password" autoComplete="current-password" required aria-describedby={describedBy} />
          )}
        </Field>
        <div className="-mt-2 flex justify-end">
          <Link href="/forgot-password" className="text-sm text-accent-text hover:underline">
            {t("signIn.forgot")}
          </Link>
        </div>
        <Button type="submit" size="lg" loading={pending}>
          {t("signIn.submit")}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-secondary">
        {t("signIn.noAccount")}{" "}
        <Link href="/sign-up" className="font-medium text-accent-text hover:underline">
          {t("signIn.createAccount")}
        </Link>
      </p>
    </>
  );
}

export function SignUpForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const next: Record<string, string> = {};
    if (!name) next.name = t("errors.nameRequired");
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = t("errors.emailInvalid");
    if (password.length < 10) next.password = t("errors.passwordShort");
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    setFormError(null);
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      setPending(false);
      setFormError(error.status === 422 || error.code === "USER_ALREADY_EXISTS" ? t("errors.emailTaken") : t("errors.generic"));
      return;
    }
    // An invitation link (e.g. to a team) brings people back to it after sign-up.
    router.replace(params.get("next") ? safeNext(params.get("next")) : "/onboarding");
    router.refresh();
  }

  return (
    <>
      <Heading title={t("signUp.title")} subtitle={t("signUp.subtitle")} />
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {formError ? <Alert tone="critical">{formError}</Alert> : null}
        <Field label={t("fields.name")} error={errors.name}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} name="name" autoComplete="name" aria-describedby={describedBy} aria-invalid={invalid || undefined} />
          )}
        </Field>
        <Field label={t("fields.workEmail")} error={errors.email}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} name="email" type="email" autoComplete="email" aria-describedby={describedBy} aria-invalid={invalid || undefined} />
          )}
        </Field>
        <Field label={t("fields.password")} hint={t("fields.passwordHint")} error={errors.password}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} name="password" type="password" autoComplete="new-password" aria-describedby={describedBy} aria-invalid={invalid || undefined} />
          )}
        </Field>
        <p className="text-sm leading-relaxed text-secondary">
          {t.rich("signUp.consent", {
            terms: (chunks) => (
              <Link href="/terms" className="font-medium text-accent-text underline underline-offset-4 hover:no-underline">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="font-medium text-accent-text underline underline-offset-4 hover:no-underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <Button type="submit" size="lg" loading={pending}>
          {t("signUp.submit")}
        </Button>
        <p className="text-xs leading-relaxed text-tertiary">{t("signUp.dataNote")}</p>
      </form>
      <p className="mt-8 text-center text-sm text-secondary">
        {t("signUp.haveAccount")}{" "}
        <Link href={params.get("next") ? `/sign-in?next=${encodeURIComponent(params.get("next")!)}` : "/sign-in"} className="font-medium text-accent-text hover:underline">
          {t("signUp.signIn")}
        </Link>
      </p>
    </>
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [sent, setSent] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    // Always show the same confirmation, whether or not the account exists.
    await authClient.requestPasswordReset({ email: String(form.get("email")), redirectTo: "/reset-password" });
    setPending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <>
        <Heading title={t("forgot.sentTitle")} subtitle={t("forgot.sentBody")} />
        <Button asChild variant="secondary" className="w-full">
          <Link href="/sign-in">{t("forgot.back")}</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Heading title={t("forgot.title")} subtitle={t("forgot.subtitle")} />
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Field label={t("fields.email")}>
          {({ id }) => <Input id={id} name="email" type="email" autoComplete="email" required />}
        </Field>
        <Button type="submit" size="lg" loading={pending}>
          {t("forgot.submit")}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm">
        <Link href="/sign-in" className="text-accent-text hover:underline">
          {t("forgot.back")}
        </Link>
      </p>
    </>
  );
}

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [error, setError] = React.useState<string | null>(params.get("error") ? t("errors.linkExpired") : null);
  const [pending, setPending] = React.useState(false);

  if (!token) {
    return (
      <>
        <Heading title={t("reset.title")} />
        <Alert tone="warning" title={t("errors.linkExpired")} />
        <Button asChild variant="secondary" className="mt-6 w-full">
          <Link href="/forgot-password">{t("reset.requestNew")}</Link>
        </Button>
      </>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password.length < 10) {
      setError(t("errors.passwordShort"));
      return;
    }
    setPending(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token: token! });
    setPending(false);
    if (error) {
      setError(t("errors.linkExpired"));
      return;
    }
    router.replace("/sign-in?reset=1");
  }

  return (
    <>
      <Heading title={t("reset.title")} subtitle={t("reset.subtitle")} />
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {error ? <Alert tone="critical">{error}</Alert> : null}
        <Field label={t("fields.newPassword")} hint={t("fields.passwordHint")}>
          {({ id, describedBy }) => (
            <Input id={id} name="password" type="password" autoComplete="new-password" aria-describedby={describedBy} />
          )}
        </Field>
        <Button type="submit" size="lg" loading={pending}>
          {t("reset.submit")}
        </Button>
      </form>
    </>
  );
}
