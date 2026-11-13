import { getTranslations } from "next-intl/server";
import { BirrInput } from "@/components/galmee/birr-input";
import { Label } from "@/components/ui/label";

/** Labelled birr amount: numeric keyboard, tabular figures, "birr" as a trailing unit. */
export async function BirrField({
  name,
  label,
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const t = await getTranslations("common");
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <BirrInput id={name} name={name} unitLabel={t("birr")} required={required} defaultValue={defaultValue} />
    </div>
  );
}
