export interface Project {
  image: string;
  tint: string;
  title: string;
  desc: string;
  tags: string;
  link?: { href: string; label: string };
  brewing?: boolean;
}

export const projects: Project[] = [
  {
    image: '/decoratives/portfolio-mockup.jpg',
    tint: 'linear-gradient(135deg,var(--tint-portfolio-a),var(--tint-portfolio-b))',
    title: 'This portfolio',
    desc: "You're looking at it. TypeScript, Vite, pure CSS animations — and way too much caffeine. The one project I can show 100% of.",
    tags: 'TypeScript · Vite · CSS',
    link: { href: 'https://github.com/tranttuan96/my-portfolio', label: 'Source →' },
  },
  {
    image: '/decoratives/leadgen-mockup.jpg',
    tint: 'linear-gradient(135deg,var(--tint-leadgen-a),var(--tint-leadgen-b))',
    title: 'Personal Brand & LeadGen Platform',
    desc: 'A digital platform built for my wife. Features a high-speed Astro storefront for lead generation, paired with a React/Vite admin dashboard for internal management.',
    tags: 'Astro · React · Tailwind',
    link: { href: 'https://nhungtran.space', label: 'Visit Site →' },
  },
  {
    image: '/decoratives/idea-mockup.jpg',
    tint: 'linear-gradient(135deg,var(--tint-idea-a),var(--tint-idea-b))',
    title: 'Idea slot #3',
    desc: 'Reserved for the next "what if I just..." moment. Fun ideas only, zero meetings guaranteed.',
    tags: 'coming soon',
    brewing: true,
  },
];
