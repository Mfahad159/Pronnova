import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const afterDir = path.resolve("public/audit-screenshots/after");
if (!fs.existsSync(afterDir)) {
  fs.mkdirSync(afterDir, { recursive: true });
}

const viewports = [
  { name: "360", width: 360, height: 800 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 800 },
];

const routes = [
  { path: "/", slug: "landing" },
  { path: "/student", slug: "student" },
  { path: "/student/chapters", slug: "student-chapters" },
  { path: "/teacher", slug: "teacher" },
  { path: "/student/practice/ex-1-1", slug: "practice-ex-1-1" },
];

async function run() {
  const browser = await chromium.launch({ channel: "chrome" });
  const report = [];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    for (const route of routes) {
      const consoleMessages = [];
      const pageErrors = [];

      page.on("console", (msg) => {
        if (msg.type() === "error" || msg.type() === "warning") {
          consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
        }
      });

      page.on("pageerror", (err) => {
        pageErrors.push(err.message);
      });

      const url = `http://localhost:3000${route.path}`;
      console.log(`Navigating to ${url} at ${vp.name}px...`);

      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
        await page.waitForTimeout(400);

        const screenshotName = `${route.slug}-${vp.name}px.png`;
        const screenshotPath = path.join(afterDir, screenshotName);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        report.push({
          route: route.path,
          viewport: `${vp.width}x${vp.height}`,
          file: screenshotName,
          errors: pageErrors,
          consoleWarningsOrErrors: consoleMessages,
          status: "OK",
        });
      } catch (e) {
        console.error(`Error on ${route.path} (${vp.name}px):`, e.message);
        report.push({
          route: route.path,
          viewport: `${vp.width}x${vp.height}`,
          error: e.message,
          status: "FAILED",
        });
      }
    }
    await page.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(afterDir, "audit-report-after.json"),
    JSON.stringify(report, null, 2)
  );
  console.log("After screenshots captured successfully!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
