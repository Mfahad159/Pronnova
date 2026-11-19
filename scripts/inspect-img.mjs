import { chromium } from "playwright";

async function inspectImg() {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage();
  for (let i = 1; i <= 4; i++) {
    await page.goto(`file:///d:/FYP_1/pronnova/public/objects/img${i}.jpg`);
    const data = await page.evaluate(() => {
      const img = document.querySelector('img');
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 100, 100);
      const p = ctx.getImageData(50, 50, 1, 1).data;
      return {
        w: img.naturalWidth,
        h: img.naturalHeight,
        aspect: (img.naturalWidth / img.naturalHeight).toFixed(2),
        sampleCenterPixel: Array.from(p)
      };
    });
    console.log(`img${i}:`, data);
  }
  await browser.close();
}

inspectImg();
