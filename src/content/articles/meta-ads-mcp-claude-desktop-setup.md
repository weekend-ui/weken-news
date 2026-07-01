---
title: "Meta Ads MCP 怎麼接 Claude Desktop？授權範圍、29 工具、URL 兩個版本的坑"
description: "Meta 在 2026-04-29 開放官方 Meta Ads MCP server beta，免 Developer App 免 marketing API approval 直接接 Claude Desktop。整理接入 URL 的兩個流傳版本（mcp.facebook.com/ads 跟 mcp.meta.com/ads，2026-07 重查仍無法一槌定音）、授權範圍、29 個工具五大類、台灣可不可以用、為什麼業界共識「適合讀不適合寫」、自動微調傷投放成效的陷阱。"
pubDate: 2026-05-03
updatedDate: 2026-07-01
tags: ["meta-ads", "mcp", "claude-desktop", "facebook-ads", "ai-agent"]
directAnswer: "Meta Ads MCP 在 2026-04-29 開放 open beta，接入 connector URL 有兩個版本在流傳（mcp.facebook.com/ads 跟 mcp.meta.com/ads），2026-07 重查仍無法一槌定音，唯一確認法是實際貼進 Claude Desktop 看哪個跳出 OAuth 授權畫面。透過 Meta Business OAuth 授權後系統會 provision 專屬 URL（含 your-business-id），免 Meta Developer App、免 marketing API approval。但 per ad account 逐步開通、寫操作沒原生 guardrails，建議先用讀模式跑分析，寫操作走人工 Ads Manager。"
faq:
  - question: "Meta Ads MCP 的 URL 是什麼？"
    answer: "目前有兩個版本在流傳：mcp.facebook.com/ads 跟 mcp.meta.com/ads。這篇 2026-05 初版時採信 mcp.meta.com/ads，但 2026-07 重查發現多數第三方教學寫 mcp.facebook.com/ads，兩邊相反，Meta 官方公告頁又沒直接列出完整字串，我沒法一槌定音。最可靠的方法是自己接一次：在 Claude Desktop 加 connector 時兩個都試，哪個跳出 Meta Business OAuth 授權畫面就是對的，填錯會靜默連線失敗。授權通過後 Meta 會 provision 一條含你 business id 的專屬 URL，那條才是後續實際使用的 endpoint。"
  - question: "Meta Ads MCP 跟 Marketing API 差別在哪？"
    answer: "Marketing API 走的是傳統 access token 流程，要建 Meta Developer App、申請 marketing API approval、自己處理 OAuth 跟 token refresh，從申請到通過動輒等幾週。Meta Ads MCP 走 Meta Business OAuth 直接授權三個 scope（ad accounts / campaign management / signal access），不用 Developer App、不用 approval。但 MCP 是 server-side 託管在 Meta，你不是直接拿 token，是讓 AI client 透過 MCP 協定問 Meta。"
  - question: "Meta Ads MCP 在台灣可以用嗎？"
    answer: "目前搜不到 Meta 公布的台灣專屬限制。Meta 把這個 release 定位為 open beta，但「逐步開通」是 per ad account 漸進，不是 waitlist。意思是你的某些廣告帳號可能先開通、其他要等。台灣廣告主可以接 Claude Desktop 試授權，看 OAuth 流程跑不跑得動，跑得動再看哪些帳號被開通。Meta 沒公布完整時程。"
  - question: "Meta Ads MCP 能直接讓 AI 改廣告嗎？"
    answer: "技術上能。Meta 官方 MCP 同時支援讀（query campaigns、ad sets、ads）和寫（建新 campaign、改預算、改狀態）。但 Meta 沒做原生 guardrails，沒有「需要人工批准才執行」的內建保險。實務建議只開讀模式跑分析，寫操作走人工 Ads Manager 或第三方有 approval workflow 的工具，避免 AI 誤觸發投放或意外調預算。"
  - question: "為什麼 MCP 適合讀不適合寫？"
    answer: "三個原因。第一，MCP 對話結束後沒留 paper trail，沒辦法 version control，相比 CLI 產出的 spec 檔可重用、可審查。第二，建廣告需要逐欄位 sequential API 互動，MCP 的 tool calls 容易吃 context，影響 AI 寫文案的判斷。第三，Meta 演算法越來越 autonomous，每次 AI 自動調預算 / 切狀態都會重置 learning phase，反而傷投放表現。"
