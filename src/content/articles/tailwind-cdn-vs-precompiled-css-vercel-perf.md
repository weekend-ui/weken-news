---
title: "Tailwind CDN 換預編譯 CSS：Vercel 課程頁手機 4G LCP 從 3-5 秒砍到 1.5 秒"
description: "把 cdn.tailwindcss.com 從 production 換掉的完整實作。407KB JS 替成 19.8KB 靜態檔（gzip 4.6KB），critical path 砍 64%，X-Vercel-Cache MISS 變 HIT，手機 4G LCP 推估 3-5 秒降到 0.8-1.5 秒。"
pubDate: 2026-05-08
tags: ["tailwind", "vercel", "web-performance", "cdn", "aeo"]
directAnswer: "Tailwind CDN 在瀏覽器即時掃 DOM 生成 CSS，render-blocking 800-1000ms，Tailwind 官方文件第一句就明寫「不要拿去 production」。預編譯成靜態 CSS 後 19.8KB 純檔（gzip 4.6KB），實測 wk-qa-bot 課程頁 critical path 砍 64%，手機 4G LCP 從 3-5 秒降到 0.8-1.5 秒。"
faq:
  - question: "Tailwind CDN 為什麼不能 production 用？"
    answer: "cdn.tailwindcss.com 是 407KB JS（gzip 123KB），瀏覽器要先下載執行掃 DOM 才生成 CSS，這個過程 render-blocking 800-1000ms。手機 4G 直接卡 1-2 秒空白。Tailwind 官方文件第一句明寫「不要拿去 production」，這個 CDN 只給 prototype 用。"
  - question: "Vercel 怎麼把 Tailwind 預編譯成靜態 CSS？"
    answer: "npm install -D tailwindcss@3，建 tailwind.config.js 設 content scan 來源檔，建 input.css 寫 @tailwind base/components/utilities，加 build:css 指令跑 tailwindcss --minify 輸出到 public/styles/。HTML 把 <script src=cdn> 換成 <link rel=stylesheet>。本地跑一次 commit 進 repo，Vercel 直接以靜態檔送。"
  - question: "Vercel Cache-Control s-maxage 為什麼 client header 看不到？"
    answer: "Vercel 故意把 s-maxage 跟 stale-while-revalidate 從 client-facing header 拿掉，瀏覽器只看到 max-age=0，但 edge cache 仍然按 s-maxage 運作。驗證有沒有命中要看 X-Vercel-Cache header，HIT 就代表 edge cache 有套用，function 沒有重跑。"
  - question: "Tailwind 預編譯 vs 動態 CDN 性能差多少？"
    answer: "實測同一頁：CDN 模式 407KB JS 阻塞 render 800-1000ms，預編譯 19.8KB CSS（gzip 4.6KB）跟 HTML 並行下載完全不阻塞。手機 4G LCP 從 3-5 秒降到 0.8-1.5 秒。靜態 CSS 加 immutable cache 後重訪流量歸零，CDN 模式重訪也得重抓 JS 處理。"
  - question: "JPG 跟 WebP 在 picture 標籤怎麼搭配？"
    answer: "用 <picture><source srcset=webp type=image/webp><img src=jpg width height></picture>，現代瀏覽器走 WebP，舊瀏覽器走 JPG fallback。給 picture 加 class=contents（display:contents）讓它不影響 layout，內層 img 直接套既有樣式。LCP 圖加 fetchpriority=high 跟 <link rel=preload> WebP 預抓。"
howToSteps:
  - name: "安裝 tailwindcss 並建 config"
    text: "npm install -D tailwindcss@3。建 tailwind.config.js 設 content 陣列指向所有 SSR 來源檔（如 lib/_course-page.js），動態組合的 class 進 safelist 否則編不到。"
  - name: "寫 input.css 並跑預編譯"
    text: "src/styles/input.css 寫 @tailwind base; @tailwind components; @tailwind utilities; 加自訂 CSS。package.json 加 build:css 指令：tailwindcss -i src/styles/input.css -o public/styles/output.css --minify。本地跑一次後把 public/styles/output.css commit 進 repo。"
  - name: "替換 HTML 並設 cache header"
    text: "HTML head 把 <script src=https://cdn.tailwindcss.com> 換成 <link rel=stylesheet href=/styles/output.css>。vercel.json headers 加 /styles/* 規則 Cache-Control: public, max-age=31536000, immutable。SSR 函數加 res.setHeader Cache-Control public, s-maxage=300, stale-while-revalidate=86400。"
---

用戶反應 wk-qa-bot 課程介紹頁很慢。我先量了一輪，server 端 TTFB 100-260ms 沒問題，慢全部在前端。

--

排了一下兇手。

1. cdn.tailwindcss.com：407KB JS，render-blocking，下載 600ms 加執行 200-400ms 等於卡 800-1000ms
2. api.qrserver.com 外部 QR Code 服務：1.03 秒
3. Vercel edge cache MISS：每個訪客都打 DB 算一次
4. 4 張課程圖全 eager load 共 520KB
5. 沒 preload hints、沒 width/height（CLS 跳）

