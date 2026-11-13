import { getTranslations } from "next-intl/server";
import { MessageSquareText, Phone } from "lucide-react";
import { alertSeekersAction } from "@/actions/rentals";
import { StatusBadge } from "@/components/galmee/status-badge";
import { ActionForm } from "@/components/rentals/action-form";
import type { Locale } from "@/i18n/config";
import { formatBirr } from "@/lib/money";
import type { SeekerMatch } from "@/server/dal/rentals";

/** Client requests that fit a vacant door, with one tap to text the ones not yet told. */
export async function SeekerMatches({ unitId, seekers, canManage, locale }: { unitId: string; seekers: SeekerMatch[]; canManage: boolean; locale: Locale }) {
  const t = await getTranslations("seekers");
  const toText = seekers.filter((s) => !s.alerted && s.phone).length;
  return (
    <section className="grid gap-3" aria-labelledby="seekers-title">
      <div>
        <h2 id="seekers-title" className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("hint")}</p>
      </div>
      {seekers.length === 0 ? (
        <p className="text-muted-foreground">{t("none")}</p>
      ) : (
        <ul className="grid gap-2">
          {seekers.map((s) => (
            <li key={s.requestId} className="flex items-center justify-between gap-3 border-b pb-2">
              <div className="min-w-0">
                <p className="truncate font-semibold">{s.name}</p>
                <p className="num text-sm text-muted-foreground">{t("budget", { price: formatBirr(s.maxPrice, locale) })}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {s.alerted ? (
                  <StatusBadge tone="ok" icon={MessageSquareText}>{t("texted")}</StatusBadge>
                ) : !s.phone ? (
                  <StatusBadge tone="neutral" icon={Phone}>{t("noPhone")}</StatusBadge>
                ) : null}
                {s.phone ? (
                  <a href={`tel:${s.phone}`} aria-label={t("call", { name: s.name })} className="inline-flex size-11 items-center justify-center rounded-md text-primary hover:bg-muted">
                    <Phone className="size-5" aria-hidden />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {canManage && toText > 0 ? (
        <ActionForm action={alertSeekersAction} submitLabel={t("send", { count: toText })} doneLabel={t("sent")} variant="secondary">
          <input type="hidden" name="id" value={unitId} />
        </ActionForm>
      ) : null}
    </section>
  );
}
