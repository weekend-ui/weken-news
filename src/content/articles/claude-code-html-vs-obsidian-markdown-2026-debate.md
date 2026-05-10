---
title: "Claude Code 工程師 vs Obsidian CEO：HTML 派跟 Markdown 派 2026 對戰實況"
description: "2026 年兩個 AI 時代輸出格式的對立論點：Anthropic Claude Code 核心工程師 Thariq Shihipar 喊「停寫 Markdown 用 HTML」+ Obsidian CEO Steph Ango 主張「file over app，plain text 才能跨百年」。表面相反實際討論不同層次，搞清楚才不會選錯工具。"
pubDate: 2026-05-10
tags: ["claude-code", "obsidian", "markdown", "html", "aeo"]
directAnswer: "Anthropic Claude Code 核心工程師 Thariq Shihipar 主張「停寫 Markdown 用 HTML」是針對「跟 AI 協作的 output 格式」（即時可讀 + 視覺化 + 互動）。Obsidian CEO Steph Ango 的「file over app plain text」哲學是針對「資料長期儲存格式」（跨百年可讀）。兩派表面相反實際討論不同層次，AI 時代要兩種都會用。"
faq:
  - question: "Claude Code 工程師為什麼說不要用 Markdown？"
    answer: "Thariq Shihipar 列 4 個 Markdown 缺點：1) 100 行以上幾乎沒人讀；2) 不能視覺化（給配色就是 ASCII 灰塊）；3) 瀏覽器不能直接打開要 email 附檔分享；4) 原本「人可改」優勢已過時，AI 來改更快。HTML 在資訊密度 / 視覺 / 分享 / 雙向互動 / 配大 context 五個面向都贏。"
  - question: "Obsidian CEO 為什麼說 Markdown 才是長期解？"
    answer: "Steph Ango 的 file over app 哲學認為：要傳百年的資料，必須是用戶能控制、格式容易讀取的純文字。最有名的引用：「如果你希望你的筆記在 2060 年的電腦上還讀得到，請確認它在 1960 年的電腦上也讀得到」。HTML 雖然視覺強，但複雜結構跟跨時代相容性比 plain text markdown 弱。"
  - question: "HTML 派跟 Markdown 派誰對？"
    answer: "兩派都對，但討論不同層次。Thariq 講「跟 AI 協作的即時 output 格式」（design prototype / PR summary / code review），HTML 互動性壓倒性贏。Steph 講「資料長期儲存格式」（你寫的筆記、永久檔案），plain text 才能跨百年活下來。AI 時代正解：output 用 HTML，source-of-truth 用 markdown。"
  - question: "Claude Code 的 HTML 範例哪裡找？"
    answer: "Thariq Shihipar 跟 Anthropic Claude Code 團隊 open source 了 20 個 HTML 範例，涵蓋 spec planning（規格規劃）/ PR summary（PR 摘要）/ code review（程式碼審查）/ design prototyping（設計原型）/ report generation（報告生成）。可以從這 20 個範例學「跟 AI 協作該用什麼 HTML 結構」的具體模板。"
  - question: "weken.news 這類 AEO 站該用哪個格式？"
    answer: "用 markdown 寫文章，用 Astro/Next.js 等框架編譯成 HTML 給瀏覽器看，是最佳組合。markdown 給作者跟 AI 協作（簡單、可 git diff、長期可讀），HTML 給訪客（視覺好、SEO 友善、結構化資料 schema）。剛好同時對應 Steph Ango 的「source 用 plain text」跟 Thariq Shihipar 的「output 用 HTML」雙論點。"
howToSteps:
  - name: "場景判斷：你要的是 source 還是 output？"
    text: "如果你寫的東西是「永久紀錄」（個人筆記 / 文章草稿 / 知識庫），走 Steph Ango 路線用 markdown。如果是「跟 AI 協作的即時可視化」（PR summary / design mockup / code review），走 Thariq Shihipar 路線用 HTML。混用常態。"
  - name: "Claude Code 工作流改寫"
    text: "請 Claude Code 產出設計稿 / PR summary / 設定建議時，明確指示「輸出 HTML 不要 markdown」。把生成的 .html 檔丟 S3 / Vercel / 任意 static host，分享 link 直接瀏覽器打開。可加 slider / button 讓你雙向調整。"
  - name: "資料儲存仍走 markdown + plain text"
    text: "個人 vault / 文章 source / 跨工具知識庫保留 .md 格式。Obsidian / Notion 匯出選 markdown。原則：可被任何時代任何 app 讀的格式才放長期資料。HTML 留給「即時可視化的 output」不要當 source。"
---

連續兩天看到兩篇 AI 時代輸出格式的對立論點，研究一下整理給看到一頭霧水的人。

--

第一篇：大乃老師講 Obsidian CEO 的 file over app 哲學

