---
title: "Top 12 Agent Skills 清單我查過了：對照 129 個 skill 的架構之後，只有 3 個值得裝"
description: "ByteByteGo 那張 Top 12 Agent Skills 排行榜在八月傳很兇。我用 GitHub API 把 12 個 repo 一個一個查過，星數是真的，但排名已經不準，而且其中一個已經改名。更重要的是把它對照我自己跑了半年的 129 個 skill 架構，12 個裡有 5 個是我已經有的或功能重複的。這篇記錄我查到什麼、哪幾個是重複投資、以及為什麼只有 3 個值得裝。"
pubDate: 2026-08-23
tags: ["claude-code", "agent-skills", "ai協作", "工程實務", "工具評估"]
directAnswer: "ByteByteGo 的 Top 12 Agent Skills 清單星數是真的，我用 GitHub API 逐一查證過，12 個全部屬實而且實際星數比圖上更高，因為圖是八月初做的。但排名已經不準，graphify 實際 109.6k 排第 7 不是第 10，而 everything-claude-code 已經改名為 ECC。真正該注意的是重複：把這 12 個對照一套已經在跑的 129 個 skill 架構，有 5 個是已經裝了或功能重疊的，只有 caveman、ponytail、superpowers 裡的計畫執行那幾個值得補。"
faq:
  - question: "ByteByteGo 那張 Top 12 Agent Skills 的星數是真的嗎？"
    answer: "是真的。我 2026 年 8 月 23 日用 GitHub API 把 12 個 repo 一個一個查過，星數全部屬實，而且實際數字比圖上更高，因為那張圖是八月初做的，這半個月又漲了。我一開始不相信，理由是 GitHub 全站超過 25 萬星的 repo 只有 14 個，最高的 build-your-own-x 是 54.2 萬。用這個當基準去否定，結果是我錯了。"
  - question: "這 12 個 repo 的實際排名是什麼？"
    answer: "依 2026 年 8 月 23 日的星數排：superpowers 276.3k、ECC 242.3k、mattpocock 的 skills 232.7k、andrej-karpathy-skills 205.5k、anthropics 官方 skills 171.1k、ui-ux-pro-max-skill 120.0k、graphify 109.6k、ponytail 108.4k、caveman 100.4k、addyosmani 的 agent-skills 89.2k、Understand-Anything 80.2k、impeccable 61.7k。圖上把 graphify 排第 10，實際是第 7。"
  - question: "everything-claude-code 為什麼查不到？"
    answer: "因為它改名了。原本的 affaan-m/everything-claude-code 現在叫 affaan-m/ECC，242.3k 星、36707 個 fork。用舊名字去搜尋只會搜到一堆翻譯版跟複製版，最高的那個才 2.7k，差了將近 90 倍。這是查證清單型內容時最容易踩的坑：名字對不上不代表東西不存在。"
  - question: "已經有自己的 skill 系統，還需要裝這些嗎？"
    answer: "先查重複再說。我對照自己的 129 個 skill 架構，anthropics 官方那套早就裝了，graphify 跟 Understand-Anything 跟已經在用的 CodeGraph 做同一件事，superpowers 的 14 個 skill 裡有 6 個在既有規則裡已經有對應的條文。12 個裡有 5 個是重複投資。"
  - question: "ponytail 跟 caveman 差在哪？"
    answer: "caveman 壓縮的是 agent 讀進去的東西，官方數字是 provider 回報的輸入 token 少 33.2%。ponytail 壓縮的是 agent 寫出來的程式碼，它的 benchmark 是真的跑 headless Claude Code 去改一個真實的 FastAPI 加 React 專案，12 個任務跑 4 次，程式碼少 54%、token 少 22%、成本少 20%、時間少 27%。ponytail 還把 caveman 列進同一張對照表，標註 caveman 只少 20% 程式碼而且 token 反而多 7%。"
