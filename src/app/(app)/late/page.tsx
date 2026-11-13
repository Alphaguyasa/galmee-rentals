import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CircleCheck, Phone } from "lucide-react";
import { EmptyState } from "@/components/galmee/empty-state";
import { ListSheet } from "@/components/galmee/list-row";
import { MoneySummaryCard } from "@/components/galmee/money-summary-card";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { addisDay } from "@/lib/addis-time";
import { daysBetween, formatEthiopianDate } from "@/lib/ethiopian-date";
import { formatBirr } from "@/lib/money";
import { cn } from "@/lib/utils";
import { listLate } from "@/server/dal/rentals";

export default async function LatePage() {
  const [t, locale, rows] = await Promise.all([getTranslations("late"), getLocale() as Promise<Locale>, listLate()]);
  const total = rows.reduce((sum, r) => sum + r.overdue, 0);
  const today = addisDay();
  return (
    <div className="grid gap-4">
      <h1 className="text-[1.5625rem] leading-tight font-bold">{t("title")}</h1>
      {rows.length === 0 ? (
        <EmptyState icon={CircleCheck} message={t("empty")} />
      ) : (
        <>
          <MoneySummaryCard tone="owed" label={t("title")} figure={formatBirr(total, locale)} sub={t("count", { count: rows.length })} />
          <ListSheet>
            {rows.map((r) => (
              <li key={r.leaseId} className="grid gap-2 p-3">
                <Link href={`/leases/${r.leaseId}`} className="flex items-start gap-3 rounded-sm focus-visible:bg-band focus-visible:outline-none active:bg-band">
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="font-semibold break-words">{r.tenantName}</span>
                    <span className="text-sm text-muted-foreground">{t("where", { property: r.propertyName, unit: r.unitLabel })}</span>
                    <span className="num text-sm text-muted-foreground">
                      {t("since", { date: formatEthiopianDate(r.oldestOverdueOn, locale, { withEra: false }), days: Math.max(0, -daysBetween(r.oldestOverdueOn, today)), months: r.months })}
                    </span>
                  </span>
                  <span className="num shrink-0 text-right font-bold text-owed">{formatBirr(r.overdue, locale)}</span>
                </Link>
                {r.tenantPhone ? (
                  <a href={`tel:${r.tenantPhone}`} className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full gap-2")}>
                    <Phone aria-hidden className="size-4" />
                    <span className="num">{t("call", { phone: r.tenantPhone })}</span>
                  </a>
                ) : null}
              </li>
            ))}
          </ListSheet>
        </>
      )}
    </div>
  );
}
