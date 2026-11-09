import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { addPropertyAction, addUnitAction } from "@/actions/rentals";
import { ActionForm } from "@/components/rentals/action-form";
import { Field } from "@/components/rentals/field";
import { SelectField } from "@/components/rentals/fields";
import type { Locale } from "@/i18n/config";
import { formatBirr } from "@/lib/money";
import { listProperties, listUnits } from "@/server/dal/rentals";
import { getSession } from "@/server/dal/session";
import { UNIT_KINDS } from "@/server/validation";

export default async function SettingsPage() {
  const { profile } = await getSession();
  if (profile.role === "staff") redirect("/");
  const [t, tKinds, locale, properties, units] = await Promise.all([getTranslations("settings"), getTranslations("unitKinds"), getLocale() as Promise<Locale>, listProperties(), listUnits("", "all")]);
  const kindOptions = UNIT_KINDS.map((k) => ({ value: k, label: tKinds(k) }));

  return (
    <div className="grid max-w-2xl gap-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">{t("properties")}</h2>
        {properties.length === 0 ? <p className="text-muted-foreground">{t("noProperties")}</p> : null}
        <ul>
          {properties.map((p) => (
            <li key={p.id} className="border-b py-2">
              <span className="font-medium">{p.name}</span>
              {p.address ? <span className="block text-sm text-muted-foreground">{p.address}</span> : null}
              <ul className="num mt-1 text-sm text-muted-foreground">
                {units
                  .filter((u) => u.propertyId === p.id)
                  .map((u) => (
                    <li key={u.id}>
                      {u.label}, {tKinds(u.kind)}, {formatBirr(u.monthlyRent, locale)}
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
        <ActionForm action={addPropertyAction} submitLabel={t("addProperty")} doneLabel={t("added")} className="grid gap-3 rounded-md border bg-card p-3">
          <Field name="name" label={t("propertyName")} required />
          <Field name="address" label={t("address")} />
        </ActionForm>
      </section>

      {properties.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">{t("units")}</h2>
          <ActionForm action={addUnitAction} submitLabel={t("addUnit")} doneLabel={t("added")} className="grid gap-3 rounded-md border bg-card p-3">
            <SelectField name="property" label={t("property")} options={properties.map((p) => ({ value: p.id, label: p.name }))} />
            <Field name="label" label={t("unitLabel")} required />
            <SelectField name="kind" label={t("kind")} defaultValue="room" options={kindOptions} />
            <Field name="rent" label={t("monthlyRent")} inputMode="decimal" required />
          </ActionForm>
        </section>
      ) : null}
    </div>
  );
}
