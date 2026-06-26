/** DigitalOcean Spaces CDN — single source for heavy media assets. */
export const ALINX_CDN = "https://alinx.nyc3.cdn.digitaloceanspaces.com";

export const HERO_FRAMES_CDN_PATTERN = `${ALINX_CDN}/frames/frame_%04d.webp`;

export const CDN_ASSETS = {
  keyBenefitsVideo: `${ALINX_CDN}/Video%20Project%2010.mp4`,
  heroFramePattern: HERO_FRAMES_CDN_PATTERN,
} as const;
