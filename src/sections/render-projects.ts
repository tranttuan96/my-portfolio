import { projects } from '../data/projects';
import { escapeAttr, safeHref } from '../utils/escape-html';

export function renderProjects(): void {
  const grid = document.getElementById('petGrid');
  if (!grid) return;

  grid.innerHTML = projects
    .map((project) => {
      const link = project.link
        ? `<a class="plink" href="${safeHref(project.link.href)}" target="_blank" rel="noopener">${escapeAttr(project.link.label)}</a>`
        : '';
      const badge = project.brewing ? `<span class="pbadge">In progress</span>` : '';
      // Without a screenshot the tint shows through, so draw the initial on it.
      const illust = project.image
        ? `<img src="${escapeAttr(project.image)}" alt="" />`
        : `<span class="pmono" aria-hidden="true">${escapeAttr(project.monogram ?? '')}</span>`;
      return `
      <div class="pet-card${project.brewing ? ' brewing' : ''}">
        <div class="p-illust">
          ${illust}
        </div>
        <div class="p-content">
          <div class="p-header">
            <span class="ptitle">${escapeAttr(project.title)}</span>
            ${badge}
          </div>
          <p class="pdesc">${escapeAttr(project.desc)}</p>
          <div class="ptags">${escapeAttr(project.tags)}</div>
          ${link}
        </div>
      </div>`;
    })
    .join('');

  // Tints are applied through the CSSOM rather than a style attribute in the
  // markup above: a strict style-src blocks style attributes parsed out of
  // innerHTML, but not property writes like this one.
  grid.querySelectorAll<HTMLElement>('.p-illust').forEach((illust, i) => {
    illust.style.background = projects[i].tint;
  });
}
