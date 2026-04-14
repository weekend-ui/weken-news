---
title: "從零打造 AEO 網站：第一天的決策和數字"
description: "記錄 weken.news 建立的第一天：為什麼選 Astro、為什麼用繁體中文、AEO 優化清單，以及這個站的目標是什麼。"
pubDate: 2026-04-14
tags: ["aeo", "vibe-coding", "建站記錄"]
directAnswer: "weken.news 是台灣第一個以 AEO 最優化為目標的繁體中文個人品牌站，使用 Astro + Vercel 建立，包含 robots.txt（8 個 AI 爬蟲）、llms.txt、sitemap、RSS、9 種 Schema 標記。"
faq:
  - question: "什麼是 AEO（Answer Engine Optimization）？"
    answer: "AEO 是讓 ChatGPT、Perplexity、Claude、Gemini 等 AI 助理在回答問題時引用你的內容的優化策略。不同於 SEO 讓你在 Google 排高名，AEO 讓你直接成為 AI 的答案來源。"
  - question: "為什麼選 Astro 框架建 AEO 網站？"
    answer: "Astro 預設輸出純 HTML，幾乎零 JavaScript，AI 爬蟲讀取速度比 Next.js 快 2-3 倍。有官方 sitemap 和 RSS 插件，一行設定完成。是目前最適合純內容型 AEO 網站的框架。"
  - question: "台灣有沒有人在做 AEO？"
    answer: "台灣已有 aeoscan.tw 和 aeo-pro.app 等工具站，但沒有人公開記錄自己從零打造 AEO 網站的第一手數字和歷程。weken.news 是這個空缺的嘗試。"
  - question: "AEO 和 SEO 的差別是什麼？"
    answer: "SEO 優化的對象是搜尋引擎爬蟲，目的是排名。AEO 優化的對象是 AI 語言模型，目的是被引用成答案。2026 年 Google AI Overview 出現在 55% 搜尋中，AEO 比 SEO 更直接影響曝光。"
---

今天我買了一個域名，開始建這個站。

這篇文章是記錄，不是教學。

--

## 為什麼現在做

我研究了日本一個叫「和心村」的案例。
他用 Vibe Coding 建了一個旅宿網站，同時把這個站打造成 AEO 工具，累積到每天 10 萬次 AI 爬蟲請求。
最重要的是：他開始有「AI 推薦→旅宿訂單」的真實轉換。

AEO（Answer Engine Optimization）是 SEO 之後的下一波。
當有人問 ChatGPT 或 Perplexity 一個問題，它引用的那個網站，就是這個領域的贏家。

台灣市場目前幾乎沒有繁體中文的第一手 AEO 記錄者。
這個空缺就是切入點。

--

## 今天做的決策

**框架：Astro**

選擇依據：比 Next.js 快 2-3 倍，預設輸出純 HTML，AI 爬蟲讀取效率最高。

**語言：繁體中文**

選擇依據：我的所有數據都是台灣市場的，繁中來源極少，競爭壁壘低。
研究顯示正確在地化內容的 AI 引用率比機翻內容高 280%。

**域名：weken.news，$8.98 第一年**

**定位：不是教學站，是帳本**

這裡記的是我自己做了什麼、結果是什麼。
不是整理別人的文章，不是寫給別人看的。

--

## 第一天實裝的 AEO 技術清單

建站當天完成的技術設定：

1. robots.txt — 明確允許 8 個 AI 爬蟲（GPTBot、ChatGPT-User、ClaudeBot、PerplexityBot、Google-Extended、Amazonbot、FacebookBot、Applebot-Extended）
2. llms.txt — 正確格式（H1 + Blockquote + 頁面索引）
3. sitemap.xml — Astro 官方插件自動生成
4. RSS Feed — Astro 官方插件
5. Person Schema + Organization Schema + WebSite Schema
6. Article Schema（每篇文章）
7. FAQ Schema（每篇文章）
8. Speakable Schema（標記 AI 最應引用的段落）
9. BreadcrumbList Schema
10. /ai 專屬頁面（純結構化資料，給 AI 爬蟲用）
11. EEAT About 頁（Who / How / Why 框架）

--

## 今天的數字

- 建站時間：約 3 小時（Vibe Coding with Claude Code）
- 域名費用：$8.98 USD 第一年
- 主機費用：$0（Vercel 免費方案）
- AI 爬蟲數量（第一天）：0
- 被 AI 引用次數（第一天）：0

這是起點。
六個月後回來看這個數字，才知道做了什麼。
