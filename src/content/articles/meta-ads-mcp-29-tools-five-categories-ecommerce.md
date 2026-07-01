---
title: "Meta Ads MCP 的 29 個工具是哪些？五大類拆解，電商廣告哪些真的用得到"
description: "Meta 官方 Meta Ads MCP 在 open beta 開了 29 個工具。我把它拆成五大類，逐類判斷做電商廣告的人哪些真的用得到：成效洞察 7 個、商品目錄 10 個、追蹤品質診斷 4 個是最有價值的讀取型；開活動改預算這類寫入型因為沒有原生人工批准機制，beta 階段先別讓 AI 自動跑。我自己還沒實接，這篇是研究 + 適配性評估。"
pubDate: 2026-07-01
tags: ["meta-ads", "mcp", "facebook-ads", "電商", "ai-agent"]
directAnswer: "Meta 官方 Meta Ads MCP 在 open beta 開了 29 個工具，分五大類：開／改活動 5 個、商品目錄 10 個、帳號與資產 3 個、追蹤品質診斷 4 個、成效洞察 7 個。對電商廣告主最先該用的是成效洞察跟像素／轉換 API 診斷這兩類唯讀工具，能把拉報表從 20 分鐘壓到 90 秒；寫入型（開活動、改預算）因為沒有原生人工批准機制，beta 階段不建議讓 AI 自動跑。"
faq:
  - question: "Meta Ads MCP 有哪些工具？29 個怎麼分類？"
    answer: "Meta 官方 MCP 在 open beta 開了 29 個工具，分五大類：開／改活動 5 個（建 campaign、ad set、ad、編輯、啟用）、商品目錄 10 個（建目錄、feed 規則、product set、feed 狀態診斷）、帳號與資產 3 個（列廣告帳號、列 campaign／ad set／ad、找連接的粉專）、追蹤品質診斷 4 個（像素與轉換 API dataset、比對品質分數、事件統計、錯誤診斷）、成效洞察 7 個（廣告主脈絡、KPI 異常、競價基準、歷史趨勢、機會分數、Help Center）。"
  - question: "Meta Ads MCP 對電商廣告主最有用的是哪些工具？"
    answer: "兩類優先：成效洞察 7 個工具，能拉報表、抓 KPI 異常、比對產業基準，把手動看數據從 20 分鐘壓到 90 秒；追蹤品質診斷 4 個工具，查像素跟轉換 API 有沒有掉資料，這是電商最容易漏轉換的地方。再來是商品目錄 10 個工具裡的 feed 診斷，電商靠 catalog 跑動態商品廣告，feed 被拒或 product 下架用這類工具查最快。這些都是唯讀，安全。"
  - question: "Meta Ads MCP 能自動開廣告、改預算嗎？安全嗎？"
    answer: "技術上能，29 個工具裡有 5 個是寫入型（建 campaign、ad set、ad、編輯、啟用）。但 Meta 官方 MCP 沒做原生 guardrails，沒有內建的「需要人工批准才執行」保險，AI 一個誤判就動到 live 廣告。加上每次自動改預算或切狀態都會重置演算法的 learning phase，反而傷投放。beta 階段建議只開讀模式，寫操作自己進 Ads Manager 手動做。"
  - question: "Meta Ads MCP 要錢嗎？"
    answer: "現在 open beta 期間免費，Meta 還沒公布之後收不收費。相較之下第三方連接器（Pipeboard、Adzviser、Markifact 這類）多是月費 25 到 99 美元起，換來跨平台儀表板跟主動告警。官方 MCP 勝在完整 API 覆蓋跟免費，弱在沒有跨平台 dashboard 跟預警。"
  - question: "Meta Ads MCP 和第三方工具差在哪？"
    answer: "官方 MCP 走 Meta Business OAuth 直接授權，中間沒有第三方，認證只在你跟 Meta 之間，不用把 marketing API token 交給別人。第三方連接器（Pipeboard、Adzviser 等）通常要共享 token，但補上官方 MCP 沒有的東西：跨平台（同時接 Google、TikTok、Snap 廣告）、主動告警、per-account guardrails、approval workflow。要安全跟免費選官方，要跨平台跟自動化保險選第三方。"
howToSteps:
  - name: "先盤點你最花時間的廣告任務"
    text: "列出你每週在 Meta 廣告上最花時間的重複動作，例如拉週報、檢查像素有沒有掉資料、比對各廣告組的 CPM 跟頻率。這些通常是讀取型任務，最適合先交給 MCP。"
  - name: "對照 29 工具，讀取型先用"
    text: "把你的任務對到成效洞察（7）跟追蹤品質診斷（4）這兩類唯讀工具。電商再加商品目錄（10）裡的 feed 診斷。這些不會動到 live 廣告，就算 beta 階段資料偶爾不準也不會造成損失。"
  - name: "寫入型先放著，等 guardrails"
    text: "開活動、改預算、切狀態這 5 個寫入型工具，beta 階段不要讓 AI 自動跑。把 AI 當找問題的分析師，你自己進 Ads Manager 做執行。等 Meta 補上人工批准機制再考慮放寫權限。"
---

