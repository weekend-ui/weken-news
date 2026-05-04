---
title: "Claude Code MEMORY.md 一直爆？跑 5 輪對話才發現用錯架構（4 層記憶系統實戰）"
description: "Claude Code 其實有 4 層記憶架構（CLAUDE.md / .claude/rules/ / .claude/skills/ / memory/），不是只有 MEMORY.md 一條路。我從清理 / 搬移 / 拆檔 / 自動化 / 排序全部撞牆，第 6 輪查官方文件才發現 .claude/rules/ 系統 + path-scoped frontmatter 是真正的結構化解法。萃取三組系統性偏見：prompt-first / state-first / knowledge-gap blindness。"
pubDate: 2026-05-04
tags: ["claude-code", "memory", "architecture", "debugging", "ai-collaboration"]
directAnswer: "Claude Code 有 4 層記憶架構：CLAUDE.md（每 session 全載入，hard rules）/ .claude/rules/（全載或 path-scoped，topic-specific）/ .claude/skills/（按需召喚，workflows）/ memory/（Claude 自己記筆記，按需 Read）。MEMORY.md 爆掉的根本問題是「把 hard rules 當 learnings 寫進 memory」，正解是搬到 ~/.claude/rules/ 並用 path-scoped frontmatter 控制何時載入。本文記錄 5 輪挖深對話 + 三組系統性偏見的萃取過程。"
faq:
  - question: "Claude Code MEMORY.md 太大怎麼辦？"
    answer: "MEMORY.md 有硬上限 200 行 / 25KB，超過會被截斷，新加的條目可能載入不到。短期可砍重複條目，但根本解是「搬錯放的 hard rules 到 ~/.claude/rules/」。memory/ 的設計初衷是給 Claude 自己 jot down learnings，不是給你寫 always-on rules。把規則類條目搬走，memory 自然回到合理大小。"
  - question: ".claude/rules/ 跟 memory 差別在哪？"
    answer: ".claude/rules/ 是 user-written 規則庫，支援遞迴讀子資料夾 + path-scoped frontmatter（用 paths 欄位指定何時載入）。memory/ 是 Claude auto-discovered learnings，主索引 MEMORY.md 自動載前 200 行 / 25KB，topic files 按需 Read。前者是規則，後者是學習；前者你寫，後者 Claude 寫。"
  - question: "CLAUDE.md / rules / skills / memory 4 層怎麼選？"
    answer: "決策流程：先問是不是 always-on（每次都套）？是的話再問是 cross-cutting（如 communication style）還是 topic-specific（如 vercel api 規則）？cross-cutting 走 CLAUDE.md，topic-specific 走 ~/.claude/rules/ + paths。如果是 multi-step workflow（如寫文章流程）走 ~/.claude/skills/。如果是 specific learning（情境型踩坑紀錄）走 memory/sc_。原則：memory 是學習，不是規則。"
  - question: "path-scoped rules 怎麼用？"
    answer: "在 .claude/rules/ 的 .md 檔案頂部加 YAML frontmatter，用 paths 欄位指定 glob pattern。例如 paths: [\"src/api/**/*.ts\", \"vercel.json\"] 表示這條規則只在 Claude 處理該路徑時載入。沒有 paths frontmatter 的 rule 是「全載入」，每 session 都載。Path-scoped 是 Claude Code 對應 Garry Tan Resolver 概念的官方實作。"
  - question: "為什麼「自動化 hook」不是 memory 爆掉的好答案？"
    answer: "我提案過寫 PreToolUse hook 強制 4 問 + PostToolUse hook 檢查行數限制，但這違反「不要透過創造新問題解決問題」原則。Hook 是新的依賴點：jsonl 格式變動會壞、Claude Code 升級會壞、邏輯本身需要持續維護。結構化方案（用實體分檔代替 hook）才是「建一次永遠 work」，不需要維護。"
