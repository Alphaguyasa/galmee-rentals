import { cn } from "@/lib/utils";

/** A gate door with a brass handle, the shape used for every unit in the app. */
export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <span aria-hidden className={cn("inline-flex size-8 items-end justify-center", className)}>
      <span className={cn("relative block h-full w-5/6 rounded-t-[0.7rem]", inverse ? "bg-white" : "bg-primary")}>
        <span className="absolute top-1/2 right-[18%] size-1.5 rounded-full bg-[var(--key)]" />
      </span>
    </span>
  );
}
