---
title: "AI agent 怎麼自我進化？Letta 把它做成產品，我用 Claude Code 手工做了一年的對照"
description: "Letta 發布 Mods，讓 AI agent 改自己的執行環境。我沒用過 Letta，但我在 Claude Code 上手工搭了一整年的分層記憶系統，做的是同一件事。這篇用第一手經驗拆解 agent 自我進化的兩條軸：context 學習跟 harness 學習，差在哪、為什麼反覆失效的規則只能靠後者解。"
pubDate: 2026-07-17
tags: ["ai agent", "letta", "自我進化", "claude code", "harness"]
directAnswer: "AI agent 自我進化有兩條軸：一是 context 學習，改它知道什麼，例如記憶、提示詞、技能；二是 harness 學習，改它執行的環境本身，例如自動幫每則訊息加時間戳、自動掃描機密、自動執行某個檢查。Letta 2026 年 7 月發布的 Mods 把 harness 學習做成產品，讓 agent 自己寫程式改自己跑的環境。關鍵差別在於：一條「每次都要記得做」的規則，如果反覆失效，光把規則寫得更清楚沒用，因為那是 context 層，要靠 agent 每次主動想起來；真正的解法是搬到 harness 層，讓系統自動執行，agent 想不起來也會發生。"
faq:
  - question: "什麼是 AI agent 的 harness？"
    answer: "harness 指的是 agent 執行的那個骨架或環境，包含它有哪些工具、指令怎麼觸發、context 怎麼組裝後餵給模型。以 Claude Code 為例，Claude Code 本身就是 harness。agent 的能力不只取決於模型多強，也取決於這個 harness 怎麼設計。"
  - question: "Letta Mods 是什麼？"
    answer: "Mods 是 Letta 在 2026 年 7 月發布的功能，讓 agent 可以修改自己的 harness，包括加工具、加指令、改 context 怎麼餵給模型。Letta 是當年做 MemGPT 的團隊，出自 UC Berkeley。他們的核心說法是 harness-as-memory，也就是 agent 不只學它知道的東西，還學它運行的環境。"
  - question: "context 學習跟 harness 學習差在哪？"
    answer: "context 學習是改 agent 知道什麼，例如它讀的記憶檔、遵守的規則、會用的技能，這些都要靠 agent 每次主動想起來並套用。harness 學習是改環境本身，例如讓系統自動在每則訊息前面加上時間戳，agent 不用記得、也不用推斷，時間就是會在那裡。前者是軟性提醒，後者是硬性執行。"
  - question: "Letta Mods 是真突破還是產品包裝？"
    answer: "核心概念不是新的，Letta 自己也承認。他們的文章明講 Mods 的靈感直接來自 Pi 的擴充系統，並引用了 Meta-Harness 的研究，而 Claude Code 早就有 hooks、skills、MCP 這些能改 harness 的機制。真正比較新的是兩點：一是 agent-first，讓 agent 自己寫這些擴充而不是工程師寫；二是 mod learning，agent 針對一個目標行為自動生成測試環境，再把擴充優化到行為穩定為止。"
  - question: "一般人怎麼把這個概念用在自己的 AI 工具上？"
    answer: "先分辨你的每一個改進是 context 還是 harness。如果一條規則你已經寫進提示詞或記憶，卻還是反覆沒被執行，那代表它卡在 context 層，靠記憶不可靠。把它搬到 harness 層，在 Claude Code 就是做成 hook，讓系統在該觸發的時機自動執行。反覆失效的規則不要再加字，要換層。"
howToSteps:
  - name: "分辨你的改進是 context 還是 harness"
    text: "拿出你對 AI 工具做過的每一個調整，逐一問：這是改它知道什麼，還是改它執行的環境。改記憶檔、改提示詞、加規則文字，都是 context。加一個會自動執行的檢查、自動附加資訊、自動觸發的動作，才是 harness。先分清楚，才知道問題該往哪一層解。"
  - name: "反覆失效的規則往 harness 搬"
    text: "如果一條規則你寫了、甚至寫了兩三次，卻還是常常沒被執行，別再把規則寫得更詳細。那是 context 層的限制，本質是靠 agent 每次主動想起來。改成 harness 層的強制執行，在 Claude Code 就是做成 hook。規則靠記憶，hook 靠系統。"
  - name: "用一個測試環境驗證規則有沒有真的生效"
    text: "借用 Letta mod learning 的想法：與其寫完規則就當它生效，不如定義一個能重複跑的測試情境，實際觀察行為有沒有改變。生效了才算數，沒生效代表你剛剛改的是 context 但問題在 harness。這比寫完就相信可靠得多。"
---

