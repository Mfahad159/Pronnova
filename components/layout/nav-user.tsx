"use client";

import Link from "next/link";
import { ChartColumn, ChevronsUpDown, FileText, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

function Avatar({ name, role, className }: { name: string; role: Role; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full font-heading font-bold",
        role === "student" ? "bg-tint-peach text-primary" : "bg-tint-sky text-foreground",
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * Sidebar footer in the Animate UI sidebar style ("nav user"): who is using Pronnova, with a menu
 * for a shortcut and "Switch role" (back to role selection). `name` is null only while loading or
 * when the database can't be reached.
 */
export function NavUser({ role, name, subtitle }: { role: Role; name: string | null; subtitle: string }) {
  const { isMobile } = useSidebar();
  const shown = name ?? (role === "student" ? "Student" : "Teacher");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label={`${shown}, ${subtitle}. Open profile menu`}
              className="h-14 rounded-xl border-2 border-foreground/12 bg-card hover:border-primary/40 hover:bg-card data-[state=open]:border-primary/40"
            >
              <Avatar name={shown} role={role} />
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate font-heading text-sm font-bold">{shown}</span>
                <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={8}
            className="w-64 rounded-xl border-2 border-foreground/12"
          >
            <DropdownMenuLabel className="flex items-center gap-2.5 py-2 font-normal">
              <Avatar name={shown} role={role} className="size-8 text-sm" />
              <span className="grid min-w-0 leading-tight">
                <span className="truncate font-heading text-sm font-bold">{shown}</span>
                <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {role === "student" ? (
                <DropdownMenuItem asChild className="gap-2.5">
                  <Link href="/student/progress">
                    <ChartColumn /> My progress
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild className="gap-2.5">
                  <Link href="/teacher/materials">
                    <FileText /> Materials
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2.5">
              <Link href="/onboarding" transitionTypes={["nav-back"]}>
                <LogOut /> Switch role
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
