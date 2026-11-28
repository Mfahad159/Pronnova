import { test as base } from "@playwright/test";

// Every spec imports `test`/`expect` from here. `page.goto` waits until the page has fully arrived:
// the first-load page loader leaves only after the load event, by which time React's streaming has
// moved each streamed section out of its temporary hidden holder. Without this, strict locators
// sometimes saw two copies of a field for a few milliseconds (Phase 5 finding; users never see it).
export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const res = await goto(url, options);
      if (options?.waitUntil === "commit") return res; // tests that look at the page while it loads
      await page.waitForSelector(".pn-loader", { state: "detached", timeout: 15_000 }).catch(() => {});
      return res;
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture `use`, not a React hook
    await use(page);
  },
});

export { expect } from "@playwright/test";
export type { Browser, Page } from "@playwright/test";