howToSteps:
  - name: "先查證再判斷，不要看圖就信"
    text: "用 GitHub API 把每個名字查一次：api.github.com/search/repositories?q=名稱+in:name&sort=stars。清單型圖片最常見的問題不是造假，是過期跟改名。我這次就抓到一個排名錯 3 名、一個已改名。"
  - name: "裝之前先跟自己已經有的東西對帳"
    text: "把候選 skill 的功能一條一條對回自己現有的 skill、規則、MCP。我對完發現 12 個裡有 5 個是重複的。沒有這一步就會一直往上疊，skill 數量變多但每一個的份量變輕。"
  - name: "抄想法不要抄整包"
    text: "社群已經出現 ponytail-lite 跟 impeccable-lite，兩個的理由都是不要那些外掛雜訊。爆紅的 skill 正在變重，直接整包裝進去會把自己的架構灌胖。先看它的 SKILL.md 想解決什麼問題，再決定是抄一條規則還是裝一整包。"
---

ByteByteGo 在八月做了一張圖，Top 12 Agent Skills You Should Know，列的是 GitHub 上星數最高的 12 個 agent skill repo。

我第一個反應是不相信。圖上寫第一名 Superpowers 有 26.6 萬星。

--

不相信的理由很具體。我去查了 GitHub 全站，超過 25 萬星的 repo 一共只有 14 個，而且都是那種存在很多年的經典大字典：build-your-own-x 54.2 萬、awesome 49.9 萬、public-apis 46.9 萬、freeCodeCamp 45.4 萬。

一個 agent skill 的 repo 要擠進那個名單，聽起來不合理。

所以我把 12 個一個一個丟去 GitHub API 查。

結果是我錯了。

--

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">2026 年 8 月 23 日實查：obra/superpowers 276.3k 星、affaan-m/ECC 242.3k、mattpocock/skills 232.7k、anthropics/skills 171.1k。ByteByteGo 圖上的數字全部屬實，而且實際星數更高，因為圖是八月初製作。</p>
</blockquote>

12 個全部是真的。不但是真的，實際星數還比圖上更高，因為那張圖是八月初做的，這半個月又漲了一輪。

我的推論錯在哪，我想清楚了。我拿「全站只有 14 個超過 25 萬星」當基準，但那個基準是舊的。它反映的是 2024 年以前的 GitHub，那時候能拿到 25 萬星的只有累積十年的大清單。agent skill 這個類目在 2026 年就是漲成這樣，一個 repo 三個月衝到 27 萬星是這一年的常態，不是異常。

用舊的量級直覺去否定新的事實，這是我這次踩到的第一個坑。

--

不過查證還是有收穫，只是收穫跟我預期的相反。

排名已經不準了。graphify 圖上排第 10 寫 7.5 萬星，實際是 10.96 萬星排第 7。ponytail 圖上 8.6 萬，實際 10.84 萬。半個月的差距就足以把順序洗掉。

還有一個更容易誤導人的：everything-claude-code 這個名字現在搜不到正主，因為它改名了，現在叫 ECC，24.23 萬星、36707 個 fork。你用舊名字去搜，搜到的最高只有 2.7k，那是翻譯版跟複製版。差了將近 90 倍。

清單型的圖片最常見的問題不是造假，是過期跟改名。

--

真正有用的部分是接下來這段。

我手上有一套跑了半年的設定，129 個 skill，分成 6 層架構。所以我做的不是「這 12 個好不好」，是「這 12 個裡面，有幾個是我已經有的」。

我把每個 repo 的 skill 清單抓出來對。

第 5 名 anthropics/skills，官方那套 19 個 skill，我早就裝了。canvas-design、frontend-design、mcp-builder、webapp-testing、claude-api、skill-creator 這些都在現有清單裡。對已經在用 Claude Code 的人來說，這一項是舊聞。

