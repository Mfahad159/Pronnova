import { chromium } from "playwright";

async function testSection() {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      </style>
    </head>
    <body class="bg-[#FAF8F5] p-10 flex flex-col gap-10 text-slate-800">
      <div class="max-w-6xl mx-auto w-full">
        <!-- Section Header -->
        <div class="flex flex-col items-center gap-2 text-center mb-8">
          <h2 class="text-3xl font-bold tracking-tight text-slate-900">
            Why choose <span class="text-[#FF594B]">Pronnova</span>?
          </h2>
          <p class="text-sm text-slate-500 max-w-lg">
            Empowering learners through structured acoustic practice and guided mentorship.
          </p>
        </div>

        <!-- 3-Card Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Card 1 (img1 - 16:9) -->
          <div class="flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-all">
            <div class="flex flex-col gap-2 mb-4">
              <h3 class="text-base font-bold text-slate-900">Optimal Speech Learning</h3>
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                Foundational sound training designed to build rock-solid articulation and acoustic accuracy.
              </p>
            </div>
            <div class="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
              <img src="file:///d:/FYP_1/pronnova/public/objects/img1.jpg" class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- Card 2 (img2 - 4:3) -->
          <div class="flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-all">
            <div class="flex flex-col gap-2 mb-4">
              <h3 class="text-base font-bold text-slate-900">Interactive Sound Discovery</h3>
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                Engaging phonetic exercises and read-aloud lessons that make everyday practice joyful.
              </p>
            </div>
            <div class="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
              <img src="file:///d:/FYP_1/pronnova/public/objects/img2.jpg" class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- Card 3 (img3 - 4:3) -->
          <div class="flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-all">
            <div class="flex flex-col gap-2 mb-4">
              <h3 class="text-base font-bold text-slate-900">Guided Teacher Mentorship</h3>
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                Dedicated classroom oversight with real-time sound analytics and individual feedback.
              </p>
            </div>
            <div class="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
              <img src="file:///d:/FYP_1/pronnova/public/objects/img3.jpg" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "d:/FYP_1/pronnova/public/audit-screenshots/test-objects-section.png" });
  await browser.close();
  console.log("Screenshot test-objects-section.png saved");
}

testSection();
