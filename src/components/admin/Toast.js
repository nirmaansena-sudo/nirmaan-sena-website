'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(0);
  const show = useCallback((message, type = 'ok') => {
    clearTimeout(timer.current);
    setToast({ message, type, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), type === 'error' ? 6000 : 3000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = toast ? (
    <div key={toast.key} className={`toast${toast.type === 'error' ? ' error' : ''}`} role="status">
      <i /> {toast.message}
    </div>
  ) : null;
  return [node, show];
}

export async function api(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Please sign in again.');
  }
  if (!res.ok || data.ok === false) {
    const err = new Error(data.error || 'Something went wrong.');
    err.errors = data.errors;
    throw err;
  }
  return data;
}
