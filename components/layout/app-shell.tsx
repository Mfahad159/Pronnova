import { Suspense } from "react";
import Link from "next/link";
import { SignOut } from "@phosphor-icons/react/ssr";
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
import { Eyebrow } from "@/components/brand/ui";
import { SidebarNav, SidebarNavStatic } from "@/components/layout/sidebar-nav";
import { navByRole } from "@/lib/navigation";
import { PageTransition } from "@/components/animate-ui/components/page-transition";
import type { Role } from "@/types";

/** Sidebar + main area for /student/* and /teacher/* (layout idea: docs/design.md). */
// Takes only the role (static), so the shell prerenders. Names load inside each page's Suspense.
export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const groups = navByRole[role];
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-foreground/10 [&_[data-slot=sidebar-inner]]:bg-card">
        <SidebarHeader className="gap-3 px-3 pt-5">
          <BrandLogo href={`/${role}`} />
          <Eyebrow tone={role === "student" ? "coral" : "sky"} className="ml-1 group-data-[collapsible=icon]:hidden">
            {role === "student" ? "Student" : "Teacher"} · Demo
          </Eyebrow>
        </SidebarHeader>
        <SidebarContent>
          <Suspense fallback={<SidebarNavStatic groups={groups} />}>
            <SidebarNav groups={groups} />
          </Suspense>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Switch role"
                className="h-11 rounded-xl border-2 border-foreground/15 bg-card font-heading font-semibold hover:border-primary/40 hover:bg-secondary/50 group-data-[collapsible=icon]:border-0 [&_svg]:size-5"
              >
                <Link href="/onboarding">
                  <SignOut />
                  <span>Switch role</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0">
        {/* Animate UI page transition (view transitions): only the page content moves; sidebar stays. */}
        {/* It reads the pathname, so (Cache Components) it sits in Suspense; the fallback is the same page, unanimated. */}
        <Suspense fallback={<div className="flex min-h-full flex-col bg-background">{children}</div>}>
          <PageTransition effect="slide" className="flex min-h-full flex-col bg-background">
            {children}
          </PageTransition>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
