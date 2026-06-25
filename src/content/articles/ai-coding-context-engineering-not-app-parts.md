---
title: "AI Coding 課都在教「蓋 app 的零件」，但真正決定成敗的是 context engineering"
description: "市面上的 AI coding 課多在教一個 app 由哪些零件組成。但我用 Claude Code 做了 20 多個上線工具後發現，真正決定產出好不好的不是工具，是 context engineering：你有沒有先把規則和判斷標準餵給 AI。"
pubDate: 2026-06-26
tags: ["claude code", "ai coding", "context engineering", "vibe coding", "ai工具"]
directAnswer: "學 AI coding 最該先搞懂的不是「一個 app 由哪些零件組成」（前端、後端、資料庫、登入這些零件 AI 本來就會），而是 context engineering：怎麼把規則、品牌、判斷標準事先寫成檔案餵給 AI，讓它穩定產出、越用越強。我用 Claude Code 做了 20 多個上線工具的經驗是，同一個需求，有沒有先寫好 context，產出品質天差地別。"
faq:
  - question: "context engineering 是什麼？"
    answer: "context engineering 是「設計要餵給 AI 的背景資訊」這件事。不是把問題問得更漂亮（那是 prompt），而是事先把專案的規則、品牌、判斷標準、踩過的坑寫成檔案，讓 AI 每次動手前都先讀到。對 Claude Code 來說，就是 CLAUDE.md、rules、skills 這些檔案。重點從「我這次怎麼問」變成「我怎麼一次設定好，之後每次都對」。"
  - question: "為什麼 AI 寫出來的網頁或程式碼常常很爛？"
    answer: "因為 AI 在沒有任何背景資訊時，只能用「最通用」的方式產出。通用就會出現一股 AI 味、版面容易爆掉、亂用 emoji、不會手機優先、改一個地方壞三個。這不是 AI 不行，是它不知道你的標準。把標準寫成 context 餵進去，同一個 AI 的產出就會完全不同。"
  - question: "學 Claude Code 應該先學什麼？"
    answer: "先學 context engineering，不是先學「app 有哪些零件」。零件（資料庫、登入、API、排程）Google 得到、AI 也會接。真正讓你跟別人拉開差距的，是你能不能把自己的判斷標準交給 AI，讓它每次都照你的標準做。這也是非工程師能不能用 AI 做出像樣東西的關鍵門檻。"
  - question: "CLAUDE.md 這種規則檔有什麼用？"
    answer: "它是放在專案裡、Claude 每次動手前都會先讀的規則檔。把「手機優先、品牌色用 CSS 變數、改版面前先驗證、動手前先確認需求、只改被要求的部分」這類標準寫進去，等於每次都先校準好 AI 再讓它動手。一份好的規則檔，比你每次重新交代一遍有效得多。"
  - question: "不會寫程式的人也能用 Claude Code 做工具嗎？"
    answer: "可以，而且 context engineering 正是讓門檻降下來的那一塊。你不需要會寫每一行程式，但你需要把「什麼叫做對」描述清楚交給 AI。會描述標準的人，就算不會 coding，也能讓 AI 穩定產出可用的東西。"
howToSteps:
  - name: "先寫一份專案規則檔（CLAUDE.md）"
    text: "在專案根目錄放一份 CLAUDE.md，寫下這個專案的硬規則：手機優先、品牌色用 CSS 變數、改版面前先算過再驗證、動手前先確認需求、產出前自我檢查。Claude 每次動手前都會先讀它。"
  - name: "把重複的事和踩過的坑變成規則或 skill"
    text: "同一件事交代第二次，就代表第一次沒被記住。把它寫成一條規則或一個 skill，下次自動套用。踩過的坑也一樣，寫成規則就不會再踩第二次。"
  - name: "定期檢查規則準不準，持續養"
    text: "規則不是寫一次就好。每隔一段時間回頭看，過時的修掉、新學到的補上。你的規則庫養得越久，AI 對你越精準。"
---