事情的起點是週末哥丟來一句話：Claude 有 Meta 廣告 MCP 嗎？

我查完發現有，而且是 Meta 官方自己做的，一口氣開了 29 個工具。他接著問一個更實際的問題：29 個工具裡，做電商廣告的人到底哪些用得到。這篇是我把 29 個工具拆完之後的判斷。

先講清楚一件事：我自己還沒實際接通這個 MCP，Meta 是 per ad account 逐步開放，我手上的帳號還沒輪到。這篇是研究 + 適配性評估，不是實測使用心得。我把工具清單攤開，逐類判斷「電商廣告主先用哪些最划算」，這才是第一手的部分。

--

## Meta Ads MCP 是什麼，一句話

2026-04-29 Meta 開放 Meta Ads AI Connectors 的 open beta，包含一個官方 MCP server 跟一個 CLI。你在 Claude Desktop 或 ChatGPT 這類支援 MCP 的工具裡，用講話的方式操作 Meta 廣告帳號。走 Meta Business OAuth 授權，免 Developer App、免 marketing API 審核，beta 期間免費。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">Meta Ads AI Connectors 於 2026-04-29 開 open beta，官方 MCP server 開 29 個工具，走 Meta Business OAuth，免 Developer App、免 marketing API 審核，beta 期間免費。</p>
</blockquote>

（接入的 endpoint URL 目前有兩個版本在社群流傳，mcp.facebook.com/ads 跟 mcp.meta.com/ads，我另一篇專門講這個問題，這篇先講工具本身。）

--

## 29 個工具，五大類

第一類，開活動與改活動，5 個。建 campaign、建 ad set、建 ad、編輯既有活動、啟用或重啟暫停的項目。這類是寫入型，會直接動到你的廣告。

第二類，商品目錄，10 個。建目錄、列目錄、抓目錄診斷、讀 feed 規則跟商品資訊、管 product set、監控 feed 狀態（CSV／XML／API 各種格式）。29 個裡最多的一類，因為電商的動態商品廣告全靠 catalog。

第三類，帳號、粉專與資產，3 個。列出你能存取的廣告帳號、列 campaign／ad set／ad、找連接的 Facebook 粉專。基礎讀取，是其他工具的入口。

第四類，資料集與追蹤品質，4 個。讀像素跟轉換 API 的 dataset 細節、比對配對品質分數、看事件統計、診斷近期錯誤。這類專門查你的追蹤有沒有掉資料。

第五類，成效洞察與分析，7 個。分析廣告主脈絡跟 KPI 異常、比對競價基準跟產業指標、追歷史成效趨勢、算機會分數、抓相關的 Help Center 文章。

--

## 電商廣告主，先用哪些

我的判斷：29 個裡，電商該最先碰的是第五類跟第四類，接著是第二類的 feed 診斷。

第五類成效洞察，全是唯讀。拉報表、抓哪個廣告組的 CPM 或頻率飄掉、比對產業基準，這些是你每週都在做的事。業界實測把「我就想看個數字」的流程從 20 分鐘壓到 90 秒，週報從 60 分鐘壓到 10 分鐘。因為是純讀，就算 beta 階段資料偶爾不準，也不會造成任何損失，頂多你回 Ads Manager 核對一次。

第四類追蹤品質診斷，是電商最容易漏錢的地方。像素跟轉換 API 一旦掉資料，你的轉換數據就失真，演算法學錯方向。這類工具能直接幫你抓配對品質分數跟近期錯誤，光是這個能力就值得接。

第二類商品目錄的 feed 診斷，是電商特有痛點。feed 被拒、product 莫名下架、格式錯誤，用自然語言問「我的目錄現在有哪些商品被拒，為什麼」比自己翻後台快。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">對電商廣告主，Meta Ads MCP 最先該用的是成效洞察 7 個工具跟追蹤品質診斷 4 個工具，兩類都是唯讀，能把拉報表從 20 分鐘壓到 90 秒，又不會誤動到 live 廣告。</p>
</blockquote>

--

## 三個坑，接之前要知道

這工具強在讀，但有三個限制我從業界技術評論整理出來，接之前先知道。

第一，會唬爛數字。prompt 沒講清楚時間範圍時，Claude 有時報的數字跟 API 實際回的對不上。它給的具體數字要當草稿，重要的自己核對。

第二，亂推因果。你問「為什麼 ROAS 掉了」，它會很有自信寫一大段，但它看不到對手出價、季節性、市場外部變化，答案可能對、半對、或整個編的。

第三，看不到素材。MCP 拿不到圖片跟影片。它沒辦法告訴你是不是圖爛了、影片前 3 秒的 hook 死了、素材在手機上讀起來怪。素材判斷還是你自己來。

再加上前面講的，5 個寫入型工具沒有原生人工批准機制，這是為什麼我建議 beta 階段只開讀模式。

--

## 學到的一件事

一個新工具開了 29 個功能，不代表 29 個都對你有用。拆成五大類、逐類問「這對我的生意是讀還是寫、是省時間還是有風險」，答案就清楚了：電商先吃唯讀的成效洞察跟追蹤診斷，把寫入型放到 guardrails 成熟再說。
