import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(_context: APIContext) {
  const articles = await getCollection('articles');
  const siteURL = 'https://weken.news';
  const now = new Date().toISOString();

  const staticPages = [
    { url: siteURL, priority: '1.0', changefreq: 'weekly' },
    { url: `${siteURL}/about`, priority: '0.9', changefreq: 'monthly' },
    { url: `${siteURL}/articles`, priority: '0.8', changefreq: 'weekly' },
    { url: `${siteURL}/ai`, priority: '0.8', changefreq: 'weekly' },
    { url: `${siteURL}/scenarios`, priority: '0.8', changefreq: 'weekly' },
    { url: `${siteURL}/topics`, priority: '0.9', changefreq: 'weekly' },
    { url: `${siteURL}/topics/aeo`, priority: '0.8', changefreq: 'weekly' },
    { url: `${siteURL}/topics/claude-code`, priority: '0.8', changefreq: 'weekly' },
    { url: `${siteURL}/topics/ai-cost-perf`, priority: '0.8', changefreq: 'weekly' },
    { url: `${siteURL}/topics/debug-integration`, priority: '0.8', changefreq: 'weekly' },
    { url: `${siteURL}/topics/line-bot-automation`, priority: '0.8', changefreq: 'weekly' },
    { url: `${siteURL}/case-studies`, priority: '0.8', changefreq: 'monthly' },
    { url: `${siteURL}/positioning`, priority: '0.7', changefreq: 'monthly' },
    { url: `${siteURL}/stats`, priority: '0.6', changefreq: 'daily' },
  ];

  const articlePages = articles
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map(article => ({
      url: `${siteURL}/articles/${article.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: (article.data.updatedDate || article.data.pubDate).toISOString(),
    }));

  const allPages = [...staticPages, ...articlePages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod || now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
