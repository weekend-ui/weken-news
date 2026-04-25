---
title: "Vibe Coding 新手 90 分鐘做出語意工具：從評估到上線的完整時間軸"
description: "我用自己做的語意工具跑『Vibe coding 新手真實案例』這題，綠區第一名是『沒人寫好真實案例』。所以這篇就是答案：90 分鐘從評估到 Vercel 部署的完整紀錄，含技術選擇、env 設定、踩到的坑、為什麼選 Next.js + Anthropic + Serper 這套組合。"
pubDate: 2026-04-26
tags: ["vibe coding", "next.js", "vercel", "anthropic", "新手"]
directAnswer: "Vibe coding 新手能在 90 分鐘內做出可上線的 SaaS 工具，前提是用 Next.js 16 + Vercel + Anthropic Haiku 4.5 這套已驗證的範本。我 2026-04-26 從題目評估到生產部署 wk-semantic-gap 共花 90 分鐘，包含 3 個 env 變數、5 個 React 檔案、1 個 API endpoint，總開發成本 0 元（Serper 免費額度 + Anthropic 共用 key）。"
faq:
  - question: "Vibe coding 新手第一個工具該做什麼？"
    answer: "做你自己每天會用的小工具，不要做給別人用的大產品。我的判斷標準：你今天就會打開來用至少一次，且解決一個你會反覆遇到的痛點。例如選題糾結（語意空缺檢測）、文件難讀（SOP 生成器）、規格化重複勞動（LINE 貼圖打包）。痛點越具體 MVP 範圍越小，90 分鐘內做完的機率越高。"
  - question: "Vibe coding 90 分鐘真的夠做出可用工具嗎？"
    answer: "夠，但前提是用範本不從零搭環境。我的 90 分鐘拆法：30 分鐘評估（題目定義、技術選擇、時間預算 self-audit），60 分鐘執行（scaffold + 寫 lib + API + UI + build + deploy）。如果連 npm 怎麼裝都不熟，先花 1 週把 Next.js + Vercel 流程跑過 3 次再算 90 分鐘。"
  - question: "Vibe coding 用什麼框架最適合新手？"
    answer: "Next.js 16 App Router + Tailwind v4 + Vercel sin1 region + Anthropic Haiku 4.5 + Serper.dev。理由：Next.js 部署到 Vercel 完全零設定、Tailwind v4 不用寫 CSS 檔案、Anthropic SDK 三行就能跑、Vercel sin1 對台灣網路最快（實測首頁可降到 93ms）、Serper 免費 2,500 credits 不需信用卡。"
  - question: "Vibe coding 新手最常踩什麼坑？"
    answer: "三個。第一：env var 沒加 .trim()，Windows 換行符讓密碼比對永遠失敗。第二：Vercel function 跑 AI 超過 60 秒被 timeout，要把工作流程拆成 50 秒以內。第三：每次部署沒同步把工具網址寫進管理清單，過 2 週自己都忘了哪個工具叫什麼名字。"
  - question: "Vibe coding 從零學要多久才能做第一個工具？"
    answer: "我自己花了大約 1 個月把基礎概念跑通（HTML/JS/部署到網址能打開），然後每個工具的時間從 4 小時開始往下掉。第 5 個工具開始 2 小時內，第 10 個工具開始 90 分鐘內。重點不是學技術，是建立『流程肌肉』：題目→評估→範本→部署這 4 步反覆跑，每跑一次都比上一次快。"
howToSteps:
  - name: "30 分鐘評估"
    text: "寫下你要解決的問題（一句話）、3 個技術選擇方案（建議和你既有專案同框架）、時間預算試算（每個 AI 呼叫多少秒、加總要 < 50s）、3 個尚未驗證的假設（必須先查清楚不能假設）。這一步省掉就會在 60 分鐘執行階段卡住改方向。"
  - name: "60 分鐘執行"
    text: "用 Claude Code 一次寫完所有檔案（package.json / tsconfig / next.config / lib / API / page），然後跑 npm install → npm run build → vercel --prod。中間不要切換思考模式（不要寫到一半去 Google），有問題讓 Claude Code 補。"
  - name: "部署收尾必跑"
    text: "vercel.json 設 regions: ['sin1']、首頁 SSR 加 Cache-Control public, s-maxage=60, stale-while-revalidate=30、把工具名稱 + URL 同步到你的工具管理清單（Notion 或 markdown 檔）。三件事 5 分鐘搞定但 2 週後找工具會省你 30 分鐘。"
---

今天我用自己做的工具 wk-semantic-gap 跑了「Vibe coding 新手」這個主題。

綠區（沒人填好的題目）第一名是「Vibe coding 新手真實案例和成功故事」，AI 評分 3 分（10 分滿分），理由：「結果多為標題和列表，缺乏具體案例細節、數字、時間軸和可複製的成功經驗」。

所以這篇就是答案。

--

## 為什麼新手最缺真實時間軸

網路上 Vibe coding 教學不少，但幾乎都長這樣：

「先學 HTML、再學 JavaScript、然後學 React、最後學部署」

或是「我用 AI 做了一個工具，超酷」配一張截圖，然後就沒了。

新手真正想知道的是：

從打開電腦到工具上線，總共幾分鐘？
評估花多久、寫程式花多久、部署花多久？
中間踩到什麼坑、怎麼解？
沒有經驗的人能不能複製？

這些問題沒人寫，因為寫的人通常沒有計時。我有，所以我寫。

