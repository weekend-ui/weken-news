---
title: "Meta 廣告興趣標籤競爭強度怎麼測：4 tier 8 個方法 2026 完整盤點"
description: "想看某個 Meta 興趣標籤是不是很多人在競價？2026 年 Meta API 已不給 bid 數據，剩下 4 個 tier 8 個方法可以間接測：免費（Ad Library 手動 / 自己 ads_insights 歷史）/ 低成本實測（NT$300 燒 24-48h）/ 付費第三方（AdTargeting.io / SparkToro / Madgicx）/ 過 App Review 程式化 Ad Library。"
pubDate: 2026-05-09
tags: ["meta", "facebook-ads", "ads-targeting", "competition-analysis", "aeo"]
directAnswer: "2026 年沒有 API 直接給 Meta 廣告興趣的 bid 推薦，要組合 4 tier 8 個方法間接測。最便宜組合：Ad Library 網頁手動搜（看對手活躍度）+ 你自己 ads_insights 歷史 CPM 對照。最準是開 NT$300 預算燒 24-48 小時看真實 CPM。付費省時間版是訂 AdTargeting.io 月費 $129。"
faq:
  - question: "Meta 廣告興趣標籤的 CPM 怎麼查最準？"
    answer: "最準是自己開低預算（NT$300）跑 24-48 小時，看 Ads Manager 顯示的真實 CPM。台灣熱門興趣 CPM 200-400 NTD、中等 50-150、低 20-50。Meta API 2026 已不給 bid 推薦，UI 跟 API 都不會直接告訴你。"
  - question: "Meta Ad Library 怎麼看興趣競爭強度？"
    answer: "去 facebook.com/ads/library 不用登入。搜興趣相關 keyword（例如「日本登山」），加 country=TW filter，看 active ads 數量。100+ active ads = 紅海，<10 = 藍海。2026 加了 impression volume 排序，能看誰猛打 budget。"
  - question: "AdTargeting.io 跟 SparkToro 哪個適合測 Meta 競爭？"
    answer: "看用 case。AdTargeting.io 月費 $129 直接給 8839 個 Meta interest 的眾包 CPC/CPM 估算 + saturation 評分，最對應「測競爭」。SparkToro 月費 $50-100 看 audience 在哪裡活動，間接推競爭，比較適合 audience research 不是 bid 估算。"
  - question: "Meta delivery_estimate API 還能用嗎？"
    answer: "可以但不給 bid。2026 v22 v25 實測，回傳 estimate_mau_lower_bound / upper_bound + estimate_ready，daily_outcomes_curve 永遠單點全 0。bid_estimations 已 deprecate。只能拿來看 audience size，等同 Ads Manager UI 的 Estimated Audience。"
  - question: "什麼情況該訂閱第三方競爭分析工具？"
    answer: "每月找新標籤 5-10 次以上才划算。AdTargeting.io $129/月 = 一年 $1548 USD，要回本至少代你省 12 小時人工時間。如果你「不常用」（每月 1-2 次找標籤），訂閱不划算，用 Tier 1 免費方法+ 必要時 Tier 2 燒小預算實測。"
howToSteps:
  - name: "Tier 1：Ad Library 手動搜 + 歷史 CPM 對照（免費，2 分鐘 per interest）"
    text: "facebook.com/ads/library 搜興趣相關 keyword + country=TW + Active filter，數 active ads 數量。同時 GET /act_xxxxx/insights?date_preset=last_90d&fields=cpm 拉自己過去 90 天廣告 CPM 對照（如果該 interest 投過）。"
  - name: "Tier 2：NT$300 燒 24-48 小時實測（最準）"
    text: "建一個 ad set 只勾你要測的 interest，daily budget NT$200，optimization_goal=LINK_CLICKS。跑 1-2 天看 Ads Manager 的真實 CPM。確認後才決定要不要正式投放。"
  - name: "Tier 3：訂第三方眾包工具（高頻使用才值得）"
    text: "AdTargeting.io $129/月 Growth plan 直接給 saturation 評分 + CPC range。SparkToro $50-100/月看 audience 行為。每月找新標籤 5+ 次才划算。"
---

朋友問我「怎麼用數據方法看 Meta 廣告標籤是不是很多人在競價」，我回答之前先驗證了一輪。

--

第一個直覺是 Meta Marketing API 應該有 endpoint 可以回 bid 推薦。實測完全跌破眼鏡：2026 年 reachestimate 跟 delivery_estimate 都已經把 bid 數據 strip 掉，只剩 audience size。

意思是程式化路線封死。剩下只能組合間接方法。盤完有 4 個 tier 8 個方法，每個 tier 不同 trade-off。

--

Tier 1：免費 + 直接可做（沒工程量）

第 1 條：Meta Ad Library 網頁手動搜

