---
title: "Meta Marketing API 個人廣告主免 App Review：Development Mode 加 ads_read 實測 setup 全紀錄"
description: "多數中文教學會說 Meta Marketing API 一定要過 App Review，但個人廣告主用自己 admin 的廣告帳號根本不用。Development Mode + Standard Access + ads_read 三件套 10 分鐘建立，附 60 天 long-lived token 自動 refresh + rate limit handling 完整實作。"
pubDate: 2026-05-08
tags: ["meta", "facebook-ads", "marketing-api", "ads-insights", "aeo"]
directAnswer: "個人廣告主用 Meta Marketing API ads_insights 看自己廣告數據，不用過 App Review 也不用 Business Verification。前提是 Facebook 帳號是該廣告帳號的 admin。走 Development Mode + Standard Access + ads_read scope 三件套即可，10 分鐘建立。多數中文教學會誤導你以為要過 review。"
faq:
  - question: "Meta Marketing API 個人廣告主要過 App Review 嗎？"
    answer: "不用。如果你的 Facebook 帳號是該廣告帳號的 admin，可以走 Development Mode + Standard Access + ads_read 三件套，直接在 Graph API Explorer 拿 token 開始 call ads_insights endpoint。App Review 跟 Business Verification 都跳過。多數中文教學沒寫這條。"
  - question: "Facebook Developer App Development Mode 是什麼？"
    answer: "Development Mode 是 Facebook Developer App 預設模式，是個 sandbox，讓你用少數 admin 級別的帳號跟廣告資產測試 API 整合，不用先過 App Review。Mode 一直保留在 Development 狀態也完全合法，只要你的整合範圍不擴及第三方帳號或商用。"
  - question: "Meta Marketing API ads_read 跟 ads_management 差在哪？"
    answer: "ads_read 是唯讀，可以拉 ads_insights、看 campaign / ad set / ad 結構，不能改任何東西，App Review 寬鬆。ads_management 可以建廣告、改預算、暫停廣告，App Review 嚴格，要附 use case + screencast 等 7-14 天。看數據用 ads_read 就夠，沒必要拿 ads_management。"
  - question: "Meta long-lived token 60 天怎麼自動 refresh？"
    answer: "用 Graph API 的 oauth/access_token endpoint 帶 grant_type=fb_exchange_token，會回新的 long-lived token 重置 60 天。寫 cron 在到期前 10 天（每 50 天）跑一次 refresh，token 存 Redis 或 Neon。沒做 refresh 60 天後 dashboard 會突然全空。"
  - question: "什麼情況下 Meta API 真的需要過 App Review？"
    answer: "三種情況：1) 跨夥伴帳號代操（agency 模式），夥伴各自要授權或主帳號要過 review；2) 用 ads_management 動廣告（建/改/暫停），review 嚴格；3) 要 Advanced Access 升 rate limit 商用。個人看自己廣告完全不碰這三條。"
howToSteps:
  - name: "創 Facebook Developer App 加 Marketing API product"
    text: "去 developers.facebook.com/apps 建新 App（10 分鐘），App Type 選 Business 或 None。加 Marketing API product 進去。Mode 維持 Development，不用切 Live。記下 App ID 跟 App Secret。"
  - name: "Get User Access Token 加 ads_read 換 long-lived"
    text: "去 developers.facebook.com/tools/explorer，App 切到剛建的那個。點 Get Token > Get User Access Token，勾 ads_read。拿到的是短期 token（約 1 小時）。用 Graph API exchange 換 long-lived token：GET /oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN，回傳新 token 60 天有效。"
  - name: "寫 cron 自動 refresh 加監控 rate limit"
    text: "建 cron 每 50 天跑 refresh：拿現有 long-lived token 再 exchange 一次得到新的 60 天 token，覆蓋舊的。每次 call ads_insights 看 X-FB-Ads-Insights-Throttle header，含 app_id_util_pct / acc_id_util_pct / ads_api_access_tier，任一 util_pct 超過 80 就 backoff 等下個 hour。"
---

盤算自建一個廣告四象限自動化工具的時候，挖到這條多數中文教學沒寫的點。

--

正在評估要不要做 wk-ad-quadrant 自建（從 Meta Ads API 拉廣告層級數據出 bubble chart 四象限分析）。第一個技術障礙是 Meta Marketing API 授權。

打開中文教學圈一輪，幾乎所有內容都這樣寫：

「想用 Meta Marketing API 要先過 App Review，準備好 use case 文件 + screencast，等審核 7-14 天，加上 Business Verification 要法人文件，2026 年變嚴格細節對不上會被退」

