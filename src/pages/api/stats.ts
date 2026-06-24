export const prerender = false;

import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';

export const GET: APIRoute = async ({ url }) => {
  try {
    const redis = new Redis({
      url: import.meta.env.UPSTASH_REDIS_REST_URL?.trim(),
      token: import.meta.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
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

    // 真人訪客：只有帶正確 key 才回（預設只有站長看得到），其他人只看到爬蟲數據
    const authed = !!import.meta.env.STATS_KEY && url.searchParams.get('key') === import.meta.env.STATS_KEY;
    let human: { total: number; today: number; topPages: Record<string, number> } | null = null;
    if (authed) {
      const [hTotal, hToday, hPageKeys] = await Promise.all([
        redis.get<number>('wkn:human:total'),
        redis.get<number>(`wkn:human:daily:${today}`),
        redis.keys('wkn:human:page:*'),
      ]);
      const hPages: Record<string, number> = {};
      if (hPageKeys.length > 0) {
        const hCounts = await Promise.all(hPageKeys.map((k) => redis.get<number>(k)));
        hPageKeys.forEach((key, i) => {
          hPages[key.replace('wkn:human:page:', '')] = hCounts[i] || 0;
        });
      }
      human = {
        total: hTotal || 0,
        today: hToday || 0,
        topPages: Object.entries(hPages)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>),
      };
    }

    return new Response(JSON.stringify({
      total: total || 0,
      today: todayCount || 0,
      bots,
      topPages,
      human,
      updatedAt: new Date().toISOString(),
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