howToSteps:
  - name: "Claude Desktop 加 Meta Ads MCP connector"
    text: "Claude Desktop 開 Settings → Connectors → Add MCP Server。URL 填 https://mcp.meta.com/ads。系統會跳出 Meta Business OAuth 授權畫面，登入你的 Meta Business 帳號。"
  - name: "完成 Meta Business OAuth 授權"
    text: "授權三個 scope：ad accounts、campaign management、signal access。授權通過後 Meta 會 provision 一條專屬 URL（含你的 business id），這條 URL 是你實際使用的 endpoint。沒過的話通常是 Meta Business 帳號權限不夠（要是 Admin 或 Finance Editor），或這個帳號還沒被排到開通批次。"
  - name: "第一次只跑讀測試開通範圍"
    text: "接通後第一個 prompt 不要碰寫操作。建議丟「拉我 Meta 廣告帳號最近 28 天的 ROAS / CPA / 曝光分布報表」這類純讀任務，看它能正確抓哪些帳號的數據。哪些帳號回 unauthorized 就代表還沒輪到開通。寫操作（建廣告、改預算）短期內不要讓 AI 自動跑，等 guardrails 機制成熟。"
---

聲明在前面：這篇是研究整理 + 風險評估，我自己還沒實接過 Meta Ads MCP。Meta 是 per ad account 逐步開放，我手上的廣告帳號還沒輪到。文章寫的是「接之前該知道的事」，不是「我接完發現什麼」。

2026-07-01 更新：這篇初版（2026-05）採信接入 URL 是 mcp.meta.com/ads。7 月重查發現 mcp.facebook.com/ads 這個版本反而被更多第三方教學採用，兩邊相反、我沒法確定哪個對，已把下面的 URL 段落改成兩版本並陳的誠實框架。同時補上官方 MCP 的 29 個工具五大類拆解。細節分別見另兩篇：29 工具怎麼用、URL 兩個版本的完整查證。

事情是這樣，週末哥昨天傳給我一個社群貼文，說「太扯，串接 Meta Ads MCP 就不用花時間申請 token」，貼文裡寫的 URL 是 https://mcp.facebook.com/ads。

URL 看起來太乾淨我就去查。

--

## 真假驗證：Meta 確實在 2026-04-29 發布官方 MCP

不是謠言，是真的。Meta 在 2026-04-29（4 天前）開放兩個官方 artifact 的 beta：Meta Ads MCP server（給 Claude Desktop / ChatGPT 等支援 MCP 的 AI client）和 Meta CLI（給 terminal agent）。Anthropic 和 OpenAI 都同步支援這個 connector。

最大賣點是免 Meta Developer App、免 marketing API approval。傳統流程從建 App 到拿到 production access 動輒等幾週，這條路被砍掉了。

--

## URL 有兩個版本在流傳，我沒法一槌定音

接入 endpoint 目前有兩個版本在傳，而且相反：

```
https://mcp.facebook.com/ads
https://mcp.meta.com/ads
```

這篇 2026-05 初版時，我研究後採信 mcp.meta.com/ads 是對的、facebook 那版是傳錯。但 2026-07 重查，多數第三方設定教學跟工具目錄反而寫 mcp.facebook.com/ads，Meta 官方公告頁又沒在頁面上直接列出完整字串。我沒實接過，沒法確定是舊研究錯、還是 Meta 中途改了、還是新資料互抄錯版本。

所以誠實講：查資料這條路我確定不了哪個對。

唯一可靠的方法是自己接一次。在 Claude Desktop 加 connector 時兩個都試，哪個跳出 Meta Business OAuth 授權畫面就是對的。填錯的那個會直接連線失敗，沒有 fallback、也不會給有用的錯誤訊息，就是靜默失敗。

不管哪個域名，有一點兩邊說法一致：你一開始填的只是「初次接入」的 entry，授權通過後 Meta 會 provision 一條包含你 business id 的專屬 URL，那條才是你後續實際使用的 endpoint。

--

## 授權範圍：3 個 scope + 免審核

OAuth 授權時 Meta 要你同意三個 scope：

1. ad accounts（讀取廣告帳號清單跟基本資料）
2. campaign management（讀寫 campaigns / ad sets / ads）
3. signal access（讀取轉換事件、像素數據）

完成後 Meta 直接 provision MCP URL，不用建 Developer App、不用送 marketing API approval。這個流程跟 Shopify、Mailchimp 接 Meta Business 一樣，只是這次是 AI client 接。

對廣告主的意義：你可以在不寫一行 code 的情況下讓 Claude 直接問你 Meta 廣告數據。

