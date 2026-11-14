// Browser-side upload helpers for the dashboard.
// Uploads straight to Cloudinary when it's configured (with chunking for large
// videos), otherwise to this server's /api/admin/upload.

const CHUNK = 6 * 1024 * 1024;
const SINGLE_LIMIT = 20 * 1024 * 1024;
const MAX_IMAGE_EDGE = 3200;

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

async function getTarget() {
  const res = await fetch('/api/admin/upload/sign', { method: 'POST' });
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Please sign in again.');
  }
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Upload is not available.');
  return data;
}

function xhr({ url, body, headers = {}, onProgress }) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('POST', url);
    for (const [k, v] of Object.entries(headers)) req.setRequestHeader(k, v);
    req.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded, e.total);
    req.onload = () => {
      let data = {};
      try {
        data = JSON.parse(req.responseText || '{}');
      } catch {}
      if (req.status >= 200 && req.status < 300) resolve(data);
      else reject(new Error(data?.error?.message || data?.error || `Upload failed (${req.status}).`));
    };
    req.onerror = () => reject(new Error('Network error during upload.'));
    req.send(body);
  });
}

/** Reads width/height of an image or video file in the browser. */
export function measure(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const done = (w, h) => {
      URL.revokeObjectURL(url);
      resolve({ width: w || 0, height: h || 0 });
    };
    if (file.type.startsWith('video/')) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => done(v.videoWidth, v.videoHeight);
      v.onerror = () => done(0, 0);
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => done(img.naturalWidth, img.naturalHeight);
      img.onerror = () => done(0, 0);
      img.src = url;
    }
  });
}

/** Scales very large photos down (max 3200px, JPEG) so uploads are fast and stay under plan limits. */
async function prepareImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const { width, height } = await measure(file);
  const edge = Math.max(width, height);
  if (!edge || (edge <= MAX_IMAGE_EDGE && file.size <= 4 * 1024 * 1024)) return file;
  const scale = Math.min(1, MAX_IMAGE_EDGE / edge);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function toCloudinary(file, target, onProgress) {
  const kind = file.type.startsWith('video/') ? 'video' : 'image';
  const url = `https://api.cloudinary.com/v1_1/${target.cloudName}/${kind}/upload`;
  const fields = {
    api_key: target.apiKey,
    timestamp: String(target.timestamp),
    folder: target.folder,
    allowed_formats: target.allowed_formats,
    signature: target.signature,
  };
  const form = (blob) => {
    const fd = new FormData();
    fd.append('file', blob, file.name);
    for (const [k, v] of Object.entries(fields)) fd.append(k, v);
    return fd;
  };

  let res;
  if (file.size <= SINGLE_LIMIT) {
    res = await xhr({ url, body: form(file), onProgress: (l) => onProgress(l / file.size) });
  } else {
    const id = uid();
    for (let start = 0; start < file.size; start += CHUNK) {
      const end = Math.min(start + CHUNK, file.size);
      res = await xhr({
        url,
        body: form(file.slice(start, end)),
        headers: { 'X-Unique-Upload-Id': id, 'Content-Range': `bytes ${start}-${end - 1}/${file.size}` },
        onProgress: (l) => onProgress((start + l) / file.size),
      });
    }
  }
  if (!res?.secure_url) throw new Error('Upload did not return a file URL.');
  return { url: res.secure_url, type: kind, width: res.width || 0, height: res.height || 0 };
}

async function toServer(file, onProgress) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await xhr({ url: '/api/admin/upload', body: fd, onProgress: (l, t) => onProgress(l / t) });
  return { url: res.url, type: res.type };
}

/**
 * Uploads one file and returns a gallery item:
 * { id, type: 'image'|'video', url, width, height, caption, layout }
 */
export async function uploadMedia(file, onProgress = () => {}) {
  if (!/^(image|video)\//.test(file.type)) throw new Error('Only photos and videos can be uploaded.');
  const prepared = file.type.startsWith('image/') ? await prepareImage(file) : file;
  const dims = await measure(prepared);
  const target = await getTarget();
  const result = target.mode === 'cloudinary' ? await toCloudinary(prepared, target, onProgress) : await toServer(prepared, onProgress);
  onProgress(1);
  return {
    id: uid(),
    type: result.type,
    url: result.url,
    width: result.width || dims.width,
    height: result.height || dims.height,
    caption: '',
    layout: 'auto',
  };
}

export const newId = uid;
