import { Suspense } from "react";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { CurrentUserMenu, UserMenuFallback } from "@/components/layout/current-user-menu";
import { SidebarNav, SidebarNavStatic } from "@/components/layout/sidebar-nav";
import { navByRole } from "@/lib/navigation";
import { PageTransition, RoleTransition } from "@/components/animate-ui/components/page-transition";
import type { Role } from "@/types";

/** Sidebar + main area for /student/* and /teacher/* (layout idea: docs/design.md). */
// Takes only the role (static), so the shell prerenders. Names load inside each page's Suspense.
export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const groups = navByRole[role];
  return (
    // Role switches (onboarding <-> student <-> teacher) zoom the whole area in from the middle;
    // page changes inside the area only swap the content (the top bar stays).
    <RoleTransition area={role}>
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-r border-foreground/10 [&_[data-slot=sidebar-inner]]:bg-card">
        {/* Animate UI sidebar layout: role switcher on top, nav in the middle, user card at the bottom. */}
        <SidebarHeader className="px-3 pt-4">
          <RoleSwitcher role={role} />
        </SidebarHeader>
        <SidebarContent>
          <Suspense fallback={<SidebarNavStatic groups={groups} />}>
            <SidebarNav groups={groups} />
          </Suspense>
        </SidebarContent>
        <SidebarFooter className="p-3">
          {/* Who's using Pronnova + menu (Switch student, Switch role); request-time, so in Suspense. */}
          <Suspense fallback={<UserMenuFallback role={role} />}>
            <CurrentUserMenu role={role} />
          </Suspense>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0">
        {/* Animate UI page transition (view transitions): only the page content moves; sidebar stays. */}
        {/* It reads the pathname, so (Cache Components) it sits in Suspense. The fallback is a skeleton,
            NOT {children}: rendering the page in both places put two live copies of every form and
            recorder in the DOM while the stream swapped them (found 2026-11-28). */}
        <Suspense fallback={<PageSkeleton />}>
          <PageTransition effect="content" className="flex min-h-full flex-col bg-background">
            {children}
          </PageTransition>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
    </RoleTransition>
  );
}
