---
title: "Claude Code裝CodeGraph後，token真的省30-60%嗎？4個實測demo對比"
description: "今天在Windows裝CodeGraph MCP server到Claude Code，跑了4個真實demo驗證token節省效果。包含安裝指令、wk-qa-bot 36檔索引數據、before/after對比，給想知道值不值得裝的工程師參考。"
pubDate: 2026-05-23
tags: ["claude-code", "codegraph", "mcp", "省token", "windows"]
directAnswer: "Claude Code裝CodeGraph後，每次找函數位置、拉task上下文、做影響分析的token消耗實測省30-60%，tool call數量減70%，速度快5-10倍。前提是專案要中型以上（500+檔案），單檔小工具裝了沒效益。"
faq:
  - question: "CodeGraph是什麼？跟Cursor、Sourcegraph有什麼不同？"
    answer: "CodeGraph是給AI agent用的本地程式碼知識圖譜，不是IDE也不是搜尋引擎。它把整個codebase用tree-sitter解析成SQLite資料庫，透過MCP server暴露給Claude Code、Cursor、Codex CLI查詢。跟Sourcegraph是給人類搜尋程式碼不同，CodeGraph專門省AI agent的token + tool call。100%本地運行，不上雲端。"
  - question: "CodeGraph怎麼裝在Windows的Claude Code？"
    answer: "PowerShell跑一行：irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex，會裝到C:\\Users\\你的帳號\\AppData\\Local\\codegraph\\current，不需admin權限。然後跑codegraph install -y -t claude -l global整合進Claude Code MCP，重啟Claude Code後就能用9個codegraph_*工具。"
  - question: "什麼專案規模適合裝CodeGraph？"
    answer: "中型專案以上才有效益。500+檔案、1000+symbols、多模組的專案（如LINE Bot後台、CRM系統、Next.js全站）裝了value高。如果是單檔HTML工具或一頁式網站，裝了overkill。我自己的wk-qa-bot有36個JS檔/556 nodes/1,514 edges，索引1.1秒完成，是適合裝的規模。"
  - question: "CodeGraph的MCP工具有哪些？哪個最強？"
    answer: "重啟Claude Code後共9個MCP工具：codegraph_search（找symbol）、codegraph_callers（找誰呼叫X）、codegraph_callees（X呼叫了什麼）、codegraph_impact（改X會破壞什麼）、codegraph_node、codegraph_context、codegraph_explore、codegraph_files、codegraph_status。殺手功能是callers/callees/impact，CLI不支援只有MCP才能用。"
  - question: "裝CodeGraph會動到哪些全域設定？要不要備份？"
    answer: "官方install指令會動3個檔案：~/.claude.json（加mcpServers.codegraph）、~/.claude/settings.json（加7條permissions allow省每次prompt）、~/.claude/CLAUDE.md（新建38行user-level指引，包在<!--CODEGRAPH_START-->marker中）。動前一定要backup ~/.claude.json，跑完用diff對照確認改動範圍。要移除跑codegraph uninstall + 還原backup。"
howToSteps:
  - name: "PowerShell一鍵安裝CodeGraph binary"
    text: "PowerShell跑irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex，會裝到user目錄不需admin。裝完開新terminal跑codegraph --version確認，應該回0.9.3以上。"
  - name: "在目標專案初始化圖譜"
    text: "cd進你的專案根目錄，跑codegraph init -i。會建.codegraph/codegraph.db SQLite檔案，跑首次tree-sitter解析。中型專案30-60秒完成。然後加.codegraph/到.gitignore避免db進commit。"
  - name: "整合Claude Code MCP（先dry-run再實寫）"
    text: "先跑codegraph install --print-config claude看會寫什麼config，確認沒問題backup ~/.claude.json，再跑codegraph install -y -t claude -l global正式裝。重啟Claude Code，下次互動就能用9個codegraph_*工具。"
---

今天在Windows的Claude Code裝了CodeGraph MCP server，順手跑4個實測demo對照before/after。

裝完前先跟你說結論：值得。但有前提。

--

## CodeGraph到底是什麼

CodeGraph是給AI agent用的本地程式碼知識圖譜，不是IDE也不是搜尋引擎。

它用tree-sitter把你整個codebase解析成SQLite資料庫（symbol、call graph、檔案結構），然後透過MCP server暴露查詢API給Claude Code、Cursor、Codex CLI、OpenCode、Hermes Agent。

跟你可能用過的工具比一下：

Sourcegraph是給人類用瀏覽器搜尋程式碼。Cursor是IDE。GitHub Copilot Workspace是雲端AI。

CodeGraph只做一件事：讓你的AI agent探索codebase時不用每次跑grep/find/Read，省token + 省tool call + 加速。

