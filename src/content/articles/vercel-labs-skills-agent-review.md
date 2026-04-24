---
title: "Vercel Labs skills 實測：npx skills add 一行指令裝 36 個 agent skill，怎麼處理觸發詞衝突"
description: "Vercel Labs 2026 年初推出 skills 工具，讓 Claude Code / Cursor 等 18+ agent 平台能用 npx skills add 批次安裝外部 skill 包。實測裝進 36 個 skill 後，發現最大風險是觸發詞衝突。完整流程、衝突解法、重疊地圖 SOP 記錄在這裡。"
pubDate: 2026-04-24
tags: ["vercel", "agent skill", "claude code", "npx", "開發者工具"]
directAnswer: "Vercel Labs 的 skills 是 agent skill 的 npm 套件管理器，支援 Claude Code / Cursor / GitHub Copilot / Cline 等 18+ agent。一行指令 npx skills add <owner/repo> 就能從 GitHub 裝 skill 到本機。實測裝入 36 個外部 skill 後可直接觸發。最大風險是外部 skill description 跟本地 skill 重疊導致 Claude 選錯，要跑『觸發詞重疊地圖』比對再微調 description 畫清邊界。"
faq:
  - question: "Vercel Labs skills 是什麼？"
    answer: "Vercel Labs 在 2026 年初推出的 agent skill 套件管理器，CLI 名稱就叫 skills。功能類似 npm 之於 Node.js：可以把別人寫好的 skill 包裝成 repo，一行指令 npx skills add 下載到本機 ~/.claude/skills/ 或 .github/skills/，讓 agent 直接使用。官方 repo 是 vercel-labs/skills 和 vercel-labs/agent-skills，有一個目錄站 skills.sh 做生態聚合。"
  - question: "npx skills add 怎麼用？"
    answer: "基本指令：npx -y skills add <owner/repo>，一次裝整個 repo 所有 skill。若只要單一 skill 加參數 --skill <name>。指定 agent 用 -a 例如 -a claude-code。全域安裝加 -g，跳過互動用 -y。範例：npx -y skills add coreyhaines31/marketingskills -a claude-code -g -y。"
  - question: "裝進來的 skill 會跟原有 skill 衝突嗎？"
    answer: "會。Claude 選 skill 是看 description 關鍵字匹配，如果外部 skill 描述跟你本地 skill 觸發詞重疊，Claude 可能選錯。實測 36 個外部 skill 進來，中英文觸發詞天然分離保護了大部分本地 skill，但 AEO / carousel 這類中英通用詞需要手動微調 description 畫清邊界。"
  - question: "適合什麼人用 Vercel Labs skills？"
    answer: "三類人最適合。一：想快速擴充 Claude Code 能力的工程師，不用自己從零寫。二：有一套 SOP 想分享給團隊或社群的人，發成 skill 包讓別人 npx 一行裝完。三：想讓課程交付升級成『可執行工具』而非 PDF 的講師，把方法論變成 skill 發佈。"
howToSteps:
  - name: "安裝外部 skill 包"
    text: "cd 到任意目錄，跑 npx -y skills add <owner/repo> -a claude-code -g -y。裝完重啟 Claude Code，~/.claude/skills/ 底下會多出新資料夾，每個 skill 的 SKILL.md 會被自動載入。"
  - name: "跑觸發詞重疊地圖"
    text: "列出所有本地 skill 和新增外部 skill 的 description 觸發詞，按語言分組（中文本地 / 英文外部）。重疊衝突集中在跨語言關鍵字（AEO、carousel、QA、launch 等中英通用詞）。標記出高風險衝突組。"
  - name: "微調 description 畫清邊界"
    text: "改本地 skill 的 SKILL.md frontmatter description，加一句『專處理 X，不處理 Y，Y 走 <外部 skill name>』。system-reminder 的 skill list 會立刻更新成新 description，Claude 下次選 skill 就知道分工。"
---

看到貼文介紹 Vercel Labs 推出 skills 工具，說是 agent skill 的 npm 套件管理器，支援 Claude Code、Cursor、GitHub Copilot 等 18+ agent 平台。

