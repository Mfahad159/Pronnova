import { Suspense } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SidebarNav, SidebarNavStatic } from "@/components/layout/sidebar-nav";
import { navByRole } from "@/lib/navigation";
import type { Role } from "@/types";

/** Sidebar + main area for /student/* and /teacher/* (layout idea: docs/design.md). */
// Takes only the role (static), so the shell prerenders. Names load inside each page's Suspense.
export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const groups = navByRole[role];
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-3 pt-4">
          <BrandLogo href={`/${role}`} />
          <p className="px-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {role === "student" ? "Student" : "Teacher"} · demo
          </p>
        </SidebarHeader>
        <SidebarContent>
          <Suspense fallback={<SidebarNavStatic groups={groups} />}>
            <SidebarNav groups={groups} />
          </Suspense>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Switch role">
                <Link href="/onboarding">
                  <LogOut />
                  <span>Switch role</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0">{children}</SidebarInset>
    </SidebarProvider>
  );
}
