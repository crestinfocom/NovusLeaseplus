import * as fs from "fs";
import * as path from "path";

const htmlPath = path.resolve("Design/NovusLease-plus-homepage.html");
const html = fs.readFileSync(htmlPath, "utf-8");

const outDir = path.resolve("public/images");
fs.mkdirSync(outDir, { recursive: true });

// Preceding-context markers used to identify each image
const markers = [
  ['<a class="brand" href="#"><img', 15928, "logo.png"],
  ["hero-bg", 285000, "hero-bg.jpg"],
  ["Bestseller", 249620, "swift.jpg"],
  ["Popular SUV", 216064, "creta.jpg"],
  ["Luxury", 240948, "sedan.jpg"],
  ["7 Seater", 285000, "innova.jpg"],
  ["showcase reveal", 285000, "showcase.jpg"],
  ["cta-final", 240948, "cta-final.jpg"],
];

const regex = /data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)/g;
let match;
const writes = [];

while ((match = regex.exec(html)) !== null) {
  const [full, ext, b64] = match;
  const before = html.slice(Math.max(0, match.index - 160), match.index);

  let filename = `image-${writes.length + 1}.${ext}`;
  for (const [needle, len, name] of markers) {
    if (b64.length === len && before.includes(needle)) {
      filename = name;
      break;
    }
  }
  // Footer brand logo (second <a class="brand"> occurrence) — smaller header logo
  if (b64.length === 8364 && before.includes('<a class="brand" href="#"><img')) {
    filename = "logo-footer.png";
  }

  const target = path.join(outDir, filename);
  fs.writeFileSync(target, Buffer.from(b64, "base64"));
  writes.push(filename);
  console.log(`Saved ${filename} (${b64.length} chars)`);
}

// Clean up any files not in the expected set
const expected = new Set(writes);
for (const file of fs.readdirSync(outDir)) {
  if (!expected.has(file)) {
    fs.unlinkSync(path.join(outDir, file));
    console.log(`Removed stale ${file}`);
  }
}

console.log(`Done. Saved ${writes.length} images.`);