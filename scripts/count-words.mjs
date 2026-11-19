import { chromium } from "playwright";

async function countWords() {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  for (const path of ["/", "/student"]) {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
    const text = await page.evaluate(() => {
      // Get all visible text elements where top is < 800
      const elements = Array.from(document.querySelectorAll("h1, h2, h3, p, span, button, a, div"));
      const visibleTexts = new Set();
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < 800 && rect.height > 0 && rect.width > 0) {
          // Check direct child text nodes
          for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
              const trimmed = node.textContent?.trim();
              if (trimmed && trimmed.length > 1) {
                visibleTexts.add(trimmed);
              }
            }
          }
        }
      }
      return Array.from(visibleTexts).join(" ");
    });

    const words = text.split(/\s+/).filter(Boolean);
    console.log(`Route ${path} - Visible words above fold: ${words.length}`);
  }

  await browser.close();
}

countWords().catch(console.error);