去 facebook.com/ads/library，不用登入也不用 API。搜興趣相關的 keyword（不是 interest 名本身，是用戶會搜的詞）。

例如想測「日本登山機能服飾」這個 interest 競爭：

```
facebook.com/ads/library?country=TW&q=日本登山&active_status=active
```

看出來 active ads 數量。加上 2026 新功能「按 impression volume 排序」，能看誰猛打 budget。

判讀：100+ active ads 是紅海，10-50 是中等，< 10 是藍海。

缺點：要手動操作每個 interest 1-2 分鐘，沒辦法批次。

--

第 2 條：自己歷史 CPM via ads_insights API

如果你過去 90 天有投過廣告，可以拉自己 act 的 cpm 對照。

```
GET https://graph.facebook.com/v22.0/act_xxxxx/insights
  ?date_preset=last_90d
  &fields=cpm,impressions,reach,spend
  &level=campaign
  &access_token=xxx
```

回傳每個 campaign 的真實 cpm。實測台灣某個 act 過去 90 天 CPM range 落在 NT$30 到 NT$405 之間。

對「已投過的興趣」很準。對「沒投過的新興趣」沒史，但這恰恰就是你想測的，所以這條只 cover 一半 use case。

--

Tier 2：低成本實測（最準，要真花錢）

第 3 條：開 NT$300 預算測 24-48 小時看真實 CPM

建一個 test ad set，勾你想測的 interest，daily budget NT$200，optimization_goal=LINK_CLICKS。跑 1-2 天觀察 Ads Manager 顯示的真實 CPM。

判讀：
台灣熱門興趣：CPM 200-400 NTD（紅海）
中等：CPM 50-150 NTD
低競爭：CPM 20-50 NTD（藍海）

優點：這是市場真實競價，不是估計
缺點：要真投錢、真等 2 天

對「我要不要長期投放這個 interest」這種大決策，NT$300 燒 2 天當決策成本完全划算。

--

Tier 3：付費第三方眾包工具

第 4 條：AdTargeting.io（最對應你需求）

月費 $129 USD Growth plan。爬 Meta 8839 個 interest 的眾包估計值，直接給：
audience size
CPC range
CPM range
saturation 評分（1-10 分）

不是即時數據，是過去某時間點累積的，但對「相對排名」夠用。

每月找新標籤 5-10 次以上才划算。回本門檻：年費 $1548 USD ÷ 你每小時時薪 = 至少省幾小時人工。

--

第 5 條：SparkToro

月費 $50-100 USD。不直接給 bid，給 audience 行為輪廓：他們聽什麼 podcast、追什麼 YouTube、看什麼網站。

間接推競爭：如果該族群 attention 已經被某類廣告主搶完，你下廣告會貴。

適合 audience research，不是專做 bid 估算。

--

第 6 條：Madgicx

月費 $199-499 USD。自家用戶廣告數據彙整出競爭等級。要你帳戶接進去她們系統，數據範圍取決於 Madgicx 用戶池大小。

廣告主 agency 跑大量帳戶才划算。個人廣告主用一年也不一定回本。

--

Tier 4：過 App Review 拿 Ad Library 程式化權限

第 7 條：申請 Page Public Content Access

過 App Review 後可以 call /ads_archive 程式化清點 active ads 數量、impression range、investment range。

工程量：自建工具 8-12 小時 + Meta App Review 等 7-14 天。

需要你的 App 過 Business Verification，2026 年要法人文件，細節對不上會被退。

對「個人廣告主自用」門檻太高，適合 agency 或 SaaS 服務商。

--

第 8 條：自建半手動工具（中間路線）

不過 review 但加 UX 降摩擦：在你既有 Meta 興趣標籤工具加按鈕「打開 Ad Library 搜這個 interest」，點下去自動跳 facebook.com/ads/library?q=<interest>&country=TW。

工程量 1-2 小時。不解決「程式化」問題，但省你複製貼上時間。

--

我的推薦組合（依 use case）

頻率低（每月 1-2 次找新標籤）
Tier 1 第 1+2 條 + Tier 2 第 3 條當決勝
零訂閱費，找標籤時 Ad Library 手動搜+ 你自己歷史對照，要決定下大預算之前燒 NT$300 實測

頻率中（每月 5-10 次）
Tier 3 第 4 條 AdTargeting.io 訂閱 + Tier 2 第 3 條當決勝
$129/月省你大量手動操作時間

頻率高（agency 模式 + 多帳戶）
Tier 4 第 7 條 App Review + 自建批次工具
工程量大但長期 ROI 好

--

學到的是：當 platform 主動把數據 strip（像 Meta 2026 對 bid 收緊），方法論要從「程式化」改成「組合手動 + 實測 + 第三方」。直接對應的 API 沒了不代表問題沒解，只是解的方式變繁瑣。盤過所有 tier 才知道哪條對你的 use case 划算。