文章主張：未來十年你筆記從 Evernote 跳 Notion 跳 Roam 跳 Heptabase，每換一次舊資料就變數位廢墟。解法：用 plain text markdown，跨任何 app 都能讀。

最有名的引用是 Obsidian CEO Steph Ango 原文：「如果你希望你的筆記在 2060 年的電腦上還讀得到，請確認它在 1960 年的電腦上也讀得到」。

論點骨架是「資料優先 app 其次」，要傳百年的東西必須是用戶能控制 + 格式容易讀取的純文字。

--

第二篇：koc.com.tw 報導 Claude Code 工程師喊停 Markdown

達小編寫的，2026-05-10 發。Anthropic Claude Code 核心工程師 Thariq Shihipar 公開喊「停止寫 Markdown，用 HTML 替代」當 AI 協作輸出格式。

Thariq 是 MIT Media Lab、Y Combinator W20 帶過 $17M 遊戲公司、加入 Anthropic 負責 AskUserQuestion 功能 + Claude Code 工程內容用戶回饋。背景重。

他列 Markdown 4 個缺點：

1. 100 行以上幾乎沒人讀
2. 不能視覺化（給配色就是 ASCII 灰塊）
3. 瀏覽器不能直接打開要 email 附檔分享
4. 原本「人可改」優勢已過時，AI 來改更快

HTML 5 個優勢：

1. 資訊密度高：可嵌 table / CSS / SVG / script / 互動元件 / 流程圖 / 空間資料
2. 視覺清楚：tab 分組 / 插圖 / 超連結 / RWD
3. 分享方便：S3 link 直接瀏覽器打開不用裝工具
4. 雙向互動：slider 調參 / 按鈕 copy 結果回 prompt
5. 配 Claude Code 大 context：檔案系統 / MCP / 瀏覽器資料 / Git history 整包吃

他團隊 open source 20 個 HTML 範例，spec planning / PR summary / code review / design prototype / report generation 五大類。

--

兩篇看起來直接打架

Steph Ango：plain text markdown 才能跨百年存活
Thariq Shihipar：AI 時代協作輸出該換 HTML，markdown 過時

哪個對？

--

我看完兩篇研究的結論：兩個都對，但討論不同層次

Steph Ango 講的是「資料儲存格式」
他關心的是 100 年後 / 50 年後 / 10 年後你的筆記還在不在你手上、能不能打開讀。對「資料長期持有」這件事，markdown 的物理特性贏：可被任何文字編輯器打開、Git 友善、可被任何 AI 模型解析、不依賴特定 app 活著。

Thariq Shihipar 講的是「跟 AI 協作的即時 output 格式」
他關心的是你今天請 Claude 給你一份 design prototype / PR summary / code review，需要視覺化 + 互動 + 立即分享。HTML 在這場景壓倒性贏：可以放配色塊看實際顏色、可放 slider 即時調參數、可放按鈕一鍵 copy 修改回 prompt。

不同物件、不同需求、不同最佳格式。這個 framing 對齊後，兩派論點不再矛盾。

--

對應到實作

我寫 weken.news 文章用 markdown source。Astro 編譯成 HTML 給訪客瀏覽器。剛好對應雙論點：source 走 Steph Ango 的 plain text 路線（檔案在我 GitHub 永久可讀），output 走 Thariq Shihipar 的 HTML 路線（讀者在瀏覽器看視覺化頁面）。

對 Claude Code 用戶（像我），Thariq 的論點意義在於：請 Claude 產出 design 概念 / PR 解析 / 性能診斷時，明確要求「輸出 HTML 不要 markdown」。例如我幾天前在 wk-qa-bot 課程介紹頁性能優化時，前後對比結果如果不是純文字而是 HTML chart 配色塊，理解速度會更快。

但長期紀錄（PROGRESS.md / sc skill cards / 私人筆記）還是該用 markdown。HTML 當 source 跨工具相容性差，跨時代不一定可讀。

--

實作上的雙語決策框架

碰到「該用 markdown 還是 HTML」時問自己：

這個東西要活幾年？
1 天到 1 週的即時 output → HTML（互動跟視覺化贏）
1 年以上的長期紀錄 → Markdown（plain text 跨時代贏）

讀者是誰？
團隊 / AI / 自己讀 → markdown（git diff / 跨 app）
公開分享 / 視覺需求 → HTML（直接瀏覽器看）

要不要互動？
靜態文件 → markdown
要 slider / 按鈕 / 動態 → HTML

--

學到的是：當看到兩個權威派系直接對撞論點時，先問「他們在討論的是同一件事嗎」。多數情況下不是。Steph Ango 跟 Thariq Shihipar 在 2026 年同時發聲不是巧合，是 AI 時代「即時可視化」跟「長期可攜性」這兩個需求都被放大，催生兩派各自為戰。AI 時代要兩種都會用，不是站隊。
