import { AppShell } from "@/components/layout/app-shell";

export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return <AppShell role="teacher">{children}</AppShell>;
}
