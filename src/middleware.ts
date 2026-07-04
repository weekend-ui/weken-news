import { defineMiddleware } from 'astro:middleware';
import { Redis } from '@upstash/redis';

// AI crawler User-Agent patterns
// 子字串比對按插入順序取第一個命中,較特定的 pattern 必須排在較短的前面
// (如 Applebot-Extended 要在 Applebot 前,否則永遠被 Applebot 吃掉)
// 2026-07-04 對齊 OpenAI / Anthropic 官方爬蟲清單:
// 補檢索型爬蟲(OAI-SearchBot / Claude-SearchBot 是「會不會被引用」的前導指標)
// 移除已停用的 anthropic-ai 與傳統搜尋的 Googlebot(Google 端看 GSC,不混進 AI 統計)
const AI_BOTS: Record<string, string> = {
  // OpenAI
  'OAI-SearchBot': 'OAI-SearchBot',
  'ChatGPT-User': 'ChatGPT',
  'GPTBot': 'GPTBot',
  // Anthropic(2026 現行:ClaudeBot 訓練 / Claude-User 對話抓頁 / Claude-SearchBot 檢索)
  'Claude-SearchBot': 'Claude-SearchBot',
  'Claude-User': 'Claude-User',
  'ClaudeBot': 'Claude',
  // Perplexity
  'Perplexity-User': 'Perplexity-User',
  'PerplexityBot': 'Perplexity',
  // Google AI
  'Google-Extended': 'Google-Extended',
  // Bing(索引直接餵 Copilot 與 ChatGPT search)
  'bingbot': 'Bingbot',
  // Meta
  'Meta-ExternalAgent': 'Meta-ExternalAgent',
  'meta-externalfetcher': 'Meta-ExternalFetcher',
  'FacebookBot': 'Facebook',
  // Apple
  'Applebot-Extended': 'Applebot-Extended',
  'Applebot': 'Apple',
  // 其他
  'Amazonbot': 'Amazon',
  'Bytespider': 'Bytespider',
  'YouBot': 'YouBot',
  'cohere-ai': 'Cohere',
  'DuckAssistBot': 'DuckAssist',
  'MistralAI-User': 'Mistral',
  'CCBot': 'CCBot',
};

function detectBot(userAgent: string): string | null {
  const ua = userAgent.toLowerCase();
  for (const [pattern, name] of Object.entries(AI_BOTS)) {
    if (ua.includes(pattern.toLowerCase())) return name;
  }
  return null;
}

function getTaiwanDate(): string {
  return new Date().toLocaleDateString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-');
}

export const onRequest = defineMiddleware(async (context, next) => {
  const userAgent = context.request.headers.get('user-agent') || '';
  const botName = detectBot(userAgent);
  const path = new URL(context.request.url).pathname;

  // /api/* 不是內容頁,不計入(避免會跑 JS 的爬蟲打 /api/track 污染 topPages)
  if (botName && !path.startsWith('/api/')) {
    try {
      const redis = new Redis({
        url: import.meta.env.UPSTASH_REDIS_REST_URL?.trim(),
        token: import.meta.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
      });
      const date = getTaiwanDate();

      // Fire all increments in parallel
      await Promise.all([
        redis.incr('wkn:ai:total'),
        redis.incr(`wkn:ai:daily:${date}`),
        redis.incr(`wkn:ai:bot:${botName}`),
        redis.incr(`wkn:ai:page:${path}`),
      ]);

      // Set expiry on daily key (30 days)
      redis.expire(`wkn:ai:daily:${date}`, 60 * 60 * 24 * 30);
    } catch {
      // Fail silently — never block the request
    }
  }

  return next();
});
