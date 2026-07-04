// IndexNow 通知腳本:把最近發布/更新的文章網址提交給 api.indexnow.org
// (Bing / Copilot / ChatGPT search 端的索引都吃這個協定;Google 不吃,Google 走 GSC)
//
// 執行時機:
// - Vercel production build 完自動跑(package.json build script 串接)。
//   build 當下新頁面還沒上線,但 IndexNow 是「通知後排程來爬」,幾分鐘的時間差沒有影響。
// - 手動全量提交(第一次啟用時跑一次):node scripts/indexnow-ping.mjs --all
//
// 任何錯誤都不會讓 build 失敗:全部 catch 掉只印 log。

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE = 'https://weken.news';
const KEY = 'a793843a28977d86cc89fa35024e2d66';
const RECENT_DAYS = 10;

const isAll = process.argv.includes('--all');
const isProd = process.env.VERCEL_ENV === 'production';

if (!isAll && !isProd) {
  console.log('[indexnow] 非 production build 且未帶 --all,跳過');
  process.exit(0);
}

try {
  const articlesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'articles');
  const files = (await readdir(articlesDir)).filter(f => f.endsWith('.md'));

  const urls = [];
  const now = Date.now();

  for (const file of files) {
    const raw = await readFile(path.join(articlesDir, file), 'utf8');
    const pub = raw.match(/^pubDate:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    const upd = raw.match(/^updatedDate:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    const latest = upd || pub;
    if (!latest) continue;

    const ageDays = (now - new Date(latest).getTime()) / 86400000;
    if (isAll || ageDays <= RECENT_DAYS) {
      urls.push(`${SITE}/articles/${file.replace(/\.md$/, '')}`);
    }
  }

  if (urls.length === 0) {
    console.log('[indexnow] 近期無新文章,不提交');
    process.exit(0);
  }

  // 有新文章時,列表頁與首頁也一併通知
  urls.push(`${SITE}/`, `${SITE}/articles`);

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: 'weken.news',
      key: KEY,
      keyLocation: `${SITE}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  console.log(`[indexnow] 提交 ${urls.length} 個網址,HTTP ${res.status}`);
} catch (e) {
  console.log('[indexnow] 提交失敗(不影響 build):', e?.message || e);
}
process.exit(0);
