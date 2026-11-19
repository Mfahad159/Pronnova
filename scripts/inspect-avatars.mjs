import { chromium } from "playwright";
import fs from "fs";

async function inspect() {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage();
  
  await page.goto("file:///d:/FYP_1/pronnova/public/avatar/avatar_staanding.jpg");
  await page.screenshot({ path: "d:/FYP_1/pronnova/public/audit-screenshots/staanding-preview.png" });

  await page.goto("file:///d:/FYP_1/pronnova/public/avatar/avatar_standing_beside_dice.png");
  await page.screenshot({ path: "d:/FYP_1/pronnova/public/audit-screenshots/standing-dice-preview.png" });

  await browser.close();
  console.log("Done");
}

inspect();
