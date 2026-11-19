import { chromium } from "playwright";

async function testAvatars() {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#FAF8F5] p-10 flex flex-col gap-10">
      <div class="flex gap-8 items-start">
        <!-- 1. Hero Avatar: 2/3 aspect ratio -->
        <div class="flex flex-col gap-2">
          <h3 class="font-bold">1. Hero (2/3 aspect, no padding)</h3>
          <div class="relative aspect-[2/3] w-80 overflow-hidden rounded-2xl shadow-sm">
            <img src="file:///d:/FYP_1/pronnova/public/avatar/avatar_standing_beside_dice.png" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- 2. Speaking Avatar: square aspect ratio -->
        <div class="flex flex-col gap-2">
          <h3 class="font-bold">2. Technique (square aspect, no padding)</h3>
          <div class="relative aspect-square w-80 overflow-hidden rounded-2xl shadow-sm">
            <img src="file:///d:/FYP_1/pronnova/public/avatar/avatar_speaking.png" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- 3. Classroom Avatar: 4/3 aspect ratio (not cut!) -->
        <div class="flex flex-col gap-2">
          <h3 class="font-bold">3. Mentorship (4/3 aspect, not cut)</h3>
          <div class="relative aspect-[4/3] w-96 overflow-hidden rounded-2xl shadow-sm">
            <img src="file:///d:/FYP_1/pronnova/public/avatar/avatar_sitting_with_studentrs.jpg" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "d:/FYP_1/pronnova/public/audit-screenshots/avatars-fixed-test.png" });
  await browser.close();
  console.log("Avatar test screenshot saved to public/audit-screenshots/avatars-fixed-test.png");
}

testAvatars();
