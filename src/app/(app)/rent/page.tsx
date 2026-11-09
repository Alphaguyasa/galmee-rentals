import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { generateInvoicesAction } from "@/actions/rentals";
import { ActionForm } from "@/components/rentals/action-form";
import type { Locale } from "@/i18n/config";
import { addisDay } from "@/lib/addis-time";
import { ETHIOPIAN_MONTHS, formatEthiopianDate, parseGregorian, toEthiopian } from "@/lib/ethiopian-date";
import { formatBirr } from "@/lib/money";
import { cn } from "@/lib/utils";
import { listMonth } from "@/server/dal/rentals";

function parseMonth(y: string | undefined, m: string | undefined, fallback: { year: number; month: number }) {
  const year = Number(y);
  const month = Number(m);
  if (Number.isInteger(year) && Number.isInteger(month) && year >= 1990 && year <= 2200 && month >= 1 && month <= 12) return { year, month };
  return fallback;
}

export default async function RentSchedulePage({ searchParams }: { searchParams: Promise<{ y?: string; m?: string }> }) {
  const { y, m } = await searchParams;
  const today = addisDay();
  const now = toEthiopian(parseGregorian(today));
  const current = { year: now.year, month: Math.min(now.month, 12) };
  const { year, month } = parseMonth(y, m, current);
  const [t, locale, rows] = await Promise.all([getTranslations("rent"), getLocale() as Promise<Locale>, listMonth(year, month)]);

  const billed = rows.reduce((sum, r) => sum + r.amount, 0);
  const collected = rows.reduce((sum, r) => sum + r.paid, 0);
  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const atCurrent = year === current.year && month === current.month;
  const monthName = (mm: number) => ETHIOPIAN_MONTHS[locale][mm - 1];

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">
        {monthName(month)} {year}
      </h1>

      <nav aria-label={t("monthNav")} className="flex items-center justify-between gap-2 text-sm">
        <Link href={`/rent?y=${prev.year}&m=${prev.month}`} className="flex h-11 items-center rounded-md bg-secondary px-3">
          {monthName(prev.month)}
        </Link>
        {!atCurrent ? (
          <Link href="/rent" className="flex h-11 items-center rounded-md bg-secondary px-3">
            {t("thisMonth")}
          </Link>
        ) : null}
        {!atCurrent ? (
          <Link href={`/rent?y=${next.year}&m=${next.month}`} className="flex h-11 items-center rounded-md bg-secondary px-3">
            {monthName(next.month)}
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {rows.length > 0 ? (
        <p className="num">{t("summary", { collected: formatBirr(collected, locale), billed: formatBirr(billed, locale) })}</p>
      ) : (
        <p className="text-muted-foreground">{t("empty")}</p>
      )}

      {rows.length > 0 ? (
        <ul>
          {rows.map((r) => {
            const late = r.balance > 0 && r.dueOn < today;
            return (
              <li key={r.id}>
                <Link href={`/leases/${r.leaseId}`} className="flex items-baseline justify-between gap-3 border-b py-3 hover:bg-accent/40">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{r.tenantName}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {r.propertyName}, {r.unitLabel}
                    </span>
                    <span className="num block text-sm text-muted-foreground">{t("dueOn", { date: formatEthiopianDate(r.dueOn, locale, { withEra: false }) })}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="num block font-semibold">{formatBirr(r.amount, locale)}</span>
                    <span className={cn("block text-sm", late ? "font-semibold text-destructive" : "text-muted-foreground")}>
                      {r.balance <= 0 ? t("paid") : late ? t("late", { amount: formatBirr(r.balance, locale) }) : t("owes", { amount: formatBirr(r.balance, locale) })}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}

      {atCurrent ? <ActionForm action={generateInvoicesAction} submitLabel={t("bill")} doneLabel={t("billed")} variant="outline" /> : null}
    </div>
  );
}
