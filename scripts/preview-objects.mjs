import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const html = `
    <!DOCTYPE html>
    <html>
    <head><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="p-6 bg-slate-50">
      <h2 class="text-xl font-bold mb-4">Objects Folder Preview</h2>
      <div class="grid grid-cols-2 gap-4">
        <div><h4 class="font-bold">img1.jpg (2752x1536)</h4><img src="file:///d:/FYP_1/pronnova/public/objects/img1.jpg" class="w-full rounded border" /></div>
        <div><h4 class="font-bold">img2.jpg (2400x1792)</h4><img src="file:///d:/FYP_1/pronnova/public/objects/img2.jpg" class="w-full rounded border" /></div>
        <div><h4 class="font-bold">img3.jpg (2400x1792)</h4><img src="file:///d:/FYP_1/pronnova/public/objects/img3.jpg" class="w-full rounded border" /></div>
        <div><h4 class="font-bold">img4.jpg (2400x1792)</h4><img src="file:///d:/FYP_1/pronnova/public/objects/img4.jpg" class="w-full rounded border" /></div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(html);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "public/audit-screenshots/objects-preview.png", fullPage: true });
  await browser.close();
  console.log("Objects preview created");
}

run();
