import { getLocale, getTranslations } from "next-intl/server";
import { Phone } from "lucide-react";
import { addClientRequestAction, addListingAction, closeListingAction, closeRequestAction } from "@/actions/rentals";
import { ActionForm } from "@/components/rentals/action-form";
import { Field } from "@/components/rentals/field";
import { SelectField } from "@/components/rentals/fields";
import type { Locale } from "@/i18n/config";
import { formatBirr } from "@/lib/money";
import { listBroker } from "@/server/dal/rentals";
import { DEALS, LISTING_KINDS } from "@/server/validation";

export default async function BrokerPage() {
  const [t, tKinds, locale, { listings, requests }] = await Promise.all([getTranslations("broker"), getTranslations("listingKinds"), getLocale() as Promise<Locale>, listBroker()]);
  const dealOptions = DEALS.map((d) => ({ value: d, label: t(`deals.${d}`) }));
  const kindOptions = LISTING_KINDS.map((k) => ({ value: k, label: tKinds(k) }));

  return (
    <div className="grid max-w-2xl gap-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">{t("requests")}</h2>
        {requests.length === 0 ? <p className="text-muted-foreground">{t("noRequests")}</p> : null}
        <ul className="grid gap-4">
          {requests.map((r) => (
            <li key={r.id} className="grid gap-2 border-b pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{r.clientName}</p>
                  <p className="num text-sm text-muted-foreground">
                    {[t(`deals.${r.deal}`), r.kind ? tKinds(r.kind) : null, r.area, r.minBedrooms ? t("minBedrooms", { count: r.minBedrooms }) : null, t("wants", { price: formatBirr(r.maxPrice, locale) })].filter(Boolean).join(", ")}
                  </p>
                </div>
                <ActionForm action={closeRequestAction} submitLabel={t("close")} size="sm" variant="outline" className="contents">
                  <input type="hidden" name="id" value={r.id} />
                </ActionForm>
              </div>
              {r.clientPhone ? (
                <a href={`tel:${r.clientPhone}`} className="num inline-flex w-fit items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
                  <Phone aria-hidden className="size-4" />
                  {r.clientPhone}
                </a>
              ) : null}
              <p className="text-sm font-medium">{r.matches.length > 0 ? t("matches", { count: r.matches.length }) : t("noMatch")}</p>
              {r.matches.length > 0 ? (
                <ul className="grid gap-1 text-sm">
                  {r.matches.map((m) => (
                    <li key={m.id} className="flex items-baseline justify-between gap-3 rounded-md bg-card px-3 py-2">
                      <span className="min-w-0 truncate">{m.title}</span>
                      <span className="num shrink-0 font-semibold">{formatBirr(m.price, locale)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
        <details className="rounded-md border bg-card p-3">
          <summary className="cursor-pointer font-medium">{t("addRequest")}</summary>
          <ActionForm action={addClientRequestAction} submitLabel={t("addRequest")} doneLabel={t("added")} className="mt-3 grid gap-3">
            <Field name="name" label={t("clientName")} required />
            <Field name="phone" label={t("phone")} type="tel" inputMode="tel" />
            <SelectField name="deal" label={t("deal")} defaultValue="rent" options={dealOptions} />
            <SelectField name="kind" label={t("kind")} defaultValue="" options={[{ value: "", label: t("kindAny") }, ...kindOptions]} />
            <Field name="area" label={t("area")} />
            <Field name="minBedrooms" label={t("minBedroomsField")} type="number" inputMode="numeric" min={0} max={50} />
            <Field name="maxPrice" label={t("maxPrice")} inputMode="decimal" required />
          </ActionForm>
        </details>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">{t("listings")}</h2>
        {listings.length === 0 ? <p className="text-muted-foreground">{t("noListings")}</p> : null}
        <ul>
          {listings.map((l) => (
            <li key={l.id} className="flex items-start justify-between gap-3 border-b py-2">
              <div className="min-w-0">
                <p className="font-medium">{l.title}</p>
                <p className="num text-sm text-muted-foreground">
                  {[t(`deals.${l.deal}`), tKinds(l.kind), l.area, l.bedrooms ? t("bedrooms", { count: l.bedrooms }) : null, formatBirr(l.price, locale)].filter(Boolean).join(", ")}
                </p>
                {l.ownerName || l.ownerPhone ? (
                  <p className="num text-sm text-muted-foreground">{t("owner", { name: [l.ownerName, l.ownerPhone].filter(Boolean).join(", ") })}</p>
                ) : null}
              </div>
              <ActionForm action={closeListingAction} submitLabel={t("close")} size="sm" variant="outline" className="contents">
                <input type="hidden" name="id" value={l.id} />
              </ActionForm>
            </li>
          ))}
        </ul>
        <details className="rounded-md border bg-card p-3">
          <summary className="cursor-pointer font-medium">{t("addListing")}</summary>
          <ActionForm action={addListingAction} submitLabel={t("addListing")} doneLabel={t("added")} className="mt-3 grid gap-3">
            <Field name="title" label={t("title_")} required />
            <SelectField name="deal" label={t("deal")} defaultValue="rent" options={dealOptions} />
            <SelectField name="kind" label={t("kind")} defaultValue="house" options={kindOptions} />
            <Field name="area" label={t("area")} />
            <Field name="bedrooms" label={t("bedroomsField")} type="number" inputMode="numeric" min={0} max={50} />
            <Field name="price" label={t("price")} inputMode="decimal" required />
            <Field name="ownerName" label={t("ownerName")} />
            <Field name="ownerPhone" label={t("ownerPhone")} type="tel" inputMode="tel" />
          </ActionForm>
        </details>
      </section>
    </div>
  );
}
