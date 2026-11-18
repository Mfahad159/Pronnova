import type { Metadata } from "next";
import { TeacherShell } from "@/components/layout";

export const metadata: Metadata = {
  title: "Teacher Portal",
};

export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return <TeacherShell>{children}</TeacherShell>;
}
