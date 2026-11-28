"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChartBar,
  FileText,
  Gear,
  House,
  Microphone,
  Question,
  Stack,
  UploadSimple,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Highlight,
  HighlightItem,
} from "@animate-ui/react/primitives/effects/highlight";
import type { NavGroup, NavItem } from "@/lib/navigation";

const icons: Record<
  NavItem["icon"],
  React.ComponentType<{ className?: string }>
> = {
  home: House,
  book: BookOpen,
  mic: Microphone,
  chart: ChartBar,
  upload: UploadSimple,
  layers: Stack,
  users: UsersThree,
  file: FileText,
  help: Question,
  settings: Gear,
};

/** Rendered without an active state while the pathname is unknown (Suspense fallback). */
export function SidebarNavStatic({ groups }: { groups: NavGroup[] }) {
  return <NavGroups groups={groups} activeHref={null} />;
}

export function SidebarNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  // Phones and tablets: the menu is a drawer; close it once the chosen page opens. Only on a real
  // page change: this nav mounts fresh inside the drawer each time it opens, so a plain
  // on-mount close would shut the drawer straight away.
  const { setOpenMobile } = useSidebar();
  const shownFor = useRef(pathname);
  useEffect(() => {
    if (shownFor.current === pathname) return;
    shownFor.current = pathname;
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);
  // Longest matching href wins, so /student/chapters/x highlights "Chapters".
  // Role home (/student, /teacher) only matches exactly.
  const activeHref =
    groups
      .flatMap((g) => g.items.map((i) => i.href))
      .filter(
        (href) =>
          pathname === href ||
          (href.split("/").length > 2 && pathname.startsWith(href + "/")),
      )
      .sort((a, b) => b.length - a.length)[0] ?? null;
  return <NavGroups groups={groups} activeHref={activeHref} />;
}

function NavGroups({
  groups,
  activeHref,
}: {
  groups: NavGroup[];
  activeHref: string | null;
}) {
  // Animate UI Highlight: the peach pill rests on the current page and glides to the hovered item.
  return (
    <Highlight
      controlledItems
      hover
      click={false}
      value={activeHref}
      exitDelay={150}
      className="inset-0 rounded-xl bg-secondary"
    >
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = icons[item.icon];
                const active = item.href === activeHref;
                return (
                  <SidebarMenuItem key={item.href}>
                    <HighlightItem value={item.href} className="rounded-xl">
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        size="lg"
                        // Landing navbar link style: rounded-xl, secondary hover, coral active (ADR-007).
                        // Pill comes from Highlight; the current page keeps coral text (aria-current).
                        className="h-11 rounded-xl bg-transparent font-medium text-foreground/80 hover:bg-transparent hover:text-foreground active:bg-transparent data-[active=true]:bg-transparent aria-[current=page]:font-semibold aria-[current=page]:text-primary [&_svg]:size-5"
                      >
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </HighlightItem>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </Highlight>
  );
}