很多人問我怎麼用 AI 做網站。我也去看了市面上幾堂 AI coding 的課，發現一個共通點：它們大多在教「一個 app 由哪些零件組成」，前端、後端、資料庫、會員登入、排程、通知，把這些零件一個一個介紹給你。

這些當然要懂。但老實說，這不是重點。

--

## 零件不是問題，AI 本來就會

資料庫怎麼接、登入怎麼做、API 怎麼串，這些東西 Google 查得到，AI 自己也知道。你把需求講清楚，AI 大概都接得起來。

真正的問題不在「要蓋哪些零件」，而在另一件事：AI 在沒有任何背景資訊時，預設產出的東西，通常很爛。

--

## 同一個 AI，差別大到不像同一個工具

我用 Claude Code 做了 20 多個真的上線、有人在用的工具。做久了我發現一個很明顯的對比。

同樣一個網頁需求，丟給一個「完全空白、什麼設定都沒有」的 AI，跟丟給一個「事先餵了規則」的 AI，產出天差地別。

空白的那個，通常是這樣：一股通用的 AI 味、版面很容易爆掉、到處亂放 emoji、不會手機優先、你叫它改一個地方它順手弄壞三個。

餵了規則的那個：有質感、版面穩、用乾淨的 SVG icon 不用 emoji、手機優先、而且你叫它改什麼它就只改什麼，不亂動旁邊。

關鍵是，這兩個是同一個 AI。差別不在它聰不聰明，在它有沒有先讀到我的標準。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">同一個 AI、同一個網頁需求，有沒有事先餵入規則檔，產出品質天差地別：空白版有 AI 味、版面爆、亂用 emoji、改一處壞三處；有 context 版有質感、版面穩、用 SVG、手機優先、只改被要求的部分。差別不在工具，在 context engineering。</p>
</blockquote>

--

## 真正的槓桿叫 context engineering

這件事有個名字，叫 context engineering。

它跟「把問題問得更漂亮」不一樣，那叫 prompt。context engineering 是更前面一步：你事先把這個專案的規則、品牌、判斷標準、踩過的坑，寫成檔案，讓 AI 每次動手前都先讀到。

換句話說，重點從「我這次要怎麼問」變成「我怎麼一次設定好，之後每次都對」。

對 Claude Code 來說，這些 context 就是放在專案裡的 CLAUDE.md、rules、skills 這些檔案。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">context engineering 不是把問題問得更漂亮（那是 prompt），而是事先把專案的規則、品牌、判斷標準、踩過的坑寫成檔案，讓 AI 每次動手前都先讀到。重點從「這次怎麼問」變成「一次設定好，之後每次都對」。</p>
</blockquote>

--

## 我自己的做法：分層 + 把重複的事變成永久能力

我把這套 context 拆成幾層在管理。最上面一層是薄薄的硬規則，再來是按主題分類的規則，然後是可以重複呼叫的工作流，最底層是一份會記住踩過的坑的記憶。

還有一條我一直在跑的循環：只要同一件事我交代第二次，就代表第一次沒被記住，這是失敗。我會把它寫成一條規則或一個 skill，下次自動套用。久了之後，AI 對我的精準度是越用越高，不是每次重新開始。

這跟「教你蓋一個 app 有哪些零件」是完全不同的層次。零件是教你蓋什麼，context engineering 是讓 AI 每次都照你的標準穩定地蓋。

--

## 對不會寫程式的人，這反而是好消息

很多人以為 AI coding 是工程師的事。但 context engineering 這一塊，剛好是讓門檻降下來的關鍵。

你不需要會寫每一行程式，但你需要把「什麼叫做對」描述清楚，交給 AI。會描述標準的人，就算不會 coding，也能讓 AI 穩定產出可用的東西。對創作者、一人公司來說，這才是真正能自己做出工具的那把鑰匙。

--

## 學到什麼

如果你要開始學用 AI 做東西，先別急著背「一個 app 有哪些零件」。先學會把你的判斷標準，寫成 AI 讀得懂的 context 交給它。工具會一直換，但「怎麼把你的標準交給 AI」這件事，是越用越值錢的能力。
