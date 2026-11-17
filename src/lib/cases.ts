import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../config/site';

export type CaseEntry = CollectionEntry<'cases'>;

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

const difficultyLabels: Record<Difficulty, Record<Locale, string>> = {
  beginner: { en: 'Beginner', zh: '入门' },
  intermediate: { en: 'Intermediate', zh: '进阶' },
  advanced: { en: 'Advanced', zh: '高级' },
};

export function difficultyLabel(difficulty: Difficulty, locale: Locale): string {
  return difficultyLabels[difficulty][locale];
}

/** Short tag for an editorial setup-time estimate. Not a claim from the source post. */
export function setupTimeLabel(minutes: number, locale: Locale): string {
  return locale === 'zh' ? `搭建 ${minutes} 分钟` : `${minutes} min setup`;
}

export async function getAllCases(): Promise<CaseEntry[]> {
  const cases = await getCollection('cases');
  return cases.sort((a, b) => a.data.order - b.data.order);
}

/**
 * Homepage "Start here" picks.
 *
 * A case is included only when `startHereRank` is a positive integer and
 * `startHereBlurb` has non-empty `en` and `zh` text. Anything else is skipped.
 * An empty result is valid: the homepage renders no section.
 */
export function selectStartHereCases(cases: CaseEntry[]): CaseEntry[] {
  return cases
    .filter((entry) => {
      const rank = entry.data.startHereRank;
      const blurb = entry.data.startHereBlurb;
      if (typeof rank !== 'number' || !Number.isInteger(rank) || rank <= 0) return false;
      if (!blurb) return false;
      return blurb.en.trim().length > 0 && blurb.zh.trim().length > 0;
    })
    .sort((a, b) => {
      const byRank = (a.data.startHereRank ?? 0) - (b.data.startHereRank ?? 0);
      if (byRank !== 0) return byRank;
      return a.data.order - b.data.order;
    });
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
 *   is non-empty after trim. That string is the copyable prompt. A
 *   `publicTemplate` link is not a prompt and does not increment this count.
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
    entry.data.difficulty
      ? `${entry.data.difficulty} ${difficultyLabel(entry.data.difficulty, locale)}`
      : '',
    entry.data.setupMinutes
      ? `${entry.data.setupMinutes} ${setupTimeLabel(entry.data.setupMinutes, locale)}`
      : '',
  ]
    .join(' ')
    .toLowerCase();
}
