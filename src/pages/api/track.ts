export const prerender = false;

import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';

// 爬蟲 UA（主要擋會跑 JS 的 Googlebot；其他 AI 爬蟲不跑 JS 不會打到這）
const BOT_UA = [
  'gptbot', 'chatgpt-user', 'oai-searchbot', 'claudebot', 'claude-searchbot',
  'anthropic-ai', 'perplexitybot', 'google-extended', 'googlebot', 'bingbot',
  'amazonbot', 'facebookbot', 'meta-externalagent', 'applebot', 'bytespider',
  'youbot', 'cohere-ai', 'bot', 'crawler', 'spider',
];

function isBot(ua: string): boolean {
  const u = ua.toLowerCase();
  return BOT_UA.some((b) => u.includes(b));
}

function getTaiwanDate(): string {
  return new Date()
    .toLocaleDateString('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-');
}

function sanitizePath(p: unknown): string | null {
  if (typeof p !== 'string') return null;
  let path = p.split('?')[0].split('#')[0];
  if (!path.startsWith('/')) return null;
  if (/[\n\r\t]/.test(path)) return null;
  if (path.length > 128) path = path.slice(0, 128);
  return path;
}

export const POST: APIRoute = async ({ request }) => {
  // 一律回 204，不洩漏任何狀態
  const ok = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  try {
    // 來源檢查：只收 weken.news 本站送來的（擋灌數據 + 預覽/本機污染）
    const origin = request.headers.get('origin') || request.headers.get('referer') || '';
    if (!origin.includes('weken.news')) return ok();

    // 過濾爬蟲（真人追蹤要乾淨）
    const ua = request.headers.get('user-agent') || '';
    if (isBot(ua)) return ok();

    const body = (await request.json().catch(() => ({}))) as { path?: unknown };
    const path = sanitizePath(body.path);
    if (!path) return ok();

    const redis = new Redis({
      url: import.meta.env.UPSTASH_REDIS_REST_URL?.trim(),
      token: import.meta.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
    });
    const date = getTaiwanDate();

    await Promise.all([
      redis.incr('wkn:human:total'),
      redis.incr(`wkn:human:daily:${date}`),
      redis.incr(`wkn:human:page:${path}`),
    ]);
    redis.expire(`wkn:human:daily:${date}`, 60 * 60 * 24 * 30);

    return ok();
  } catch {
    return ok();
  }
};
