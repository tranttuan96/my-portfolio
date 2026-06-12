import type { Bilingual } from './work-projects';

export interface PetProject {
  emoji: string;
  title: Bilingual;
  desc: Bilingual;
  tags: string;
  link?: { href: string; label: Bilingual };
  brewing?: boolean;
}

export const petProjects: PetProject[] = [
  {
    emoji: '👀',
    title: { en: 'This portfolio', vi: 'Chính trang này' },
    desc: {
      en: 'You’re looking at it. A 3D chibi me, a Doctor Strange entrance, and way too much caffeine. The one project I can show 100% of.',
      vi: 'Bạn đang xem nó đó. Một chibi 3D, màn chào sân kiểu Doctor Strange, và quá nhiều caffeine. Dự án duy nhất mình show được 100%.',
    },
    tags: 'Three.js · TypeScript · Vite',
    link: {
      href: 'https://github.com/tranttuan96/my-portfolio',
      label: { en: 'Source →', vi: 'Mã nguồn →' },
    },
  },
  {
    emoji: '☕',
    title: { en: 'Something’s brewing', vi: 'Đang ủ một thứ' },
    desc: {
      en: 'A tiny weekend idea is taking shape here. Check back soon — or ping me and I’ll tell you about it first.',
      vi: 'Một ý tưởng cuối tuần nho nhỏ đang thành hình. Quay lại sau nhé — hoặc nhắn mình kể cho nghe trước.',
    },
    tags: '???',
    brewing: true,
  },
  {
    emoji: '🧪',
    title: { en: 'Idea slot #3', vi: 'Slot ý tưởng #3' },
    desc: {
      en: 'Reserved for the next “what if I just…” moment. Fun ideas only, zero meetings guaranteed.',
      vi: 'Để dành cho khoảnh khắc “hay là mình thử…” tiếp theo. Chỉ nhận ý tưởng vui, cam kết không họp hành.',
    },
    tags: 'coming soon',
    brewing: true,
  },
];
