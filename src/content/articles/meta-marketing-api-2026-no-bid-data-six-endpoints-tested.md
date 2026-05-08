---
title: "Meta Marketing API 2026 不再回 bid 數據：6 個 endpoint 全試實測記錄"
description: "想用 Meta API 程式化看廣告興趣標籤的推薦 bid 跟競爭密度？2026 年 v22 v25 都試過：reachestimate / delivery_estimate / 加 bid_amount / 加 budget / 換 optimization_goal / Ad Library API 全測。Meta 已 strip bid_estimations，daily_outcomes_curve 只回單點全 0。"
pubDate: 2026-05-09
tags: ["meta", "facebook-ads", "marketing-api", "delivery-estimate", "aeo"]
directAnswer: "Meta Marketing API 2026 已不回 bid 數據。reachestimate 只回 users_lower_bound / users_upper_bound / estimate_ready 三欄，bid_estimations 欄消失。delivery_estimate 的 daily_outcomes_curve 永遠只回 1 個全 0 的點。v22 跟 v25、加 bid_amount、加 budget、換 optimization_goal 都試過，無法解。"
faq:
  - question: "Meta reachestimate API 為什麼不回 bid_estimations？"
    answer: "2026 年已不回。實測 v22 用最精簡 targeting（geo_locations + interests + age）只 call reachestimate，response 只有 users_lower_bound、users_upper_bound、estimate_ready 三欄，沒 bid_estimations。早期文檔提的 bid 欄位已 deprecate，跟 5/4 起 AMSA 改名 + reach metric 變更同一波收緊。"
  - question: "Meta delivery_estimate API 的 daily_outcomes_curve 為什麼只回零？"
    answer: "實測 v22 跟 v25 都這樣。response 結構正常含 daily_outcomes_curve 陣列，但陣列裡永遠只 1 個元素，spend / reach / impressions / actions 全為 0。加 bid_amount、加 budget、換 optimization_goal LINK_CLICKS / REACH 都不影響。Meta 把這個 endpoint 從 API 端 strip 成只給 audience size。"
  - question: "Meta API 還有什麼 endpoint 給競價數據？"
    answer: "都沒了。reachestimate / delivery_estimate / reachfrequencypredictions 都不回 bid。Ad Library API（ads_archive）需過 App Review 才能 access，且回傳的是 active ads 數量不是 bid。你自己 act 的 insights endpoint 可以拉歷史 cpm，但只 cover 已投過的廣告，新興趣沒史。"
  - question: "Meta 廣告 bid 推薦只能在哪裡看？"
    answer: "Ads Manager UI 建完整 ad set + 設預算 + 走報價流程才會顯示，且不是 bid 曲線只是單一推薦。最準的方式是開低預算（NT$300）跑 24-48 小時看真實 CPM。第三方工具如 AdTargeting.io 月費 $129 提供眾包估算 CPC/CPM，但精準度比不上自己實測。"
  - question: "什麼情況下 reachestimate 才會回 bid 欄位？"
    answer: "2026 年實測沒有任何 input combo 會讓 bid 欄位出現。包括加 currency 會直接拒絕（Param currency on field reachestimate: This param is not valid）。delivery_estimate 加 currency 也會被拒。bid_amount 可以放但不影響 daily_outcomes_curve 結果。"
howToSteps:
  - name: "驗證 reachestimate 真實 response"
    text: "拿 ads_read scope 的 user token，call GET https://graph.facebook.com/v22.0/act_xxxxx/reachestimate?targeting_spec={...}&access_token=xxx，response 只有 users_lower_bound / users_upper_bound / estimate_ready 三欄。沒有 bid_estimations。"
  - name: "驗證 delivery_estimate daily_outcomes_curve"
    text: "call GET https://graph.facebook.com/v22.0/act_xxxxx/delivery_estimate?targeting_spec={...}&optimization_goal=LINK_CLICKS&access_token=xxx，daily_outcomes_curve 永遠是 [{spend:0, reach:0, impressions:0, actions:0}] 單點全零。試 bid_amount=200 / 加 budget / 換 v25 / 換 REACH 都一樣。"
  - name: "替代方案：拉自己 act insights"
    text: "GET /act_xxxxx/insights?date_preset=last_90d&fields=cpm,impressions,reach,spend&level=campaign 拿自己過去廣告的 CPM。對已投過 interest 有用，新 interest 沒史只能去 Ads Manager 試 ad set 看 estimated reach。"
---

評估自建一個廣告四象限分析工具的時候，第一個技術障礙撞到 Meta API。

--

我以為簡單：個人廣告主用 Marketing API ads_insights 走 Development Mode + ads_read，10 分鐘設定完，剩下就 call reachestimate 拿 bid 範圍 + audience，畫 bubble chart。

