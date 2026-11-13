import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CalendarDays, CircleCheck, Clock, Phone, TriangleAlert, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/galmee/empty-state";
import { ListRow, ListSheet } from "@/components/galmee/list-row";
import { MoneySummaryCard } from "@/components/galmee/money-summary-card";
import { StatusBadge } from "@/components/galmee/status-badge";
import { endLeaseAction, payAction } from "@/actions/rentals";
import { ActionForm } from "@/components/rentals/action-form";
import { ClientRef } from "@/components/rentals/client-ref";
import { BirrField } from "@/components/rentals/birr-field";
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

const STATE_TONE = { paid: "ok", late: "urgent", part: "warn", due: "neutral" } as const;
const STATE_ICON: Record<keyof typeof STATE_TONE, LucideIcon> = { paid: CircleCheck, late: TriangleAlert, part: Clock, due: Clock };

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
        <h1 className="text-[1.5625rem] leading-tight font-bold">{lease.tenantName}</h1>
        <p className="text-muted-foreground">
          {t("where", { property: lease.propertyName, unit: lease.unitLabel })}
          {active ? null : `, ${t("ended", { date: formatEthiopianDate(lease.endOn!, locale, { withEra: false }) })}`}
        </p>
        {lease.tenantPhone ? (
          <a href={`tel:${lease.tenantPhone}`} className={cn(buttonVariants({ variant: "outline" }), "mt-2 h-12 w-fit gap-2")}>
            <Phone aria-hidden className="size-4" />
            <span className="num">{lease.tenantPhone}</span>
          </a>
        ) : null}
      </header>

      {lease.overdue > 0 ? (
        <MoneySummaryCard tone="owed" label={t("late")} figure={formatBirr(lease.overdue, locale)} sub={`${t("owes")}: ${formatBirr(lease.openBalance, locale)}`} />
      ) : (
        <MoneySummaryCard label={t("owes")} figure={formatBirr(lease.openBalance, locale)} />
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
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
            <dd className="num font-semibold text-warn">{formatBirr(lease.advance, locale)}</dd>
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
          <h2 className="text-xl font-bold">{t("takeRent")}</h2>
          <ActionForm action={payAction} submitLabel={t("record")} doneLabel={t("recorded")}>
            <input type="hidden" name="lease" value={lease.id} />
            <ClientRef />
            <BirrField name="amount" label={t("amount")} required defaultValue={String(suggested)} />
            <SelectField name="method" label={t("method")} defaultValue="cash" options={PAY_METHODS.map((m) => ({ value: m, label: tMethods(m) }))} />
            <Field name="reference" label={t("reference")} />
          </ActionForm>
          {active ? <p className="text-sm text-muted-foreground">{t("advanceNote")}</p> : null}
        </section>
      ) : null}

      <section className="grid gap-2">
        <h2 className="text-xl font-bold">{t("schedule")}</h2>
        {lease.invoices.length === 0 ? (
          <EmptyState icon={CalendarDays} message={t("noInvoices")} />
        ) : (
          <ListSheet>
            {lease.invoices.map((i) => {
              const state = invoiceState(i, today);
              return (
                <ListRow
                  key={i.id}
                  title={`${months[i.ethMonth - 1]} ${i.ethYear}`}
                  sub={<span className="num">{t("dueOn", { date: formatEthiopianDate(i.dueOn, locale, { withEra: false }) })}</span>}
                  right={
                    <>
                      <span className="num font-semibold">{formatBirr(i.amount, locale)}</span>
                      <StatusBadge tone={STATE_TONE[state]} icon={STATE_ICON[state]}>
                        <span className="num">{t(`states.${state}`, { amount: formatBirr(i.balance, locale) })}</span>
                      </StatusBadge>
                    </>
                  }
                />
              );
            })}
          </ListSheet>
        )}
      </section>

      {lease.payments.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-xl font-bold">{t("payments")}</h2>
          <ListSheet>
            {lease.payments.map((p) => (
              <ListRow
                key={p.id}
                title={<span className="num">{formatEthiopianDate(p.createdAt, locale, { withEra: false })}</span>}
                sub={`${tMethods(p.method)}${p.reference ? `, ${p.reference}` : ""}`}
                right={<span className="num font-semibold text-money-in">{formatBirr(p.amount, locale)}</span>}
              />
            ))}
          </ListSheet>
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
