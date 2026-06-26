#!/usr/bin/env node
/**
 * Replace hero source video, re-extract frames, update lib/hero-frames.manifest.json.
 * Upload outputs to DigitalOcean Spaces (see extract-hero-frames.mjs).
 *
 * Usage:
 *   npm run replace-hero-video -- "/path/to/video.mp4"
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const cacheDir = path.join(root, ".hero-source");
const dest = path.join(cacheDir, "building.mp4");

const argSource = process.argv[2];
if (!argSource || !fs.existsSync(argSource)) {
  console.error("Pass a source video path:");
  console.error('  npm run replace-hero-video -- "/path/to/video.mp4"');
  process.exit(1);
}

const source = path.resolve(argSource);
fs.mkdirSync(cacheDir, { recursive: true });
fs.copyFileSync(source, dest);

const stat = fs.statSync(dest);
console.log(`Cached → ${dest} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);

try {
  const probe = execSync(
    `ffprobe -v error -show_entries stream=width,height -show_entries format=duration -of default=noprint_wrappers=1 "${dest}"`,
    { encoding: "utf8" }
  );
  console.log(probe.trim());
} catch {
  console.warn("ffprobe skipped (install ffmpeg to see metadata)");
}

console.log("\nExtracting frames…");
execSync(`node scripts/extract-hero-frames.mjs "${dest}"`, { stdio: "inherit", cwd: root });

console.log("\nDone. Upload frames to DigitalOcean, then hard-refresh.");
