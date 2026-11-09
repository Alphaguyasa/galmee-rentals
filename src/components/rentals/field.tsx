import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Labelled text input. Server-renderable, so forms stay light on the phone. */
export function Field({
  name,
  label,
  type,
  inputMode,
  required,
  defaultValue,
  min,
  max,
}: {
  name: string;
  label: string;
  type?: string;
  inputMode?: "decimal" | "numeric" | "tel";
  required?: boolean;
  defaultValue?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} inputMode={inputMode} required={required} defaultValue={defaultValue} min={min} max={max} autoComplete="off" />
    </div>
  );
}