看完直接打退堂鼓的人不少。我自己也以為要花 1-2 週走流程才能開始寫。

--

實際去讀英文官方文件才發現：個人廣告主完全不用過 review。

關鍵字是「Development Mode + Standard Access + ads_read」三件套。

Standard Access 的定義：你可以對「自己 admin 的廣告帳號跟資產」用 API permission，這個權限給測試跟個人用。Advanced Access 才需要過 App Review，那是給「服務第三方帳號」「商用 SaaS」用的。

Development Mode 是 Facebook Developer App 預設模式。它是 sandbox，讓你用少數 admin 帳號測試整合，不用先過 review。Mode 一直保留在 Development 狀態合法，只要你的整合範圍不擴及第三方帳號或商用。

ads_read 是 Meta API 的唯讀 scope，給 Insights API 用。可以拉 campaign / ad set / ad / ads_insights 全部數據。動不了東西。App Review 對 ads_read 寬鬆很多。

三件套組合起來，個人廣告主想看自己廣告效益，10 分鐘可以開始 call API。

--

具體 setup 4 步驟。

第 1 步：去 developers.facebook.com/apps 建一個 App。Type 選 Business 或 None 都行。建完記下 App ID 跟 App Secret。

第 2 步：App 加 Marketing API product。Settings > Products > Add Product > Marketing API。Mode 維持 Development，不要切 Live。

第 3 步：拿短期 token。去 developers.facebook.com/tools/explorer，左上 Application 切到剛建的 App。點 Get Token > Get User Access Token，勾 `ads_read`。會跳 Facebook 授權對話框，按確認。拿到的 token 約 1 小時到期。

第 4 步：換 long-lived token。打：

```
GET https://graph.facebook.com/v22.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id=APP_ID
  &client_secret=APP_SECRET
  &fb_exchange_token=SHORT_TOKEN
```

回傳新 token 60 天有效。存進 Redis 或 Neon DB。

到這裡可以開始 call /act_<AD_ACCOUNT_ID>/insights，拿廣告層級數據。

--

60 天到期 refresh 一定要做，不然 dashboard 會突然全空。

寫 cron 每 50 天（留 10 天 buffer）跑一次：

```js
async function refreshLongLivedToken(currentToken) {
  const url = `https://graph.facebook.com/v22.0/oauth/access_token`
    + `?grant_type=fb_exchange_token`
    + `&client_id=${APP_ID}`
    + `&client_secret=${APP_SECRET}`
    + `&fb_exchange_token=${currentToken}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.access_token;
}
```

把回來的新 token 覆蓋掉舊的。Long-lived token 可以無限續，每次 exchange 都重置 60 天。

--

Rate limit handling 也要寫，不寫高峰會被擋。

Development tier 是 200 calls/hour per ad account per Business Use Case。看 response header：

```
X-FB-Ads-Insights-Throttle: 
  {"app_id_util_pct": 12, "acc_id_util_pct": 28, "ads_api_access_tier": "development"}
```

任一 `util_pct` 超過 80，就 backoff 等下個 hour 再重試。超過 100 會直接擋。

如果你打多個 ad account 高頻拉資料，development tier 200/hr 會破。這時候才需要過 review 升 Standard Access tier。

--

什麼情況下真的要過 App Review：

1. 跨夥伴廣告帳號代操（agency 模式）：你想看別人的廣告數據，夥伴各自要建自己的 dev app + 自己授權，或主帳號要過 App Review 拿 Advanced Access
2. 用 `ads_management` 動廣告（建廣告 / 改預算 / 暫停）：review 嚴格，要附 use case + screencast，等 7-14 天
3. 要 Advanced Access 升 rate limit + 商用 / SaaS：必過 review + Business Verification

個人看自己廣告，這三條都不會碰到。

--

幾個 5/4/2026 之後的變更要注意。

AMSA（Ads Management Standard Access）改名「Marketing API Access Tier」，feature 規格收緊。

ads_insights breakdowns 不再回 reach metric，做 dashboard 不能 reach + breakdown 同時用，否則資料缺。

Long-lived token 機制本身不變，60 天到期 refresh 機制照寫。

--

整套設定完，從 0 到能 call /act_xxx/insights 拿到 JSON，10 分鐘搞定。Token refresh + rate limit handling 30 分鐘寫完。

學到的是：技術門檻有時候只是「有人沒讀完官方文件就轉述」造成的假象。中文教學圈一律抄「要過 App Review」這條，但官方文件其實寫得清楚 Development Mode 對個人開發者是開放的。下次看到「一定要 X 才能 Y」，先去英文官方確認一次再下結論。
