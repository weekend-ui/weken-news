---
title: "不會寫程式怎麼一年做出 30 個 AI 工具？Claude Code + Vercel 實測紀錄"
description: "我 2025 年連 JavaScript 都不會寫，到 2026 年手機上有 30 個我自己做的 AI 工具，19 個已部署在 Vercel。這篇紀錄我用 Claude Code + Vercel 把開發成本拉到接近零的 6 條法則，含具體工具名、stack 複用、上線時間。"
pubDate: 2026-05-12
tags: ["claude-code", "vercel", "ai工具", "個人開發", "one-person-lab"]
directAnswer: "Claude Code 寫程式 + Vercel 部署 + 以「一個週末」為最小單位，12 個月可以做出 30 個 AI 工具，其中 19 個能對外給人用。關鍵不是會寫程式，是有真實痛點清單，跟願意 ship 醜版本。"
faq:
  - question: "不會寫程式可以做 AI 工具嗎？"
    answer: "可以。我 2025 年連 JavaScript 一行都寫不出來，現在有 30 個自己做的工具。Claude Code 在你電腦裡寫程式、跑指令、部署，你只需要說「我要這個」三個字。但要做出來的關鍵不是工具，是有具體痛點清單，否則做出來沒人用包括自己。"
  - question: "一個 AI 工具從 0 到上線要多久？"
    answer: "我做過最快的工具是 weken-watermark 浮水印去除工具，一個下午就上線。最慢的是 wk-crm 客戶名單系統，用了一整個週末。我的內部規則是上線時間不超過 12 小時。超過代表沒想清楚或範圍太大。"
  - question: "做 30 個 AI 工具大概花多少錢？"
    answer: "我目前固定月費主要是 Claude Code 訂閱費，加上少數流量大的工具升級到 Vercel Pro。其他大部分跑在 Vercel / Neon Postgres / Upstash Redis 的免費 plan。沒有實際 SaaS 訂閱費，跑得最便宜的工具一年成本接近 0。"
  - question: "Claude Code 跟 Cursor 哪個適合一個人做 AI 工具？"
    answer: "我選 Claude Code，因為它能直接在 terminal 跑指令、改檔案、部署。Cursor 比較偏 IDE 內輔助寫程式。差別在「我要 Claude 把這個 deploy 上去」這種指令，Claude Code 自己接 Vercel CLI 跑完，Cursor 我得自己接。對「不會寫程式但想出貨」這個 use case，Claude Code 摩擦比較少。"
  - question: "什麼類型的 AI 工具最適合一個週末做完？"
    answer: "個人或小團隊的痛點工具。例如：每天手動下載一份報表 → 自動抓單工具；客戶資料散在 5 個 CSV → CRM 去重工具；產品圖有浮水印要手動修 → 浮水印橡皮擦。這類問題有具體痛點、單一輸入輸出、不需要複雜後台，一個週末 16 小時內能做出 MVP。"
howToSteps:
  - name: "1. 列你的痛點清單"
    text: "開一個 Notes，記錄這禮拜被同一個問題痛了 3 次以上的事。不要想商業模式，只記痛點。一週應該至少 3-5 個。下個週末挑一個動，剩下留 backlog。"
  - name: "2. 用 Claude Code + Vercel 走最短路徑"
    text: "Claude Code 跟它說「我要做一個 X 工具，給我最小 MVP」。寫完當天就跑 `vercel deploy`，先有 URL，再看 UX 缺什麼。上線時間目標 < 12 小時。"
  - name: "3. 第 N 個工具複用前 N-1 個"
    text: "第二個工具開始強制複用：同個 Neon DB、同個 Vercel 帳號、同個 Tailwind config、同個 auth pattern。每個新工具開工前先問「我能複用哪 3 個既有元件」。找不到 3 個就再開新的。"
---

2025 年我連一行 JavaScript 都寫不出來。

2026 年，我手機上有 30 個 AI 工具，全是我自己做的、自己部署的、自己每天在用的。中間發生什麼？不是 12 週訓練營，不是半夜啃 JS 聖經本。是這個時代做工具的成本，正在被 AI 拉到接近零，跟我願意把每個週末丟進去做事。

下面是這 12 個月我整理出來的 6 條法則。不是教程，是 method。任何人套上這 6 條都能做出工具，差別只在你被痛了多少次、你願意丟多少個週末。

--

## 法則 1：Pain First, Tool Later

不要先有 idea。要先被痛。

Startup ideation 是個騙局。坐在咖啡廳腦力激盪「下一個獨角獸」是浪費時間。我每個工具的起源都是某個具體的下午：

- 「為什麼快電商銷售報告要我每天手動下載？」變成 weken-report，每月自動抓銷售 TOP 15
- 「為什麼客戶名單散在 5 個 CSV 裡？」變成 wk-crm，email/phone 去重的客戶名單系統
- 「為什麼 IG 定位要花 1,500 塊找顧問？」變成 wk-ig-positioning，5 節問答 + 3 個 AI 角色介入的定位工具

工具不是想出來的，是被痛出來的。沒被痛過的問題，做出來沒人會用，包括你自己。

我的內部紀律：每週末開工前先問「我這禮拜被什麼問題痛了 3 次以上」。3 次是門檻，少於 3 次代表是偶發，不是系統性痛點。

--

