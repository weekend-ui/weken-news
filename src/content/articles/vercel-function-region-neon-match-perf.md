---
title: "Vercel function 預設跑在美東：把它搬到新加坡配對 Neon 後，部署速度從 523ms 降到 93ms"
description: "最近在優化兩個用 Vercel + Neon 的專案，發現 SSR 慢得離譜。實測 X-Vercel-Id 才看到 Vercel function 預設跑在 iad1（華盛頓 DC），但 DB 在新加坡 ap-southeast-1，每次 query 跨太平洋來回 250ms。雙刀流 region 配對 + edge cache，實測首頁從 523ms 降到 93ms，5.6 倍速。完整 SOP 和對照表寫在這。"
pubDate: 2026-04-25
tags: ["vercel", "neon", "serverless", "效能優化", "部署"]
directAnswer: "Vercel function 預設跑在美東 iad1，如果 DB 在亞太 region，每次 SSR 跨太平洋查 DB 多吃 250ms 純網路延遲。改 vercel.json 加 regions 配對 DB region，加上首頁 60 秒 edge cache 雙刀流，實測首頁 SSR warm 從 523ms 降到 93ms，5.6 倍速。任何 Vercel + serverless DB 部署都該跑這個 SOP。"
faq:
  - question: "Vercel function 預設跑在哪個 region？"
    answer: "iad1，華盛頓 DC。所有新 Vercel project 沒設定的話都跑這裡。如果 DB 在歐洲或亞洲，每次 SSR 都跨海來回，光網路延遲就吃 100-250ms。多數人不知道這個預設值不一定適合自己。"
  - question: "怎麼確認 Vercel function 跑在哪個 region？"
    answer: "用 curl 打任何 API 或 SSR 頁面，看 X-Vercel-Id header：`curl -I https://your-site.vercel.app/api/xxx`。回傳格式是 `edge-node::function-region::id`，例如 `hkg1::iad1::xxx` 代表 CDN 在香港但 function 跑美東。看到 function region 跟 DB 不同洲就要動。"
  - question: "vercel.json 怎麼設 region？要對應哪個 Vercel region？"
    answer: "建/改 root vercel.json：`{ \"regions\": [\"sin1\"] }`。對照表：Neon ap-southeast-1（新加坡）→ Vercel sin1，ap-northeast-1（東京）→ hnd1，ap-east-1（香港）→ hkg1，us-east-1 → iad1，eu-central-1 → fra1。Hobby plan 限單一 region，Pro plan 可多 region。"
  - question: "SSR 頁面加 edge cache 會有副作用嗎？"
    answer: "會。加 `Cache-Control: public, s-maxage=60` 後，業主在後台改設定要等最多 60 秒前台才反映。對「不太常變動」的頁面（首頁、about、產品介紹）這 trade-off 可接受。但需要立刻反映寫入的頁面（後台、結帳）千萬不要加 cache。"
  - question: "換 Neon driver 從 Pool 到 neon() HTTP-based 有差嗎？"
    answer: "有。Pool 是 WebSocket-based，serverless cold start 要建 WS 連線多 200-500ms。neon() 是 HTTP-based，每次 query 用 fetch 沒有連線開銷，serverless 友善。實測一個專案改完 cold start 額外省 200-300ms。code 改動：`import { neon } from '@neondatabase/serverless'; const sql = neon(url)`，再把 `pool.query()` 全部換成 `sql.query()`。"
howToSteps:
  - name: "抓 X-Vercel-Id 確認 function region"
    text: "curl -I https://your-site.vercel.app/api/xxx 看 X-Vercel-Id 第二段（edge::function::id）。如果是 iad1 就要動，如果已經跟 DB 同 region 就不用做。"
  - name: "抓 DB region"
    text: "vercel env pull .env.production.local --environment=production --yes，grep DATABASE_URL 看 host 含的 region 字串（例如 ap-southeast-1）。看完記得 rm 那個 .env 檔，內含敏感連線字串。"
  - name: "vercel.json 加 regions"
    text: "root vercel.json 加 `\"regions\": [\"對應 vercel region\"]`，部署後再 curl X-Vercel-Id 驗證確實生效。建議同時挑「不太常變動」的 SSR 頁加 `Astro.response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30')`。"
---

最近兩個用 Vercel + Neon 的專案都被嫌慢。一個是個人工作日誌站，一個是顧問案的客戶網站。打開首頁明顯感覺到「載入中」那半秒。

業主問我：「這個怎麼這麼慢？」