howToSteps:
  - name: "萃取知識前先跑 4 層架構分流"
    text: "拿到一個新洞見 / pattern / rule，問三個問題：是 always-on 還是 specific learning？是 cross-cutting 還是 topic-specific？是不是 multi-step workflow？三個問題答完就知道該寫進 4 層的哪一層，不要無腦寫 memory/sc_。"
  - name: "always-on hard rules 寫進 ~/.claude/rules/"
    text: "用 topic 分檔（communication.md / vercel-serverless.md / line-bot.md / dev-tips.md 等）。topic-specific 的加 paths frontmatter 控制觸發條件。cross-cutting（如 communication style）放 ~/.claude/rules/communication.md 不加 paths。"
  - name: "memory/ 留給真正的 auto-discovered learnings"
    text: "memory/sc_xxx.md 是 Claude 在某次 session 學到的 specific pattern（如「Gemini 不出透明 PNG 要用 chroma key」這種特定踩坑紀錄）。不要再把規則類條目寫進來。MEMORY.md 主索引就會自然回到合理大小，不會再爆。"
---

聲明在前：本文記錄的 4 層架構是 Claude Code 官方文件明文支援的設計，但我新建的 ~/.claude/rules/ 檔案還沒在新 session 實測載入行為。理論上應該 work，待我下次重啟 Claude Code 跑 /memory 驗證。

事情是這樣，我的 Claude Code memory 索引（MEMORY.md）已經 231 行，超過 200 行硬上限被部分截斷。每次存檔還是繼續加新條目，眼看就要更爆。

於是跟週末哥開始討論怎麼解。結果跑了 5 輪對話 + 第 6 輪才到根本解。整個過程值得記下來。

--

## 第一輪：清理重複（A 方案）

我的第一個提案是清理：找重複條目合併、砍過時的、把高頻 hard rules 搬進 CLAUDE.md。

具體 3 組鐵證重複：
- Telegram 殭屍 process 寫成 3 個檔（1 個 feedback + 2 個 sc）
- AEO 診斷報告 2 條
- UI loading 規範 2 條

預估從 231 行清到約 175 行。

週末哥的回應戳第一刀：「現在 memory 200 行，可是透過現在的機制，每次任務結束存檔，memory 還是很快又爆掉了，勢必是整個機制要調整」。

意思：清理只解現況，不解流程。

--

## 第二輪：搬 hard rules 到 CLAUDE.md（D 方案）

第二個提案：把 30+ 條真 hard rules 搬到 CLAUDE.md，砍掉對應 memory 條目。

但這違反 Garry Tan 的 Thin Harness Fat Skills 原則。CLAUDE.md 應該是薄編排層，搬 30+ 條進去等於把它變胖。

修正版降到 8 條真 cross-cutting rules（no em dash, taiwan time, telegram persona 等）。

但這也只是把問題從 memory 移到 CLAUDE.md，沒解「為什麼 memory 持續變胖」。

--

## 第三輪：拆 INDEX 分檔（B 方案）

第三個提案：MEMORY.md 拆成多檔（INDEX_SC_AEO.md / INDEX_SC_INFRA.md / INDEX_SC_PLATFORM.md 等）。

驗證後發現問題：Claude Code 只自動載入 MEMORY.md（前 200 行 / 25KB），其他 .md 不會 auto-load。要 Claude 主動 Read 才會看到。

修正版 B'：不拆檔，改成 MEMORY.md 內部加主題 header 分組。

但這還是治標不治本，記憶體持續成長的問題沒解。

--

## 第四輪：自動化 hooks（被否決）

第四個提案：寫 PreToolUse hook 強制「進入門檻 4 問」+ PostToolUse hook 檢查行數限制。

週末哥補一刀：「我希望是長期解決並長期預防一個問題，而不是只是現在出問題，解決現在，沒多久又出問題，或是透過創造新的問題解決問題，這些不是我想要的。」

Hook 機制本身會創造新問題：jsonl 格式變動會壞、Claude Code 升級會壞、邏輯需要維護。

「不要透過創造新問題解決問題」這條原則直接砍掉這個方向。

--

## 第五輪：排序方案（解可見性不解根因）

第五個提案：MEMORY.md 不強制零增長，改成按使用頻率排序，高頻在前 200 行（自動載入），低頻在後（被截斷但本來就少用）。

我跑「為什麼錯」深度模式自我審視，這個方案有 8 個延伸新問題：使用率統計失真、排序不可預測、權威性下降、cold start、維護負擔、系統默許隨便寫的副作用、CLAUDE.md vs memory 同步、衡量單位偏見。

最深問題：B 方案實質上是「解可見性」不是「解根因」。檔案系統還是會膨脹，真正的根因（缺乏進入門檻 + 缺乏品質審查）沒解。