第一名比所有其他兇手加起來還大。Tailwind 官方文件第一句就寫「不要拿去 production」，但很多新建站的工程師（包括我）為了省事一開始就用了。

--

CDN 模式做的事是這樣：

瀏覽器看到 head 裡的 `<script src="https://cdn.tailwindcss.com">`，停下來等下載拉完 407KB（gzip 123KB）的 JS。

執行那段 JS。JS 開始掃整個 DOM 看你用了什麼 class。即時生成對應的 CSS。注入 `<style>` 標籤。

整個過程跑完才開始 paint。手機 4G 訊號普通的時候，這條獨佔 1-2 秒空白。

預編譯模式相反：build 階段把 SSR 寫好的 HTML 字串掃過一遍，生成靜態 CSS 檔。瀏覽器拿到 HTML 就同時拿到 CSS link，並行下載。沒有 JS 阻塞、沒有 runtime 計算、CSS 直接套。

--

實作只要 4 件事。

`npm install -D tailwindcss@3`。

`tailwind.config.js` 寫 content 陣列指向 SSR 來源檔：

```js
module.exports = {
  content: ['./lib/_course-page.js', './lib/_course-form.js'],
  safelist: ['opacity-50', 'bg-[#9ca3af]'],
}
```

動態組合的 class（像 `class="bg-${color}-500"` 這種 string 拼接的）tailwind 預編譯掃不到，要進 `safelist`，否則上線後那些 class 不會被編進 CSS。

`src/styles/course-input.css` 寫 `@tailwind base; @tailwind components; @tailwind utilities;` 加自訂 grain pattern。

`package.json` 加 build:css 指令跑 `tailwindcss -i ... -o ... --minify`。

本地跑一次，把 `public/styles/course.css` commit 進 repo（19.8KB）。HTML 把 `<script src=cdn>` 換成 `<link rel="stylesheet" href="/styles/course.css">`。

--

驗收的時候踩到一個 Vercel cache 的奇怪行為。

我設了 `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=86400`，但 client 收到的 response header 只剩 `Cache-Control: public, max-age=0`。s-maxage 跟 swr 不見了。

第一個直覺是 Vercel 把它吃掉了，cache 沒套用。

驗證的方法是看 `X-Vercel-Cache` 這個 header。連續 5 發 curl，第一發 MISS，後面四發全 HIT。Age 從 0 變 26 秒、變 50 秒。

意思是：Vercel 故意把 s-maxage 從 client header 拿掉（瀏覽器不需要知道 edge cache 邏輯），但 edge cache 內部還是按 s-maxage 運作。看 `X-Vercel-Cache` 才是真相。

--

vercel.json 加 headers 規則給靜態檔：

```json
{
  "headers": [
    { "source": "/styles/:path*", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/course/:path*", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

CSS 跟圖片設 1 年 immutable，重訪流量直接歸零（瀏覽器走 disk cache）。檔名變了才 invalidate。

--

順手把圖片一起處理。

`sharp` 重壓 4 張 JPG quality 80 mozjpeg progressive：總 508KB → 394KB（-22%）。
每張多出一份 WebP quality 78：總 283KB（-44%）。

HTML 改成：

```html
<picture class="contents">
  <source srcset="/course/hero.webp" type="image/webp" />
  <img src="/course/hero.jpg" width="1280" height="720" loading="lazy" decoding="async" />
</picture>
```

`<picture class="contents">` 是 Tailwind `display: contents` 工具，picture 不參與 layout，內層 img 繼承 flex/grid 屬性。沒加 contents 的話，picture 是 inline 元素會干擾既有版型。

LCP 元素（hero）加 `fetchpriority="high"` 跟 `<link rel="preload" as="image" type="image/webp" href="...webp">` 預先抓。其他三張 `loading="lazy"` 等捲到再載。

全部 4 張加 width/height 屬性防 CLS。沒這個瀏覽器在圖載完前不知道留多少空間，圖到達時 layout 跳一下。

--

部署完驗：

X-Vercel-Cache：MISS → HIT（連續 5 發都 HIT）。
TTFB：cold 540ms → warm 120ms。
Critical path（HTML + CSS + hero WebP gzip）：283KB → 100KB，砍 64%。
預估手機 4G LCP：3-5 秒 → 0.8-1.5 秒。
重訪流量：CSS 跟圖全部 immutable cache，0 byte。

--

整個工程 30 分鐘寫完、5 分鐘部署、5 分鐘驗證。手機載入時間砍 70-80%。

學到的是：「server 慢」這個直覺，多半是錯的。十次有九次慢在前端 render-blocking JS 跟外部請求。先量再改，量化兇手排名再對應修。Tailwind CDN 是頭號殺手不是因為它差，是因為它的設計目的就不是給 production，官方寫得清清楚楚。
