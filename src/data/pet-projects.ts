export interface PetProject {
  shape: string;
  tint: string;
  title: string;
  desc: string;
  tags: string;
  link?: { href: string; label: string };
  brewing?: boolean;
}

export const petProjects: PetProject[] = [
  {
    shape: 'square',
    tint: 'linear-gradient(135deg,#ffd0e0,#ffe9c7)',
    title: 'This portfolio',
    desc: "You're looking at it. TypeScript, Vite, pure CSS animations — and way too much caffeine. The one project I can show 100% of.",
    tags: 'TypeScript · Vite · CSS',
    link: { href: 'https://github.com/tranttuan96/my-portfolio', label: 'Source →' },
  },
  {
    shape: 'zigzag',
    tint: 'linear-gradient(135deg,#cfe6ff,#d8d2ff)',
    title: "Something's brewing",
    desc: "A tiny weekend idea is taking shape here. Check back soon — or ping me and I'll tell you about it first.",
    tags: '???',
    brewing: true,
  },
  {
    shape: 'torus',
    tint: 'linear-gradient(135deg,#ffd9c2,#ffb9d1)',
    title: 'Idea slot #3',
    desc: 'Reserved for the next "what if I just..." moment. Fun ideas only, zero meetings guaranteed.',
    tags: 'coming soon',
    brewing: true,
  },
];
