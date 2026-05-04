---
title: "Claude Code MEMORY.md 一直爆？我跑 5 輪對話才逼 Claude 挖到根本解（4 層記憶系統實戰）"
description: "我的 Claude Code 索引 231 行超過上限被截斷。叫 Claude 解，第一輪只給清理方案。我每輪戳破他的表面解，逼到第 6 輪查官方文件才找到 4 層架構（CLAUDE.md / .claude/rules/ / .claude/skills/ / memory/）。整段對話 + 我的決策原則 + Claude 三組系統性偏見的萃取過程。"
pubDate: 2026-05-04
tags: ["claude-code", "memory", "architecture", "ai-collaboration", "weekend-thinking"]
directAnswer: "Claude Code 有 4 層記憶架構（CLAUDE.md / .claude/rules/ / .claude/skills/ / memory/），不是只有 MEMORY.md。我的索引爆掉時叫 Claude 解，他連續 5 輪都只給表面方案（清理 / 搬移 / 拆檔 / 自動化 / 排序）。我每輪戳破，逼到第 6 輪他才查官方文件發現 .claude/rules/ 系統。最後選混合機制存檔，並萃取出 Claude 的三組系統性偏見（prompt-first / state-first / knowledge-gap blindness）。"
faq:
  - question: "Claude Code MEMORY.md 太大怎麼辦？"
    answer: "MEMORY.md 有硬上限 200 行 / 25KB，超過會被截斷。但「清理」只是治標。根本問題是「把 hard rules 當 learnings 寫進 memory」，正解是搬到 ~/.claude/rules/ 並用 path-scoped frontmatter 控制何時載入。memory/ 的設計初衷是給 Claude 自己 jot down learnings，不是寫 always-on rules 的地方。"
  - question: "怎麼讓 AI 從表面解挖到根本解？"
    answer: "我這次跑 5 輪才挖到結構化層。每輪我戳一個盲點：清理只解現況不解流程、搬 hard rules 違反 thin harness、拆檔依賴紀律失敗、自動化 hook 創造新問題、排序解可見性不解根因。最後直接點「結構化才是真解」他才查官方文件。經驗值：AI 預設給「廣度方案」，要靠連續質疑逼到結構性思考。"
  - question: ".claude/rules/ 跟 memory 差別在哪？"
    answer: ".claude/rules/ 是使用者寫的規則庫，支援遞迴讀子資料夾 + path-scoped frontmatter（用 paths 欄位指定何時載入）。memory/ 是 Claude auto-discovered learnings，主索引 MEMORY.md 自動載前 200 行，topic files 按需 Read。前者是規則（你寫），後者是學習（Claude 寫）。我之前 97 條 feedback 大多放錯位置。"
  - question: "為什麼自動化 hook 不是好答案？"
    answer: "我跟 Claude 討論時的決策原則：「不要透過創造新問題解決問題」。Hook 機制本身會創造新問題，jsonl 格式變動會壞、Claude Code 升級會壞、邏輯需要持續維護。結構化方案（用實體分檔代替 hook）才是「建一次永遠 work」，不需要維護。長期解 vs 短期解的差異在這裡。"
  - question: "Claude 有哪三組系統性偏見？"
    answer: "我跟 Claude 跑深度對話挖出三組：prompt-first bias（預設所有 AI 輸出問題都是 prompt 問題）、state-first bias（預設所有問題都是當下狀態問題不是流程問題）、knowledge-gap blindness（預設我看過的就是全部，不主動掃官方文件）。三個是姊妹組合，每個都是「預設用某類方法解某類問題」的習慣。"
howToSteps:
  - name: "戳破 AI 的「廣度方案」習慣"
    text: "AI 預設給的是「在現有結構不變」的前提下 patching。每輪追問「這真的解了根本問題嗎？還是只解現況？」逼他切換到深度思考模式。我的觸發句是「現在解了沒多久又會出問題，勢必要改機制」。"
  - name: "用「不要創造新問題」當決策過濾器"
    text: "AI 給的解法常常是「再加一層自動化 / 再寫一個 hook / 再建一個機制」。問自己「這個方案本身會不會延伸新問題？」如果會，砍掉。優先選「移除複雜度」的方案，不選「增加複雜度」的方案。"
  - name: "點破「結構化才是真解」這個層次"
    text: "AI 在「現有結構不變」的前提下打轉時，主動拋一句「應該是要透過結構化去應對問題」。這個提示會讓 AI 重新檢視整個架構，往往會發現他之前忽略的更深層機制。我這次的 .claude/rules/ 就是這樣挖出來的。"
