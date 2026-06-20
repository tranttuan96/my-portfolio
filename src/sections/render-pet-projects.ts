import { petProjects } from '../data/pet-projects';
import { escapeAttr, safeHref } from '../utils/escape-html';

export function renderPetProjects(): void {
  const grid = document.getElementById('petGrid');
  if (!grid) return;

  grid.innerHTML = petProjects
    .map((project) => {
      const link = project.link
        ? `<a class="plink" href="${safeHref(project.link.href)}" target="_blank" rel="noopener">${escapeAttr(project.link.label)}</a>`
        : '';
      const badge = project.brewing ? `<span class="pbadge">In progress</span>` : '';
      return `
      <div class="pet-card${project.brewing ? ' brewing' : ''}">
        <div class="p-illust" style="background: ${project.tint}">
          <img src="/decoratives/${project.shape}.png" alt="" />
        </div>
        <div class="p-content">
          <div class="p-header">
            <span class="ptitle">${escapeAttr(project.title)}</span>
            ${badge}
          </div>
          <p class="pdesc">${escapeAttr(project.desc)}</p>
          <div class="ptags">${project.tags}</div>
          ${link}
        </div>
      </div>`;
    })
    .join('');
}
