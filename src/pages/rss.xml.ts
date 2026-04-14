import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles');
  return rss({
    title: 'weken.news — 週末哥的第一手數據記錄',
    description: '台灣電商 × AI 自動化 × Meta 廣告的真實操作數字',
    site: context.site!,
    items: articles
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
