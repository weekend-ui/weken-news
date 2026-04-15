---
title: "Claude Code 建 AEO 網站，實際省了幾小時？"
description: "用 Claude Code 輔助建立 weken.news 的完整記錄：原本估計 2 天的工作，實際 3 小時完成，省下 44 小時。這是計算方式和所有細節。"
pubDate: 2026-04-14
tags: ["ai自動化", "vibe-coding", "建站記錄", "省時數字"]
directAnswer: "用 Claude Code 建立完整 AEO 網站（含 9 種 Schema、llms.txt、sitemap、RSS、About 頁、第一篇文章），實際花費約 3 小時，手動完成同樣工作估計需要 2 天（約 48 小時），省下約 44 小時。"
faq:
  - question: "Vibe Coding 建網站真的快多少？"
    answer: "以 weken.news 為例，完整 AEO 網站（9 種 Schema、llms.txt、sitemap、RSS、動態 sitemap endpoint、About 頁、文章 Content Collection、第一篇文章）用 Claude Code 輔助完成約 3 小時，手動估計需要 2 天，快了約 16 倍。"
  - question: "怎麼計算 AI 幫你省了多少時間？"
    answer: "每個任務完成後記錄兩個數字：手動預估時間（按照熟練程度估算）和 AI 實際花費時間。差值就是省下的時間。weken.news 建站估計手動需 2880 分鐘，AI 實際 240 分鐘，省下 2640 分鐘（44 小時）。"
  - question: "這樣的時間估算準確嗎？"
    answer: "手動預估本來就有誤差，但誤差方向一致——我通常低估手動難度。Schema 設計、AEO 技術研究、debug 每一個都比預期耗時。所以 44 小時可能是保守估計。"
  - question: "Claude Code 和一般 AI 助理的差別是什麼？"
    answer: "Claude Code 在終端機直接操作，可以讀寫檔案、執行指令、部署，不需要人工複製貼上。一般 AI 助理只能生成文字，你還要自己執行。這是建站速度差距的主要原因。"
---

我想知道一件事：AI 到底幫我省了多少時間？

不是感覺，是數字。

--

## 這次做了什麼

weken.news 第一天建了以下東西：

**AEO 技術層**
- robots.txt（允許 8 個 AI 爬蟲）
- llms.txt（H1 + Blockquote + 頁面索引格式）
- sitemap.xml（動態生成 endpoint）
- RSS Feed

**Schema 標記（9 種）**
- WebSite Schema
- Organization Schema
- Person Schema（含 sameAs、knowsAbout）
- Article Schema
- FAQ Schema
- Speakable Schema
- HowTo Schema
- BreadcrumbList Schema
- WebPage Schema

**頁面**
- 首頁
- /about（EEAT 強化版，Who / How / Why 框架）
- /ai（AI 爬蟲專用結構化頁面）
- /articles 列表
- 第一篇文章（含 Content Collection、Zod schema）

--

## 時間是怎麼算的

手動預估：我有網頁開發基礎，但這種規模的 AEO 技術棧我從沒建過。
估計手動完成需要 2 天，約 48 小時。

AI 實際花費：約 3 小時。

省下：約 44 小時。

計算方式不精準，但方向確定：手動難度只會被低估，不會被高估。
Schema 設計、AEO 技術選型、debug，每個都比直覺複雜。

--

## 這個數字的意義

44 小時 = 5.5 個工作天

一個人從零建一個完整的 AEO 技術網站，要花超過一週。
Claude Code 讓這件事在一個下午完成。

這不是「節省時間」，是「改變了什麼事情值得做」的邊界。

一個原本太麻煩所以不做的事，現在的成本是一個下午。
這改變的不只是效率，是決策。

--

## 現在的數字

- 建站時間：約 3 小時
- 域名費用：$8.98 USD 第一年
- 主機費用：$0（Vercel 免費）
- AI 爬蟲到訪（截至 2026-04-14）：追蹤中
- Google 收錄頁數：等待中

六個月後回來看。
---
