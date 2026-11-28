import { expect, test } from "./fixtures";
import { navByRole } from "../../lib/navigation";

// Phase 5 check 2: routing — every sidebar link, active item, refresh/deep link, back/forward,
// bad ids → 404 screen (+ noindex, see Next's streaming contract), no in-page link that 404s.

const BAD = [
  "/student/chapters/not-a-uuid",
  "/student/chapters/00000000-0000-4000-8000-00000000dead",
  "/student/practice/not-a-uuid",
  "/student/practice/00000000-0000-4000-8000-00000000dead",
  "/teacher/materials/not-a-uuid",
  "/teacher/materials/00000000-0000-4000-8000-00000000dead",
  "/no-such-page",
];

for (const role of ["student", "teacher"] as const) {
  test(`${role}: every sidebar link opens its page, is marked active, and survives a refresh`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "sidebar is a slide-out menu on phones; routes are covered by routes.spec");
    for (const item of navByRole[role].flatMap((g) => g.items)) {
      await page.goto(`/${role}`);
      await page.getByRole("navigation").or(page.locator("[data-sidebar=sidebar]")).getByRole("link", { name: item.title, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${item.href.replace(/\//g, "\\/")}$`));
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      const title = await h1.innerText();
      await expect(page.locator(`[data-sidebar="menu-button"][href="${item.href}"]`)).toHaveAttribute("aria-current", "page");
      await page.reload(); // deep link / refresh
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    }
  });
}

test("back and forward keep the right page", async ({ page }) => {
  await page.goto("/student");
  await page.goto("/student/chapters");
  await page.goto("/student/chapters/10000000-0000-4000-8000-000000000001");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1, name: /^chapters$/i })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1, name: /^hi, ayesha/i })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole("heading", { level: 1, name: /^chapters$/i })).toBeVisible();
});

for (const path of BAD) {
  test(`bad link ${path} → "couldn't find that page" and not indexed`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: /couldn.t find that page/i })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  });
}

test("no in-page link on the main screens leads to an error", async ({ page }) => {
  test.setTimeout(180_000); // fetches every internal link; the dev server is slower while the full suite runs
  const pages = ["/", "/onboarding", "/student", "/student/chapters", "/teacher", "/teacher/materials", "/teacher/classes"];
  const hrefs = new Set<string>();
  for (const p of pages) {
    await page.goto(p);
    for (const h of await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!))) {
      hrefs.add(h.split("#")[0] || "/");
    }
  }
  const bad: string[] = [];
  for (const h of hrefs) {
    const res = await page.request.get(h);
    if (res.status() >= 400) bad.push(`${h} → ${res.status()}`);
    // Every page ships Next's not-found boundary text, so detect a soft 404 by its noindex tag instead.
    else if (/<meta name="robots" content="noindex"/i.test(await res.text())) bad.push(`${h} → not-found screen`);
  }
  expect(bad).toEqual([]);
  expect(hrefs.size).toBeGreaterThan(5); // 11 on desktop, 7 on phones (sidebar links live in the closed menu)
});
