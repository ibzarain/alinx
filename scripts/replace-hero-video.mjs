#!/usr/bin/env node
/**
 * Replace public/hero/video.mp4 and re-extract scroll-scrub frames.
 *
 * Usage:
 *   npm run replace-hero-video
 *   npm run replace-hero-video -- "/path/to/video.mp4"
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dest = path.join(root, "public/hero/video.mp4");

const defaultSources = [
  "/mnt/c/Users/IbrahimArain/Downloads/Generated Video May 29, 2026 - 12_35PM.mp4",
  path.join(
    process.env.USERPROFILE || "",
    "Downloads",
    "Generated Video May 29, 2026 - 12_35PM.mp4"
  ),
];

const argSource = process.argv[2];
let source = argSource;

if (!source) {
  source = defaultSources.find((p) => p && fs.existsSync(p));
}

if (!source || !fs.existsSync(source)) {
  console.error("Source video not found.");
  console.error("Pass a path: npm run replace-hero-video -- \"/path/to/video.mp4\"");
  defaultSources.forEach((p) => console.error("  tried:", p));
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(source, dest);

const stat = fs.statSync(dest);
console.log(`Copied → ${dest} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);

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
execSync("node scripts/extract-hero-frames.mjs", { stdio: "inherit", cwd: root });

console.log("\nDone. Hard-refresh the browser to load new frames.");
