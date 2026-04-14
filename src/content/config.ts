import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // AEO: direct answer summary for AI extraction
    directAnswer: z.string(),
    // AEO: FAQ pairs for FAQ Schema
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).default([]),
    // AEO: HowTo steps (optional)
    howToSteps: z.array(z.object({
      name: z.string(),
      text: z.string(),
    })).optional(),
    // AEO: speakable section IDs
    speakableSections: z.array(z.string()).default(['article-summary', 'article-conclusion']),
  }),
});

export const collections = { articles };
