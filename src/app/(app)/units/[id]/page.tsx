import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { startLeaseAction } from "@/actions/rentals";
import { ActionForm } from "@/components/rentals/action-form";
import { ClientRef } from "@/components/rentals/client-ref";
import { SeekerMatches } from "@/components/rentals/seeker-matches";
import { BirrField } from "@/components/rentals/birr-field";
import { Field } from "@/components/rentals/field";
import { DateField } from "@/components/rentals/fields";
import { addisDay } from "@/lib/addis-time";
import { parseGregorian, toEthiopian } from "@/lib/ethiopian-date";
import { formatBirr } from "@/lib/money";
import type { Locale } from "@/i18n/config";
import { getUnit, listSeekersForUnit } from "@/server/dal/rentals";
import { getSession } from "@/server/dal/session";
import { uuidParam } from "@/server/validation";

export default async function UnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuidParam.safeParse(id).success) notFound();
  const [unit, t, tKinds, locale, { profile }, seekers] = await Promise.all([getUnit(id), getTranslations("moveIn"), getTranslations("unitKinds"), getLocale() as Promise<Locale>, getSession(), listSeekersForUnit(id)]);
  if (!unit) notFound();
  if (unit.leaseId) redirect(`/leases/${unit.leaseId}`);

  const today = addisDay();
  const canManage = profile.role !== "staff";
  return (
    <div className="grid max-w-md gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("title", { label: unit.label })}</h1>
        <p className="text-muted-foreground">
          {unit.propertyName}, {tKinds(unit.kind)}, <span className="num">{formatBirr(unit.monthlyRent, locale)}</span>
        </p>
      </div>
      {canManage ? (
        <ActionForm action={startLeaseAction} submitLabel={t("submit")} className="grid gap-3">
          <input type="hidden" name="unit" value={unit.id} />
          <ClientRef />
          <Field name="name" label={t("name")} required />
          <Field name="phone" label={t("phone")} type="tel" inputMode="tel" />
          <DateField name="start" label={t("start")} defaultValue={today} />
          <BirrField name="rent" label={t("rent")} required defaultValue={unit.monthlyRent > 0 ? String(unit.monthlyRent) : ""} />
          <Field name="dueDay" label={t("dueDay")} type="number" inputMode="numeric" required min={1} max={30} defaultValue={String(toEthiopian(parseGregorian(today)).day)} />
          <BirrField name="deposit" label={t("deposit")} />
        </ActionForm>
      ) : (
        <p className="text-muted-foreground">{t("managerOnly")}</p>
      )}
      <SeekerMatches unitId={unit.id} seekers={seekers} canManage={canManage} locale={locale} />
    </div>
  );
}
