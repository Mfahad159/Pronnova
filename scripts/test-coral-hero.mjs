import { chromium } from "playwright";

async function testCoralHero() {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });

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
    <body class="bg-[#FAF8F5] text-slate-800">
      <!-- 1. Hero Card -->
      <div class="max-w-6xl mx-auto px-6 py-10">
        <div class="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
          <div class="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center gap-6">
            <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Transform your voice and speak with confidence
            </h1>
            <p class="text-base sm:text-lg text-slate-500 max-w-md leading-relaxed">
              Master clear spoken English with structured exercises and instant acoustic assessment.
            </p>
            <div class="flex items-center gap-4 pt-2">
              <button class="bg-[#FF594B] text-white px-7 py-3 rounded-full font-semibold text-sm shadow-sm hover:opacity-95">
                Start practice →
              </button>
              <button class="text-slate-500 font-semibold text-sm hover:text-slate-800">
                Explore curriculum
              </button>
            </div>
          </div>
          <div class="lg:col-span-5 relative min-h-[380px] bg-[#FCEAE6]">
            <img src="file:///d:/FYP_1/pronnova/public/avatar/avatar_standing_beside_dice.png" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- 2. Coral Breakthrough Section with Card Inside (like the user image!) -->
      <section class="bg-[#FF594B] text-white py-16 sm:py-20 w-full">
        <div class="max-w-6xl mx-auto px-6 flex flex-col items-center gap-4 text-center">
          <span class="text-xs font-semibold text-white/80 uppercase tracking-wider">Breakthrough</span>
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight">
            Proven voice improvement methods
          </h2>
          <p class="max-w-md text-sm sm:text-base text-white/90">
            Acoustic speech training built to develop lasting clarity and natural pronunciation.
          </p>

          <!-- The White Card Inside Coral Background -->
          <div class="w-full text-left rounded-3xl bg-white text-slate-900 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 mt-8">
            <div class="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center gap-6">
              <span class="text-xs font-bold text-[#FF594B] uppercase tracking-wider">Technique</span>
              <div class="flex flex-col gap-2">
                <h3 class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  Master your vocal range
                </h3>
                <p class="text-sm text-slate-500 max-w-md">
                  Targeted acoustic practice builds vocal control and pronunciation clarity.
                </p>
              </div>

              <ul class="flex flex-col gap-2.5 text-sm font-medium text-slate-700">
                <li class="flex items-center gap-2.5">
                  <span class="text-[#FF594B]">✓</span> Vowel & consonant accuracy
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="text-[#FF594B]">✓</span> Real-time pitch tracking
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="text-[#FF594B]">✓</span> Word-level phoneme feedback
                </li>
              </ul>

              <div>
                <button class="border border-[#FF594B] text-[#FF594B] px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[#FF594B] hover:text-white transition-colors">
                  Start training
                </button>
              </div>
            </div>

            <div class="lg:col-span-5 relative min-h-[360px] bg-[#FCEAE6]">
              <img src="file:///d:/FYP_1/pronnova/public/avatar/avatar_speaking.png" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "d:/FYP_1/pronnova/public/audit-screenshots/test-coral-hero.png" });
  await browser.close();
  console.log("Screenshot test-coral-hero.png saved");
}

testCoralHero();