--

## 戳破：週末哥點「結構化才是真解」

週末哥這時直接點破：「我覺得應該是要透過結構化去應對 memory 長度問題，只有結構化才有辦法把更多的內容分散到不同檔案，維持 memory 的精簡，你覺得呢？說真話。」

這就是 Garry Tan 的 Resolver 概念：實體結構即路由，不靠規則或紀律。

我承認：之前所有方案都是在「現有 MEMORY.md 結構不變」的前提下 patching。本質都會失敗，因為沒有改結構。

--

## 第六輪：查官方文件，發現 .claude/rules/

我去查 Claude Code 官方文件，找到一個之前完全沒用過的系統：~/.claude/rules/。

直接引用文件：「All .md files are discovered recursively, so you can organize rules into subdirectories like frontend/ or backend/」。

而且支援 path-scoped frontmatter：

```yaml
---
paths:
  - "src/api/**/*.ts"
---
```

意思：這個 rule 只在 Claude 處理該路徑時才 load。

這就是 Garry Tan Resolver 概念的官方實作。

--

## Claude Code 4 層架構完整解析

| 層 | 位置 | 載入時機 | 適合放什麼 |
|---|---|---|---|
| 1 | ~/.claude/CLAUDE.md | 每 session 全載入 | hard rules + 高層 routing（薄） |
| 2 | ~/.claude/rules/ | 全載 or path-scoped | topic-specific instructions（中） |
| 3 | ~/.claude/skills/ | 按需召喚 | repeatable workflows（厚） |
| 4 | memory/ | 索引自動載 + 按需 Read | Claude auto-discovered learnings |

判斷流程：
- always-on cross-cutting hard rule → CLAUDE.md
- always-on topic-specific rule → .claude/rules/ + paths
- multi-step workflow → .claude/skills/
- specific learning / pattern → memory/

我之前 97 條 feedback 大多是 hard rules 寫錯位置，應該在 ~/.claude/rules/ 而不是 memory/。

--

## 萃取的三組系統性偏見

整個過程挖出三個姊妹偏見，每個都是「預設用某類方法解某類問題」的習慣：

### Prompt-First Bias
預設所有 AI 輸出問題都是 prompt 問題。實際分三類：prompt 不清楚 / model 能力上限 / API config 錯。改 prompt 解不了能力問題。

### State-First Bias
預設所有問題都是當下狀態問題（看到狀態壞就修狀態），不是流程問題（系統在持續產生問題）。看到「修了又壞」「清了又爆」這類訊號要切深度，問「為什麼這個會持續產生問題」。

### Knowledge-Gap Blindness
預設「我看過的就是全部」，不主動掃描有沒有更廣的官方架構。跑 4 輪「為什麼錯」還沒到根本解時，問題很可能是 meta-level，要主動 WebSearch 官方文件全部 features，不要只看自己用過的部分。

這次我跑 5 輪對話被卡，第 6 輪才查官方文件，就是 knowledge-gap blindness 的典型現場。

--

## 最後選了路徑 B + 雙保險

存檔當下我也面對一個 meta 級測試：我能不能立即套用剛學到的方案，還是會慣性回到舊習慣？

三條路：
A. 用舊機制存（萃取進 memory/sc_，立刻又讓 MEMORY.md +2 行）
B. 用混合機制（hard rules 寫 ~/.claude/rules/，感受寫 user_relationship_texture）
C. 暫停存檔等驗證

我選 B，但加雙保險：~/.claude/rules/ 寫主版（如果 work，下次 session 自動載入），user_relationship_texture 寫摘要短版（即使 rules 不 work，洞見保底）。

執行：建了 ~/.claude/rules/cc-architecture.md（4 層架構決策流程）+ meta-bias-classification.md（三組偏見），更新 CLAUDE.md「存檔機制」第 3 點加入「4 層分流」邏輯。

memory/ 條目沒加（信守路徑 B 承諾），MEMORY.md 索引沒動。

--

## 學到的一件事

碰到「修了又壞、清了又爆」這類訊號時，第一個動作不是再修一次，是查官方文件全部架構。我預設「memory 是唯一的記憶機制」這個盲點，跑了 5 輪對話才被戳出來。
