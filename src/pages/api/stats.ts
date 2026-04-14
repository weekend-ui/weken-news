export const prerender = false;

import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';

export const GET: APIRoute = async () => {
  try {
    const redis = new Redis({
      url: import.meta.env.UPSTASH_REDIS_REST_URL,
      token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
    });

    function getTaiwanDate(): string {
      return new Date().toLocaleDateString('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\//g, '-');
    }

    const today = getTaiwanDate();

    // Fetch all stats in parallel
    const [total, todayCount, botKeys] = await Promise.all([
      redis.get<number>('wkn:ai:total'),
      redis.get<number>(`wkn:ai:daily:${today}`),
      redis.keys('wkn:ai:bot:*'),
    ]);

    // Fetch per-bot counts
    const bots: Record<string, number> = {};
    if (botKeys.length > 0) {
      const botCounts = await Promise.all(botKeys.map(k => redis.get<number>(k)));
      botKeys.forEach((key, i) => {
        const name = key.replace('wkn:ai:bot:', '');
        bots[name] = botCounts[i] || 0;
      });
    }

    // Fetch top pages (up to 10)
    const pageKeys = await redis.keys('wkn:ai:page:*');
    const pages: Record<string, number> = {};
    if (pageKeys.length > 0) {
      const pageCounts = await Promise.all(pageKeys.map(k => redis.get<number>(k)));
      pageKeys.forEach((key, i) => {
        const path = key.replace('wkn:ai:page:', '');
        pages[path] = pageCounts[i] || 0;
      });
    }

    // Sort pages by count desc, take top 10
    const topPages = Object.entries(pages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>);

    return new Response(JSON.stringify({
      total: total || 0,
      today: todayCount || 0,
      bots,
      topPages,
      updatedAt: new Date().toISOString(),
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch stats',
      detail: err instanceof Error ? err.message : String(err),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
