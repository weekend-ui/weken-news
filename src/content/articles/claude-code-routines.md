---
title: "Claude Code Routines 是什麼？三種觸發方式、用量限制、實際用法整理"
description: "2026 年 4 月 14 日，Anthropic 發布 Claude Code Routines。設定一次，自動執行，不需要你的電腦開著。這篇整理三種觸發方式、Pro/Max 用量限制、以及實際適合拿來做什麼。"
pubDate: 2026-04-17
tags: ["claude", "ai工具", "自動化", "claude-code"]
directAnswer: "Claude Code Routines 是一個自動化功能，讓你把 Claude Code 的任務設定好之後定時執行，或透過 API / GitHub 事件觸發，跑在 Anthropic 的雲端，不需要你的電腦開著。Pro 每天可跑 5 次，Max 每天 15 次，Team/Enterprise 25 次。2026 年 4 月 14 日發布，目前是 Research Preview。"
faq:
  - question: "Claude Code Routines 是什麼？"
    answer: "Routines 是 Claude Code 的自動化功能。你設定好一個任務（prompt + repo + 觸發條件），之後它會自動執行，跑在 Anthropic 管理的雲端伺服器，不需要你的電腦或本地環境保持開啟。"
  - question: "Claude Code Routines 有哪三種觸發方式？"
    answer: "三種觸發：1) Scheduled（排程）：每小時、每天、每週定時跑；2) API：每個 routine 有專屬的 endpoint + auth token，POST 一個訊息即觸發；3) GitHub Webhook：PR 開啟、merge、release 等 GitHub 事件自動觸發（需安裝 Claude GitHub App）。"
  - question: "Claude Code Routines 每天可以跑幾次？"
    answer: "Pro 方案每天 5 次，Max 方案每天 15 次，Team 和 Enterprise 每天 25 次。目前是 Research Preview，限制可能調整。"
  - question: "怎麼設定 Claude Code Routine？"
    answer: "兩種方式：1) 網頁介面：到 claude.ai/code/routines，點 New routine，填入名稱、prompt、選觸發條件；2) CLI：在 Claude Code 對話中輸入 /schedule 指令，對話式設定排程 routine。Prompt 必須完整自足，因為 routine 執行時沒有互動提示。"
  - question: "Claude Code Routines 適合拿來做什麼？"
    answer: "常見用途：每天自動掃 bug、PR 自動 review、部署後驗證、定時分析 Google Search Console 數據、定時更新報告。任何「重複做、有規則、不需要人在場判斷」的任務都適合。"
howToSteps:
  - name: "建立第一個 Routine"
    text: "到 claude.ai/code/routines，點 New routine。填入名稱和 prompt。Prompt 必須清楚說明任務目標和完成的樣子，因為執行時不會有確認提示。"
  - name: "選擇觸發方式"
    text: "Scheduled：選擇執行頻率（hourly/daily/weekly），填入你的時區時間，系統自動換算。API：啟用後會拿到專屬 endpoint 和 bearer token，POST 任何訊息即觸發。GitHub：需先安裝 Claude GitHub App 到目標 repo，再選擇要監聽的事件（PR、merge、release 等）。"
  - name: "連結 Repo 和環境"
    text: "選擇要讓 routine 存取的 GitHub repo（透過 /web-setup 授權）和 cloud environment（控制網路存取、環境變數、setup scripts）。注意：/web-setup 只給 cloning 權限，GitHub Webhook 觸發還需要另外安裝 Claude GitHub App。"
---

2026 年 4 月 14 日，Anthropic 發布了 Claude Code Routines。

我第一個反應是：這就是幫 Claude Code 加上了 cron job，但不需要你自己管伺服器。

--

## Routines 解決的問題

用 Claude Code 做過自動化的人都有這個問題：

任務要跑，但要開著電腦。或者要自己架 cron job、管服務、設環境變數。

Routines 把這些都移到 Anthropic 的雲端。你設定好，關掉電腦，它繼續跑。

--

## 三種觸發方式

**排程（Scheduled）**

每小時、每天、每週，選一個頻率，填時間，設定完就不用管了。適合定時掃 bug、定時生成報告。

**API 觸發**

每個 routine 有自己的專屬 endpoint 和 auth token。任何服務 POST 一個請求就能觸發，不需要打開 Claude Code。適合串接到其他工作流程。

**GitHub Webhook**

PR 開啟、merge、release 等 GitHub 事件自動觸發 routine。但這個要注意：需要另外安裝 Claude GitHub App 到目標 repo。用 `/web-setup` 只給 cloning 權限，不夠，這是目前最常踩的坑。

--

## 用量限制

Pro：每天 5 次
Max：每天 15 次
Team / Enterprise：每天 25 次

目前是 Research Preview，限制可能會調整。Pro 的 5 次對低頻任務夠用，高頻或多個 repo 的話 Max 比較合理。

--

## 怎麼設定

**網頁**：claude.ai/code/routines → New routine → 填 prompt → 選觸發條件

**CLI**：在 Claude Code 對話輸入 `/schedule`，對話式設定

Prompt 寫法要注意：routine 執行時沒有互動提示，沒有人在旁邊確認。所以 prompt 必須完整，清楚說明目標和「完成的樣子是什麼」。模糊的 prompt 在有人的時候還能補救，在 routine 裡會默默跑錯。

--

## 適合拿來做什麼

重複做、有規則、不需要人在場判斷的任務都適合：

- 每天掃 GitHub issues，自動分類優先序
- PR 開啟時自動 review 並留 comment
- 每週產出 GSC 數據摘要報告
- 部署後驗證頁面是否正常

不適合的：需要人做決策的任務，或者需要反覆調整 prompt 的探索性工作。

--

這個功能剛出來，我還在測。但方向很清楚：AI 從「你問它才動」變成「它自己在跑」。

這個轉變比功能本身更值得注意。
