export const SITE_URL = "https://rinrituroadster.github.io/roadsterMarin";
export const X_URL = "https://x.com/roadsterMarin";
export const LINE_STAMP_URL =
  "https://store.line.me/stickershop/product/37587561/ja";

export const withBasePath = (value: string) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}${value.startsWith("/") ? value : `/${value}`}`;
};
