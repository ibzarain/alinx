/** DigitalOcean Spaces CDN — single source for heavy media assets. */
export const ALINX_CDN = "https://alinx.nyc3.cdn.digitaloceanspaces.com";

export const CDN_ASSETS = {
  keyBenefitsVideo: `${ALINX_CDN}/Video%20Project%2010.mp4`,
  heroFramePattern: "/cdn-frames/frame_%04d.jpg",
} as const;
