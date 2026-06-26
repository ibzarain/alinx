#!/usr/bin/env node
/**
 * Extract frames from a source video for the scroll-scrub hero.
 * Writes frames to .hero-frames/ (gitignored), updates lib/hero-frames.manifest.json,
 * then upload .hero-frames/* to DigitalOcean Spaces at frames/.
 *
 * Requires: ffmpeg (libwebp recommended)
 *
 * Env:
 *   HERO_FRAME_COUNT, HERO_START_FRAME, HERO_END_FRAME, HERO_FRAME_WIDTH
 *   HERO_FRAME_FORMAT=webp|jpg  (default webp — ~40% smaller at same visual quality)
 *   HERO_WEBP_QUALITY=85          (75–90; 85 is visually lossless for scroll scrub)
 *   HERO_JPEG_QUALITY=5           (ffmpeg q:v 2–10; only used when format=jpg)
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
const publicManifestPath = path.join(root, "public/hero/frames/manifest.json");

const frameCount = Math.max(2, Number(process.env.HERO_FRAME_COUNT) || 240);
const startFrame = Math.max(1, Number(process.env.HERO_START_FRAME) || 1);
const endFrame = Math.min(
  frameCount,
  Math.max(startFrame, Number(process.env.HERO_END_FRAME) || frameCount)
);

const format = (process.env.HERO_FRAME_FORMAT || "webp").toLowerCase();
const useWebp = format === "webp";
const ext = useWebp ? "webp" : "jpg";

const webpQuality = Math.min(
  100,
  Math.max(75, Number(process.env.HERO_WEBP_QUALITY) || 85)
);
const jpegQuality = Math.min(
  10,
  Math.max(2, Number(process.env.HERO_JPEG_QUALITY) || 5)
);

if (!fs.existsSync(videoPath)) {
  console.error("Missing source video:", videoPath);
  console.error('Pass a path: npm run extract-hero-frames -- "/path/to/video.mp4"');
  process.exit(1);
}

if (useWebp) {
  try {
    const encoders = execSync("ffmpeg -hide_banner -encoders 2>&1", {
      encoding: "utf8",
    });
    if (!encoders.includes("libwebp")) {
      console.warn("libwebp not found — falling back to JPEG (q:v 5)");
    }
  } catch {
    /* checked below */
  }
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
  if (/^frame_\d+\.(jpg|webp)$/i.test(f)) fs.unlinkSync(path.join(outDir, f));
}

const trimArg =
  startFrame > 1
    ? `-ss ${((startFrame - 1) / frameFps).toFixed(4)}`
    : "";

let encodeArgs;
let actualExt = ext;
let actualFormat = format;

if (useWebp) {
  try {
    const encoders = execSync("ffmpeg -hide_banner -encoders 2>&1", {
      encoding: "utf8",
    });
    if (encoders.includes("libwebp")) {
      encodeArgs = `-c:v libwebp -quality ${webpQuality} -compression_level 4`;
    } else {
      actualExt = "jpg";
      actualFormat = "jpg";
      encodeArgs = `-q:v ${jpegQuality}`;
    }
  } catch {
    actualExt = "jpg";
    actualFormat = "jpg";
    encodeArgs = `-q:v ${jpegQuality}`;
  }
} else {
  encodeArgs = `-q:v ${jpegQuality}`;
}

execSync(
  `ffmpeg -y -i "${videoPath}" ${trimArg} -vf "${vf}" ${encodeArgs} "${path.join(outDir, `frame_%04d.${actualExt}`)}"`,
  { stdio: "inherit", cwd: root }
);

const frames = fs
  .readdirSync(outDir)
  .filter((f) => new RegExp(`^frame_\\d+\\.${actualExt}$`, "i").test(f))
  .sort();

if (frames.length === 0) {
  console.error("No frames produced.");
  process.exit(1);
}

const totalBytes = frames.reduce(
  (sum, f) => sum + fs.statSync(path.join(outDir, f)).size,
  0
);
const avgKb = (totalBytes / frames.length / 1024).toFixed(0);

const videoStat = fs.statSync(videoPath);
const cacheSuffix =
  actualFormat === "webp"
    ? `webp-q${webpQuality}`
    : `jpg-q${jpegQuality}`;

const manifest = {
  frameCount: frames.length,
  fps: Number(frameFps.toFixed(3)),
  format: actualFormat,
  pattern: `https://alinx.nyc3.cdn.digitaloceanspaces.com/frames/frame_%04d.${actualExt}`,
  width: targetWidth,
  height: targetHeight,
  cacheKey: `${videoStat.mtimeMs}-${videoStat.size}-${frames.length}-${cacheSuffix}`,
};

if (startFrame > 1) manifest.startFrame = startFrame;
if (endFrame < frames.length) {
  manifest.endFrame = endFrame;
  manifest.endTimeSec = endTime;
}

const manifestJson = JSON.stringify(manifest, null, 2) + "\n";
fs.writeFileSync(manifestPath, manifestJson);
if (fs.existsSync(path.dirname(publicManifestPath))) {
  fs.writeFileSync(publicManifestPath, manifestJson);
}

console.log(`Done: ${frames.length} ${actualExt.toUpperCase()} frames → ${outDir}`);
console.log(`Avg frame size: ${avgKb} KB (${(totalBytes / 1024 / 1024).toFixed(1)} MB total)`);
console.log("Updated:", manifestPath);
console.log("\nUpload to DigitalOcean Spaces:");
console.log(`  ${outDir}/frame_*.${actualExt}  →  frames/`);