我決定實測。一次裝兩組：coreyhaines31/marketingskills（行銷全套）和 anthropics/skills 的 mcp-builder。結果比想像中多，35 個 + 1 個共 36 個 skill 進到本機。

完整紀錄如下。

--

## 一行指令裝完

安裝指令長這樣：

```
npx -y skills add coreyhaines31/marketingskills -a claude-code -g -y
```

-a 指定 agent，-g 全域安裝，-y 跳過互動。整包 repo 的所有 skill 一次裝進 ~/.claude/skills/，每個 skill 一個資料夾含 SKILL.md。

coreyhaines31/marketingskills 實際裝了 35 個 skill：ab-test-setup、ad-creative、ai-seo、analytics-tracking、aso-audit、churn-prevention、cold-email、community-marketing、competitor-alternatives、competitor-profiling、content-strategy、copy-editing、copywriting、customer-research、directory-submissions、email-sequence、form-cro、free-tool-strategy、launch-strategy、lead-magnets、marketing-ideas、marketing-psychology、onboarding-cro、page-cro、paid-ads、paywall-upgrade-cro、popup-cro、pricing-strategy、product-marketing-context、programmatic-seo、referral-program、revops、sales-enablement、schema-markup、seo-audit、signup-flow-cro、site-architecture、social-content。

加上 anthropics/skills 的 mcp-builder，總共 36 個。

裝完重啟 Claude Code，所有 skill 自動進到 system prompt 的 skill list，觸發詞一對上就能被叫出來跑任務。

--

## 真正的風險：觸發詞衝突

Claude 選哪個 skill 的機制是看 description 關鍵字匹配。外部 skill 一次進 36 個，跟你本地原有的 skill 很容易重疊。

我原本擔心：這下觸發詞要互搶。實測後發現不是。

大部分本地 skill 用中文描述觸發詞（「廣告策略」「寫Skool」「幫我做IG」），外部 skill 用英文（「paid ads」「social media post」「carousel」）。中英文天然隔離保護了 80% 以上的情境。

真正會衝突的只有「跨語言關鍵字」：
AEO（中英都通用）
carousel（有 IG carousel 也有 LinkedIn carousel）
QA（品質保證和問答都叫 QA）

這類詞才是真衝突點。其他的是假想衝突。

--

## 邊界微調：改 description 畫清分工

我的本地 skill 裡有兩個需要微調：

一個是處理 AEO 文章寫作的 skill，原 description 只說「AEO 文章寫手」，會跟外部的 ai-seo skill 搶「AEO」這個詞。我改成「專寫本站 markdown 文章，不處理 AEO 策略/諮詢/外部網站優化，那些走 ai-seo」。

一個是做 IG 輪播的 skill，原 description 含 carousel 沒限定平台。我改成「IG 專用，LinkedIn carousel / Twitter carousel 走 social-content」。

兩個改動各 30 秒，衝突解除。

system-reminder 的 skill list 會立刻更新，Claude 下次選 skill 就知道誰處理哪段。

--

## 意外收穫：skill publish 是個人品牌武器

研究過程發現，skills.sh 這個生態目錄站公開顯示每個 skill 的裝量。

Vercel 官方的 find-skills 有 1.2M 裝、frontend-design 331K 裝、anthropics 的 mcp-builder 43K 裝。coreyhaines31 的 marketing 全套則累積 50-86K 不等。

這代表什麼：把你的 SOP / 方法論打包成 skill 發到 public repo，別人一行 npx skills add 裝進他的 Claude。你的名字會長期駐留在他的工具箱裡。

對內容創作者、諮詢顧問、課程講師來說，這是新通路。以前賣課是 PDF 和影片，現在可以交付「可執行工具」，傳播力、可信度都不一樣層級。

--

## 學到什麼

Vercel Labs skills 解決了 agent skill 的分發問題。以前 skill 是私有資產，現在是可公開分享的生態。

安裝容易是優勢，但「36 個 skill 同時進你的工具箱」這件事需要後續處理：跑觸發詞重疊地圖、對衝突組微調 description。20 分鐘的事做完，擴展出來的能力比想像中多。
