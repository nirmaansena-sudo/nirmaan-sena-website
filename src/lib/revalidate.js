import { revalidatePath } from 'next/cache';

/** Refreshes every public page after content changes in the dashboard. */
export function refreshSite() {
  try {
    revalidatePath('/', 'layout');
  } catch (err) {
    console.warn('[revalidate]', err.message);
  }
}
