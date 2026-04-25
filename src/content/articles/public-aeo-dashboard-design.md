---
title: "我幫客戶網站做了一個公開 AEO 儀表板：完成清單 + 速度實測對比，業主一打開就懂"
description: "AEO 是個很抽象的工程，工程師心裡知道做了什麼但業主看不到。我幫一個顧問案的客戶後台做了 AEO 儀表板：30 項完成清單分類顯示、雙色速度實測對比卡（523ms vs 93ms）、AI 爬蟲分布 + 30 天趨勢圖。業主一打開就看到 AEO 做了什麼 + 實際成果。完整 UI 設計邏輯寫在這。"
pubDate: 2026-04-25
tags: ["aeo", "後台儀表板", "ux", "前端", "客戶交接"]
directAnswer: "AEO 對業主是黑箱：工程師做了 30+ 個技術改動但業主看不到。把 AEO 進度變成公開儀表板可以解這個痛點：完成清單分為「業主操作 / 技術基礎 / 結構化資料 / 內容 AEO」四類顯示完成度圓環、速度實測雙色對比卡（優化前後具體數字）、AI 爬蟲 30 天趨勢圖。實作後業主直接看儀表板就懂 AEO 在做什麼，交接時也有實際成果可呈現。"
faq:
  - question: "為什麼 AEO 需要儀表板？"
    answer: "AEO 是工程師眼裡的工作（schema、robots、sitemap、cache、speakable…），但業主看不到。沒有儀表板的話業主只能聽工程師說「有做」，沒有實際數據佐證。儀表板把抽象工程變成可視化資產，業主信任度提高、交接時有交付物、未來追加優化也有 baseline 可對比。"
  - question: "AEO 儀表板要顯示什麼數據？"
    answer: "我目前的版本含 5 個區塊：1. 完成度圓環（X/Y 完成、百分比）2. AI 爬蟲總造訪 + 今日造訪 3. AEO 完成清單（分類顯示，未完成業主操作項紅標警示）4. 速度實測對比卡（優化前後具體 ms 數字）5. AI 爬蟲分布 chart + 30 天趨勢 line chart + Top 被爬頁面。每個都有「為什麼這個重要」的脈絡說明。"
  - question: "速度實測對比卡怎麼設計才有說服力？"
    answer: "雙色卡片並列：左邊橘色「優化前 523ms」、右邊綠色「優化後 93ms」，下方標「5.6 倍速」。視覺上一秒看出差異，數字精確到 ms 增加可信度。再下方附其他頁面參考數字（cold/warm/cache hit 三種狀態），讓業主理解不是平均值是「最差到最好」的範圍。"
  - question: "AEO 完成清單怎麼分類？"
    answer: "我分四類：1. 需要業主操作（紅標警示，例如 GSC 驗證、填個人故事、補社群連結）2. 技術基礎層（sitemap、robots、llms.txt、edge cache 等）3. 結構化資料層（@graph schema、Person.alumniOf、speakable 等）4. 內容 AEO 層（meta description、H2/H3 標題、author attribution 等）。第一類最重要要紅色凸顯，業主一打開就知道「我還要做什麼」。"
  - question: "做這個儀表板要花多少時間？"
    answer: "後端：AI 爬蟲追蹤 middleware（13 種 bot 偵測 + Neon UPSERT）+ /api/admin/aeo-stats 約 2 小時。前端：完成清單渲染 + Chart.js 整合 + 速度實測卡 UI 約 3 小時。AEO_ITEMS 陣列硬編碼維護（每次新增 AEO 能力同步更新）約 5 分鐘/次。總開發成本一個半天，後續維護幾乎沒成本。"
howToSteps:
  - name: "後端：寫 AI 爬蟲追蹤 middleware"
    text: "在 Astro / Next.js middleware 偵測 user-agent 是否含 GPTBot / ClaudeBot / PerplexityBot / Google-Extended / Bingbot 等 13 種 AI bot，每次到訪寫一筆到 DB（INSERT 或 UPSERT 加 1）。記錄欄位：bot 名稱、被爬路徑、日期。"
  - name: "前端：完成清單分類渲染 + 完成度圓環"
    text: "AEO_ITEMS 陣列硬編碼（每項 label + done + note + 分類）。前端用 SVG 畫圓環，stroke-dashoffset 動態計算完成百分比。清單分類顯示，未完成項用紅標背景凸顯，業主操作類項目放最上面。"
  - name: "前端：速度實測對比卡 + Chart.js"
    text: "雙色卡片橫向並列（優化前 vs 優化後），用 grid-template-columns: repeat(2,1fr) 實作。AI 爬蟲分布用 Chart.js bar chart（type: bar），30 天趨勢用 line chart（type: line, fill: true）。Chart.js 從 CDN 載入即可，不用打包進 bundle。"
---

