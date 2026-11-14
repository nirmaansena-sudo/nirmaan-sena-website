import { isPortrait } from './media.js';

/**
 * Arranges gallery items into an editorial rhythm of rows so any set of uploads
 * looks composed: full-bleed frames, pairs, and portrait/landscape splits.
 *
 * Row kinds:
 *  - full   : one wide frame (landscape image, video, or item marked "Full width")
 *  - pair   : two frames of equal width
 *  - split  : a portrait next to a landscape (5/7 columns)
 *  - single : a lone portrait, set off-centre
 */
export function composeGallery(items = []) {
  const list = items.filter((it) => it && it.url);
  const rows = [];
  let landscapeTurn = 0;
  let i = 0;

  const isFlexibleImage = (it) => it && it.type === 'image' && it.layout !== 'full';

  while (i < list.length) {
    const a = list[i];
    const b = list[i + 1];

    if (!isFlexibleImage(a)) {
      rows.push({ kind: 'full', items: [a] });
      landscapeTurn = 1;
      i += 1;
      continue;
    }

    const nextFlexible = isFlexibleImage(b) ? b : null;

    if (isPortrait(a)) {
      if (nextFlexible && isPortrait(nextFlexible)) {
        rows.push({ kind: 'pair', portrait: true, items: [a, nextFlexible] });
        i += 2;
      } else if (nextFlexible) {
        rows.push({ kind: 'split', items: [a, nextFlexible], portraitIndex: 0 });
        i += 2;
      } else {
        rows.push({ kind: 'single', items: [a] });
        i += 1;
      }
      continue;
    }

    // Landscape image
    if (landscapeTurn % 2 === 0 || !nextFlexible) {
      rows.push({ kind: 'full', items: [a] });
      landscapeTurn += 1;
      i += 1;
      continue;
    }

    if (isPortrait(nextFlexible)) {
      rows.push({ kind: 'split', items: [a, nextFlexible], portraitIndex: 1 });
    } else {
      rows.push({ kind: 'pair', portrait: false, items: [a, nextFlexible] });
    }
    landscapeTurn += 1;
    i += 2;
  }

  return rows;
}
