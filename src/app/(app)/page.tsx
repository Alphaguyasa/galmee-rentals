import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { DoorOpen, Plus, Search, SearchX, TriangleAlert } from "lucide-react";
import { loadDemoDataAction } from "@/actions/rentals";
import { EmptyState } from "@/components/galmee/empty-state";
import { ListRow, ListSheet } from "@/components/galmee/list-row";
import { MoneySummaryCard } from "@/components/galmee/money-summary-card";
import { StatusBadge } from "@/components/galmee/status-badge";
import { ActionForm } from "@/components/rentals/action-form";
import { Door, type DoorState } from "@/components/rentals/door";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/i18n/config";
import { formatBirr } from "@/lib/money";
import { cn } from "@/lib/utils";
import { listProperties, listUnits, type UnitFilter, type UnitRow } from "@/server/dal/rentals";
import { getSession } from "@/server/dal/session";
import { searchParam } from "@/server/validation";

const FILTERS: UnitFilter[] = ["all", "vacant", "late"];
const DEMO_TENANT = "Galmee Rentals Demo";

function doorState(u: UnitRow): DoorState {
  if (!u.leaseId) return "vacant";
  return u.overdue > 0 ? "late" : "occupied";
}

export default async function DoorsPage({ searchParams }: { searchParams: Promise<{ q?: string; show?: string }> }) {
  const { q, show } = await searchParams;
  const parsed = searchParam.safeParse(q ?? "");
  const query = parsed.success ? parsed.data : "";
  const filter: UnitFilter = FILTERS.includes(show as UnitFilter) ? (show as UnitFilter) : "all";
  const [t, tLate, locale, units, allUnits, properties, { profile, tenant }] = await Promise.all([
    getTranslations("doors"),
    getTranslations("late"),
    getLocale() as Promise<Locale>,
    listUnits(query, filter),
    listUnits("", "all"),
    listProperties(),
    getSession(),
  ]);

  const let_ = allUnits.filter((u) => u.leaseId).length;
  const late = allUnits.filter((u) => u.overdue > 0);
  const lateTotal = late.reduce((sum, u) => sum + u.overdue, 0);
  const canManage = profile.role !== "staff";

  const link = (next: UnitFilter) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (next !== "all") params.set("show", next);
    const text = params.toString();
    return text ? `/?${text}` : "/";
  };

  const groups = new Map<string, { name: string; units: UnitRow[] }>();
  if (filter === "all" && !query) for (const p of properties) groups.set(p.id, { name: p.name, units: [] });
  for (const u of units) {
    if (!groups.has(u.propertyId)) groups.set(u.propertyId, { name: u.propertyName, units: [] });
    groups.get(u.propertyId)!.units.push(u);
  }

  return (
    <div className="grid gap-4">
      {allUnits.length > 0 ? (
        late.length > 0 ? (
          <MoneySummaryCard
            tone="owed"
            href="/late"
            label={tLate("title")}
            figure={formatBirr(lateTotal, locale)}
            sub={t("lateBandSub", { count: late.length, doors: t("letCount", { let: let_, total: allUnits.length }) })}
          />
        ) : (
          <MoneySummaryCard size="md" label={t("noneLate")} figure={t("letCount", { let: let_, total: allUnits.length })} />
        )
      ) : null}

      <form action="/" className="flex gap-2">
        <Label htmlFor="q" className="sr-only">
          {t("search")}
        </Label>
        {filter !== "all" ? <input type="hidden" name="show" value={filter} /> : null}
        <input
          id="q"
          name="q"
          defaultValue={query}
          placeholder={t("search")}
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-base outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <button type="submit" aria-label={t("searchAction")} className={cn(buttonVariants(), "h-12 w-12 shrink-0 px-0")}>
          <Search aria-hidden className="size-5" />
        </button>
      </form>

      <nav aria-label={t("filter")} className="flex gap-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={link(f)}
            aria-current={f === filter ? "page" : undefined}
            className={cn("flex h-11 items-center rounded-md px-3 text-sm", f === filter ? "bg-primary font-semibold text-primary-foreground" : "bg-secondary")}
          >
            {t(`filters.${f}`)}
          </Link>
        ))}
      </nav>

      {groups.size === 0 ? (
        <EmptyState
          icon={query ? SearchX : DoorOpen}
          message={query ? t("noMatch") : t(`empty.${filter}`)}
          action={
            !query && filter === "all" && canManage ? (
              <div className="grid w-full max-w-xs gap-2">
                <Link href="/settings" className={cn(buttonVariants({ size: "lg" }), "h-12")}>
                  <Plus aria-hidden />
                  {t("addFirst")}
                </Link>
                {tenant.name === DEMO_TENANT ? <ActionForm action={loadDemoDataAction} submitLabel={t("loadDemo")} variant="outline" /> : null}
              </div>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6">
          {[...groups.entries()].map(([id, group]) => (
            <section key={id} className="grid gap-3">
              <h2 className="text-xl font-bold">{group.name}</h2>
              {group.units.length === 0 ? (
                <EmptyState message={t("noUnits")} />
              ) : (
                <>
                  <ul className="flex flex-wrap gap-2">
                    {group.units.map((u) => {
                      const state = doorState(u);
                      return (
                        <li key={u.id}>
                          <Door
                            href={u.leaseId ? `/leases/${u.leaseId}` : `/units/${u.id}`}
                            label={u.label}
                            state={state}
                            description={t(`door.${state}`, { label: u.label, name: u.tenantName ?? "" })}
                          />
                        </li>
                      );
                    })}
                  </ul>
                  {group.units.some((u) => u.overdue > 0) ? (
                    <ListSheet>
                      {group.units
                        .filter((u) => u.overdue > 0)
                        .map((u) => (
                          <ListRow
                            key={u.id}
                            href={`/leases/${u.leaseId}`}
                            title={t("lateLine", { name: u.tenantName ?? "", label: u.label })}
                            right={
                              <StatusBadge tone="urgent" icon={TriangleAlert}>
                                <span className="num">{t("lateAmount", { amount: formatBirr(u.overdue, locale) })}</span>
                              </StatusBadge>
                            }
                          />
                        ))}
                    </ListSheet>
                  ) : null}
                </>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