--

## 90 分鐘的完整時間軸

工具：wk-semantic-gap，語意空缺檢測工具，輸入主題自動掃 30 個語意鄰居問題、Google 搜尋每題現有答案、AI 評估飽和度，產出綠區（可寫）/ 紅區（別碰）。

時間：2026-04-26，從決定做到生產上線 90 分鐘。

拆解：

0-15 分鐘：題目評估
列 10 個維度分析（價值 / 技術可行性 / 風險 / 競品 / ROI / MVP 範圍 / 時間預算 / 模型選擇 / 成本 / 後續用途）。

15-30 分鐘：技術選擇
決定 Next.js 16 + Tailwind v4 + Vercel sin1 + Anthropic Haiku 4.5 + Serper.dev。理由：跟我前一天剛部署的 wk-line-sticker-uploader 完全同框架，可以直接複製範本。

30-45 分鐘：scaffold + 安裝
寫 package.json / tsconfig / next.config / postcss.config / vercel.json / .env.local，npm install。

45-65 分鐘：寫 lib + API
lib/auth.ts（cookie auth）、lib/serper.ts（Google 搜尋）、lib/anthropic.ts（生成鄰居 + 評分）、middleware.ts（攔截未登入）、/api/auth、/api/analyze 三步驟流程。

65-80 分鐘：寫 UI
/login 頁 + 主頁（textarea + 雙欄綠/紅區結果 + 一鍵複製）。

80-85 分鐘：build 驗證
npm run build 過了，Next.js 16 提示 middleware → proxy 但還能跑。

85-90 分鐘：部署 + Vercel env
vercel link → 設 3 個 env（SERPER_API_KEY / SECRET_KEY / ANTHROPIC_API_KEY）→ vercel --prod → 31 秒 build 完上線。

--

## 技術棧為什麼選這套

Next.js 16 App Router：部署到 Vercel 零設定，TypeScript 開箱即用。

Tailwind v4：不寫 CSS 檔案，直接 className，新手不用學 BEM 或 CSS Modules。

Vercel sin1 region：function 跑在新加坡對台灣訪客延遲最低。我之前測過娜娜子網站的首頁從預設 iad1 region 的 523ms 降到 sin1 的 93ms。

Anthropic Haiku 4.5：每千 token 約 0.001 美元，60 秒內可跑 2-3 次 AI 呼叫不超時。Sonnet 太慢、Opus 太貴，新手用 Haiku 就夠。

Serper.dev：免費送 2,500 credits 不用信用卡。我這個工具一個主題用 30 credits，等於免費跑 83 次。等真的用爆再花 50 美元充 50,000 credits，可以再用 18 個月。

這套組合最大優點：每個元件都是新手能負擔的，沒有任何一個會在第 100 個用戶之前燒掉超過 100 美元。

--

## 踩到的 3 個坑

第一個坑：環境變數沒加 .trim()。

Windows 寫進 env 檔的密碼會帶換行符 \r，部署到 Linux 上比對 cookie 時永遠不等於原值。解法：所有 env var 比對都加 .trim()。我已經為這個坑反覆吃過虧，現在直接內建在新專案的開發規則。

第二個坑：Anthropic API key 跨專案重用。

我在 wk-semantic-gap 直接 reuse wk-line-sticker-uploader 的 ANTHROPIC_API_KEY。技術上沒問題，但如果 key 外洩會影響所有專案。新手建議每個工具獨立 key，雖然多花 30 秒設定。

第三個坑：密碼命名違反慣例。

我的規則是每個專案密碼用 `wk{縮寫}{年份}`，例如 wkls2026、wksg2026。這次選了 weken（沒含年份），跨專案會撞名。記下來下次不犯。

--

## 為什麼我能 90 分鐘做完

不是因為我特別會寫程式，是因為這已經是我的第 25+ 個工具。

從去年開始我累積的工具包括：sop 生成器、第二曲線官網、密室逃脫 LINE Bot、Claude 角色卡、Meta 廣告興趣標籤工具、wk-coach 健身教練 Bot、weken-watermark 浮水印去除、weken-assets 素材庫、wk-work-log 工作日誌、wk-crm 客戶名單、nana-brand AEO 網站，加上昨天剛上線的 wk-line-sticker-uploader v1.0.0 跟今天的 wk-semantic-gap v0.1.0。

第一個工具我可能花了 8 小時才做出能跑的版本，第 5 個 4 小時，第 10 個 2 小時，現在第 25 個 90 分鐘。

每個工具都讓下一個工具的範本變厚一點：技術選擇不用想（同一套）、env 設定不用查（看上一個）、部署不用試（同一個 region）、踩過的坑不會重踩（寫進開發規則）。

新手前 5 個工具會慢，這是正常的。重點是讓每一個都上線可用，不要中途停掉。範本厚度才會累積。

--

## 學到什麼

Vibe coding 不是技術門檻，是「把流程說清楚」的功夫。

新手最大的錯覺是「我會寫程式才能 vibe coding」。事實相反：你把流程拆得越細、評估越具體、範本越熟，就算不會手刻 React 也能 90 分鐘做出工具。

我這個工具的 90% 程式碼是 Claude Code 寫的，我做的事是評估題目、選技術、設 env、debug、部署。這些都是「流程肌肉」，不是「技術肌肉」。

第一個工具最痛苦，第 25 個工具會像今天這樣，順手就做完了。
