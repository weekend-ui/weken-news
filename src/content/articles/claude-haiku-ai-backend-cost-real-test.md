---
title: "客戶用 Claude Haiku 4.5 寫文章後台，每天 1 篇月費實測 NT$20（不是 NT$600）"
description: "幫一個顧問案的客戶估算 AI 後台月費，他原本以為要訂 Claude Pro NT$600 月費才能用 AI 寫文章。實測 Claude Haiku 4.5 API 一篇 1000-1400 字 AEO 文章成本約 US$0.02，每天寫 1 篇月費 NT$20。完整 token 計算 + Pro vs API 選擇分析寫在這。"
pubDate: 2026-04-25
tags: ["claude haiku", "anthropic api", "ai 接案", "成本估算", "aeo"]
directAnswer: "Claude Pro 訂閱（NT$600/月）跟 Claude API 是不同產品。API 是按 token 計費的 pay-as-you-go，Haiku 4.5 定價 input $1/M、output $5/M tokens。實測 1000-1400 字繁中 AEO 文章一篇成本約 US$0.02（NT$0.65），每天寫 1 篇月費約 US$0.6（NT$20）。Pro 訂閱不會送 API 額度，兩個帳單分開。客戶用 AI 寫文章後台用 API 比訂 Pro 划算 30 倍。"
faq:
  - question: "Claude Pro 跟 Claude API 有什麼不同？"
    answer: "Claude Pro 是 claude.ai 網頁版的訂閱方案（NT$600/月），用於網頁聊天。Claude API 是給開發者程式呼叫的（pay-as-you-go），按 token 計費。兩個帳單完全分開：訂 Pro 不會送 API 額度，用 API 不需要訂 Pro。常見誤解：以為要訂 Pro 才能用 API，這是錯的。"
  - question: "Claude Haiku 4.5 API 定價怎麼算？"
    answer: "input $1/M tokens、output $5/M tokens。一篇 1000-1400 字繁中 AEO 文章實測：input ≈ 4000 tokens（系統 prompt + 標題 + 摘要 + 內容片段）、output ≈ 3000-3500 tokens（slug + excerpt + tags + content）。一次呼叫成本 = 4000 × $1/M + 3500 × $5/M ≈ $0.02。換成台幣約 NT$0.65。"
  - question: "業主用 AI 寫文章後台月費會很貴嗎？"
    answer: "不會。每天寫 1 篇月費 ≈ $0.6 美金（NT$20），比訂 Pro 月費 NT$600 便宜 30 倍。實測經驗：儲值最低 $5 美金可以用 3-8 個月。即使每天用 2-3 次（含 AI 建議按鈕、改寫），月費也通常 NT$50 內。對「業主一個人用」的個人品牌站來說 API 完全夠。"
  - question: "什麼時候 Pro 訂閱才比 API 划算？"
    answer: "Pro 適合：大量在 claude.ai 網頁手動聊天（每天 100+ 次對話）、需要 Projects / Computer Use 等 Pro 專屬功能、不想處理付費 + token 計算。API 適合：透過程式整合（聊天機器人、後台 AI 寫手、自動化）、用量低或波動大、要精準控制成本。一句話：手動操作多選 Pro，程式整合多選 API。"
  - question: "Anthropic API 怎麼開始使用？"
    answer: "四步：1. 到 console.anthropic.com 註冊帳號 2. Settings → Billing → Add payment method（最低儲值 $5 美金，或綁信用卡 pay-as-you-go）3. API Keys → Create Key → 複製 sk-ant- 開頭那串 4. 把 key 貼到應用後台或 env var。沒有「啟用」流程，key 拿到立刻可呼叫。"
howToSteps:
  - name: "確認 token 估算"
    text: "對你的 prompt 跑 Anthropic 的 token counter（API 提供）或拿一個樣本 input + output 算 character 數估 token。中文 1 字 ≈ 1.5-2 tokens。input 算 prompt + 使用者輸入，output 算回傳字數。"
  - name: "用 Haiku 4.5 不用 Sonnet/Opus"
    text: "後台寫文章用 Haiku 就夠（input $1 / output $5 per M），便宜 3 倍 vs Sonnet 4.6（$3/$15）、便宜 15 倍 vs Opus 4.6（$15/$75）。Sonnet 留給「需要更深思考」的場景，Opus 留給「最高品質」的關鍵任務。"
  - name: "估算月費 = 單次 × 預期次數"
    text: "公式：input_tokens × 1/M + output_tokens × 5/M = 單次美金。乘上每日次數 × 30 = 月費。實測一篇 AEO 文章單次 $0.02，每天 1 篇月費 $0.6。算清楚再跟業主交接。"
