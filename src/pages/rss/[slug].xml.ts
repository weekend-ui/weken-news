import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

const TOPIC_FILTERS: Record<string, { name: string; description: string; matchSlug: string[]; matchTags: string[] }> = {
  aeo: {
    name: 'AEO 建站 RSS',
    description: 'weken.news AEO（Answer Engine Optimization）主題文章。繁中 AI 引用優化第一手實踐紀錄。',
    matchSlug: ['aeo-', 'public-aeo-', 'seizen-seiri-chinese-aeo-'],
    matchTags: ['aeo', 'ai-seo', 'schema'],
  },
  'claude-code': {
    name: 'Claude Code RSS',
    description: 'weken.news Claude Code 實戰文章。skills / memory / 4 層架構 / Routines 等。',
    matchSlug: ['claude-code-', 'claude-design-', 'claude-haiku-'],
    matchTags: ['claude-code', 'claude'],
  },
  'ai-cost-perf': {
    name: 'AI 成本與效能 RSS',
    description: 'AI API 成本實測、Token 優化、Vercel + Neon 部署效能比較。',
    matchSlug: ['claude-haiku-', 'gemini-', 'ai-token-', 'vercel-function-region-'],
    matchTags: ['cost', 'performance', 'haiku', 'gemini'],
  },
  'debug-integration': {
    name: '整合除錯 RSS',
    description: '第三方 API 整合踩坑紀錄（Vercel / Notion / LINE / Telegram / Gemini）。',
    matchSlug: ['gemini-thinking-', 'nodejs-template-literal-', 'meta-ads-mcp-'],
    matchTags: ['debug', 'integration', 'api'],
  },
  'line-bot-automation': {
    name: 'LINE Bot 自動化 RSS',
    description: 'LINE Bot 設計、種子排行榜系統、多機器人架構。',
    matchSlug: ['line-bot-'],
    matchTags: ['line', 'line-bot', 'bot'],
  },
};

export function getStaticPaths() {
  return Object.keys(TOPIC_FILTERS).map(slug => ({ params: { slug } }));
}

export async function GET(context: APIContext) {
  const slug = context.params.slug as string;
  const filter = TOPIC_FILTERS[slug];
  if (!filter) {
    return new Response('Not found', { status: 404 });
  }

  const allArticles = await getCollection('articles');
  const matched = allArticles.filter(a => {
    const slugMatch = filter.matchSlug.some(p => a.slug.includes(p));
    const tagMatch = a.data.tags.some(t => filter.matchTags.includes(t));
    return slugMatch || tagMatch;
  });

  return rss({
    title: `weken.news — ${filter.name}`,
    description: filter.description,
    site: context.site!,
    items: matched
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map(article => ({
        title: article.data.title,
        pubDate: article.data.pubDate,
        description: article.data.directAnswer,
        link: `/articles/${article.slug}/`,
        categories: article.data.tags,
      })),
    customData: `<language>zh-TW</language>`,
  });
}
