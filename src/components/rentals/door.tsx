import Link from "next/link";
import { cn } from "@/lib/utils";

export type DoorState = "occupied" | "late" | "vacant";

/** One unit drawn as a door. The state is carried by shape and mark as well as colour. */
export function Door({ href, label, state, description }: { href: string; label: string; state: DoorState; description: string }) {
  return (
    <Link
      href={href}
      aria-label={description}
      title={description}
      className={cn(
        "relative flex h-16 w-12 items-center justify-center rounded-t-[1.5rem] rounded-b-sm border-2 text-sm font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        state === "occupied" && "border-primary bg-primary text-primary-foreground",
        state === "late" && "border-destructive bg-destructive text-primary-foreground",
        state === "vacant" && "border-dashed border-input bg-transparent text-muted-foreground",
      )}
    >
      <span className="num max-w-10 truncate">{label}</span>
      {state === "late" ? (
        <span aria-hidden className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-white text-xs font-bold text-destructive ring-2 ring-destructive">
          !
        </span>
      ) : null}
      {state !== "vacant" ? <span aria-hidden className="absolute top-[58%] right-1 size-1.5 rounded-full bg-[var(--key)]" /> : null}
    </Link>
  );
}
