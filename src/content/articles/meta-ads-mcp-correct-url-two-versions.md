---
title: "Meta Ads MCP 正確網址是哪個？mcp.facebook.com 和 mcp.meta.com 兩個版本都在傳"
description: "Meta Ads MCP 接入的 endpoint 有兩個版本在流傳：mcp.facebook.com/ads 跟 mcp.meta.com/ads。我 2026-07 重查一輪，第三方資料多寫前者、也有校正成後者的說法，Meta 官方公告頁沒直接列出完整字串，我沒法一槌定音。這篇誠實記錄查證過程，跟唯一能確認哪個對的方法：實際貼進 Claude Desktop 看哪個跳出授權畫面。"
pubDate: 2026-07-01
tags: ["meta-ads", "mcp", "claude-desktop", "facebook-ads", "資訊差"]
directAnswer: "Meta Ads MCP 的接入 endpoint 目前有兩個版本在流傳：mcp.facebook.com/ads 跟 mcp.meta.com/ads。我 2026-07 重查一輪無法一槌定音，多數第三方設定教學寫 mcp.facebook.com/ads，也有資料校正成 mcp.meta.com/ads，Meta 官方公告頁沒直接列出完整字串。唯一能確定哪個對的方法，是實際在 Claude Desktop 貼上去，看哪個跳出 Meta Business OAuth 授權畫面，填錯會直接連線失敗、沒有有用的錯誤訊息。"
faq:
  - question: "Meta Ads MCP 的網址到底是什麼？"
    answer: "目前有兩個版本在流傳，mcp.facebook.com/ads 跟 mcp.meta.com/ads。我 2026-07 重查，多數第三方設定教學跟工具目錄寫 mcp.facebook.com/ads，但也有校正成 mcp.meta.com/ads 的說法，兩邊相反。Meta 官方公告頁確認了這個產品 2026-04-29 開 beta，但沒在頁面上直接列出完整的 endpoint 字串。我沒實際接過，無法幫你一槌定音，只能兩個都試。"
  - question: "mcp.facebook.com/ads 連不上怎麼辦？"
    answer: "先換另一個版本試，把 URL 改成 mcp.meta.com/ads 再連一次。填錯 endpoint 在 Claude Desktop 會直接連線失敗，不會給有用的錯誤訊息，所以連不上不代表工具壞了，很可能只是 URL 版本不對。如果兩個都連不上，再檢查你的 Meta Business 帳號權限是不是 Admin 或 Finance Editor，以及你的廣告帳號有沒有被排到開通批次。"
  - question: "為什麼會有兩個版本的 URL 在傳？"
    answer: "這是新 AI 工具發布時典型的資訊差。Facebook 等於 Meta 是舊認知，大家口頭轉貼方便，加上 Meta 自家技術 endpoint 這幾年逐步從 facebook.com 收斂到 meta.com 域名，過渡期就會出現兩個版本並存。社群轉貼又互相複製，錯的版本跟對的版本一起擴散，短短幾天就分不清哪個是官方原始出處。"
  - question: "怎麼確認哪個 URL 才對？"
    answer: "最可靠的方法是自己接一次。在 Claude Desktop 開 Settings、Connectors、Add MCP Server，先貼一個版本，看它跳不跳出 Meta Business OAuth 授權畫面。跳出授權畫面的那個就是對的 endpoint。這比看任何第三方教學都準，因為教學可能互相抄錯，但 OAuth 授權畫面不會騙人。"
  - question: "授權通過後 URL 會變嗎？"
    answer: "會。根據早期研究，Meta Business OAuth 授權通過後，系統會 provision 一條包含你 business id 的專屬 URL（類似 mcp.meta.com/ads/<your-business-id> 這種格式），這條才是你後續實際使用的 endpoint。所以你一開始填的是「初次接入」的 entry URL，授權後拿到的專屬 URL 要另外記下來。這點兩個域名版本的說法一致。"
