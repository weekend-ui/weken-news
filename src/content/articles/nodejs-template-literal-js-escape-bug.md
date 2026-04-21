---
title: "Node.js template literal 嵌入 JavaScript 的地雷：\\n 和 \\' 會讓整個 script 靜默崩潰"
description: "在 Node.js 後端用 template literal 產生 HTML 頁面時，如果 HTML 裡含有 inline JavaScript，\\n 和 \\' 這類 escape 會被 Node.js 先處理一次，輸出到瀏覽器時語法錯誤，整個 script block 靜默崩潰，頁面空白但 HTML 正常顯示。這篇記錄兩次踩到同一個坑的完整過程。"
pubDate: 2026-04-21
tags: ["nodejs", "javascript", "debug", "vercel", "template-literal"]
directAnswer: "Node.js template literal 裡的 \\n 和 \\' 等 escape 序列會被 Node.js 處理成真實字元，輸出到瀏覽器的 JavaScript 因此語法錯誤，整個 script block 靜默崩潰。症狀是 HTML 顯示正常但頁面功能完全失效，console 沒有報錯。解法是把 template literal 裡的 \\ 全部雙寫（\\\\n 輸出成 \\n、\\\\' 輸出成 \\'）。"
faq:
  - question: "Node.js template literal 裡的 \\n 為什麼會讓瀏覽器 JavaScript 壞掉？"
    answer: "Node.js 在處理 template literal 時會先解析所有 \\x escape 序列：\\n 變成真實換行、\\' 變成單引號。如果這段文字輸出成 HTML 裡的 inline JS，瀏覽器看到的是已經被替換過的字元，不是原本的 escape 語法。regex 的 /\\n/g 被替換成 / 加真實換行 加 /g，語法無效，整個 script block 崩潰。"
  - question: "script block 靜默崩潰有什麼症狀？"
    answer: "HTML 結構正常顯示（header、按鈕、頁面框架都在），但所有 JavaScript 功能完全失效：清單空白、按鈕無反應、資料不載入。瀏覽器 console 可能沒有錯誤訊息，需要手動在最外層加 try/catch 才看得到 SyntaxError。"
  - question: "Node.js template literal 裡寫 JavaScript 的正確做法是什麼？"
    answer: "所有要輸出到瀏覽器的 JavaScript 裡的 \\ 都要雙寫：\\\\n 輸出成 \\n，\\\\' 輸出成 \\'。或者把含特殊字元的邏輯抽成全域函式，避開 inline 字串嵌入。"
  - question: "這個 bug 在 Vercel serverless function 特別常見嗎？"
    answer: "不是 Vercel 特有的問題，而是 Node.js template literal 的語言特性。在任何用 Node.js 動態產生 HTML 的場景都會出現，例如 Express、Vercel serverless function、Next.js API route。"
howToSteps:
  - name: "確認是否為 template literal escape 問題"
    text: "在輸出的 HTML 裡的 script block 最外層加上 try/catch，看 console 是否出現 SyntaxError。同時檢查 Node.js 的 template literal 裡是否有 \\n、\\'、\\t 等 escape 序列。"
  - name: "修正：所有 escape 雙寫"
    text: "把 template literal 裡出現在輸出 JavaScript 中的所有單 \\ 改成 \\\\。例如 /\\n/g 改成 /\\\\n/g，輸出到瀏覽器後才是正確的 /\\n/g。"
  - name: "預防：把含特殊字元的邏輯抽成全域函式"
    text: "img 的 onerror、onclick 等 attribute 裡如果要嵌入字串，改成呼叫全域函式（例如 onerror=\"handleError(this)\"），把邏輯放在 function 定義裡，完全避開四層引號巢狀問題。"
---

同一個 bug 踩了兩次，第一次花了兩個小時才找到原因，第二次認出來只用了十分鐘。

症狀每次都一樣：HTML 顯示正常，頁面功能完全不動，console 沒有報錯，資料清單空白。

原因每次也都一樣：Node.js template literal 裡的 escape 序列。

--

第一次踩的是 `\'`。

在 Vercel serverless function 裡用 template literal 產生 HTML 頁面，`img` 的 `onerror` attribute 裡有這樣的字串：

```javascript
const html = `<img onerror="this.parentNode.textContent=\\'${name}\\'">`;
```

Node.js 處理 template literal 的時候，`\'` 被轉成了 `'`，輸出到瀏覽器的變成：

```html
<img onerror="this.parentNode.textContent='Ken'">
```

看起來沒問題，但整個 script block 在這之前其實已經因為另一段語法錯誤崩潰了。那段 `\'` 出現在字串拼接裡，產生了 `textContent='' + name + ''` 的語法，在某些位置讓 JS parser 解讀出問題。

修法：把 `onerror` 邏輯抽成全域函式，attribute 只留 `onerror="handleImgError(this)"`。

--

第二次踩的是 `/\n/g`。

幾個月後在同一個專案，要在輸出的 JavaScript 裡把換行轉成 `<br>`：

```javascript
const html = `...content.replace(/\n/g, '<br>')...`;
```

Node.js 處理 template literal，`\n` 被換成真實換行字元。瀏覽器看到的是：

```
content.replace(/
/g, '<br>')
```

regex literal 裡有真實換行，語法錯誤，整個 script block 崩潰。

修法：改成 `/\\n/g`，template literal 輸出 `/\n/g`，瀏覽器看到正確語法。

--

根本規則只有一條：Node.js template literal 會處理所有 `\x` escape 序列。

要輸出給瀏覽器看的 JavaScript，裡面的每一個 `\` 都要雙寫，Node.js 消耗一層，瀏覽器拿到正確的一層。

不確定的時候，把複雜邏輯抽成全域函式，完全避開 attribute 嵌入字串的需求。這個解法更根本，不會因為字串內容改變而重新踩坑。
