---
title: "Claude Code Channels 實測：Telegram 成功、LINE 失敗，差在哪裡"
description: "我試過把 Claude Code 接上 LINE，失敗了。Telegram 和 Discord 能用，LINE 不行，原因不是技術複雜度，是白名單機制。這篇說清楚差別在哪。"
pubDate: 2026-04-17
tags: ["claude-code", "ai工具", "telegram", "line", "實測"]
directAnswer: "Claude Code Channels 目前只支援官方白名單插件（Telegram、Discord）。LINE 因不在官方白名單內，自製 MCP server 無法取得自動注入 session 的權限，實測確認無解。結論：要讓 AI 在 session 裡直接收發訊息，用 Telegram 或 Discord；LINE 只能做獨立 Bot，無法整合進 Claude Code 工作流程。"
faq:
  - question: "Claude Code Channels 支援哪些平台？"
    answer: "目前官方支援 Telegram 和 Discord，透過 Anthropic 官方插件市集安裝。其他平台（LINE、WhatsApp、Slack 等）不在官方白名單內，無法用相同方式整合。"
  - question: "為什麼 LINE 無法接 Claude Code？"
    answer: "Claude Code 的 channel 功能依賴官方插件白名單機制，才能自動把訊息注入 AI session。LINE 不在白名單內，自製 MCP server 可以做到工具呼叫，但沒有接收 LINE 訊息並自動觸發 session 的能力。這是架構層面的限制，不是程式寫法問題。"
  - question: "自製 MCP server 可以模擬 Telegram 的效果嗎？"
    answer: "不行。Telegram 插件能運作，是因為它是 Anthropic 官方認可的插件，有自動注入 session 的權限。自製 MCP server 可以提供工具（tools），但 Claude Code 不會把外部訊息自動路由進你的 session，除非是白名單內的官方插件。"
  - question: "Telegram 和 LINE Bot 在實際使用上差在哪裡？"
    answer: "Telegram：訊息直接進入 Claude Code session，AI 可以主動讀、回、觸發工具，整個工作流程在一個地方完成。LINE Bot：訊息進後台，需要另外的伺服器（Webhook + 自己的 AI 呼叫邏輯）才能回應，無法利用 Claude Code session 裡已有的工具和記憶。"
  - question: "如果我想用 LINE 跟 Claude 互動，有什麼替代方案？"
    answer: "可以做獨立的 LINE Bot，接 Claude API 回應訊息，但這跟 Claude Code Channels 是不同的東西：沒有共用 session、沒有工具存取、沒有 memory 系統。實際工作流程上，Telegram 整合效率高很多，建議直接換到 Telegram。"
howToSteps:
  - name: "確認平台是否在 Claude Code 官方白名單"
    text: "在 Claude Code 設定（settings.json）的 enabledPlugins 欄位，只有官方市集的插件才能啟用。目前確認可用：telegram@claude-plugins-official、discord@claude-plugins-official。其他平台在動手之前先查清楚，不要假設可以。"
  - name: "用官方插件配對 Telegram 或 Discord"
    text: "Telegram：在 Claude Code 執行 /telegram:access，依指示完成 Bot 配對，完成後訊息會自動注入 session。Discord：同樣用 /discord:access 配對。兩個可以並行跑，不互搶訊息。"
  - name: "LINE 的替代做法（不整合進 session）"
    text: "如果業務需要 LINE，可以建獨立 LINE Bot 接 Claude API，但要接受它和 Claude Code session 是分開的兩個系統。工作流程上不要期待它有 Telegram 的整合深度，那個整合只有官方白名單的平台才有。"
---

我試過把 Claude Code 接上 LINE。

結果失敗了。不是因為沒寫好，是根本做不到。

--

## 為什麼會有這個念頭

我在 Claude Code 裡已經有 Telegram 頻道跑得很順，AI 收到訊息、直接在 session 裡處理、回覆到 Telegram，整個工作流程連在一起。

然後我想：LINE 在台灣更普及，如果能把這個整合到 LINE，很多東西會更方便。

所以我開始研究怎麼做。

--

## 嘗試的路線

思路是這樣：既然 Telegram 是透過 MCP（Model Context Protocol）插件跟 Claude Code 連接，那 LINE 也可以做一個類似的 MCP server，接收 LINE Webhook，然後把訊息傳進 session。

技術上不複雜。LINE Bot 有完整的 Webhook API，建一個接收端不難。

但問題不在技術，在機制。

--

## 問題在哪裡

Claude Code 的 channel 功能，不是「有 MCP server 就能用」。

Telegram 和 Discord 能運作，是因為它們是 **Anthropic 官方白名單插件**，有特定的自動注入權限——訊息進來，系統自動路由到你的 session，AI 可以直接讀到並回應。

自製 MCP server 沒有這個權限。你可以寫工具（tools）讓 Claude 呼叫，但 Claude Code 不會自動把 LINE 的訊息推進你的 session。那個推送機制，只對白名單內的插件開放。

我查了官方文件，試了幾種繞法，確認沒有辦法。2026-04-12，LINE channel 專案關閉。

--

## Telegram 和 LINE 的實際差別

用 Telegram 整合之後，工作流程是這樣：

- 訊息進來，自動進 session
- AI 讀到訊息，可以呼叫任何已有的工具（讀檔、寫檔、查記憶、跑程式）
- 回覆透過 reply tool 發回 Telegram
- 整個過程不需要額外的伺服器

LINE Bot 的架構完全不同：

- LINE 發 Webhook 到你的伺服器
- 你的伺服器呼叫 AI API（不是 session，是單次呼叫）
- 回覆推回 LINE
- 沒有共用的 session、沒有工具存取、沒有記憶系統

兩個看起來都是「用訊息跟 AI 說話」，但底下的深度差很多。

--

## 這次踩坑學到什麼

整合新東西之前，先查清楚底層機制是否真的開放，不要假設「原理一樣」就直接動手。

LINE Bot 可以做，但要接受它跟 Claude Code session 是兩個分開的系統。如果你需要深度整合（AI 能存取工具、記憶、工作流程），換 Telegram 是比較直接的路。

LINE 的優勢是台灣普及率，但那個普及率在 AI 工作流程裡不是決定性的因素。
