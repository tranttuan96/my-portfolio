export interface Project {
  /** Screenshot for the card. Omit when a project has nothing public to show. */
  image?: string;
  /** Single letter drawn in the image slot when there is no screenshot. */
  monogram?: string;
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
    monogram: 'H',
    tint: 'linear-gradient(135deg,var(--tint-homehub-a),var(--tint-homehub-b))',
    title: 'HomeHub',
    desc: 'A personal finance platform I built and run solo. Bank webhooks land through a transactional outbox, a queue picks them up, and an AI agent answers questions about accounts and records transactions through typed tools.',
    tags: 'NestJS · PostgreSQL · BullMQ · React',
  },
  {
    image: '/decoratives/leadgen-mockup.jpg',
    tint: 'linear-gradient(135deg,var(--tint-leadgen-a),var(--tint-leadgen-b))',
    title: 'Personal Brand & LeadGen Platform',
    desc: 'A digital platform built for my wife. Features a high-speed Astro storefront for lead generation, paired with a React/Vite admin dashboard for internal management.',
    tags: 'Astro · React · Tailwind',
    link: { href: 'https://nhungtran.space', label: 'Visit Site →' },
  },
];
