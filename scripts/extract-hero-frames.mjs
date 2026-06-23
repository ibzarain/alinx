#!/usr/bin/env node
/**
 * Extract JPG frames from public/building.mp4 for scroll-scrub hero.
 * Re-run when building.mp4 changes, then commit public/hero/frames/.
 * Requires: ffmpeg
 *
 * Env: HERO_FRAME_COUNT (default 400), HERO_END_FRAME (optional clip, default = full count),
 *   HERO_FRAME_WIDTH, HERO_JPEG_QUALITY
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const videoPath = path.join(root, "public/building.mp4");
const outDir = path.join(root, "public/hero/frames");

const frameCount = Math.max(2, Number(process.env.HERO_FRAME_COUNT) || 400);
const endFrame = Math.min(
  frameCount,
  Math.max(1, Number(process.env.HERO_END_FRAME) || frameCount)
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

const endTime =
  endFrame >= frameCount
    ? videoDuration
    : videoDuration * (endFrame / frameCount);
const extractCount = endFrame;
const frameFps = extractCount / endTime;

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

const trimArg = endFrame < frameCount ? `-t ${endTime}` : "";
const clipNote =
  endFrame < frameCount
    ? `clipped at frame ${endFrame}/${frameCount} (≈${endTime.toFixed(2)}s)`
    : `full ${videoDuration.toFixed(2)}s`;

console.log(
  `Extracting ${extractCount} frames (${clipNote} @ ${frameFps.toFixed(2)}fps, ${targetWidth}x${targetHeight}, JPEG q:v ${jpegQuality})...`
);
execSync(
  `ffmpeg -y -i "${videoPath}" ${trimArg} -vf "${vf}" -q:v ${jpegQuality} "${path.join(outDir, "frame_%04d.jpg")}"`,
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
  endFrame: frames.length,
  endTimeSec: endTime,
  fps: Number(frameFps.toFixed(3)),
  pattern: "/hero/frames/frame_%04d.jpg",
  width: targetWidth,
  height: targetHeight,
  videoSrc: "/building.mp4",
  cacheKey: `${videoStat.mtimeMs}-${videoStat.size}-${frameCount}-${endFrame}`,
};

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

console.log(`Done: ${frames.length} frames → ${outDir}`);
console.log("manifest.json:", manifest);
