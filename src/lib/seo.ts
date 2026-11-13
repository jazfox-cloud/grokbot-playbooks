import type { Locale } from '../config/site';
import { siteConfig } from '../config/site';

export function absoluteUrl(path: string, site: string): string {
  const base = site.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function pageTitle(page: string | undefined, _locale: Locale): string {
  if (!page) return siteConfig.name;
  return `${page} · ${siteConfig.name}`;
}

export function htmlLang(locale: Locale): string {
  return locale === 'zh' ? 'zh-Hans' : 'en';
}

export function hreflangLinks(
  site: string,
  enPath: string,
  zhPath: string
): { hreflang: string; href: string }[] {
  return [
    { hreflang: 'en', href: absoluteUrl(enPath, site) },
    { hreflang: 'zh-Hans', href: absoluteUrl(zhPath, site) },
    { hreflang: 'x-default', href: absoluteUrl(enPath, site) },
  ];
}
