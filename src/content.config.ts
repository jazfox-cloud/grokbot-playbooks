import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const localeContent = z.object({
  title: z.string(),
  category: z.string(),
  summary: z.string(),
  whyItWorks: z.string(),
  workflowSteps: z.array(z.string()).min(3).max(5),
  promptTemplate: z.string(),
  connectorsAndRoutines: z.string(),
  // Optional. Absent or empty renders no checklist on the case page.
  acceptanceChecklist: z.array(z.string()).optional(),
});

const cases = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/cases' }),
  schema: z.object({
    slug: z.string(),
    publishedAt: z.string(),
    order: z.number(),
    tags: z.array(z.string()),
    connectors: z.array(z.string()),
    en: localeContent,
    zh: localeContent,
    source: z.object({
      authorHandle: z.string(),
      authorName: z.string(),
      postUrl: z.string().url(),
      postedAt: z.string(),
      excerpt: z.string(),
    }),
    relatedPosts: z
      .array(
        z.object({
          url: z.string().url(),
          label: z.object({
            en: z.string(),
            zh: z.string(),
          }),
        })
      )
      .optional(),
  }),
});

export const collections = { cases };