---

聲明在前：本文記錄的 4 層架構是 Claude Code 官方文件明文支援的設計，但我新建的 ~/.claude/rules/ 檔案還沒在新 session 實測載入行為。理論上應該 work，待我下次重啟 Claude Code 跑 /memory 驗證。

事情是這樣，我的 Claude Code memory 索引 MEMORY.md 已經 231 行，超過 200 行硬上限被部分截斷。這表示新加的條目可能根本載入不到，AI 看不到後面那段。

我叫 Claude 解這個問題。結果跑了 5 輪對話 + 第 6 輪才到根本解。整個過程比結論還值得記，因為這是「我怎麼一步一步逼 AI 從表面解挖到結構性解」的真實案例。

--

## 第一輪：他給的是「清理」（A 方案）

Claude 第一個提案是清理：找重複條目合併、砍過時的、把高頻 hard rules 搬進 CLAUDE.md。具體 3 組鐵證重複：Telegram 殭屍 process 寫成 3 個檔、AEO 診斷報告 2 條、UI loading 規範 2 條。預估從 231 行清到約 175 行。

聽起來合理，但我直覺不對。我點他：「現在 memory 200 行，可是透過現在的機制，每次任務結束存檔，memory 還是很快又爆掉了，勢必是整個機制要調整。」

意思：清理只解現況，不解流程。

他承認跑了「為什麼錯」深度模式，挖出他自己的盲點：他預設「memory 太大」是「狀態問題」（看到狀態壞就修狀態），不是「流程問題」（系統會持續產生壞狀態）。後來我們把這個叫 state-first bias。

--

## 第二輪：搬 hard rules 到 CLAUDE.md（D 方案）

第二個提案：把 30+ 條真 hard rules 搬到 CLAUDE.md，砍掉對應 memory 條目。

我提了我們之前討論過的 Garry Tan Thin Harness Fat Skills 框架。CLAUDE.md 應該是薄編排層，搬 30+ 條進去等於把它變胖。

他自己對齊後降到 8 條真 cross-cutting rules（no em dash, taiwan time, telegram persona 等）。但這還是把問題從 memory 移到 CLAUDE.md，沒解「為什麼 memory 持續變胖」。

--

## 第三輪：拆 INDEX 分檔（B 方案）

第三個提案：MEMORY.md 拆成多檔（INDEX_SC_AEO.md / INDEX_SC_INFRA.md / INDEX_SC_PLATFORM.md 等）。

我叫他先去查官方文件，不要假設。他查完發現：Claude Code 只自動載入 MEMORY.md，其他 .md 不會 auto-load。要 Claude 主動 Read 才會看到。

修正版 B'：不拆檔，改成 MEMORY.md 內部加主題 header 分組。但這還是治標不治本。

--

## 第四輪：自動化 hooks（被我否決）

第四個提案：寫 PreToolUse hook 強制「進入門檻 4 問」+ PostToolUse hook 檢查行數限制。

我直接補一刀：「我希望是長期解決並長期預防一個問題，而不是只是現在出問題，解決現在，沒多久又出問題，或是透過創造新的問題解決問題，這些不是我想要的。」

這條原則直接砍掉這個方向。Hook 機制本身會創造新依賴點：jsonl 格式變動會壞、Claude Code 升級會壞、邏輯需要持續維護。

「不要透過創造新問題解決問題」是我的決策過濾器。AI 給的解法常常是「再加一層自動化 / 再寫一個 hook / 再建一個機制」，每個都看起來合理，但組合起來就是不斷增加維護負擔。

--

## 第五輪：排序方案（解可見性不解根因）

第五個提案：MEMORY.md 不強制零增長，改成按使用頻率排序，高頻在前 200 行（自動載入），低頻在後（被截斷但本來就少用）。

他自己跑「為什麼錯」第三輪自我審視，承認這個方案有 8 個延伸新問題。最深問題：「解可見性不解根因」。檔案系統還是會膨脹，真正的根因（缺乏進入門檻 + 缺乏品質審查）沒解。