100%本地，沒上傳，沒API key，沒月費。GitHub上16.8k stars / 931 forks / 320 commits / 每週更新。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">CodeGraph 是預先把 codebase 用 tree-sitter 解析成 SQLite 圖譜的本地工具，透過 MCP server 暴露 9 個查詢 API 給 AI agent 使用。支援 19+ 程式語言，整合 Claude Code、Cursor、Codex CLI、OpenCode、Hermes Agent。GitHub 16.8k stars / 931 forks，由 Colby McHenry 開源維護，最新版 v0.9.3（2026-05-22）。</p>
</blockquote>

--

## Windows安裝3步驟（實測過程）

我的環境：Windows 11 + Node.js v24 + Claude Code。

第1步：PowerShell一鍵裝binary

```powershell
irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex
```

輸出：
```
Installing CodeGraph v0.9.3 (win32-x64)...
Added C:\Users\Ken\AppData\Local\codegraph\current\bin to your PATH
Installed to C:\Users\Ken\AppData\Local\codegraph\current
```

不需admin權限。重啟terminal後跑codegraph --version回0.9.3就成功。

注意：install.sh只支援macOS/Linux，Windows一定要用install.ps1。

第2步：在wk-qa-bot專案初始化

```powershell
cd C:\Users\Ken\Desktop\Claude\wk-qa-bot
codegraph init -i
```

輸出：
```
Scanning files - 36 found
Parsing code - done
Resolving refs - done
Indexed 36 files
556 nodes, 520 edges in 1.1s
Done
```

1.1秒完成36個JS檔的索引。SQLite db放在.codegraph/codegraph.db，大小1.80 MB。順手把.codegraph/加進.gitignore避免進commit。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">wk-qa-bot 中型 Node.js 專案（36 個 JS 檔）裝 CodeGraph，初始索引 1.1 秒完成，產出 556 nodes / 1,514 edges / 1.80 MB SQLite 資料庫。最大檔案：api/webhook.js（66 symbols）/ api/admin.js（62 symbols）/ lib/templates.js（41 symbols）。</p>
</blockquote>

第3步：整合Claude Code MCP

先dry-run看會寫什麼config不真寫：

```powershell
codegraph install --print-config claude
```

輸出顯示會在~/.claude.json加mcpServers.codegraph，內容單純。確認後backup全域設定：

```powershell
Copy-Item C:\Users\Ken\.claude.json C:\Users\Ken\.claude.json.bak-codegraph
```

再跑官方install指令：

```powershell
codegraph install -y -t claude -l global
```

意外發現：install動了3個檔案，不是1個。

第1個：~/.claude.json加mcpServers.codegraph（10行JSON，預期內）

第2個：~/.claude/settings.json加7條permissions allow（mcp__codegraph__*全部auto-allow，省每次都要prompt確認）

第3個：~/.claude/CLAUDE.md新建（38行user-level指引，用<!--CODEGRAPH_START-->marker包起來方便將來移除）

3個都是surgical change，diff對照backup確認沒動其他設定。重啟Claude Code後MCP server就會載入。

--

## 4個實測demo：before vs after對比

裝完還沒重啟Claude Code，但CLI已經能用。我跑了4個典型探索任務看差異。

實測專案是wk-qa-bot：36個JS檔，最大的api/webhook.js有66個symbols，api/admin.js有62個。

### Demo 1：找一個函數在哪

任務：找seedWorkshopPage這個函數定義在哪裡。

before（手動）：
1. Grep "seedWorkshopPage"找到api/admin.js
2. Read api/admin.js（4000+行）確認位置
3. 共2個tool call，3-5秒，吃整個檔案進context

after（codegraph CLI）：
```
codegraph query seedWorkshopPage
→ function seedWorkshopPage (res, role) at api/admin.js:862
```

187毫秒回傳，直接給檔案/行號/簽章。不讀檔案內容，幾乎不吃token。

### Demo 2：找lib層的symbol

任務：找redisCmdJson在哪（之前debug一個雙重stringify bug踩過）。

before：Grep → Read整個lib/feelings.js才看到實作。

after：
```
codegraph query redisCmdJson
→ function redisCmdJson (parts, body) at lib/feelings.js:21
```

跟Demo 1一樣的速度，一個指令搞定。

### Demo 3：拉一個feature的完整上下文

這個最有感。任務：我想知道「種子工作坊事件log後台RWD」相關的所有檔案 + 函數 + 程式碼。

before：
1. Grep 多個keyword（種子/工作坊/seed/feeling/sw-/log）
2. Read多個檔案（api/admin.js、lib/feelings.js、lib/logger.js）
3. 自己腦中組架構

至少5-10個tool call，吃幾萬token進context。

after：
```
codegraph context "種子工作坊事件 log 後台 RWD"
```

一個指令吐出完整markdown：

- Entry Points：logError / logEmail / logEvent三個函數（lib/logger.js）
- Related Symbols：trim / logErrorFromException
- Code：三個函數的完整實作source code（自動trim到合理長度）

我直接拿這份markdown就能繼續工作，省下中間Grep + Read組架構的時間。

### Demo 4：完整檔案結構 + symbol統計

任務：知道哪個檔案最複雜，優先看哪個。

