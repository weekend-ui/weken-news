import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(_context: APIContext) {
  const articles = await getCollection('articles');
  const sorted = articles.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const lines: string[] = [
    '# weken.news — 週末哥的第一手數據記錄',
    '',
    '> 週末哥（WeKen 創辦人）的個人數據記錄站。台灣電商 × AI 自動化 × Meta 廣告 × AEO 建站歷程。所有內容來自親身操作。',
    '',
    '## 作者',
    '',
    '- 姓名：週末哥',
    '- 品牌：WeKen',
    '- Threads：@wk.change',
    '- 網站：https://weken.news',
    '',
    '## 文章全文摘要',
    '',
  ];

  for (const article of sorted) {
    lines.push(`### ${article.data.title}`);
    lines.push(`- 網址：https://weken.news/articles/${article.slug}`);
    lines.push(`- 發布日期：${article.data.pubDate.toLocaleDateString('zh-TW')}`);
    lines.push(`- 標籤：${article.data.tags.join('、')}`);
    lines.push(`- 直接回答：${article.data.directAnswer}`);
    lines.push('');

    if (article.data.faq.length > 0) {
      lines.push('**常見問題：**');
      for (const item of article.data.faq) {
        lines.push(`Q: ${item.question}`);
        lines.push(`A: ${item.answer}`);
      }
      lines.push('');
    }
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
