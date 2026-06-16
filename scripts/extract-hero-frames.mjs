#!/usr/bin/env node
/**
 * Extract JPG frames from public/building.mp4 for scroll-scrub hero.
 * Re-run when building.mp4 changes, then commit public/hero/frames/.
 * Requires: ffmpeg (apt install ffmpeg)
 *
 * Env:
 *   HERO_FRAME_COUNT — total frames to extract (default: 200)
 *   HERO_END_RATIO — stop at this fraction of video length (default: 0.84 = frame 84/100)
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

const frameCount = Math.max(2, Number(process.env.HERO_FRAME_COUNT) || 200);
const endRatio = Math.min(1, Math.max(0.01, Number(process.env.HERO_END_RATIO) || 0.80));
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
let videoDuration = 10;
try {
  const sizeProbe = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "${videoPath}"`,
    { encoding: "utf8" }
  ).trim();
  const [sw, sh] = sizeProbe.split("x").map(Number);
  if (sw && sh) {
    sourceWidth = sw;
    sourceHeight = sh;
  }

  const durationProbe = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
    { encoding: "utf8" }
  ).trim();
  const d = Number(durationProbe);
  if (d > 0) videoDuration = d;
} catch {
  /* use defaults */
}

const endTime = videoDuration * endRatio;
const frameFps = frameCount / endTime;

const maxWidth = Number(process.env.HERO_FRAME_WIDTH) || sourceWidth;
const targetWidth = Math.min(sourceWidth, maxWidth, 1920);
let targetHeight = Math.round((targetWidth / sourceWidth) * sourceHeight);
if (targetHeight % 2 !== 0) targetHeight += 1;

const vf =
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
  `Extracting ${frameCount} frames (0–${(endRatio * 100).toFixed(0)}% of ${videoDuration.toFixed(2)}s ≈ ${endTime.toFixed(2)}s @ ${frameFps.toFixed(2)}fps, ${targetWidth}x${targetHeight}, JPEG q:v ${jpegQuality})...`
);
execSync(
  `ffmpeg -y -i "${videoPath}" -t ${endTime} -vf "${vf}" -q:v ${jpegQuality} "${path.join(outDir, "frame_%04d.jpg")}"`,
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
  frameCount: frames.length,
  targetFrameCount: frameCount,
  endRatio,
  endTimeSec: endTime,
  fps: Number(frameFps.toFixed(3)),
  pattern: "/hero/frames/frame_%04d.jpg",
  width: targetWidth,
  height: targetHeight,
  cacheKey: `${videoStat.mtimeMs}-${videoStat.size}-${frameCount}-${endRatio}`,
};

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

console.log(`Done: ${frames.length} frames → ${outDir}`);
console.log("manifest.json:", manifest);
