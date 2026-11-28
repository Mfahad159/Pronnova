import { redirect } from "next/navigation";

// "Who are you?" was removed on 2026-11-28: FYP-1 now has one student (Ahmad), so there is nothing
// to pick. Old links and bookmarks land on the dashboard instead of a dead page.
export default function WhoPage() {
  redirect("/student");
}
