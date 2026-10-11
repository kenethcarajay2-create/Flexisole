
const CLOUD_NAME = "ok8bp9vv";

const BASE_URL =
  `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export const cloudinaryAssets = {
  logo: `${BASE_URL}/v1791691604/logo.png`,
  hero: `${BASE_URL}/v1791691573/hero.png`,
  about: `${BASE_URL}/v1791691584/about.png`,

  classicPeachNude:
    `${BASE_URL}/v1791691633/classic-peach-nude.png`,

  classicCreamBeige:
    `${BASE_URL}/v1791691628/classic-cream-beige.png`,

  crossStrapDustyPink:
    `${BASE_URL}/v1791691632/cross-strap-dusty-pink.png`,

  crossStrapMochaBrown:
    `${BASE_URL}/v1791691632/cross-strap-mocha-brown.png`,

  doubleBandIvoryWhite:
    `${BASE_URL}/v1791691632/double-band-ivory-white.png`,

  doubleBandCaramelTan:
    `${BASE_URL}/v1791691633/double-band-caramel-tan.png`,
};

export function getCloudinaryUrl(
  source,
  {
    width = 800,
    quality = "auto",
    format = "auto",
  } = {}
) {
  if (!source) return "";

  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    "c_limit",
    `w_${Math.max(1, Math.round(Number(width) || 800))}`,
  ].join(",");

  const prefix = `${BASE_URL}/`;

  if (source.startsWith(prefix)) {
    return `${prefix}${transformations}/${source.slice(prefix.length)}`;
  }

  // Leave unrelated external URLs and local paths unchanged.
  if (/^https?:\/\//i.test(source) || source.startsWith("/")) {
    return source;
  }

  return `${prefix}${transformations}/${source}`;
}

export const getProductCardImage = (source) =>
  getCloudinaryUrl(source, { width: 600 });

export const getProductDetailImage = (source) =>
  getCloudinaryUrl(source, { width: 1200 });

export const getHeroImage = (source) =>
  getCloudinaryUrl(source, { width: 1920 });

export const getAboutImage = (source) =>
  getCloudinaryUrl(source, { width: 1200 });

export const getLogoImage = (source) =>
  getCloudinaryUrl(source, { width: 500 });
