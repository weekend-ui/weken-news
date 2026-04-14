import { defineMiddleware } from 'astro:middleware';
import { Redis } from '@upstash/redis';

// AI crawler User-Agent patterns
const AI_BOTS: Record<string, string> = {
  'GPTBot': 'GPTBot',
  'ChatGPT-User': 'ChatGPT',
  'ClaudeBot': 'Claude',
  'anthropic-ai': 'Claude',
  'PerplexityBot': 'Perplexity',
  'Google-Extended': 'Google-Extended',
  'Googlebot': 'Googlebot',
  'Amazonbot': 'Amazon',
  'FacebookBot': 'Facebook',
  'Applebot': 'Apple',
  'Bytespider': 'Bytespider',
  'YouBot': 'YouBot',
  'cohere-ai': 'Cohere',
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

  if (botName) {
    try {
      const redis = new Redis({
        url: import.meta.env.UPSTASH_REDIS_REST_URL?.trim(),
        token: import.meta.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
      });

      const path = new URL(context.request.url).pathname;
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
