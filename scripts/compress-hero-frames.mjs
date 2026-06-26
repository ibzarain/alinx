#!/usr/bin/env node
/**
 * Re-compress hero scroll frames for smaller CDN payload without visible quality loss.
 *
 * Preferred: re-extract from .hero-source/building.mp4 (single encode from source).
 * Fallback: convert public/hero/frames/*.jpg (or download CDN JPGs) → WebP.
 *
 * Output: public/hero/frames/frame_*.webp + manifest.json (drag folder to DO Spaces)
 *
 * Requires: ffmpeg with libwebp
 *
 * Usage:
 *   npm run compress-hero-frames
 *   npm run compress-hero-frames -- --from-cdn
 */
import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public/hero/frames");
const sourceVideo = path.join(root, ".hero-source/building.mp4");
const manifestPath = path.join(root, "lib/hero-frames.manifest.json");
const publicManifestPath = path.join(root, "public/hero/frames/manifest.json");

const CDN_BASE = "https://alinx.nyc3.cdn.digitaloceanspaces.com/frames";
const WEBP_QUALITY = Math.min(
  100,
  Math.max(75, Number(process.env.HERO_WEBP_QUALITY) || 85)
);

const fromCdn = process.argv.includes("--from-cdn");

function hasWebpEncoder() {
  try {
    const encoders = execSync("ffmpeg -hide_banner -encoders 2>&1", {
      encoding: "utf8",
    });
    return encoders.includes("libwebp");
  } catch {
    return false;
  }
}

function readManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function writeManifest(manifest) {
  const json = JSON.stringify(manifest, null, 2) + "\n";
  fs.writeFileSync(manifestPath, json);
  if (fs.existsSync(path.dirname(publicManifestPath))) {
    fs.writeFileSync(publicManifestPath, json);
  }
}

function formatBytes(n) {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

function dirSize(dir, ext) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .reduce((sum, f) => sum + fs.statSync(path.join(dir, f)).size, 0);
}

function reExtractFromVideo() {
  console.log("Re-extracting from source video (best quality)…");
  execSync(`node scripts/extract-hero-frames.mjs "${sourceVideo}"`, {
    stdio: "inherit",
    cwd: root,
    env: { ...process.env, HERO_FRAME_FORMAT: "webp", HERO_WEBP_QUALITY: String(WEBP_QUALITY) },
  });
}

async function downloadCdnJpegs(manifest) {
  fs.mkdirSync(outDir, { recursive: true });
  const count = manifest.frameCount;
  console.log(`Downloading ${count} frames from CDN…`);

  for (let i = 1; i <= count; i++) {
    const name = `frame_${String(i).padStart(4, "0")}.jpg`;
    const dest = path.join(outDir, name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) continue;

    const url = `${CDN_BASE}/${name}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to download ${url} (${res.status})`);
    }
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    if (i % 24 === 0 || i === count) {
      process.stdout.write(`\r  ${i}/${count}`);
    }
  }
  console.log("");
}

function convertJpgsToWebp() {
  const jpgs = fs
    .readdirSync(outDir)
    .filter((f) => /^frame_\d+\.jpg$/i.test(f))
    .sort();

  if (jpgs.length === 0) {
    console.error("No frame_*.jpg files found in", outDir);
    process.exit(1);
  }

  const before = dirSize(outDir, ".jpg");
  console.log(`Converting ${jpgs.length} JPEGs → WebP (quality ${WEBP_QUALITY})…`);

  for (let i = 0; i < jpgs.length; i++) {
    const jpg = jpgs[i];
    const webp = jpg.replace(/\.jpg$/i, ".webp");
    const input = path.join(outDir, jpg);
    const output = path.join(outDir, webp);

    const result = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        input,
        "-c:v",
        "libwebp",
        "-quality",
        String(WEBP_QUALITY),
        "-compression_level",
        "4",
        output,
      ],
      { stdio: "pipe", encoding: "utf8" }
    );

    if (result.status !== 0) {
      console.error(result.stderr || result.stdout);
      process.exit(1);
    }

    fs.unlinkSync(input);
    if ((i + 1) % 24 === 0 || i + 1 === jpgs.length) {
      process.stdout.write(`\r  ${i + 1}/${jpgs.length}`);
    }
  }
  console.log("");

  const after = dirSize(outDir, ".webp");
  const saved = before > 0 ? ((1 - after / before) * 100).toFixed(0) : "?";
  console.log(`  ${formatBytes(before)} → ${formatBytes(after)} (~${saved}% smaller)`);
  return jpgs.length;
}

function updateManifestForWebp(frameCount) {
  const manifest = readManifest();
  manifest.format = "webp";
  manifest.pattern = "https://alinx.nyc3.cdn.digitaloceanspaces.com/frames/frame_%04d.webp";
  manifest.frameCount = frameCount;
  manifest.cacheKey = `cdn-frames-v3-webp-q${WEBP_QUALITY}`;
  writeManifest(manifest);
  console.log("Updated:", manifestPath);
  return manifest;
}

async function main() {
  if (!hasWebpEncoder()) {
    console.error("ffmpeg libwebp encoder not found. Install ffmpeg with WebP support.");
    process.exit(1);
  }

  if (fs.existsSync(sourceVideo) && !fromCdn) {
    reExtractFromVideo();
    const count = fs
      .readdirSync(outDir)
      .filter((f) => f.endsWith(".webp")).length;
    const beforeEstimate = count * 280 * 1024;
    const after = dirSize(outDir, ".webp");
    if (beforeEstimate > 0) {
      const saved = ((1 - after / beforeEstimate) * 100).toFixed(0);
      console.log(`\nOutput: ${count} WebP frames, ${formatBytes(after)} (~${saved}% vs prior JPEG est.)`);
    }
    updateManifestForWebp(count);
  } else {
    const manifest = readManifest();
    const existingWebp = fs
      .readdirSync(outDir)
      .filter((f) => /^frame_\d+\.webp$/i.test(f));
    const existingJpg = fs
      .readdirSync(outDir)
      .filter((f) => /^frame_\d+\.jpg$/i.test(f));

    if (existingWebp.length >= manifest.frameCount) {
      console.log(`Already have ${existingWebp.length} WebP frames in ${outDir}`);
      updateManifestForWebp(existingWebp.length);
    } else if (existingJpg.length >= manifest.frameCount) {
      console.log(`Found ${existingJpg.length} local JPEGs`);
      const count = convertJpgsToWebp();
      updateManifestForWebp(count);
    } else {
      await downloadCdnJpegs(manifest);
      const count = convertJpgsToWebp();
      updateManifestForWebp(count);
    }
  }

  console.log("\nUpload to DigitalOcean Spaces:");
  console.log(`  Drag ${outDir}/  →  frames/  (replace existing)`);
  console.log("Remove old frame_*.jpg from the bucket if any remain.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
