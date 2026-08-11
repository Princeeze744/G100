import sharp from "sharp";
import { readdir, mkdir, copyFile, stat } from "fs/promises";
import path from "path";

const DIR = "public/members";
const BACKUP = "photo-originals";

await mkdir(BACKUP, { recursive: true });

const files = (await readdir(DIR)).filter((f) =>
  /\.(jpe?g|png)$/i.test(f)
);

let before = 0;
let after = 0;

for (const f of files) {
  const src = path.join(DIR, f);
  const bak = path.join(BACKUP, f);
  const s1 = await stat(src);
  before += s1.size;

  await copyFile(src, bak);

  const out = path.join(DIR, f.replace(/\.png$/i, ".jpg"));
  const buf = await sharp(src)
    .rotate()
    .resize({ width: 900, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();

  await sharp(buf).toFile(out + ".tmp");
  const { rename, unlink } = await import("fs/promises");
  await unlink(src);
  await rename(out + ".tmp", out);

  const s2 = await stat(out);
  after += s2.size;
  console.log(
    f.padEnd(24),
    (s1.size / 1024).toFixed(0) + "KB ->",
    (s2.size / 1024).toFixed(0) + "KB"
  );
}

console.log(
  "\nTOTAL:",
  (before / 1024 / 1024).toFixed(1) + "MB ->",
  (after / 1024 / 1024).toFixed(1) + "MB",
  "(" + Math.round((1 - after / before) * 100) + "% lighter)"
);
