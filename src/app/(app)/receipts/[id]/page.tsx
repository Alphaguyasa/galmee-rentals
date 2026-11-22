import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PrintReceiptButton } from "@/components/galmee/print-receipt-button";
import { Receipt } from "@/components/galmee/receipt";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { rentReceiptData } from "@/lib/rent-receipt";
import { cn } from "@/lib/utils";
import { getRentReceipt } from "@/server/dal/rentals";
import { getSession } from "@/server/dal/session";
import { uuidParam } from "@/server/validation";

const RECEIPT_ID = "rent-receipt";

/** The receipt for one rent payment: printable at 58 or 80 mm, and reprintable any time. */
export default async function RentReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ w?: string }>;
}) {
  const parsed = uuidParam.safeParse((await params).id);
  if (!parsed.success) notFound();
  const width = (await searchParams).w === "80" ? 80 : 58;

  const [session, payment, t, locale] = await Promise.all([
    getSession(),
    getRentReceipt(parsed.data),
    getTranslations("receipt"),
    getLocale() as Promise<Locale>,
  ]);
  if (!payment) notFound();
  const data = rentReceiptData(payment, { name: session.tenant.name }, locale, {
    rentFor: (month) => t("rentFor", { month }),
    prepaid: t("prepaid"),
    payment: t("payment"),
    door: (door) => door,
  });
  const base = `/receipts/${parsed.data}`;

  return (
    <div className="grid max-w-md gap-5">
      <h1 className="text-[1.5625rem] leading-tight font-bold">{t("title")}</h1>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("widthLabel")}>
        <span className="text-sm text-muted-foreground">{t("widthLabel")}</span>
        {([58, 80] as const).map((w) => (
          <Link
            key={w}
            href={w === 80 ? `${base}?w=80` : base}
            replace
            aria-current={w === width ? "true" : undefined}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-semibold",
              w === width ? "border-primary bg-primary text-primary-foreground" : "bg-card",
            )}
          >
            {t(w === 80 ? "width80" : "width58")}
          </Link>
        ))}
      </div>

      <Receipt data={data} width={width} id={RECEIPT_ID} />
      {payment.receiptNo ? null : <p className="text-sm text-muted-foreground">{t("noNumber")}</p>}

      <div className="grid grid-cols-2 gap-2">
        <PrintReceiptButton targetId={RECEIPT_ID} label={t("print")} />
        <Link href={`/leases/${payment.leaseId}`} className={cn(buttonVariants({ variant: "outline" }))}>
          {t("back")}
        </Link>
      </div>
    </div>
  );
}
