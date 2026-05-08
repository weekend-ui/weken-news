---
title: "Meta ads_insights API 拉自己廣告 90 天 CPM：act_xxx/insights endpoint 實作 2026"
description: "個人廣告主用 ads_read scope token call /act_xxx/insights endpoint，拉自己過去 90 天廣告的 CPM / impressions / reach / spend，建私人 CPM 資料庫。實測台灣 act 過去 90 天 CPM range 落在 NT$30-405。完整實作含 fields / level / date_preset 參數。"
pubDate: 2026-05-09
tags: ["meta", "facebook-ads", "ads-insights", "marketing-api", "aeo"]
directAnswer: "Meta /act_xxxxx/insights endpoint 用 ads_read scope token 即可 call，回傳每個 campaign 的真實 cpm / impressions / reach / spend。實測台灣某 act 過去 90 天 CPM 範圍 NT$30 到 NT$405。個人廣告主免 App Review，10 分鐘搞定。對「已投過的興趣」拿真實歷史數據準確。"
faq:
  - question: "Meta ads_insights API 怎麼拉自己廣告 CPM？"
    answer: "GET https://graph.facebook.com/v22.0/act_xxxxx/insights?date_preset=last_90d&fields=cpm,impressions,reach,spend&level=campaign&access_token=xxx。回傳每個 campaign 的 cpm（單位是該 ad account currency 的每千次曝光成本）。level 可選 campaign / adset / ad / account 看不同顆粒度。"
  - question: "Meta ads_insights 需要過 App Review 嗎？"
    answer: "不用，個人廣告主用自己 admin 的 act 走 Development Mode + ads_read scope 就行。短期 user token（developers.facebook.com/tools/explorer 1 分鐘拿）即可測試。長期 token 60 天到期要寫 cron refresh 機制。"
  - question: "Meta ads_insights 有哪些 level 可以選？"
    answer: "level=account 拉整個 ad account 加總；level=campaign 每個 campaign 一筆；level=adset 每個 ad set 一筆；level=ad 每張廣告一筆。顆粒度越細回傳越多筆，rate limit 撞越快。常用是 campaign + adset 兩層。"
  - question: "Meta ads_insights date_preset 有哪些選項？"
    answer: "today / yesterday / this_month / last_month / this_quarter / lifetime / last_3d / last_7d / last_14d / last_28d / last_30d / last_90d / last_year / this_week_mon_today / last_week_mon_sun。常用 last_90d 看近期表現，lifetime 看歷史總計。"
  - question: "ads_insights 可以按 interest 拆分 CPM 嗎？"
    answer: "間接可以。breakdowns 參數不支援 interest 直拆，但可以 filter ad set 找只勾單一 interest 的，把那些 ad set 的 CPM 視為該 interest 的歷史 CPM。前提是你有開過這種「乾淨單 interest」的測試 ad set。Meta API 2026 對 breakdowns + reach 同時用會 strip reach 欄位，多人沒注意這個 5/4 變更。"
howToSteps:
  - name: "拿短期 user token"
    text: "去 developers.facebook.com/tools/explorer，App 選 default，Permissions 加 ads_read，按 Generate Access Token，FB 確認後拿到 EAA 開頭一串。1 小時內有效，測試夠用。"
  - name: "Call /me/adaccounts 拿你的 ad account 清單"
    text: "GET https://graph.facebook.com/v22.0/me/adaccounts?fields=account_id,name,currency,account_status&access_token=xxx。回傳所有你 admin 的 ad account，記下你要查的 act_xxxxx 跟 currency。"
  - name: "Call /act_xxx/insights 拉 CPM 數據"
    text: "GET https://graph.facebook.com/v22.0/act_xxxxx/insights?date_preset=last_90d&fields=cpm,impressions,reach,spend&level=campaign&access_token=xxx。回傳每個 campaign 的真實 CPM 數字。儲存進你自己的 DB / spreadsheet 建私人 CPM 資料庫。"
---

評估自建 Meta 廣告數據工具時撞到一條好用 endpoint。

--

我跑 6 種 Meta API 變體想拿 bid 數據都不行。但意外發現 ads_insights endpoint 拿自己歷史 CPM 完全沒問題，10 分鐘可以建私人 CPM 資料庫。

