---
title: "多 Agent 系統架構：一個 Bot 怎麼演七個角色"
description: "有人說他建了一個「7 個 AI agent 的編輯部」。但 7 個 agent 不等於 7 個 bot。這篇拆解多 agent 系統的架構，說清楚 agent 是什麼、怎麼串、用什麼工具做。"
pubDate: 2026-04-17
tags: ["ai工具", "multi-agent", "自動化", "系統架構"]
directAnswer: "多 agent 系統是把一個複雜任務拆成多個 AI 角色分工完成的架構。每個 agent 有自己的角色定義（system prompt）和工具，彼此傳遞結果。7 個 AI agent 不等於 7 個 Telegram bot——通常是一個後台系統，透過一個或多個 bot 介面把結果回傳給用戶。常用框架：LangGraph、CrewAI、AutoGen、n8n。"
faq:
  - question: "AI agent 是什麼？"
    answer: "AI agent 是一個有特定角色、目標和工具的 LLM 實例。它不只是回答問題，而是能根據目標自主決定下一步行動、使用工具（如搜尋、呼叫 API、讀寫檔案），並把結果傳給下一個環節。"
  - question: "多 agent 系統和單一 AI 對話有什麼不同？"
    answer: "單一 AI 對話是一問一答，你問什麼它回什麼。多 agent 系統是把一個複雜任務拆成多個步驟，每個步驟由專門的 agent 負責，agent 之間傳遞輸出，最後得到完整結果。就像一個編輯部：統籌派任務、記者採訪、編輯修稿、發布，各司其職。"
  - question: "7 個 AI agent 需要 7 個 Telegram bot 嗎？"
    answer: "不需要。Agent 是軟體層面的角色定義，不是 Telegram 帳號。後台可以有 7 個 agent（各自有不同的 system prompt 和工具），但對外只用一個 Telegram bot 把結果回傳。7 個 agent 的系統可以完全跑在後台，用戶只看到一個 bot 在說話。"
  - question: "做多 agent 系統要用什麼工具？"
    answer: "常見框架：LangGraph（圖結構，精確控制 agent 流程）、CrewAI（角色導向，設定 crew 和 task）、AutoGen（Microsoft，agent 之間可以互相對話）、n8n（no-code 流程，適合串接外部服務）。選哪個看複雜度：簡單任務 n8n 夠用，複雜 pipeline 選 LangGraph 或 CrewAI。"
  - question: "多 agent 系統適合拿來做什麼？"
    answer: "適合：需要多個步驟、每步驟有不同專業的任務。例如：掃描網站→診斷問題→派工修稿→回報結果（SEO 編輯部）；蒐集資料→分析→產報告→發通知（數據監控）。不適合：簡單問答、單次生成，這些用單一 LLM 呼叫就夠，多 agent 反而複雜。"
howToSteps:
  - name: "定義你的任務需不需要多 agent"
    text: "先問：這個任務可以一次 prompt 完成嗎？如果可以，不需要多 agent。如果任務有明顯的階段（蒐集→分析→生成→回報），或需要不同專業（SEO 分析 vs 寫手 vs 連結檢查），才考慮多 agent。"
  - name: "設計 agent 角色和分工"
    text: "每個 agent 需要：角色名稱、system prompt（它的工作是什麼）、可用的工具（API、搜尋、讀檔等）、輸入來源（從哪裡拿資料）、輸出目標（結果傳給誰）。設計好之後，agent 之間的傳遞關係就是系統架構圖。"
  - name: "選框架實作並接 bot 介面"
    text: "用 LangGraph / CrewAI / AutoGen 實作 agent pipeline。最後用一個 Telegram bot（或 Discord、LINE）作為介面，把 pipeline 的輸出格式化後回傳給用戶。bot 只是前端，agent 都在後台跑。"
---

最近看到一個案例：有人說他幫客戶建了一個「7 個 AI agent 的編輯部」，跑在 Telegram 群組裡，每天自動掃 400 篇文章、找問題、派工修稿。

我第一個問題是：7 個 agent 是 7 個 bot 嗎？

不是。這是很多人對 multi-agent 系統的常見誤解。

--

## Agent 是什麼

Agent 是一個有特定角色的 AI 實例。

它不是一般的 LLM 問答。它有：
- 角色定義（system prompt：你是誰、你負責什麼）
- 工具（可以搜尋、呼叫 API、讀寫檔案）
- 目標（完成什麼算完成）

Agent 的特點是「自主」：它根據目標決定下一步，不是你說一句它做一句。

--

## 多 Agent 系統的邏輯

複雜任務往往需要多個專業。

以「400 篇文章 SEO 健檢」為例：

1. 統籌 agent：從 Google Search Console 拿數據，決定今天優先掃哪些文章
2. 診斷 agent：逐篇分析，找出哪裡有問題（連結 404、數字過期、meta 太短）
3. 連結 agent：逐一點擊所有外部連結，確認存不存在
4. 寫手 agent：根據診斷結果，更新過期的數字和文字
5. 統籌 agent：收集所有結果，整理成報告，推到 Google Doc

每個 agent 有自己的系統提示和工具，彼此傳遞輸出，最後整合成完整結果。

--

## 一個 Bot，多個 Agent

關鍵：agent 是後台的軟體角色，不是 Telegram 帳號。

後台可以跑 7 個 agent，但對外只需要一個 Telegram bot。Bot 負責把 pipeline 的輸出格式化後貼回群組：

```
📋 統籌：今天掃 28 篇，優先處理 8 篇掉流量的
🔍 診斷師：第 3 篇有 2 條壞連結、數字過期
✍️ 寫手：已更新簽證費為 AUD 1,600
✅ 完成，報告已存到 Google Doc
```

看起來像 4 個人在工作，實際上是一個 bot 把 pipeline 結果分段回傳。

--

## 常用框架

**LangGraph**：圖結構，適合複雜流程，可精確控制 agent 的觸發條件和跳轉邏輯。

**CrewAI**：角色導向，定義 crew（團隊）和 task（任務），設定簡單，上手快。

**AutoGen**：Microsoft 出品，agent 之間可以互相對話、辯論，適合需要多輪協作的任務。

**n8n**：no-code 流程工具，適合串接外部服務（GSC API、Google Doc、Telegram），不需要寫太多程式碼。

簡單任務用 n8n 或 CrewAI，複雜 pipeline 用 LangGraph。

--

## 什麼任務適合多 Agent

適合：
- 任務有明顯的階段（蒐集→分析→生成→回報）
- 每個階段需要不同的「專業」或工具
- 任務量大，需要並行處理

不適合：
- 簡單問答或單次生成，一個 LLM 呼叫就夠
- 流程還沒想清楚，多 agent 會放大混亂

--

多 agent 系統的本質是「讓 AI 分工合作」。Bot 是前端介面，不是架構的核心。架構的核心是你怎麼拆任務、怎麼設計 agent 之間的傳遞關係。
