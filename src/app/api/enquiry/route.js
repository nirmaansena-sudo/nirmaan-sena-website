import { clientIp, errorJson, handle, json, rateLimit, readJson } from '@/lib/api';
import { normalizeEnquiry } from '@/lib/validate';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

function reference() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NS-${ymd}-${rand}`;
}

async function forward(enquiry) {
  const url = process.env.ENQUIRY_WEBHOOK_URL;
  if (!url) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.ENQUIRY_WEBHOOK_SECRET ? { 'x-website-secret': process.env.ENQUIRY_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(enquiry),
      signal: controller.signal,
    });
    return res.ok;
  } catch (err) {
    console.error('[enquiry] webhook failed:', err.message);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export const POST = handle(async (request) => {
  if (!rateLimit(`enquiry:${clientIp(request)}`, 6, 10 * 60 * 1000)) {
    return errorJson('Too many requests. Please call or WhatsApp us instead.', 429);
  }

  const body = await readJson(request, 20_000);

  // Honeypot: real visitors never fill this hidden field.
  if (body.company) return json({ ok: true, reference: reference() });

  // Forms sent within a second of the page loading are almost always bots.
  if (typeof body.t !== 'number' || body.t < 1200) {
    return errorJson('Please take a moment to check your details, then send again.', 400);
  }

  const { data, errors } = normalizeEnquiry(body);
  if (Object.keys(errors).length) return errorJson('Please check the highlighted fields.', 422, { errors });

  const enquiry = { ...data, reference: reference(), submittedAt: new Date().toISOString() };

  let saved = false;
  try {
    const store = await getStore();
    await store.createEnquiry(enquiry);
    saved = true;
  } catch (err) {
    console.error('[enquiry] could not save:', err.message);
  }

  const forwarded = await forward(enquiry);

  if (!saved && !forwarded) {
    return errorJson('We could not send your request right now.', 503);
  }
  return json({ ok: true, reference: enquiry.reference });
});