跟我以為的差很多。Meta API 2026 已經不再給 bid 數據。

--

實測 6 種 endpoint 變體，全都不回 bid。

第 1 試：/reachestimate（舊 endpoint，docs 說會回 bid_estimations）

```
GET https://graph.facebook.com/v22.0/act_xxxxx/reachestimate
  ?targeting_spec={"geo_locations":{"countries":["TW"]},"interests":[{"id":"6003120113217","name":"Stock photography"}],"age_min":18,"age_max":65}
  &access_token=...
```

response：

```json
{
  "data": {
    "users_lower_bound": 141700,
    "users_upper_bound": 166700,
    "estimate_ready": true
  }
}
```

只有 users 範圍 + estimate_ready 三欄。沒有 bid_estimations。

加 currency=TWD 會直接被拒：「Param currency on field reachestimate: This param is not valid」。
加 optimize_for=LINK_CLICKS 也被拒：「Param optimize_for on field reachestimate: This param is not valid」。

--

第 2 試：/delivery_estimate（新 endpoint）

```
GET https://graph.facebook.com/v22.0/act_xxxxx/delivery_estimate
  ?targeting_spec={...}
  &optimization_goal=LINK_CLICKS
  &access_token=...
```

response：

```json
{
  "data": [{
    "estimate_mau_lower_bound": 141700,
    "estimate_mau_upper_bound": 166700,
    "estimate_ready": true,
    "daily_outcomes_curve": [
      { "spend": 0, "reach": 0, "impressions": 0, "actions": 0 }
    ],
    "estimate_dau": 0
  }]
}
```

`daily_outcomes_curve` 文檔說「應該是 bid 軸對應的 reach / impressions 曲線」，實際只回 1 個全 0 的點。

加 bid_amount=200、加 budget、換 optimization_goal=REACH、換 v25.0 API 版本，全試過，都一樣。

--

第 3 試：fields query 想顯式拉 bid_estimate

```
&fields=daily_outcomes_curve,estimate_dau,estimate_mau,estimate_ready,bid_estimate
```

response：「Tried accessing nonexisting field (estimate_mau)」。意思是連 estimate_mau 都不接受（要 estimate_mau_lower_bound + upper_bound 分開）。bid_estimate 欄位查不到。

--

第 4 試：Ad Library API（ads_archive）

```
GET https://graph.facebook.com/v22.0/ads_archive
  ?search_terms=廚藝&ad_reached_countries=["TW"]&ad_active_status=ACTIVE
```

response：「Application does not have permission for this action」。需要過 App Review 拿 Page Public Content Access 才能 call。

--

第 5 試：v25.0 換廣大 interest

換成 audience 6.2M 的「Stock photography」，再 call delivery_estimate。

```json
{
  "estimate_mau_lower_bound": 141700,
  "estimate_mau_upper_bound": 166700,
  "estimate_ready": true,
  "daily_outcomes_curve": [{"spend": 0, "reach": 0, "impressions": 0, "actions": 0}]
}
```

audience 大廣度也沒讓 bid 出現。

--

第 6 試：多 interest stack

```
"interests": [
  { "id": "6003120113217", "name": "Stock photography" },
  { "id": "6003196556865", "name": "Candid photography" },
  { "id": "6003784991078", "name": "Black and White Photography" }
]
```

reach 從 141K-166K 漲到 217K-255K，OR-stack 邏輯運作正常。但 bid 還是不回。

--

結論：2026 年用 Meta Marketing API 程式化測廣告興趣競價密度，沒戲。

可能跟 2026/5/4 起 AMSA 改名為 Marketing API Access Tier、breakdowns 不再回 reach metric 同一波收緊。Meta 把競價這層數據關掉。

--

可以做什麼

1. /act_xxx/insights：拉自己 act 過去 90 天的 cpm / spend / reach。對已投過 interest 有用。新 interest 沒史。
2. Ads Manager UI 建 ad set：走完整流程 + 設預算才看得到 estimated reach。bid 推薦在某些 objective 才出現。
3. 開 NT$300 預算實測 24-48 小時：最準。
4. AdTargeting.io / Madgicx 等第三方眾包數據：付費 $100-300/月，給 8839 interest 的估計 CPC/CPM。

不可以做：自建工具直接 call Meta API 出 bid 曲線。

--

學到的是：API 文檔跟 API 行為不一定一致，特別是 platform 收緊的 endpoint。要做新整合前先 5 分鐘 curl 一次看 response 真實長什麼，比讀 30 分鐘 doc 更可靠。我這次 8 小時評估有 1 小時是「先驗證，發現死門」省下了沒寫白工的 7 小時。
