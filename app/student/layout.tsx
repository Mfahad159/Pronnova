import type { Metadata } from "next";
import { StudentShell } from "@/components/layout";

export const metadata: Metadata = {
  title: "Student Portal",
};

export default function StudentLayout({ children }: LayoutProps<"/student">) {
  return <StudentShell>{children}</StudentShell>;
}
