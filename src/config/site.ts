export const siteConfig = {
  name: 'Grok Bot Playbooks',
  tagline: {
    en: 'Copy-ready Grok Bot playbooks from real X posts',
    zh: '可抄作业的 Grok Bot 实战案例库 / Playbook',
  },
  description: {
    en: 'Actionable Grok Bot playbooks grounded in real community posts—workflows, prompts, and connector patterns you can copy.',
    zh: '基于真实社区帖子整理的 Grok Bot 实战 Playbook：可抄的工作流、提示词模板与连接器用法。',
  },
  defaultLocale: 'en' as const,
  locales: ['en', 'zh'] as const,
  ads: {
    enabled: false,
  },
};

export type Locale = (typeof siteConfig.locales)[number];

export function localePath(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  if (locale === 'en') {
    return clean ? `/${clean}/` : '/';
  }
  return clean ? `/zh/${clean}/` : '/zh/';
}

export function alternateLocale(locale: Locale): Locale {
  return locale === 'en' ? 'zh' : 'en';
}