## 法則 2：Weekend as Unit

一個週末做不完的，不是工具，是專案。

時間有兩種：weekend-unit 跟 quarter-unit。工具屬於前者。如果一個東西兩個週末還做不出 MVP，代表它要嘛太大、要嘛你還沒想清楚。砍掉重來，不要硬撐。

我做過最快的工具是 weken-watermark 浮水印去除工具，一個下午就上線。純前端，C2CBuy 商品圖一秒去掉浮水印。最慢的是 wk-crm 客戶名單系統，用了一整個週末，因為要做去重邏輯、多來源黏著度追蹤、Neon Postgres 資料庫設計。從沒一個工具讓我陷進去超過 16 小時。

16 小時是我的 hard limit。超過代表沒想清楚範圍，或者該拆成兩個工具。拆得掉就拆，拆不掉就放下，等下個月被痛 3 次以上再回來。

--

## 法則 3：Ship Then Polish

當天就上 Vercel。先有 URL，再優化 UX。

完美主義是工具殺手。我每個工具的第一個版本都很醜。沒 favicon、沒 responsive、沒 error handling。但它有 URL。

它有 URL 這件事，比它有沒有 favicon 重要 100 倍。

URL 等於：我可以丟給朋友用。可以發 Threads 介紹。可以放 IG bio。可以從手機打開測試。可以截圖貼進 Skool 社群跟夥伴秀。

醜的工具還是工具。漂亮的草稿不是工具。

我的紀律是上線時間 < 12 小時。Claude Code 接 Vercel CLI 讓這件事變成預設值。Claude Code 寫完直接喊 `vercel --prod`，60 秒內拿到 production URL。

--

## 法則 4：Voice the Output

每個工具帶你個人 voice。不做泛用。

我的 ecom-analysis 工具會用千億電商大佬視角罵你資料的問題。我的感恩牆是馬卡龍色，因為感恩應該是溫暖的，不是商業的。Claude 角色卡用 RPG 屬性而不是 admin 後台，因為 AI 不應該長得像企業內部系統。

每個工具的「voice」是把它跟全世界的 SaaS 模板區分開的東西。

泛用工具的問題：沒人記得、沒人推薦、沒人付錢。如果你的工具看起來像 Bootstrap 模板，用戶記不住是「Weekend 做的」，下次有相同痛點他會去問 ChatGPT 而不是回來找你。

我的紀律：使用者要在開啟工具的 30 秒內，感覺到「這是 Weekend 做的」。可能是配色、可能是文案、可能是錯誤訊息口吻。沒有 voice 的工具，下次不會被想起。

--

## 法則 5：Stack Compound

新工具複用舊工具的資料、帳號、DB。不從零起。

我的第 N 個工具比第 1 個快很多倍。不是因為我變聰明了，是因為我有了「stack」。

具體可複用的元件清單：

- Neon DB 已經有了，新工具不需要再開資料庫
- Vercel 帳號已經有了，新工具不需要設新 hosting
- Tailwind config + 品牌色 token 已經調過，新工具不需要重新設計
- Auth pattern（密碼驗證、session、cookie）已經寫過，新工具直接複製
- Telegram bot / LINE webhook 整合模板已經存在，新工具不需要從零接

複利不是金錢的專利，是 infrastructure 的專利。你的第 N 個工具的速度等於前 N-1 個工具累積出來的 leverage。

我的紀律：每個新工具開始前先問「我能複用哪 3 個既有元件」。找不到 3 個再開新的，否則先想辦法接舊的。

--

## 法則 6：Tell the Story After

做完發 Threads 或 Skool 用第一人稱講「為什麼做這個」。

這條是最多人忽略，但最關鍵。工具本身是創作素材。Threads 貼文是創作。沒有後面這篇，前面的工具只有你自己知道。

「為什麼做這個」這個 framing 比「我做了什麼」更有 hook。「我做了 wk-crm」沒人在乎。「我做 wk-crm 是因為發現客戶名單散在 5 個 CSV」這個故事有人看。

工具流向是：工具 → 內容 → 觀眾 → 客戶。沒講出來的工具是死的。講出來的工具會 compound。

我的紀律：每個工具上線後 48 小時內，寫一篇 Threads 或 Skool 貼文，用第一人稱講「為什麼做這個」。重點不是介紹功能，是介紹當天的決定。

--

## 12 個月的累計數據

從 2025 年寫第一行 hello world 到 2026 年 5 月，這 12 個月：

- 30+ 個 AI 工具
- 19 個已部署在 Vercel（live URL 可訪問）
- 12 個內建 agent（Claude Code 觸發詞執行，不對外開放）
- 5 條內容生產線（Threads / IG / Skool / AEO / 廣告）
- 1 個個人品牌 AEO 站（weken.news，累計 34 篇文章）

固定 stack：Claude Code + Vercel + Neon Postgres + Upstash Redis + Tailwind + Astro / Next.js。大部分工具跑在免費額度內，付費只有 Claude Code 訂閱跟流量大的工具的 Vercel Pro。

--

這 6 條法則加起來不是「我比較聰明」，是「我比較有系統」。任何人套上這 6 條都能做出工具。

差別只在你被痛了多少次，跟你願意丟多少個週末。

把這 6 條印出來貼牆上。下次有 idea 時翻一翻，自然知道下一步該動哪一條。
