import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Phone } from "lucide-react";
import { endLeaseAction, payAction } from "@/actions/rentals";
import { ActionForm } from "@/components/rentals/action-form";
import { ClientRef } from "@/components/rentals/client-ref";
import { Field } from "@/components/rentals/field";
import { DateField, SelectField } from "@/components/rentals/fields";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { addisDay } from "@/lib/addis-time";
import { ETHIOPIAN_MONTHS, formatEthiopianDate } from "@/lib/ethiopian-date";
import { formatBirr } from "@/lib/money";
import { cn } from "@/lib/utils";
import { getLease, type InvoiceRow } from "@/server/dal/rentals";
import { getSession } from "@/server/dal/session";
import { PAY_METHODS, uuidParam } from "@/server/validation";

function invoiceState(i: InvoiceRow, today: string) {
  if (i.balance <= 0) return "paid" as const;
  if (i.dueOn < today) return "late" as const;
  return i.paid > 0 ? ("part" as const) : ("due" as const);
}

export default async function LeasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuidParam.safeParse(id).success) notFound();
  const [lease, t, tMethods, locale, { profile }] = await Promise.all([getLease(id), getTranslations("lease"), getTranslations("methods"), getLocale() as Promise<Locale>, getSession()]);
  if (!lease) notFound();
  const today = addisDay();
  const canManage = profile.role !== "staff";
  const active = lease.status === "active";
  const months = ETHIOPIAN_MONTHS[locale];
  const suggested = lease.overdue > 0 ? lease.overdue : lease.openBalance > 0 ? lease.openBalance : lease.monthlyRent;

  return (
    <div className="grid max-w-2xl gap-6">
      <header className="grid gap-1">
        <h1 className="text-2xl font-bold">{lease.tenantName}</h1>
        <p className="text-muted-foreground">
          {t("where", { property: lease.propertyName, unit: lease.unitLabel })}
          {active ? null : `, ${t("ended", { date: formatEthiopianDate(lease.endOn!, locale, { withEra: false }) })}`}
        </p>
        {lease.tenantPhone ? (
          <a href={`tel:${lease.tenantPhone}`} className={cn(buttonVariants({ variant: "outline" }), "mt-2 h-11 w-fit gap-2")}>
            <Phone aria-hidden className="size-4" />
            <span className="num">{lease.tenantPhone}</span>
          </a>
        ) : null}
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <dt className="text-sm text-muted-foreground">{t("late")}</dt>
          <dd className={cn("num text-xl font-bold", lease.overdue > 0 && "text-destructive")}>{formatBirr(lease.overdue, locale)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">{t("owes")}</dt>
          <dd className="num text-xl font-bold">{formatBirr(lease.openBalance, locale)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">{t("rent")}</dt>
          <dd className="num">{formatBirr(lease.monthlyRent, locale)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">{t("nextDue")}</dt>
          <dd className="num">{lease.nextDueOn ? formatEthiopianDate(lease.nextDueOn, locale, { withEra: false }) : t("nothingDue")}</dd>
        </div>
        {lease.advance > 0 ? (
          <div>
            <dt className="text-sm text-muted-foreground">{t("prepaid")}</dt>
            <dd className="num font-semibold text-warning">{formatBirr(lease.advance, locale)}</dd>
          </div>
        ) : null}
        {lease.deposit > 0 ? (
          <div>
            <dt className="text-sm text-muted-foreground">{t("deposit")}</dt>
            <dd className="num">{formatBirr(lease.deposit, locale)}</dd>
          </div>
        ) : null}
      </dl>

      {active || lease.openBalance > 0 ? (
        <section className="grid gap-3 rounded-md border bg-card p-3">
          <h2 className="text-lg font-semibold">{t("takeRent")}</h2>
          <ActionForm action={payAction} submitLabel={t("record")} doneLabel={t("recorded")}>
            <input type="hidden" name="lease" value={lease.id} />
            <ClientRef />
            <Field name="amount" label={t("amount")} inputMode="decimal" required defaultValue={String(suggested)} />
            <SelectField name="method" label={t("method")} defaultValue="cash" options={PAY_METHODS.map((m) => ({ value: m, label: tMethods(m) }))} />
            <Field name="reference" label={t("reference")} />
          </ActionForm>
          {active ? <p className="text-sm text-muted-foreground">{t("advanceNote")}</p> : null}
        </section>
      ) : null}

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">{t("schedule")}</h2>
        {lease.invoices.length === 0 ? <p className="text-muted-foreground">{t("noInvoices")}</p> : null}
        <ul>
          {lease.invoices.map((i) => {
            const state = invoiceState(i, today);
            return (
              <li key={i.id} className="flex items-baseline justify-between gap-3 border-b py-2">
                <span className="min-w-0">
                  <span className="font-medium">
                    {months[i.ethMonth - 1]} {i.ethYear}
                  </span>
                  <span className="num block text-sm text-muted-foreground">{t("dueOn", { date: formatEthiopianDate(i.dueOn, locale, { withEra: false }) })}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="num font-semibold">{formatBirr(i.amount, locale)}</span>
                  <span className={cn("block text-sm", state === "late" ? "font-semibold text-destructive" : "text-muted-foreground")}>
                    {t(`states.${state}`, { amount: formatBirr(i.balance, locale) })}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {lease.payments.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-lg font-semibold">{t("payments")}</h2>
          <ul>
            {lease.payments.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-3 border-b py-2 text-sm">
                <span className="num">{formatEthiopianDate(p.createdAt, locale, { withEra: false })}</span>
                <span className="min-w-0 truncate text-muted-foreground">
                  {tMethods(p.method)}
                  {p.reference ? `, ${p.reference}` : ""}
                </span>
                <span className="num shrink-0 font-semibold">{formatBirr(p.amount, locale)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {active && canManage ? (
        <section className="grid gap-3 rounded-md border p-3">
          <h2 className="font-semibold">{t("endTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("endNote")}</p>
          <ActionForm action={endLeaseAction} submitLabel={t("end")} variant="outline">
            <input type="hidden" name="lease" value={lease.id} />
            <DateField name="end" label={t("endDate")} defaultValue={today} min={lease.startOn} />
          </ActionForm>
        </section>
      ) : null}

      <Link href="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        {t("back")}
      </Link>
    </div>
  );
}
