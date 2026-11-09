import { cartelAlt, cartelOg, cartelOgSize } from './cartel';

export const site = {
  name: 'PS SVQ Triana',
  legalName: 'Peña Sevillista SVQ Triana',
  shortName: 'SVQ Triana',
  url: 'https://svqtriana.com',
  locale: 'es_ES',
  lang: 'es',
  foundingDate: '2019-07-27',
  foundingPlace: 'Triana, Sevilla, España',
  author: 'SVQ Triana',
  email: 'svqtriana@gmail.com',
  emailSubject: '[WEB]',
  formUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSdJ7KOc7hi-vBmWrmMwsD1zKJmmoM0TmtUd1IQ3cx_eS69azA/viewform',
  adsenseAccount: 'ca-pub-5217718596352992',
  themeColor: '#df0606',
  manifest: '/images/site.webmanifest',
  ogImage: cartelOg,
  ogImageSize: cartelOgSize,
  ogImageAlt: cartelAlt,
  changelogUrl:
    'https://github.com/mlorentedev/svqtriana.github.io/blob/main/CHANGELOG.md',
  developer: { name: '@mlorentedev', url: 'https://github.com/mlorentedev' },
} as const;

export const socials = {
  instagram: {
    label: 'Instagram',
    handle: '@PS_SVQTRIANA',
    url: 'https://www.instagram.com/ps_svqtriana/',
  },
  facebook: {
    label: 'Facebook',
    handle: 'PS SVQ Triana',
    url: 'https://www.facebook.com/PS-SVQ-Triana-110014627020914',
  },
  x: {
    label: 'X',
    handle: '@PS_SVQTRIANA1',
    url: 'https://twitter.com/ps_svqtriana1',
  },
  tiktok: {
    label: 'TikTok',
    handle: '@p.s.svq.triana',
    url: 'https://www.tiktok.com/@p.s.svq.triana',
  },
  youtube: {
    label: 'YouTube',
    handle: '@svqtriana2090',
    url: 'https://www.youtube.com/@svqtriana2090',
  },
} as const;

export type SocialKey = keyof typeof socials;

export const socialList: Array<{ key: SocialKey; label: string; url: string; handle: string }> = [
  { key: 'instagram', ...socials.instagram },
  { key: 'facebook', ...socials.facebook },
  { key: 'x', ...socials.x },
  { key: 'tiktok', ...socials.tiktok },
];

export const nav = [
  { label: 'INICIO', href: '/#home' },
  { label: 'NUESTRA HISTORIA', href: '/nosotros' },
  { label: 'MATERIAL', href: '/productos' },
  { label: 'GALERÍA', href: '/media' },
] as const;

export const membershipUrl = site.formUrl;
