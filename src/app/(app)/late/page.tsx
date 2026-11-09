import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Phone } from "lucide-react";
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
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        {rows.length > 0 ? <p className="num font-semibold text-destructive">{t("total", { amount: formatBirr(total, locale) })}</p> : null}
      </div>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul>
          {rows.map((r) => (
            <li key={r.leaseId} className="grid gap-2 border-b py-3">
              <Link href={`/leases/${r.leaseId}`} className="grid gap-1 hover:bg-accent/40">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate font-semibold">{r.tenantName}</span>
                  <span className="num shrink-0 font-semibold text-destructive">{formatBirr(r.overdue, locale)}</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("where", { property: r.propertyName, unit: r.unitLabel })}
                </span>
                <span className="num text-sm">
                  {t("since", { date: formatEthiopianDate(r.oldestOverdueOn, locale, { withEra: false }), days: Math.max(0, -daysBetween(r.oldestOverdueOn, today)), months: r.months })}
                </span>
              </Link>
              {r.tenantPhone ? (
                <a href={`tel:${r.tenantPhone}`} className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full gap-2")}>
                  <Phone aria-hidden className="size-4" />
                  <span className="num">{t("call", { phone: r.tenantPhone })}</span>
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