幫一個顧問案的客戶網站做 AEO 優化做了一陣子，30 多項技術改動全都跑完。但客戶一個問題把我問倒：

「我怎麼知道你做了什麼？」

對工程師我可以列 schema、robots、sitemap、cache 一堆名詞。對業主這些都是天書。

於是我做了一個公開 AEO 儀表板，把抽象工程變成可視化資產。完整設計邏輯如下。

--

## 為什麼 AEO 必須有儀表板

AEO 是個訊號工程：每個技術改動是給 AI 爬蟲的一個訊號，累積後 AI 才會引用你。但訊號本身對業主完全不可見。

沒有儀表板的痛點：

業主聽工程師說「我做了 30 件事」但不知道是什麼，信任度卡關
交接給業主後，新接手的人不知道現狀，也不知道「還有什麼要做」
未來想追加優化，沒有 baseline 可比較進步多少

儀表板解這 3 個痛點。

--

## 我的儀表板含 5 個區塊

頂部 stats row（3 個卡片）：

完成度圓環（X/Y 已完成、百分比）
Sitemap 頁面數
AI 爬蟲總造訪

中段大區塊：

速度實測對比卡（後面細講）
AEO 完成清單（分類）

底部 chart 區塊：

AI 爬蟲分布 bar chart
30 天造訪趨勢 line chart
Top 被爬頁面 progress bar

--

## 速度實測對比卡：最有說服力的設計

這張卡是我覺得整個儀表板最值錢的一塊。

設計：

兩張卡片橫向並列。左邊橘色「優化前 (iad1, 無 cache)」顯示 523ms。右邊綠色「優化後 (sin1 + cache)」顯示 93ms。下方一行大字「5.6 倍速」加說明「訪客體感從『等載入』變『即時』」。

再下方一個小字參考區，列其他頁面實測數字：

首頁 cold (cache miss): 651ms
/about SSR: 184ms
/blog (5min cache): 86ms
/llms-full.txt: 173ms

為什麼這樣設計：

視覺一秒看出差異（橘色 vs 綠色）
數字精確到 ms，可信度高
寫「5.6 倍速」比「快很多」直接
參考數字告訴業主「不是均值是範圍」

業主看完不會問「真的嗎」，會問「下一步怎麼維持」。

--

## AEO 完成清單：分類比平鋪有效

清單共 30+ 項，平鋪會看不出輕重。我分 4 類：

第一類「需要業主操作」用紅黃色背景凸顯
第二類「技術基礎層」（sitemap、robots、llms.txt、edge cache 等）
第三類「結構化資料層」（@graph schema、Person.alumniOf、speakable 等）
第四類「內容 AEO 層」（meta description、H2/H3 標題、author attribution 等）

第一類放最上面用紅標。為什麼？因為這些是「業主自己要做的」例如：

GSC 驗證 + Sitemap 提交
Person sameAs 填入社群連結
關於頁填入個人故事 + 上傳個人照片

業主一打開儀表板就先看到「我還有什麼要做」，不是先看到工程師做了什麼。這個排序刻意設計，因為 AEO 後期最大瓶頸是業主資料，不是技術。

--

## AI 爬蟲追蹤 middleware：證據在這

完成清單是「我做了什麼」的宣稱，AI 爬蟲追蹤是「實際有用」的證據。

middleware 偵測 user-agent，13 種 AI bot 全部記錄：

GPTBot、ChatGPT-User（OpenAI）
ClaudeBot、anthropic-ai（Anthropic）
PerplexityBot
Google-Extended（Gemini / AI Overviews）
Amazonbot、FacebookBot、Applebot-Extended、Bingbot 等

每次到訪 INSERT 或 UPSERT 加 1，存到 DB。前端用 Chart.js 渲染：

bar chart 顯示哪個 bot 來最多
line chart 顯示 30 天趨勢
horizontal bar 顯示 Top 被爬頁面

業主就看得到「真的有 AI 在抓我的網站」，AEO 不是空談。

--

## 開發成本估算

後端：AI 爬蟲追蹤 middleware + Neon UPSERT + /api/admin/aeo-stats 約 2 小時
前端：完成清單渲染 + Chart.js 整合 + 速度實測卡 UI 約 3 小時
AEO_ITEMS 陣列硬編碼維護：每次新增 AEO 能力同步更新清單，5 分鐘/次

總開發一個半天，後續維護幾乎沒成本。

對接案者來說，這個半天是高 ROI 投資。多一個交付資產 + 客戶信任度跳升 + 未來追加優化有可量化 baseline。

--

## 學到什麼

AEO 工程師心裡的工作 vs 業主眼中的服務，中間有一道「黑箱」。儀表板就是把黑箱打開的工具。

不是每個 AEO 案子都需要儀表板，但凡是「業主會自己進後台」的案子都該做。把抽象工程變可視化資產，業主信任度跟你的服務差異化都跳一級。
