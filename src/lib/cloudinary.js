import crypto from 'node:crypto';

export function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret, folder: process.env.CLOUDINARY_FOLDER || 'nirmaan-sena' };
}

/**
 * Cloudinary upload signature: parameters sorted alphabetically, joined as
 * key=value with "&", followed by the API secret, hashed with SHA-1.
 */
export function signParams(params, apiSecret) {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

// Only photo and video formats can be uploaded with a signature from this site.
export const ALLOWED_FORMATS = 'jpg,jpeg,png,webp,avif,heic,heif,gif,mp4,mov,webm,m4v';

export function uploadSignature(subfolder = 'projects', now = Date.now()) {
  const cfg = cloudinaryConfig();
  if (!cfg) return null;
  const timestamp = Math.floor(now / 1000);
  const folder = `${cfg.folder}/${subfolder}`.replace(/[^a-zA-Z0-9/_-]/g, '');
  const params = { allowed_formats: ALLOWED_FORMATS, folder, timestamp };
  const signature = signParams(params, cfg.apiSecret);
  return { cloudName: cfg.cloudName, apiKey: cfg.apiKey, ...params, signature };
}
