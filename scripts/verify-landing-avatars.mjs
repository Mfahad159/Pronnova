import { chromium } from "playwright";
import fs from "fs";

async function verifyLanding() {
  const browser = await chromium.launch({ channel: "chrome" });
  
  for (const vp of [
    { name: "1280", w: 1280, h: 900 },
    { name: "768", w: 768, h: 1024 },
    { name: "360", w: 360, h: 800 }
  ]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `public/audit-screenshots/landing-avatars-fixed-${vp.name}px.png`,
      fullPage: true,
    });
    await page.close();
  }

  await browser.close();
  console.log("Verified landing avatar screenshots generated!");
}

verifyLanding();