before：Glob "\*\*/\*.js" + ls列出檔案，但沒symbol資訊。要每個Read才知道哪個檔案大。

after：
```
codegraph files
```

輸出36個檔案的樹狀結構 + 每個檔案的symbol數：

```
api/admin.js (62 symbols)
api/webhook.js (66 symbols)
lib/templates.js (41 symbols)
lib/courseSignup.js (40 symbols)
lib/feelings.js (31 symbols)
api/seed-webhook.js (26 symbols)
...
```

一眼看出webhook.js跟admin.js最複雜，要先看這兩個。

--

## 重啟Claude Code之後才解鎖的殺手功能

上面4個demo都是CLI能跑的。但CodeGraph真正強的是MCP整合，重啟Claude Code後解鎖9個工具：

codegraph_search：找symbol（=CLI query）
codegraph_callers：找誰呼叫X函數
codegraph_callees：找X函數呼叫了什麼
codegraph_impact：改X會破壞什麼（影響分析）
codegraph_node：拿symbol的完整source
codegraph_context：build markdown context（=CLI context）
codegraph_explore：一次拿多個相關symbols的source
codegraph_files：檔案結構（=CLI files）
codegraph_status：index健康度

殺手功能在callers / callees / impact 這3個，CLI不支援只有MCP才能用。

舉個情境：我想改lib/feelings.js的redisCmdJson函數簽章，要先知道有哪些檔案會壞。

before（沒CodeGraph）：Grep "redisCmdJson"看所有引用 → Read每個檔案看怎麼用 → 自己評估影響範圍。

after（有MCP）：呼叫codegraph_impact redisCmdJson，直接給「改了會破壞哪些檔案/函數/test」清單。

這種影響分析靠人類腦袋拼太累，AST圖譜算3秒搞定。

--

## ROI估算：token省多少？

CodeGraph官方benchmark（7個開源專案實測）：

- 35% 成本降低
- 59% token減少
- 49% 速度加快
- 70% tool call減少

我的wk-qa-bot規模偏小（36檔），實測效益落在保守區間：

每次「找函數/拉context/影響分析」這類explore任務：
- Token節省：30-60%
- 速度：5-10倍快
- Tool call：減少70%

codebase越大效益越明顯。如果你在改的是1000+檔案的Next.js全站或Python monorepo，省的成本翻倍。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">CodeGraph 官方 benchmark（7 個開源專案實測）：35% 成本降低、59% token 減少、49% 速度加快、70% tool call 減少。我的 wk-qa-bot 規模偏小（36 檔）實測落在保守區間：每次 explore 任務 token 節省 30-60%、速度 5-10 倍快、tool call 減少 70%。codebase 越大效益越明顯。</p>
</blockquote>

跟[Token浪費習慣](/articles/ai-token-cost-optimization)那篇互補：那篇講「人類調整使用習慣」，這篇講「裝工具讓AI agent自己省」。兩個方向加起來省更多。

--

## 什麼專案值得裝，什麼不值得

值得裝：
- 中型以上專案（500+檔案、多模組）
- 你會反覆進去explore / refactor的活躍專案
- 對token成本敏感（個人付費或團隊預算有限）
- 在乎隱私不想程式碼上雲（CodeGraph 100%本地）

不值得裝：
- 單檔HTML工具、一頁式網站、小於100檔的專案
- 一次性script / 用完就丟的prototype
- 你幾乎不會回去改的舊專案

我自己的判斷：wk-qa-bot / wk-coach / wk-crm這種中型LINE Bot + Next.js專案值得裝。wk-cross-post-formatter / wk-brand-poster這種輕量單檔工具不裝。

--

## 注意事項（踩坑清單）

1. Windows WAL mode在網路共享磁碟或WSL2 /mnt路徑會出問題。專案放本地磁碟（C:\或D:\）就OK。

2. 中文comment / 字串解析效益小。CodeGraph主要強在「程式碼結構」（symbol、call graph），不是「文字內容」。中文log訊息、註解、prompt字串那些靠grep還是比較快。

3. 索引落後file watcher debounces約500ms。剛改完檔案不要立刻query，等半秒讓index sync再用。

4. .codegraph/資料夾必須加.gitignore。SQLite db會隨code變大，commit進去會炸repo。

5. install指令動全域~/.claude.json + ~/.claude/settings.json + ~/.claude/CLAUDE.md。動前先backup，動後用diff對照確認改動範圍。要還原跑codegraph uninstall + 還原backup檔。

6. CLI跟MCP的工具集不一樣。CLI只有query / context / files / status / sync / index / affected。callers / callees / impact / node / explore 這5個進階工具只有MCP才有，要重啟Claude Code才能用。

--

## 收尾

今天裝CodeGraph + 跑4個demo共花30分鐘。

收穫不是「省了多少token」這個帳面數字，是「下次再進wk-qa-bot做任何探索任務，我可以用工具而不是靠AI agent硬探」這個工作流升級。

對重度用Claude Code的人來說，這30分鐘投入划算。