完整評估跑下來，發現是一個多數人不會注意的預設值問題。

--

## 第一個診斷：X-Vercel-Id 顯示 function 跑美東

我先用 curl 看 response header：

```
curl -I https://my-site.vercel.app/api/xxx
```

回傳裡有一行：

```
X-Vercel-Id: hkg1::iad1::xxx
```

這個 header 的格式是 `edge-node::function-region::request-id`。

hkg1 是香港邊緣節點（CDN），這個正常，因為訪客從台灣連最近的就是香港 edge。

問題出在 iad1。iad1 是華盛頓 DC，這是 Vercel function 真正執行的地方。所有新建的 Vercel project 預設都跑 iad1，因為 Vercel 公司在美國。

但我的 Neon DB 在新加坡。每次 SSR 跑 DB 查詢的路徑是：

訪客（台灣）→ 香港 edge → 美東 function → 跨太平洋查新加坡 DB → 跨回美東 → 香港 edge → 訪客

光是「美東 function ↔ 新加坡 DB」這一段就吃 250ms 純網路延遲，每次 query 都要付一次。

--

## 第一刀：function 搬到新加坡

vercel.json 加一行：

```json
{
  "regions": ["sin1"]
}
```

部署後再 curl X-Vercel-Id：

```
X-Vercel-Id: hkg1::sin1::xxx
```

function 搬到新加坡跟 DB 同一個 region，DB query 從 250ms 跨海降到 5-20ms 同 region 內。

實測效果：

第一個專案的 API TTFB warm 580ms 降到 200-400ms。
第二個專案首頁 SSR warm 523ms 降到 200-300ms。

但兩個都還沒到我預期的 100ms 以下。

--

## 卡點：cold start 還是慢

實測發現 cold start（function 第一次被叫起來）還是 600-1000ms。

兩個來源：
Vercel function 本身 cold start 200-500ms（拉 image + Node 初始化）
Neon Pool 是 WebSocket based，cold 要建 WS 連線多 200-500ms

第一項沒辦法改（hobby plan 限制）。第二項可以解。

第二個專案的 driver 一開始就是 `neon()` HTTP-based，沒這問題。第一個專案還在用舊的 `Pool`，要改：

```typescript
// 改前
import { Pool } from '@neondatabase/serverless'
const pool = new Pool({ connectionString: url })
const { rows } = await pool.query('SELECT...', [id])

// 改後
import { neon } from '@neondatabase/serverless'
const sql = neon(url)
const rows = await sql.query('SELECT...', [id])
```

API route 全部換完後 cold start 額外省 200-300ms，warm 大致相同（HTTP 沒比 WS 慢）。

--

## 第二刀：首頁加 60 秒 edge cache

雖然 region 配對 + driver 換掉，warm 還是 200-300ms。原因是每次訪客都要打 function + DB，再快也有 baseline。

真正的 game changer 是 edge cache。

首頁的 site_settings 數據多數時候不變動。我加：

```typescript
Astro.response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
```

這個 header 告訴 Vercel edge：「60 秒內所有訪客直接從 edge 回應，不用打 function 也不用打 DB」。

實測：cache 命中時首頁 TTFB 93ms。

副作用：業主在後台改 site_settings 後，前台要等最多 60 秒才反映。對「不太常變動」的頁面這 trade-off 可接受，對需要即時反映的頁面（後台、結帳）千萬不要加 cache。

--

## 雙刀流的最終數字

優化前 vs 優化後：

第一個專案 API：580ms → 200-400ms warm
第二個專案首頁：523ms → 93ms（cache 命中時）

5.6 倍速。訪客體感從「等載入」變「即時」。

--

## 對照表：Neon region 對應 Vercel region

ap-southeast-1（新加坡）→ sin1
ap-northeast-1（東京）→ hnd1
ap-east-1（香港）→ hkg1
us-east-1 → iad1（Vercel 預設）
us-west-2 → pdx1
eu-central-1 → fra1

Supabase / PlanetScale 同樣邏輯，把 DB region 跟 Vercel region 配上就對。

--

## 學到什麼

Vercel function 跑美東是「給美國公司用」的預設值，不是給亞洲用戶的最佳值。多數人開發時不會注意這件事，因為本機跑很快、Vercel 預覽頁也快，等 production 流量起來才發現慢。

部署完成不是收尾，部署完成後立刻 curl X-Vercel-Id 驗 region 配對才是真收尾。每個 Vercel + serverless DB 專案都該跑這個 SOP，不分大小。
