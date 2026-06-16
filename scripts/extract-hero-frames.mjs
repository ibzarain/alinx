#!/usr/bin/env node
/**
 * Extract JPG frames from public/building.mp4 for scroll-scrub hero.
 * Re-run when building.mp4 changes, then commit public/hero/frames/.
 * Requires: ffmpeg (apt install ffmpeg)
 *
 * Env:
 *   HERO_FRAME_FPS — extraction rate (default: 5, fewer = faster scroll scrub)
 *   HERO_FRAME_WIDTH — max width (default: source width, capped at 1920)
 *   HERO_JPEG_QUALITY — mjpeg q:v 2–31, lower = better (default: 3)
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const videoPath = path.join(root, "public/building.mp4");
const outDir = path.join(root, "public/hero/frames");

const frameFps = Math.min(
  30,
  Math.max(1, Number(process.env.HERO_FRAME_FPS) || 5)
);
const jpegQuality = Math.min(
  31,
  Math.max(2, Number(process.env.HERO_JPEG_QUALITY) || 3)
);

if (!fs.existsSync(videoPath)) {
  console.error("Missing:", videoPath);
  process.exit(1);
}

let sourceWidth = 1920;
let sourceHeight = 1080;
try {
  const probe = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "${videoPath}"`,
    { encoding: "utf8" }
  ).trim();
  const [sw, sh] = probe.split("x").map(Number);
  if (sw && sh) {
    sourceWidth = sw;
    sourceHeight = sh;
  }
} catch {
  /* use defaults */
}

const maxWidth = Number(process.env.HERO_FRAME_WIDTH) || sourceWidth;
const targetWidth = Math.min(sourceWidth, maxWidth, 1920);
let targetHeight = Math.round((targetWidth / sourceWidth) * sourceHeight);
if (targetHeight % 2 !== 0) targetHeight += 1;

const scaleFilter =
  targetWidth < sourceWidth
    ? `fps=${frameFps},scale=${targetWidth}:${targetHeight}:flags=lanczos`
    : `fps=${frameFps}`;

fs.mkdirSync(outDir, { recursive: true });

for (const f of fs.readdirSync(outDir)) {
  if (f.startsWith("frame_") && f.endsWith(".jpg")) {
    fs.unlinkSync(path.join(outDir, f));
  }
}

console.log(
  `Extracting frames at ${frameFps}fps (${targetWidth}x${targetHeight}, JPEG q:v ${jpegQuality})...`
);
execSync(
  `ffmpeg -y -i "${videoPath}" -vf "${scaleFilter}" -q:v ${jpegQuality} "${path.join(outDir, "frame_%04d.jpg")}"`,
  { stdio: "inherit", cwd: root }
);

const frames = fs
  .readdirSync(outDir)
  .filter((f) => /^frame_\d+\.jpg$/.test(f))
  .sort();

if (frames.length === 0) {
  console.error("No frames produced.");
  process.exit(1);
}

const videoStat = fs.statSync(videoPath);
const manifest = {
  fps: frameFps,
  frameCount: frames.length,
  pattern: "/hero/frames/frame_%04d.jpg",
  width: targetWidth,
  height: targetHeight,
  cacheKey: `${videoStat.mtimeMs}-${videoStat.size}`,
};

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

console.log(`Done: ${frames.length} frames → ${outDir}`);
console.log("manifest.json:", manifest);
