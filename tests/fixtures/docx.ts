// Builds tiny .docx files in memory for tests (*.docx is git-ignored, so no binary fixtures).
// Uses jszip, which mammoth already depends on.
import { createRequire } from "node:module";

// Resolve from the project root: works under Vitest (ESM) and Playwright (CommonJS).
const require = createRequire(`${process.cwd()}/package.json`);
const JSZip = require("jszip") as new () => {
  file(path: string, data: string): void;
  generateAsync(o: { type: "uint8array" }): Promise<Uint8Array>;
};

const CT = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** One Word paragraph per string. */
export async function makeDocx(paragraphs: string[]): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", CT);
  zip.file("_rels/.rels", RELS);
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs
      .map((p) => `<w:p><w:r><w:t xml:space="preserve">${esc(p)}</w:t></w:r></w:p>`)
      .join("")}</w:body></w:document>`,
  );
  return zip.generateAsync({ type: "uint8array" });
}

/** A zip that is not a Word document. */
export async function makeZip(): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file("hello.txt", "hello");
  return zip.generateAsync({ type: "uint8array" });
}