---

最近幫一個顧問案的客戶估算 AI 後台月費。他想用後台的「AI 幫我填寫」按鈕寫文章，但問了我一個關鍵問題：「我是不是要先升 Claude Pro NT$600 才能用？」

答案是：不用，而且 API 月費可能 NT$20 就搞定。

完整估算和邏輯記錄如下。

--

## 為什麼會誤解「要升 Pro」

Claude 的兩個產品名字太像：

Claude Pro = claude.ai 網頁版的訂閱方案，月費 US$20（NT$600），用於人類在網頁手動聊天
Claude API = 開發者用程式呼叫的 API，pay-as-you-go 按 token 計費

兩個帳單完全分開。訂 Pro 不會送你 API 額度，用 API 也不需要訂 Pro。

但因為名字都叫「Claude」，多數第一次接觸的業主會誤以為訂 Pro 就能解鎖 API。這是錯的。

--

## Haiku 4.5 定價怎麼算

Haiku 4.5（最新版）的官方定價：

input：$1 per million tokens
output：$5 per million tokens

token 是 Anthropic 的計費單位，繁中 1 字大約 1.5-2 tokens。

我幫客戶估算的場景是「每天用後台寫 1 篇 1000-1400 字 AEO 文章」，實測 token 數：

input 約 4000 tokens：包含系統 prompt（要求 AI 寫成 AEO 友善格式的指引）+ 標題 + 參考摘要 + 內容片段
output 約 3000-3500 tokens：slug + excerpt + tags 陣列 + 1000-1400 字 content

單次成本：

```
input:  4000 × $1/M  = $0.004
output: 3500 × $5/M  = $0.0175
total ≈ $0.02 美金（約 NT$0.65）
```

每天 1 篇，月費：

```
$0.02 × 30 = $0.6 美金（約 NT$20）
```

不是 NT$600，是 NT$20。比訂 Pro 便宜 30 倍。

--

## 為什麼業主常算錯費用

幾個常見誤解：

第一，把 Pro 月費套到 API 用量上。直接以為「不訂月費等於沒能用」。實際上 API 是儲值制，用多少扣多少，沒月費門檻。

第二，沒分清楚 Sonnet 跟 Haiku 價差。如果用 Sonnet 4.6（$3/$15 per M）寫文章，每篇成本變成 $0.065，月費 $2 美金（NT$65），還是比 Pro 便宜，但比 Haiku 貴 4 倍。

第三，沒算進「AEO 建議」按鈕也會花錢。如果業主每篇文章除了「AI 填寫」還會跑「AEO 建議」（通常用 Sonnet），單次再多 $0.065，月費可能跳到 NT$80-100。

所以給客戶的真實估算會分三層：
保底（純 Haiku 寫 1 篇）：NT$20/月
中等（Haiku 寫 + Sonnet 建議）：NT$80/月
偏高（每篇改寫 3-5 次 + AEO 建議）：NT$150-250/月

最高估也不到 Pro 月費 NT$600 的一半。

--

## 什麼時候反而要選 Pro

API 不是萬能解。Pro 的場景：

大量在 claude.ai 網頁手動聊天（每天 100+ 次對話）
需要 Projects、Computer Use 等 Pro 專屬功能
不想處理付費 + token 計算的麻煩

API 的場景：

透過程式整合（聊天機器人、後台 AI 寫手、自動化）
用量低或波動大
要精準控制成本

一句話：手動操作多選 Pro，程式整合多選 API。

--

## 怎麼跟客戶交接 API

我給客戶的四步流程：

1. 到 console.anthropic.com 註冊帳號
2. Settings → Billing → Add payment method 或儲值最低 $5 美金
3. API Keys → Create Key → 複製 sk-ant- 開頭那串
4. 把 key 貼到後台設定頁的「AI API 金鑰」欄位

整個過程 5 分鐘。沒有「啟用 API」這種流程，key 拿到立刻可呼叫。

如果客戶選儲值制 $5，依保底用量 NT$20/月可以撐 7-8 個月，到時收到信再儲。如果用量大選綁信用卡 pay-as-you-go，月底結帳。

--

## 學到什麼

「我是不是要訂 Pro 才能用 AI 後台」是新業主最常誤解的問題。誤解一次可能讓他多付 30 倍費用，或乾脆放棄用 AI 後台。

接案者交接 AI 後台時，要主動把這個帳算清楚給對方看，不能等他自己摸索。一張試算表就能救他一年的訂閱費。
