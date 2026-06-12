import { petProjects } from '../data/pet-projects';
import { escapeAttr, safeHref } from '../utils/escape-html';

/**
 * Emits data-en/data-vi attributes so the global language toggle covers these nodes.
 * emoji/tags are injected raw — static typed data only, never external input.
 */
export function renderPetProjects(): void {
  const grid = document.getElementById('petGrid');
  if (!grid) return;

  grid.innerHTML = petProjects
    .map((project) => {
      const link = project.link
        ? `<a class="plink" href="${safeHref(project.link.href)}" target="_blank" rel="noopener"
             data-en="${escapeAttr(project.link.label.en)}" data-vi="${escapeAttr(project.link.label.vi)}">${project.link.label.en}</a>`
        : '';
      const badge = project.brewing
        ? `<span class="pbadge" data-en="soon" data-vi="sắp có">soon</span>`
        : '';
      return `
      <div class="pet-card${project.brewing ? ' brewing' : ''}">
        ${badge}
        <span class="pemoji">${project.emoji}</span>
        <div class="ptitle" data-en="${escapeAttr(project.title.en)}" data-vi="${escapeAttr(project.title.vi)}">${project.title.en}</div>
        <div class="pdesc" data-en="${escapeAttr(project.desc.en)}" data-vi="${escapeAttr(project.desc.vi)}">${project.desc.en}</div>
        <div class="ptags">${project.tags}</div>
        ${link}
      </div>`;
    })
    .join('');
}