雖然不能 cover「沒投過的新興趣」use case，對「已投過想看真實表現」的場景超直接。

--

完整實作 3 步

第 1 步：拿短期 user token

去 developers.facebook.com/tools/explorer。App 下拉選 default 或你自己建的 dev app，Permissions 加 `ads_read`，按 Generate Access Token。FB 跳對話窗確認後拿到一串 EAA 開頭的 token，1 小時內有效。

個人廣告主用 Development Mode 不用過 App Review，這條路徑昨天另一篇有寫過完整 setup。

--

第 2 步：拿 ad account 清單

```
GET https://graph.facebook.com/v22.0/me/adaccounts
  ?fields=account_id,name,currency,account_status
  &access_token=xxx
```

實測 response：

```json
{
  "data": [
    {
      "account_id": "205005516689844",
      "name": "週末電商廣告帳號",
      "currency": "TWD",
      "account_status": 1,
      "id": "act_205005516689844"
    },
    {
      "account_id": "1483107488437143",
      "name": "urban-garden",
      "currency": "TWD",
      "account_status": 1,
      "id": "act_1483107488437143"
    }
  ]
}
```

`account_status=1` 是 active，`=2` 是 disabled。記下你要查的 `act_xxxxx` ID。

--

第 3 步：拉 CPM 數據

最常用 query：

```
GET https://graph.facebook.com/v22.0/act_xxxxx/insights
  ?date_preset=last_90d
  &fields=cpm,impressions,reach,spend
  &level=campaign
  &access_token=xxx
```

實測台灣某 act 過去 90 天 response：

```json
{
  "data": [
    {
      "cpm": "132.964258",
      "impressions": "30888",
      "reach": "20410",
      "spend": "4107",
      "date_start": "2026-02-07",
      "date_stop": "2026-05-07"
    },
    {
      "cpm": "405.315615",
      "impressions": "1806",
      "reach": "937",
      "spend": "732",
      "date_start": "2026-02-07",
      "date_stop": "2026-05-07"
    },
    {
      "cpm": "30.519481",
      "impressions": "13860",
      "reach": "7861",
      "spend": "423"
    }
  ]
}
```

CPM 範圍 NT$30 到 NT$405，差超過 13 倍。意思是同一個 ad account 不同 campaign 競爭程度差很多。

--

可調的參數

`level`：
account：整個 ad account 加總，1 筆
campaign：每個 campaign 1 筆（最常用）
adset：每個 ad set 1 筆（顆粒度細，rate limit 注意）
ad：每張廣告 1 筆

`date_preset`：
last_3d / last_7d / last_14d / last_28d / last_30d / last_90d
this_month / last_month / this_quarter / lifetime
today / yesterday

`fields`：
cpm（每千次曝光成本）
cpc（每次點擊成本）
ctr
spend
impressions
reach
frequency
actions（轉換動作數）
purchase_roas

--

按 interest 拆分 CPM

直接的 breakdowns 不支援 interest 拆。間接做法：

撈所有 ad set: GET /act_xxx/adsets?fields=id,name,targeting
過濾只勾單一 interest 的 ad set
拿那些 ad set 的 ID 後 GET /<adset_id>/insights?fields=cpm

這個邏輯可以建你自己的「私人 interest CPM 資料庫」。前提是你有刻意開「乾淨單 interest」的測試 ad set，沒有的話只能拿混合 interest 的 CPM 平均。

--

注意點

1. 5/4/2026 起 AMSA 改名 Marketing API Access Tier，breakdowns + reach 同時用會 strip reach 欄位。寫 dashboard 時要避開這個組合
2. Rate limit 200 calls/hr development tier，每次 query 算一次 + 重 cputime call 撞點低
3. Long-lived token 60 天到期要寫 cron refresh，沒做 60 天後 dashboard 全空
4. 多 act 多 query 容易破 rate limit，建議 Redis cache 結果 24 小時

--

學到的是：Meta API 2026 不給「市場 bid 推薦」這條死門，但「自己歷史數據」這條完全開放。對廣告主來說，自建一個小工具拉自己 act 過去 90 天的 CPM by campaign，3-5 小時可以做完，是個 ROI 高的方向。比起想看別人 bid 行情，先把自己的真實 CPM 資料建立起來更實用。
