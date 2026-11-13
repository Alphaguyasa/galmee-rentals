"use client";

import { useTranslations } from "next-intl";
import { CalendarDays, DoorOpen, Handshake, Settings, TriangleAlert } from "lucide-react";
import { BottomNav } from "@/components/galmee/bottom-nav";

const ITEMS = [
  { href: "/", key: "home", icon: DoorOpen, manager: false },
  { href: "/late", key: "late", icon: TriangleAlert, manager: false },
  { href: "/rent", key: "rent", icon: CalendarDays, manager: false },
  { href: "/broker", key: "broker", icon: Handshake, manager: false },
  { href: "/settings", key: "settings", icon: Settings, manager: true },
] as const;

/** The rentals destinations in the shared Galmee nav; setup is for managers. */
export function AppNav({ variant, canManage }: { variant: "bottom" | "side"; canManage: boolean }) {
  const t = useTranslations("nav");
  return (
    <BottomNav
      variant={variant}
      menuLabel={t("menu")}
      items={ITEMS.filter((item) => canManage || !item.manager).map(({ href, key, icon }) => ({
        href,
        label: t(key),
        icon,
      }))}
    />
  );
}