到這裡我意識到：他連續 5 輪都在「現有結構不變」的前提下打轉。

--

## 我直接戳破：「結構化才是真解」

我直接點：「我覺得應該是要透過結構化去應對 memory 長度問題，只有結構化才有辦法把更多的內容分散到不同檔案，維持 memory 的精簡，你覺得呢？說真話。」

這就是 Garry Tan 的 Resolver 概念：實體結構即路由，不靠規則或紀律。

他承認：之前所有方案都是在「現有 MEMORY.md 結構不變」的前提下 patching。本質都會失敗，因為沒有改結構。

--

## 第六輪：他終於去查官方文件，發現 .claude/rules/

我叫他去查官方文件 + 實測。他這次掃完整個 Claude Code memory 系統 spec，找到一個之前完全沒用過的功能：~/.claude/rules/。

直接引用文件：「All .md files are discovered recursively, so you can organize rules into subdirectories like frontend/ or backend/」。

而且支援 path-scoped frontmatter：

```yaml
---
paths:
  - "src/api/**/*.ts"
---
```

意思：這個 rule 只在 Claude 處理該路徑時才 load。

這就是 Garry Tan Resolver 概念的官方實作。Claude 之前完全沒用過這個系統，因為他預設「memory 是唯一的記憶機制」。

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

之前 97 條 feedback 大多是 hard rules 寫錯位置，應該在 ~/.claude/rules/ 而不是 memory/。這就是 memory 持續爆掉的根本原因。

--

## Claude 的三組系統性偏見

整個過程跟 Claude 一起挖出三個姊妹偏見，每個都是「預設用某類方法解某類問題」的習慣：

### Prompt-First Bias
他預設所有 AI 輸出問題都是 prompt 問題。實際分三類：prompt 不清楚 / model 能力上限 / API config 錯。改 prompt 解不了能力問題。

### State-First Bias
他預設所有問題都是當下狀態問題（看到狀態壞就修狀態），不是流程問題（系統在持續產生問題）。看到「修了又壞」「清了又爆」這類訊號要切深度，問「為什麼這個會持續產生問題」。

### Knowledge-Gap Blindness
他預設「我看過的就是全部」，不主動掃描有沒有更廣的官方架構。跑 5 輪都沒查官方文件全部 features，第 6 輪才查就是這個偏見的典型現場。

我把這三組偏見整理成 ~/.claude/rules/meta-bias-classification.md，下次 Claude 啟動時會自動載入。理論上他下次遇到類似問題第一輪就該掃官方文件，不再跑 5 輪才到。

--

## 最後選了路徑 B + 雙保險

存檔當下我面對一個 meta 級測試：剛討論完不能再加 memory，但今天的洞見要留下來。

三條路：
A. 用舊機制存（萃取進 memory/sc_，立刻又讓 MEMORY.md +2 行，反諷剛討論完）
B. 用混合機制（hard rules 寫 ~/.claude/rules/，感受寫 user_relationship_texture）
C. 暫停存檔等驗證

我選 B，但要他加雙保險：~/.claude/rules/ 寫主版（如果 work，下次 session 自動載入），user_relationship_texture 寫摘要短版（即使 rules 不 work，洞見保底）。

執行：他建了 ~/.claude/rules/cc-architecture.md（4 層架構決策流程）+ meta-bias-classification.md（三組偏見），更新 CLAUDE.md「存檔機制」第 3 點加入「4 層分流」邏輯。memory/ 條目沒加（信守路徑 B 承諾），MEMORY.md 索引沒動。

--

## 我學到什麼

跟 AI 共事的兩個核心動作：

第一，連續質疑表面解。AI 預設給的是「在現有結構不變」的前提下 patching。每輪追問「這真的解了根本問題嗎？還是只解現況？」逼他切換到深度思考模式。

第二，當決策原則的守門員。AI 給的解法常常是「再加一層自動化 / 再寫一個 hook / 再建一個機制」，看起來都合理。我的決策過濾器是「不要透過創造新問題解決問題」。優先選「移除複雜度」的方案。

這兩個動作組合起來就是：逼 AI 從廣度方案挖到結構化解，並過濾掉所有「看似聰明但會增加長期負擔」的提案。

5 輪對話換來 4 層架構的發現，我覺得值得。