--

## 29 個工具，分五大類

官方 MCP 在 beta 開了 29 個工具，五大類：

1. 開活動與改活動，5 個。建 campaign、ad set、ad、編輯、啟用。這類是寫入型，會動到 live 廣告。
2. 商品目錄，10 個。建目錄、feed 規則、product set、feed 狀態診斷。數量最多，因為電商動態商品廣告全靠 catalog。
3. 帳號、粉專與資產，3 個。列廣告帳號、列 campaign／ad set／ad、找連接的粉專。基礎讀取。
4. 資料集與追蹤品質，4 個。像素跟轉換 API 的 dataset、配對品質分數、事件統計、錯誤診斷。查追蹤有沒有掉資料。
5. 成效洞察與分析，7 個。廣告主脈絡、KPI 異常、競價基準、歷史趨勢、機會分數、Help Center。

判斷上，第四類跟第五類是唯讀、最安全，也最省時間；第一類寫入型 beta 階段先別讓 AI 自動跑。哪些工具對電商最划算，我另一篇專門拆。

--

## 「逐步開通」是什麼意思

這不是 waitlist 機制，是 per ad account 漸進開放。意思是：

你 OAuth 授權通過了不代表所有廣告帳號都能用。Meta 會分批把帳號加進 MCP 可存取清單。某些帳號可能先開通、某些要等。Meta 沒公布完整時程，也沒公布判斷邏輯（按帳號規模？按 spend？按地區？都沒明說）。

實務上：你授權完跑一個讀任務，AI 會回報哪些帳號可用、哪些 unauthorized。

--

## 台灣可不可以用

我搜遍 Meta 官方文件、技術部落格、新聞稿，沒看到「Taiwan 不在開放範圍」這類限制。Meta 的官方說法是「at launch the AI connectors will support tools including Claude and ChatGPT, with more platforms added over time, availability depends on the advertiser's plan within those tools.」

意思是限制是 advertiser plan 不是地區。台灣廣告主理論上可以接，要實測才知道你的廣告帳號被排到第幾批。

--

## 三個關鍵風險

接之前要知道的事，我從業界技術評論整理三條：

1. 寫操作沒原生 guardrails
Meta 官方 MCP 同時支援讀和寫（建 campaign、改預算、切狀態），但 Meta 沒做「需要人工批准才執行」的內建保險。AI 一個誤判就直接動到 live 廣告。第三方 connector 平台（Pipeboard、Ryze、Adzviser 這類）有自己的 approval workflow 和 per-account guardrails，Meta 自家 MCP 沒有。

2. 業界共識：MCP 適合讀不適合寫
廣告業界已經形成共識：MCP 強在 cross-account rollup、creative fatigue 偵測、自然語言查報表，這些是 read-only 任務。建廣告需要 sequential API 互動逐欄位填，MCP 的 tool calls 容易吃 context、沒留 paper trail（對話結束就消失），相比 CLI 產出的 spec 檔可 version control，差很多。

3. 自動微調傷 learning phase
Meta 演算法越來越 autonomous，最佳實踐是「不要頻繁手動調」。每次 AI 自動改預算 / 切狀態都會重置投放系統的 learning phase，看似在優化其實在傷成效。AI 適合做「找問題」，不適合做「自動調」。

--

## 我的具體推薦

如果你也想接，這樣做風險最低：

第一，先只開讀模式。第一個任務丟「拉最近 28 天 ROAS / CPA / 曝光分布」，看哪些帳號可用。

第二，寫操作走 wk-ad-strategist 這類策略型 skill 給方向，你自己進 Ads Manager 改。把 AI 當策略顧問，不當執行手。

第三，每次 AI 給的數字自己驗證一遍。MCP 是新的，beta 階段資料準確度待驗證，不要拿沒交叉確認的數字下決策。

第四，等 Meta 補上 guardrails 再考慮放寫權限。沒人工批准 layer 之前，自動寫操作的爆雷風險大於省時間的價值。

--

## 學到的一件事

新發布的 AI 工具看起來越方便，越要先驗證 URL 是否是官方真實 endpoint，再評估能讀能寫到什麼程度，最後才決定怎麼用。

mcp.facebook.com/ads 跟 mcp.meta.com/ads 只差一個域名，但兩個版本現在都在流傳、而且說法相反，連我兩個月前寫的都不敢說一定對。真正能定案的不是查更多資料，是實際接一次看 OAuth 跳不跳。查不出來就老實說查不出來，這比硬押一個版本假裝確定有用。
