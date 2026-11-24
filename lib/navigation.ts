import type { Role } from "@/types";

export interface NavItem {
  title: string;
  href: string;
  icon: "home" | "book" | "mic" | "chart" | "upload" | "layers" | "users" | "file" | "help" | "settings";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Sidebar menu per role (docs/design.md). Add a page → add it here and in docs/codebase-index.md.
export const navByRole: Record<Role, NavGroup[]> = {
  student: [
    {
      label: "Learn",
      items: [
        { title: "Home", href: "/student", icon: "home" },
        { title: "Chapters", href: "/student/chapters", icon: "book" },
        { title: "Progress", href: "/student/progress", icon: "chart" },
      ],
    },
  ],
  teacher: [
    {
      label: "Teach",
      items: [
        { title: "Dashboard", href: "/teacher", icon: "home" },
        { title: "Upload material", href: "/teacher/materials/new", icon: "upload" },
        { title: "Chapters", href: "/teacher/chapters", icon: "layers" },
        { title: "Students", href: "/teacher/students", icon: "users" },
      ],
    },
  ],
};
