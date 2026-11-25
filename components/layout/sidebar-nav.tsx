"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookDoodle,
  ChaptersDoodle,
  HomeDoodle,
  MicDoodle,
  ProgressDoodle,
  SparkleDoodle,
  StudentsDoodle,
  UploadDoodle,
} from "@/components/icons/doodle";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavGroup, NavItem } from "@/lib/navigation";

const icons: Record<NavItem["icon"], React.ComponentType<{ className?: string }>> = {
  home: HomeDoodle,
  book: ChaptersDoodle,
  mic: MicDoodle,
  chart: ProgressDoodle,
  upload: UploadDoodle,
  layers: ChaptersDoodle,
  users: StudentsDoodle,
  file: BookDoodle,
  help: SparkleDoodle,
  settings: SparkleDoodle,
};

/** Rendered without an active state while the pathname is unknown (Suspense fallback). */
export function SidebarNavStatic({ groups }: { groups: NavGroup[] }) {
  return <NavGroups groups={groups} activeHref={null} />;
}

export function SidebarNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  // Longest matching href wins, so /student/chapters/x highlights "Chapters".
  // Role home (/student, /teacher) only matches exactly.
  const activeHref =
    groups
      .flatMap((g) => g.items.map((i) => i.href))
      .filter((href) => pathname === href || (href.split("/").length > 2 && pathname.startsWith(href + "/")))
      .sort((a, b) => b.length - a.length)[0] ?? null;
  return <NavGroups groups={groups} activeHref={activeHref} />;
}

function NavGroups({ groups, activeHref }: { groups: NavGroup[]; activeHref: string | null }) {
  return groups.map((group) => (
    <SidebarGroup key={group.label}>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => {
            const Icon = icons[item.icon];
            const active = item.href === activeHref;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title} size="lg" className="h-11 text-[0.95rem] [&_svg]:size-6!">
                  <Link href={item.href} aria-current={active ? "page" : undefined}>
                    <Icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ));
}
