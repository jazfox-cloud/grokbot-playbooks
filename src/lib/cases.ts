import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../config/site';

export type CaseEntry = CollectionEntry<'cases'>;

export async function getAllCases(): Promise<CaseEntry[]> {
  const cases = await getCollection('cases');
  return cases.sort((a, b) => a.data.order - b.data.order);
}

export function localeContent(entry: CaseEntry, locale: Locale) {
  return locale === 'zh' ? entry.data.zh : entry.data.en;
}

export function relatedCases(all: CaseEntry[], current: CaseEntry, limit = 3): CaseEntry[] {
  const sameCategory = all.filter(
    (c) =>
      c.id !== current.id &&
      c.data.en.category === current.data.en.category
  );
  const rest = all.filter(
    (c) => c.id !== current.id && !sameCategory.some((s) => s.id === c.id)
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

export function nextCase(all: CaseEntry[], current: CaseEntry): CaseEntry | undefined {
  const idx = all.findIndex((c) => c.id === current.id);
  if (idx === -1) return undefined;
  return all[(idx + 1) % all.length];
}

export function uniqueCategories(all: CaseEntry[], locale: Locale): string[] {
  const set = new Set(all.map((c) => localeContent(c, locale).category));
  return Array.from(set);
}

export function caseSearchBlob(entry: CaseEntry, locale: Locale): string {
  const loc = localeContent(entry, locale);
  return [
    loc.title,
    loc.summary,
    loc.whyItWorks,
    entry.data.connectors.join(' '),
    entry.data.source.authorHandle,
    entry.data.source.authorName,
    entry.data.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase();
}
