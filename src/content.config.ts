import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const localeContent = z
  .object({
    title: z.string(),
    category: z.string(),
    summary: z.string(),
    whyItWorks: z.string(),
    workflowSteps: z.array(z.string()).min(3).max(5),
    // Copyable prompt. Omit when publicTemplate is set. Existing cases keep
    // a non-empty string and do not set publicTemplate, so their pages stay
    // on the copy-prompt block.
    promptTemplate: z.string().optional(),
    // Public template entry. Rendered as a link, never as a copyable prompt.
    // Use this when the reusable artifact is a template URL and there is no
    // source prompt to copy. Do not invent a promptTemplate fallback.
    publicTemplate: z
      .object({
        url: z.string().url(),
        title: z.string().min(1),
      })
      .optional(),
    connectorsAndRoutines: z.string(),
    // Optional. Absent or empty renders no step-by-step setup on the case page.
    setupSteps: z
      .array(
        z.object({
          title: z.string(),
          detail: z.string().optional(),
        })
      )
      .optional(),
    // Optional. Absent or empty renders no checklist on the case page.
    acceptanceChecklist: z.array(z.string()).optional(),
  })
  .superRefine((value, ctx) => {
    const prompt = (value.promptTemplate ?? '').trim();
    const hasTemplate = Boolean(value.publicTemplate);
    if (prompt && hasTemplate) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Use either a copyable promptTemplate or a publicTemplate link, not both.',
        path: ['publicTemplate'],
      });
    }
    if (!prompt && !hasTemplate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide a non-empty promptTemplate or a publicTemplate link.',
        path: ['promptTemplate'],
      });
    }
  });

const cases = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/cases' }),
  schema: z.object({
    slug: z.string(),
    publishedAt: z.string(),
    order: z.number(),
    tags: z.array(z.string()),
    connectors: z.array(z.string()),
    // Optional editorial estimates. Not claims from the source post.
    // Absent fields render no tag and do not fail the build.
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    setupMinutes: z.number().int().positive().optional(),
    // Optional homepage "Start here" placement. A case appears only when both
    // are set: a positive rank (ascending) and a non-empty EN + ZH blurb.
    // Absent or incomplete fields omit that case and do not fail the build.
    // When no case qualifies, the homepage section is not rendered.
    startHereRank: z.number().int().positive().optional(),
    startHereBlurb: z
      .object({
        en: z.string().min(1),
        zh: z.string().min(1),
      })
      .optional(),
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
