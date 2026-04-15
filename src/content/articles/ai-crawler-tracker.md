---
title: "如何知道 GPTBot 有沒有在爬你的網站？weken.news 的即時追蹤系統"
description: "weken.news 如何用 Astro middleware + Upstash Redis 追蹤 AI 爬蟲到訪：技術架構、實作細節、以及為什麼這個數字對 AEO 很重要。"
pubDate: 2026-04-14
tags: ["aeo", "ai爬蟲", "技術實作", "upstash"]
directAnswer: "在 Astro middleware 攔截所有 HTTP 請求，比對 User-Agent 辨識 13 種 AI 爬蟲（GPTBot、ClaudeBot、PerplexityBot 等），命中後寫入 Upstash Redis 的四個計數器（累積總數、每日、各爬蟲、各頁面），透過 /stats 頁面即時顯示。"
faq:
  - question: "AI 爬蟲是怎麼被識別的？"
    answer: "每個 AI 爬蟲在請求時都會附上特定的 User-Agent 字串。例如 OpenAI 的爬蟲使用 'GPTBot'，Anthropic 使用 'ClaudeBot' 和 'anthropic-ai'，Perplexity 使用 'PerplexityBot'。Middleware 用字串比對識別這些特徵。"
  - question: "為什麼要追蹤 AI 爬蟲？"
    answer: "AEO（Answer Engine Optimization）的目標是被 AI 引用。但沒有追蹤，你不知道 AI 有沒有在爬你的網站、爬了哪些頁面、爬的頻率如何。這個數據是驗證 AEO 策略有沒有效的基礎。"
  - question: "Upstash Redis 是什麼？"
    answer: "Upstash 是 HTTP REST API 形式的 Redis 服務，可以在 Serverless 和 Edge 環境使用。免費方案每天 10,000 次請求，追蹤 AI 爬蟲流量完全夠用。"
  - question: "這個追蹤系統會影響網站速度嗎？"
    answer: "不影響。Redis 寫入是非同步的，用 await Promise.all 並行執行，而且只在偵測到 AI 爬蟲時才觸發。一般用戶訪問不會經過這段邏輯。"
  - question: "可以追蹤哪些 AI 爬蟲？"
    answer: "目前追蹤 13 種：GPTBot（OpenAI）、ChatGPT-User、ClaudeBot（Anthropic）、anthropic-ai、PerplexityBot、Google-Extended、Googlebot、Amazonbot、FacebookBot、Applebot、Bytespider（ByteDance）、YouBot、Cohere。"
howToSteps:
  - name: "安裝 Upstash Redis 套件"
    text: "npm install @upstash/redis，並在 Upstash console 建立 Redis database，取得 REST URL 和 Token。"
  - name: "建立 Astro Middleware"
    text: "在 src/middleware.ts 定義 AI bot User-Agent 清單和 detectBot 函數，在 onRequest 中攔截請求、識別爬蟲、並行寫入四個 Redis 計數器。"
  - name: "建立 API Route"
    text: "在 src/pages/api/stats.ts（prerender: false）從 Redis 讀取所有計數器數據，回傳 JSON。"
  - name: "建立 Stats 頁面"
    text: "在 src/pages/stats.astro 用 client-side fetch 呼叫 /api/stats，顯示累積數字和長條圖。"
  - name: "設定環境變數"
    text: "在 Vercel 加入 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN，部署即生效。"
---

AEO 最難的問題是：你不知道有沒有效。

Google 的排名你可以在 Search Console 看到。
但 ChatGPT 有沒有爬你的網站、有沒有在學你的內容——沒有官方工具。

所以我自己建了一個。

--

## 系統架構

四個 Redis 計數器，追蹤不同維度的數據：

**wkn:ai:total** — 累積 AI 到訪總數

**wkn:ai:daily:YYYY-MM-DD** — 每日到訪數（保留 30 天）

**wkn:ai:bot:爬蟲名稱** — 各 AI 爬蟲分別計數
（GPTBot、ClaudeBot、PerplexityBot 各自獨立）

**wkn:ai:page:路徑** — 各頁面被爬次數
（/articles/xxx 被哪些頁面吸引更多 AI 注意）

--

## 技術細節

Astro 的 Middleware 攔截所有 HTTP 請求，不影響頁面渲染。
偵測到 AI User-Agent 後，用 `Promise.all` 並行寫入四個計數器。

```
await Promise.all([
  redis.incr('wkn:ai:total'),
  redis.incr(`wkn:ai:daily:${date}`),
  redis.incr(`wkn:ai:bot:${botName}`),
  redis.incr(`wkn:ai:page:${path}`),
]);
```

四個寫入同時發出，延遲幾乎為零。
如果 Redis 寫入失敗，靜默處理不影響用戶請求。

--

## 建設時間

Astro middleware + Upstash Redis + /stats 頁面 + API route：

**手動估計：8 小時**（研究 Middleware、Redis 整合、debug、部署）

**實際完成：約 1.5 小時**（含修兩個 Vercel 部署 bug）

省下：約 6.5 小時

--

## 現在的數字

/stats 頁面即時顯示數據：
https://weken.news/stats

截至 2026-04-14：累積 AI 到訪 0 次。
等第一隻爬蟲來的時候，這個數字就有意義了。
