// Helpers that turn a stored media URL into fast, correctly sized delivery URLs.
// Cloudinary and Google-hosted images are resized on the fly; anything else is served as-is.

const CLOUDINARY = /res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\//;
const GOOGLE = /googleusercontent\.com\//;

export const DEFAULT_WIDTHS = [480, 768, 1080, 1440, 1920, 2400];

export function isCloudinary(url = '') {
  return CLOUDINARY.test(url);
}

export function isResizable(url = '') {
  return isCloudinary(url) || GOOGLE.test(url);
}

/** Image URL at a given width. */
export function imageUrl(url, width = 1600) {
  if (!url) return '';
  if (isCloudinary(url)) {
    return url.replace(/\/image\/upload\//, `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
  }
  if (GOOGLE.test(url)) {
    const base = url.replace(/=[^/]*$/, '');
    return `${base}=w${width}`;
  }
  return url;
}

/** srcset string for responsive images, or undefined if the host can't resize. */
export function imageSrcSet(url, widths = DEFAULT_WIDTHS, maxWidth) {
  if (!isResizable(url)) return undefined;
  const list = maxWidth ? widths.filter((w) => w <= maxWidth) : widths;
  if (maxWidth && !list.includes(maxWidth) && maxWidth < widths[widths.length - 1]) list.push(maxWidth);
  return list.map((w) => `${imageUrl(url, w)} ${w}w`).join(', ');
}

/** Optimised video delivery URL. */
export function videoUrl(url) {
  if (!url) return '';
  if (isCloudinary(url)) {
    return url.replace(/\/video\/upload\//, '/video/upload/q_auto,c_limit,w_1920/');
  }
  return url;
}

/** Poster image for a video item. */
export function videoPoster(item) {
  if (!item) return '';
  if (item.poster) return imageUrl(item.poster, 1920);
  if (isCloudinary(item.url)) {
    return item.url
      .replace(/\/video\/upload\//, '/video/upload/so_0,f_jpg,q_auto,c_limit,w_1600/')
      .replace(/\.[a-z0-9]+(\?.*)?$/i, '.jpg');
  }
  if (item.type === 'youtube') {
    const id = youtubeId(item.url);
    return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : '';
  }
  return '';
}

export function youtubeId(url = '') {
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/) ||
    url.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
}

/** Aspect ratio (w/h) of a media item, with a sensible default. */
export function aspect(item, fallback = 3 / 2) {
  if (item && item.width > 0 && item.height > 0) return item.width / item.height;
  if (item && (item.type === 'video' || item.type === 'youtube')) return 16 / 9;
  return fallback;
}

export function isPortrait(item) {
  return aspect(item) < 0.95;
}
