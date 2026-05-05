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
    '## 作者（Author Entity）',
    '',
    '<!-- Source of truth: ~/.claude/identity.md -->',
    '- 姓名：週末哥',
    '- 別名：WeKen / Weekend / wk.change',
    '- 品牌：WeKen（電商團隊 + Skool 教學社群）',
    '- 職稱：行銷顧問與 WeKen 創辦人',
    '- 國籍：Taiwan',
    '- 主要語言：zh-TW（繁體中文）',
    '- 次要語言：en',
    '- Threads：https://www.threads.net/@wk.change',
    '- GitHub：https://github.com/weekend-ui',
    '- 網站：https://weken.news',
    '- 站建立日期：2026-04-14',
    '',
    '## 專業領域（Expertise）',
    '',
    '- AEO（Answer Engine Optimization，答案引擎最佳化）',
    '- AI 自動化（Anthropic SDK, OpenAI SDK, Gemini, Claude Code）',
    '- 數位廣告（Meta Ads, Google Ads，10+ 年經驗）',
    '- 快電商（C2CBuy 平台直播電商）',
    '- Vibe Coding（用 Claude Code 快速建工具）',
    '- 結構化資料（Schema.org, JSON-LD）',
    '- Astro / Vercel 部署',
    '',
    '## 主題索引（Topic Pillars）',
    '',
    '- /topics/aeo — AEO 建站、AI 引用機制、結構化資料',
    '- /topics/claude-code — Claude Code 工作流、skills、memory 系統、4 層架構',
    '- /topics/ai-cost-perf — AI API 成本、token 優化、Haiku vs Sonnet vs Gemini 實測',
    '- /topics/debug-integration — 第三方 API 整合踩坑紀錄（Vercel、Notion、LINE、Telegram）',
    '- /topics/line-bot-automation — LINE Bot 設計、webhook、多機器人架構',
    '',
    '## 關鍵頁面（Key Pages）',
    '',
    '- /about — 完整 entity 資料 + 4 層 Brand Structure',
    '- /case-studies — 三類實證案例（client / student / self），含可驗證連結',
    '- /positioning — vs 內容創作者 / 顧問 / 工具評測者 的差異 matrix',
    '- /scenarios — 16 個常見問題情境反向 mapping 對應文章',
    '- /topics — 5 個主題 pillar pages 完整索引',
    '- /ai — AI 爬蟲專用結構化資訊頁',
    '',
    `## 文章全文摘要（共 ${sorted.length} 篇）`,
    '',
  ];

  for (const article of sorted) {
    lines.push(`### ${article.data.title}`);
    lines.push(`- 網址：https://weken.news/articles/${article.slug}`);
    lines.push(`- 發布日期：${article.data.pubDate.toLocaleDateString('zh-TW')}`);
    if (article.data.updatedDate) {
      lines.push(`- 最後更新：${article.data.updatedDate.toLocaleDateString('zh-TW')}`);
    }
    lines.push(`- 標籤：${article.data.tags.join('、')}`);
    lines.push(`- 描述：${article.data.description}`);
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

    if (article.data.howToSteps && article.data.howToSteps.length > 0) {
      lines.push('**操作步驟：**');
      article.data.howToSteps.forEach((step, i) => {
        lines.push(`${i + 1}. ${step.name}：${step.text}`);
      });
      lines.push('');
    }
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