Letta 在 2026 年 7 月發布了一個叫 Mods 的功能，讓 AI agent 可以修改自己執行的環境。我看到標題的第一個念頭不是「這好新」，是「這我已經手工做了一年」。

先說清楚，我沒有用過 Letta，這篇不是實測 Letta。這是我把它的概念，跟我自己在 Claude Code 上手工搭的分層記憶系統對照之後，整理出來的第一手心得。Letta 的部分是研究，我的系統是真的每天在跑。

--

## 先解釋一個詞：harness

harness 指的是 AI agent 執行的那個骨架，或者說環境。它有哪些工具、指令怎麼觸發、資訊怎麼組裝後餵給模型，這一整套都是 harness。

以我來說，Claude Code 就是我的 harness。

一個 agent 表現好不好，不是只看模型多聰明，也看這個 harness 怎麼設計。同一個模型，放在設計好的 harness 裡，跟放在陽春的 harness 裡，差很多。

--

## Letta Mods 做了什麼

Letta 這次發布的 Mods，是讓 agent 自己改這個 harness。加工具、加指令、改資訊怎麼餵給模型，agent 自己動手改自己跑的環境。

他們用了一個很精準的說法：harness-as-memory。

意思是，agent 不只學「它知道什麼」，還學「它在什麼環境裡跑」。這兩個都能進化。

補充一個背景：Letta 就是當年做 MemGPT 的那群人，出自 UC Berkeley，做 AI 記憶是他們的老本行。所以這不是隨便一家公司喊的概念。

--

## 老實說，這是突破還是包裝

我研究東西的習慣是把公司自己講的跟事實分開，尤其是產品發布文，最容易把小改良講成革命。

Letta 這篇，核心概念不是新的，而且他們自己大方承認。文章裡直接寫 Mods 的靈感來自 Pi 的擴充系統，還引用了 Meta-Harness 的研究。Claude Code 本來也早就有 hooks、skills、MCP 這些能改 harness 的東西。

真正比較新的只有兩點。一是 agent-first，讓 agent 自己寫這些擴充，而不是工程師寫。二是 mod learning，agent 針對一個目標行為，自動生成一個測試環境，再把擴充優化到行為穩定為止。

所以我的判斷是：方向是真的，大公司都在往這走，但這篇是把一個已經存在的研究方向，包成 Letta 的功能。值得看的是那套自動優化的機制，不是「agent 能改自己」這個標題。

--

## 重點：這就是我手工在做的事

Letta 講的兩條軸，我在 Claude Code 上都有。

第一條，context 學習。我有一套分層的指令跟記憶系統，從最上層每次都載入的硬規則，到按需才叫出來的工作流程，到我自己邊做邊記下來的學習筆記。這些就是 Letta 講的 learned context，agent 讀它、遵守它、用它。

我甚至今天還在重構這套東西，把幾份肥大的規則檔壓縮成精簡的速記加完整版兩層，規則本體一條都沒丟，但每次載入的成本降下來了。這就是在優化 context。

第二條，harness 學習。每次我調整系統自動執行的機制，那就是在改 harness。

還有一個巧合，Letta 文章裡舉的頭號範例，是教 agent「用維基百科式的雙括號 path 格式標註記憶來源」。而我的記憶系統，早就在用雙括號連結不同的記憶檔。看到那個範例的時候我笑了，因為那是我每天在用的寫法。

--

## 但這篇也照出我系統的一個失衡

這才是研究這篇文章最有價值的地方，它讓我看到自己的盲點。

我盤了一下：我的系統幾乎全部是 context，harness 那層只有一個自動同步的機制。也就是說，我把幾乎所有的規矩都寫成「文字規則」，靠 agent 每次主動想起來去遵守。

這有一個致命的失效模式。

我踩過一個很具體的坑：有一條規則我寫得清清楚楚，甚至寫了不只一次，但實際執行時還是反覆漏掉。因為它是 context，本質上是「靠記憶」。而記憶會漏。

Letta 這篇點醒我的是：這種反覆失效的規則，光把規則寫得更詳細，沒有用。那是在同一層裡打轉。

真正的解法是換層，把它從 context 搬到 harness。做成一個系統會自動執行的機制，在 Claude Code 就是 hook。這樣它不靠我想起來，該發生的時候就會發生。

一句話總結：反覆失效的規則，不要再加字，要換層。

--

## 給也在搞這塊的人

如果你也在調教自己的 AI 工具，這個 context 對 harness 的分法，是一把很好用的尺。

拿它盤你做過的每一個改進：這是改它知道什麼，還是改它執行的環境。

然後看你反覆失效的問題，卡在哪一層。如果你一直在寫規則、改提示詞，問題卻一直回來，那你很可能是在 context 層修一個 harness 層的病。

換層，比加字有效。
