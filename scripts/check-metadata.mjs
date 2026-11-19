import fs from "fs";

for (let i = 1; i <= 4; i++) {
  const buf = fs.readFileSync(`public/objects/img${i}.jpg`);
  const str = buf.toString("latin1");
  const prompts = str.match(/([a-zA-Z0-9 ,.'-]{20,120})/g);
  console.log(`=== img${i} ===`);
  const clean = (prompts || []).filter(p => p.includes("learning") || p.includes("illustration") || p.includes("book") || p.includes("child") || p.includes("cute") || p.includes("table") || p.includes("study") || p.includes("fox") || p.includes("bear") || p.includes("smart") || p.includes("pron") || p.includes("speak") || p.includes("voice") || p.includes("headphone") || p.includes("screen"));
  console.log(clean.slice(0, 5));
}
