export interface Bilingual {
  en: string;
  vi: string;
}

export interface WorkTeaserRow {
  emoji: string;
  title: Bilingual;
  meta: Bilingual;
  tags: string;
}

/** Landing-page teaser only — full details live on /cv.html */
export const workTeaserRows: WorkTeaserRow[] = [
  {
    emoji: '⚡',
    title: {
      en: 'Circuit Technologies — Full-stack (Freelance) · 2025–2026',
      vi: 'Circuit Technologies — Full-stack (Freelance) · 2025–2026',
    },
    meta: {
      en: 'Built a generator for optimal solar panel layout + cost & performance estimates, replacing sales reps’ manual design work.',
      vi: 'Xây công cụ tự sinh bố trí tấm pin tối ưu + ước tính chi phí & hiệu năng, thay cho việc thiết kế thủ công của sales.',
    },
    tags: 'NestJS · React · Mongo · AWS',
  },
  {
    emoji: '🌊',
    title: {
      en: 'Before that: Designveloper · Soundlabs.ai · 2022–2024',
      vi: 'Trước đó: Designveloper · Soundlabs.ai · 2022–2024',
    },
    meta: {
      en: 'Solar CRM (US market), battery-charging simulation, MeteorJS upgrade lead, Shopify auth flows (OTP + OAuth 2.0), CI/CD.',
      vi: 'CRM điện mặt trời (thị trường Mỹ), mô phỏng sạc pin, dẫn dắt nâng cấp MeteorJS, luồng auth Shopify (OTP + OAuth 2.0), CI/CD.',
    },
    tags: 'React · MeteorJS · Shopify',
  },
];