graphify 跟 Understand-Anything，兩個都是把程式碼庫變成可查詢的知識圖。這件事我已經有 CodeGraph 在做，而且已經寫進設定檔有明確的使用時機。這兩個對我是重複投資。

第 1 名 superpowers 裡的 14 個 skill，我抓出清單逐條對，有 6 個在我既有的規則裡已經有對應條文：subagent-driven-development 對到派工驗證的規則、dispatching-parallel-agents 對到模型調度守則、systematic-debugging 對到問題分類的規則、verification-before-completion 對到「何時算真的完成」的檢查清單、writing-skills 對到 skill 寫作規範。

--

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">12 個爆紅 skill repo 對照一套 129 個 skill 的既有架構：5 個是重複投資（官方那套已裝、graphify 與 Understand-Anything 跟 CodeGraph 同質、superpowers 有 6 個 skill 對應到既有規則），只有 3 個值得補。</p>
</blockquote>

12 個裡有 5 個是重複的。這個比例我覺得值得記下來，因為它不是這份清單的問題，是任何一份熱門清單的常態。

排行榜是按星數排的，星數反映的是「多少人覺得這個有用」，不是「這個對你有用」。這兩件事沒有關係。

--

剩下真正值得補的只有 3 個。

第一個是 caveman，省 token。它官方給的數字是 provider 回報的輸入 token 少 33.2%。它的做法不是叫模型講話簡短而已，是在送出去給模型之前先壓縮要讀進去的東西，而且宣稱可以位元組還原。

第二個是 ponytail，少寫程式。它的 benchmark 是我這次看到最誠實的一份。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">ponytail 的 benchmark：headless Claude Code 改真實的 FastAPI 加 React 專案，12 個任務、n=4、Haiku 4.5，對照無 skill 的同一個 agent。結果 LOC 少 54%、token 少 22%、成本少 20%、時間少 27%，安全檢查 100% 保留。同表列出 caveman 只少 20% LOC 且 token 多 7%。</p>
</blockquote>

它不是拿一個玩具範例跑一次，是真的開 headless 的 Claude Code 去改一個真實的開源專案，跑 12 個任務、每個跑 4 次，用留下來的 git diff 評分。而且它把 caveman 拉進同一張對照表，標明 caveman 只少 20% 程式碼、token 反而多 7%。

敢把競爭對手放進自己的 benchmark 表格裡，而且對手在某一欄贏過自己的，這種很少見。願意這樣做的通常數字是真的。

第三個不是整包，是 superpowers 裡我確實沒有的那幾條：test-driven-development、writing-plans、executing-plans、using-git-worktrees。

我的架構裡「怎麼確認完成了」寫得很細，但「怎麼寫計畫、怎麼照著計畫執行」是空的。這是對完帳之後才看得出來的缺口。

--

最後一個訊號，我覺得比排行榜本身更值得注意。

社群已經有人做了 ponytail-lite 跟 impeccable-lite。兩個的說明寫得很直白，一個說「不要那些外掛瘋狂」，一個說「不要那些外掛機械」。

意思是這些爆紅的 skill 正在變重。impeccable 現在是 1 個 skill 加 23 個指令加 59 條偵測規則，superpowers 是一整套方法論加 14 個 skill 加跨 14 種工具的安裝說明。

對已經有自己架構的人來說，整包裝進去的代價是把自己灌胖。129 個 skill 再加幾包，很快就變 200 個，然後每一個的份量都變輕。

抄想法，不要抄整包。先看它的 SKILL.md 想解決什麼問題，再決定是抄一條規則進既有的檔案，還是真的需要那一整包。

--

補一句必要的話：這篇是查證與適配性評估，不是使用實測。我實際做的是查星數、抓 repo 的 skill 清單、跟自己的架構對帳。caveman 那 33.2% 和 ponytail 那 54% 都是 repo 官方公布的數字，我還沒有自己跑過。

學到的是：熱門清單要先查重複再查好壞。好不好是別人的評分，重不重複只有你自己算得出來。