howToSteps:
  - name: "兩個 URL 都試，看哪個跳 OAuth"
    text: "Claude Desktop 開 Settings、Connectors、Add MCP Server。先貼 https://mcp.facebook.com/ads，連不上就換 https://mcp.meta.com/ads。哪個跳出 Meta Business OAuth 授權畫面，哪個就是對的。填錯只會靜默連線失敗，不會有明確錯誤訊息。"
  - name: "檢查 Meta Business 帳號權限"
    text: "如果兩個 URL 都跳不出授權，或授權後拿不到帳號，檢查你的 Meta Business 帳號權限。要是 Admin 或 Finance Editor 才能授權完整 scope。權限不夠或這個廣告帳號還沒被排到開通批次，都會卡在這裡。"
  - name: "記下授權後的專屬 URL"
    text: "授權通過後 Meta 會 provision 一條含你 business id 的專屬 URL，這條才是你之後實際用的 endpoint。記下來，不要每次都用初次接入那條。這是兩個域名版本說法一致的部分。"
---

先把結論放前面：Meta Ads MCP 接入的網址，我查到最後還是沒法一槌定音，有兩個版本在流傳。這篇不是要給你標準答案，是誠實記錄我查證的過程，跟一個你自己就能驗證的方法。我沒實際接過這個 MCP，Meta 是逐步開放，我手上帳號還沒輪到。

--

## 兩個版本，而且相反

事情是這樣。週末哥問我 Claude 有沒有 Meta 廣告 MCP，我查完確認有，是 Meta 官方 2026-04-29 開的 open beta。但查接入的 endpoint URL 時，撞到一個矛盾。

多數第三方資料，包括工具目錄跟設定教學，寫的是：

```
https://mcp.facebook.com/ads
```

但也有資料明確校正說，正確的其實是：

```
https://mcp.meta.com/ads
```

而且校正的那方講得很篤定，說 mcp.facebook.com/ads 是社群傳錯的版本、填了會連不上。兩邊不是模糊，是直接相反。

--

## 我查不到官方一槌定音的版本

我去翻 Meta 的官方公告頁。頁面確認了這個產品的存在、確認 2026-04-29 開 beta、確認走 Meta Business OAuth 免 Developer App，但就是沒在頁面上直接列出那串完整的 endpoint URL。

第三方寫的又互相打架，而且看得出有互相複製的痕跡，一個寫錯後面跟著錯。

所以誠實講：我沒法用「查資料」這個方法確定哪個對。要嘛我自己接一次（但我帳號還沒開通），要嘛你自己接一次。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">Meta Ads MCP 接入 endpoint 有兩版本流傳：mcp.facebook.com/ads 跟 mcp.meta.com/ads。第三方資料相反、Meta 官方公告頁未列完整字串，唯一確認法是實際接入看哪個跳出 OAuth 授權畫面。</p>
</blockquote>

--

## 唯一可靠的驗證方法

不要相信任何教學（包括這篇）直接告訴你哪個對。自己接一次最準。

在 Claude Desktop 開 Settings、Connectors、Add MCP Server，先貼一個版本，看它跳不跳出 Meta Business OAuth 授權畫面。跳出授權畫面的那個就是對的。填錯的那個會直接連線失敗，而且不會給你有用的錯誤訊息，就是靜默失敗。

因為教學會互相抄錯，但 OAuth 授權畫面不會騙人。它跳出來就代表 Meta 那端認得這個 endpoint。

--

## 為什麼新 AI 工具老是出這種包

這其實是新工具發布時的典型現象。Facebook 等於 Meta 是舊認知，大家轉貼方便，加上 Meta 自家技術域名這幾年逐步從 facebook.com 往 meta.com 收斂，過渡期兩個版本並存。社群一轉貼就互相複製，對的跟錯的一起擴散，幾天內就分不清原始出處。

我自己站上先前那篇 Meta Ads MCP 的文章，當時研究後採信 mcp.meta.com/ads 是對的。現在重查發現 mcp.facebook.com/ads 這版反而更多資料採用。我沒法確定是舊研究錯、還是 Meta 中途改了、還是新資料在互抄錯版本。這種不確定本身，就是新工具資訊差的樣子。

--

## 學到的一件事

越是剛發布的工具，越不能把任何單一來源的 URL 當定論，包括自己兩個月前寫的。真正能定案的不是查更多資料，是實際接一次看 OAuth 跳不跳。查證到最後查不出來，就老實說查不出來，順便把驗證方法交給讀者，比硬押一個版本假裝確定有用。
