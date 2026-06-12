import { workTeaserRows } from '../data/work-projects';
import { escapeAttr } from '../utils/escape-html';

/**
 * Emits data-en/data-vi attributes so the global language toggle covers these nodes.
 * emoji/tags are injected raw — static typed data only, never external input.
 */
export function renderWorkTeaser(): void {
  const list = document.getElementById('workList');
  if (!list) return;

  list.innerHTML = workTeaserRows
    .map(
      (row) => `
      <div class="work-row">
        <span class="wemoji">${row.emoji}</span>
        <div>
          <div class="wtitle" data-en="${escapeAttr(row.title.en)}" data-vi="${escapeAttr(row.title.vi)}">${row.title.en}</div>
          <div class="wmeta" data-en="${escapeAttr(row.meta.en)}" data-vi="${escapeAttr(row.meta.vi)}">${row.meta.en}</div>
        </div>
        <div class="wtags">${row.tags}</div>
      </div>`
    )
    .join('');
}
