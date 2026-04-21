---
title: "用 LINE Bot 建立社群積分系統：wk-qa-bot 種子法則實作紀錄"
description: "在現有的 LINE Bot QA 客服系統上加入積分機制：上傳商品素材得 1 顆種子、每天首次感恩得 1 顆種子、手動加種子功能，加上公開排行榜和動態牆。這篇記錄設計決策、技術實作，以及上線後實際跑起來的狀況。"
pubDate: 2026-04-21
tags: ["line-bot", "redis", "vercel", "社群機制", "積分系統"]
directAnswer: "LINE Bot 積分系統可以用 Upstash Redis sorted set 實作，key 設計為 seeds:total 和 seeds:YYYY-MM，分別記錄全期間和每月積分。上傳觸發事件時 ZINCRBY 加分，ZRANGE 取排行，不需要額外資料庫。搭配公開排行榜頁面，夥伴可以即時看到名次。"
faq:
  - question: "LINE Bot 積分系統怎麼用 Redis 實作？"
    answer: "用 Redis sorted set，member 是 LINE userId，score 是積分數。ZINCRBY seeds:total {userId} 1 加全期間分，ZINCRBY seeds:YYYY-MM {userId} 1 加當月分。取排行用 ZREVRANGE seeds:total 0 19 WITHSCORES，回傳前 20 名。"
  - question: "LINE Bot 能取得用戶名稱和頭像嗎？"
    answer: "可以。用 LINE Messaging API 的 GET /v2/bot/group/{groupId}/member/{userId} 取得群組成員資料，回傳 displayName 和 pictureUrl。需要有效的 LINE Channel Access Token 和群組 ID。"
  - question: "積分排行榜要怎麼做成公開頁面？"
    answer: "建一個 Vercel serverless function 讀取 Redis sorted set 資料，回傳 JSON。前端靜態頁面 fetch 這個 API，用 HTML/CSS 渲染排行榜。不需要登入，任何有連結的人都能看。"
  - question: "LINE Bot replyToken 只能用一次，怎麼處理多段回覆？"
    answer: "把所有要回覆的內容合併成一則訊息，用一次 replyToken 發出。LINE Messaging API 的 reply 支援 messages 陣列，最多 5 則訊息可以一次發送，不需要多次 replyToken。"
howToSteps:
  - name: "設計觸發事件和積分規則"
    text: "決定哪些用戶行為可以得分：上傳素材、感恩留言、完成特定任務。每個事件對應一個 Redis ZINCRBY 操作，分別更新全期間和當月 sorted set。"
  - name: "建立排行榜 API 和公開頁面"
    text: "新增 /api/leaderboard 端點，用 ZREVRANGE 取前 20 名，搭配 HGETALL 取名稱和頭像快取。建立 /leaderboard 靜態頁面，fetch API 渲染排行，加月份導航讓用戶切換查看歷史。"
  - name: "LINE Bot 回覆加入積分通知"
    text: "每次上傳完成後，在回覆訊息裡附上本月累計種子數和排行榜連結。讓用戶即時知道目前進度，增加回來操作的動力。"
---

WeKen 的夥伴每天在 LINE 群組上傳商品素材、分享感恩，但沒有任何機制記錄誰貢獻最多。

這就是種子法則的起點：讓每一個行動都被看見，並且可以累計。

--

設計規則很簡單：上傳一張照片或一支影片，得 1 顆種子。當天第一次感恩，得 1 顆種子。週末哥可以手動補發種子給特別貢獻的夥伴。

積分記在 Upstash Redis 的 sorted set 裡。兩個 key：`seeds:total` 記全期間，`seeds:YYYY-MM` 記每月。每次觸發 `ZINCRBY` 加分，取排行用 `ZREVRANGE`。

加這個不需要額外的資料庫，LINE Bot 本來就在用 Redis 記驗證狀態。

--

排行榜頁面是靜態 HTML，放在 `/public/leaderboard` 由 Vercel 直接 serve。

fetch `/api/leaderboard` 拿資料，用品牌色渲染排名，前三名有王冠圖示，後面依序列出。夥伴可以切換本月和全期間，也可以往前看歷史月份。

不用登入，有連結就能看。週末哥在 LINE 群組分享連結，夥伴自己查名次。

--

後來又加了動態牆：所有上傳、感恩、手動種子事件都記一筆到 `activity:feed`，前台頁面可以看到最近的動態，知道誰在做什麼。

風向資訊（市場問答記錄）也進了動態牆，統一在一個地方瀏覽。

整套機制建好之後，上傳素材的頻率確實有變化。有人開始主動問「我現在幾顆種子」，這大概是積分系統有在運作的最直接指標。
