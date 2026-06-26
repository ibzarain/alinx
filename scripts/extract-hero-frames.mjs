#!/usr/bin/env node
/**
 * Extract JPG frames from a source video for the scroll-scrub hero.
 * Writes frames to .hero-frames/ (gitignored), updates lib/hero-frames.manifest.json,
 * then upload .hero-frames/*.jpg to DigitalOcean Spaces at frames/.
 *
 * Requires: ffmpeg
 *
 * Env: HERO_FRAME_COUNT, HERO_START_FRAME, HERO_END_FRAME, HERO_FRAME_WIDTH, HERO_JPEG_QUALITY
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const videoPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, ".hero-source/building.mp4");
const outDir = path.join(root, ".hero-frames");
const manifestPath = path.join(root, "lib/hero-frames.manifest.json");
const CDN_BASE = "https://alinx.nyc3.cdn.digitaloceanspaces.com";

const frameCount = Math.max(2, Number(process.env.HERO_FRAME_COUNT) || 240);
const startFrame = Math.max(1, Number(process.env.HERO_START_FRAME) || 1);
const endFrame = Math.min(
  frameCount,
  Math.max(startFrame, Number(process.env.HERO_END_FRAME) || frameCount)
);

const jpegQuality = Math.min(
  31,
  Math.max(2, Number(process.env.HERO_JPEG_QUALITY) || 3)
);

if (!fs.existsSync(videoPath)) {
  console.error("Missing source video:", videoPath);
  console.error("Pass a path: npm run extract-hero-frames -- \"/path/to/video.mp4\"");
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
  if (/^frame_\d+\.jpg$/.test(f)) fs.unlinkSync(path.join(outDir, f));
}

const trimArg =
  startFrame > 1
    ? `-ss ${((startFrame - 1) / frameFps).toFixed(4)}`
    : "";

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
  fps: Number(frameFps.toFixed(3)),
  pattern: "/cdn-frames/frame_%04d.jpg",
  width: targetWidth,
  height: targetHeight,
  cacheKey: `${videoStat.mtimeMs}-${videoStat.size}-${frames.length}-full`,
};

if (startFrame > 1) manifest.startFrame = startFrame;
if (endFrame < frames.length) {
  manifest.endFrame = endFrame;
  manifest.endTimeSec = endTime;
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Done: ${frames.length} frames → ${outDir}`);
console.log("Updated:", manifestPath);
console.log("\nUpload to DigitalOcean Spaces:");
console.log(`  ${outDir}/frame_*.jpg  →  frames/`);
