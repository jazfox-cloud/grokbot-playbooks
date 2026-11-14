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

/**
 * Homepage stats, derived only from the cases collection.
 *
 * - cases: one per collection entry
 * - copyablePrompts: entries whose `en.promptTemplate` or `zh.promptTemplate`
 *   is non-empty. That string is the copyable prompt. The schema has no
 *   separate config field (`localeContent.promptTemplate` in content.config.ts).
 * - connectors: distinct trimmed values of the top-level `connectors` array
 * - authors: distinct `source.authorHandle` values; `source.authorName` is
 *   used only when the handle is blank
 */
export interface CaseLibraryStats {
  cases: number;
  copyablePrompts: number;
  connectors: number;
  authors: number;
}

function filled(value: string | undefined): string {
  return (value ?? '').trim();
}

export function computeCaseLibraryStats(cases: CaseEntry[]): CaseLibraryStats {
  const connectors = new Set<string>();
  const authors = new Set<string>();
  let copyablePrompts = 0;

  for (const entry of cases) {
    const { en, zh, source } = entry.data;
    if (filled(en.promptTemplate) || filled(zh.promptTemplate)) {
      copyablePrompts += 1;
    }
    for (const name of entry.data.connectors) {
      const trimmed = filled(name);
      if (trimmed) connectors.add(trimmed);
    }
    const author = filled(source.authorHandle) || filled(source.authorName);
    if (author) authors.add(author);
  }

  return {
    cases: cases.length,
    copyablePrompts,
    connectors: connectors.size,
    authors: authors.size,
  };
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
