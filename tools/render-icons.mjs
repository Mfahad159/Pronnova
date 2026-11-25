// Rasterise SVG icons to PNG with Playwright's Chromium (transparent background).
import { createRequire } from "node:module";
const { chromium } = createRequire("D:/FYP_1F/package.json")("@playwright/test");
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const dir = process.argv[2];
const jobs = JSON.parse(readFileSync(resolve(dir, "jobs.json"), "utf8"));
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const j of jobs) {
  const svg = readFileSync(resolve(dir, j.svg), "utf8");
  await page.setViewportSize({ width: j.size, height: j.size });
  await page.setContent(`<html><body style="margin:0;background:transparent"><div style="width:${j.size}px;height:${j.size}px">${svg.replace("<svg ", `<svg width="${j.size}" height="${j.size}" `)}</div></body></html>`);
  await page.screenshot({ path: resolve(dir, j.png), omitBackground: true, clip: { x: 0, y: 0, width: j.size, height: j.size } });
}
await browser.close();
console.log("rendered", jobs.length);
