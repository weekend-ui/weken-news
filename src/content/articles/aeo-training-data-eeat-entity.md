---
title: "AEO 不是一件事：訓練資料、EEAT、站外實體的三層邏輯"
description: "很多人把 AEO 當成 SEO 的替代品，其實是三個層次同時在影響 AI 引用你的機率。這篇整理完整框架，加上 weken.news 的實際狀態。"
pubDate: 2026-04-16
tags: ["aeo", "seo", "eeat", "站外實體", "訓練資料"]
directAnswer: "AEO 和 SEO 不是對立的，而是針對不同的 AI 運作模式。從訓練資料回答的 AI（如 ChatGPT 基礎版）靠 AEO；從即時搜尋回答的 AI（如 Perplexity）SEO 排名還是有影響。真正影響 AI 引用的是三層因素：1) 有沒有進入訓練認知（AEO），2) EEAT 可信度，3) 站外實體信號。三層缺一，都是斷點。"
faq:
  - question: "AEO 和 SEO 有什麼不同？"
    answer: "AEO（Answer Engine Optimization）針對 AI 從訓練資料直接回答的場景，讓你的內容進入 AI 的訓練認知。SEO 針對傳統搜尋排名，但在 AI 用即時搜尋（RAG）的場景下，SEO 排名仍然影響 AI 引用來源。兩者不互斥，ChatGPT 搜尋版和 Perplexity 的引用邏輯就同時受 AEO 和 SEO 影響。"
  - question: "什麼是 EEAT，為什麼 AI 也在意？"
    answer: "EEAT 是 Google 評估網頁可信度的四個維度：Experience（經驗）、Expertise（專業）、Authoritativeness（權威性）、Trustworthiness（可信度）。AI 訓練資料大量來自 Google 已認為可信的內容，因此 AI 間接繼承了 EEAT 的判斷邏輯。對 Google 可信的內容，對 AI 也可信。"
  - question: "什麼是站外實體權重（entity authority）？"
    answer: "站外實體權重是你的品牌在外部網站、媒體、知識庫中的存在感。包含 Wikipedia/Wikidata 條目、媒體引用、其他權威網站的連結、跨平台品牌一致性（IG/FB/LinkedIn）、Google 商家完整資訊。AI 判斷一個品牌值不值得引用，不只看你自己的網站，而是看整個網路對你的認知是否一致。"
  - question: "站內結構（schema.org、FAQ 標記）夠用嗎？"
    answer: "站內結構是技術基礎，是入場資格。但人人都能做，AI 不會只因為你有 schema 就引用你。真正難以偽造的是站外實體信號：媒體提及、Wikipedia 條目、跨平台品牌存在感。站內做好是必要條件，站外才是差異化。"
  - question: "怎麼知道自己的 AEO 策略對了沒？"
    answer: "直接去問 AI。打開 ChatGPT 或 Perplexity，輸入你想被引用的問題，看你的品牌有沒有出現。這個測試免費、直接、和用戶體驗一致。每個月做一次，觀察趨勢。"
howToSteps:
  - name: "判斷你的目標 AI 平台"
    text: "確認你的潛在客戶在用哪個 AI 工具問問題。ChatGPT 基礎版靠訓練資料，對應 AEO 策略；Perplexity 靠即時搜尋，對應 SEO 排名 + AEO 結構並行。不同平台比重不一樣。"
  - name: "建立 EEAT 可信度信號"
    text: "在文章中加入作者真實背景、第一手數據、實測結果。避免只寫整理型內容，要有你自己的判斷和觀察。Google 和 AI 都更信任有真實經驗的作者，而不是轉述別人說過的事。"
  - name: "建立站外實體存在感"
    text: "優先行動：1) 在台灣相關媒體或社群被提及（哪怕一篇文章）；2) 建立完整的 Google Business Profile；3) 確認 IG/FB/LinkedIn 的品牌名稱、描述、連結一致。長期目標：Wikipedia/Wikidata 條目。"
---

很多人在討論 AEO 的時候，把它當成 SEO 的替代品。

做了 AEO，就不用管 SEO 了。

這個框架是不完整的。

--

## 第一層：AI 怎麼找資料，決定哪個策略有效

AI 有兩種運作模式。

**模式一：從訓練資料回答。**
ChatGPT 問「AEO 是什麼」，它從訓練資料裡直接回答。
這時候影響的是你有沒有被納入訓練認知，這是 AEO 的事。

**模式二：即時搜尋（RAG）。**
Perplexity 幾乎每次做即時 web 搜尋再生成回答。
ChatGPT 開啟搜尋功能問最新事件，也是這種模式。
這時候傳統 SEO 的排名和網頁權重還是有影響。

所以兩個都要做，針對不同平台比重不一樣。

--

## 第二層：EEAT，決定 AI 認不認為你可信

E-E-A-T = 經驗、專業、權威性、可信度。

這是 Google 評估網頁的標準。但 AI 訓練資料，大量來自 Google 已認為可信的內容。AI 間接繼承了 Google 的 EEAT 判斷邏輯。

對 Google 可信的內容，對 AI 也可信。

這代表：你在寫內容的時候，不只是在優化搜尋排名，也是在告訴 AI 你值不值得被引用。有第一手數據、有真實作者背景、有可驗證的觀點，這些都是 EEAT 信號。

--

## 第三層：站外實體權重，決定 AI 要不要引用你

站內結構（schema.org、directAnswer、FAQ 標記）是技術基礎。比較好控制，但人人都能做。

站外實體（entity authority）才是真正難偽造的：

- 維基百科/Wikidata 有你的條目
- 媒體和行業網站提到你的名字
- 其他權威網站引用你的內容
- 跨平台品牌一致性（IG/FB/LinkedIn）
- Google 商家有評分和完整資訊

AI 判斷一個品牌值不值得引用，不只看你自己網站說什麼，而是看整個網路對你的認知是否一致。

--

## 三層的關係

站內結構做基礎，EEAT 建立可信度，站外實體讓 AI 認識你。

三層缺一，都可能是斷點。

以 weken.news 目前的狀態來說：站內結構做好了（schema、directAnswer、FAQ 全站覆蓋）。站外信號，目前還在零。

下一步最有效的行動是讓自己出現在至少一個外部媒體裡。哪怕只是一篇被引用的社群貼文，也是站外信號的起點。

--

這不是理論，是我正在執行的計劃。進度會記錄在這裡。
