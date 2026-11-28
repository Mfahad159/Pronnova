"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronsUpDown, GraduationCap, House, Presentation } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import type { Role } from "@/types";

const roles = [
  { role: "student", label: "Student", href: "/student", Icon: GraduationCap },
  { role: "teacher", label: "Teacher", href: "/teacher", Icon: Presentation },
] as const;

/**
 * Sidebar header in the Animate UI sidebar style (its "team switcher"): Pronnova mark, name and the
 * current role; the menu switches between the student and teacher areas (role-switch zoom).
 */
export function RoleSwitcher({ role }: { role: Role }) {
  const { isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label={`Pronnova, ${role} demo. Switch role`}
              className="h-14 rounded-xl hover:bg-secondary/60 data-[state=open]:bg-secondary"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-card">
                <Image src="/icons/pronnova-mark.svg" alt="" width={28} height={28} priority />
              </span>
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate font-heading text-base font-bold">Pronnova</span>
                <span className="truncate text-xs font-semibold text-muted-foreground">
                  {role === "student" ? "Student" : "Teacher"} · Demo
                </span>
              </span>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={8}
            className="w-60 rounded-xl border-2 border-foreground/12"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Switch role</DropdownMenuLabel>
            {roles.map((r) => (
              <DropdownMenuItem key={r.role} asChild className="gap-2.5 py-2 font-semibold">
                <Link href={r.href} aria-current={r.role === role ? "true" : undefined}>
                  <span className="flex size-7 items-center justify-center rounded-lg border border-foreground/10 bg-card">
                    <r.Icon className="size-4" />
                  </span>
                  {r.label}
                  {r.role === role ? <Check className="ml-auto size-4 text-primary" /> : null}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2.5 py-2">
              <Link href="/" transitionTypes={["nav-back"]}>
                <span className="flex size-7 items-center justify-center rounded-lg border border-foreground/10 bg-card">
                  <House className="size-4" />
                </span>
                Pronnova home
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
