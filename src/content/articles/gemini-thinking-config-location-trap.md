---
title: "Gemini 2.5 API 突然壞掉：thinkingConfig 必須嵌在 generationConfig 內，Google 收緊 schema 後頂層被拒"
description: "幫一個 LINE Bot 客戶診斷 AI 管家突然壞掉，錯誤訊息「Invalid JSON payload received. Unknown name thinkingConfig」。原本程式碼把 thinkingConfig 放在 body 頂層，Google 之前寬鬆接受、最近收緊 schema 後直接拒絕。5 分鐘修復紀錄 + 正確位置 + 為什麼以前 work 現在不 work。"
pubDate: 2026-04-25
tags: ["gemini", "google ai", "api", "debug", "node.js"]
directAnswer: "Gemini 2.5 系列 REST API 的 thinkingConfig 必須嵌在 generationConfig 內，不能放在 request body 頂層。錯誤訊息「Invalid JSON payload received. Unknown name thinkingConfig: Cannot find field」就是 Google API 在 body 頂層找不到這個欄位。Google 之前寬鬆接受頂層寫法、最近收緊 schema 後一律拒絕。修法是把 thinkingConfig 移進 generationConfig 同層的物件，5 分鐘可改完。"
faq:
  - question: "thinkingConfig 是什麼？為什麼要設？"
    answer: "thinkingConfig 是 Gemini 2.5 系列控制「思考預算」的參數。Gemini 2.5 預設會花 token 「想一下」再回答，thinkingConfig.thinkingBudget 控制這個預算。設 0 = 完全關閉思考（省 quota、省時間）、設正整數 = 上限 token 數、設 -1 = 動態。對 QA 找答案這種「不需要思考、直接抓答案」的任務設 0 最划算。"
  - question: "thinkingConfig 正確位置在哪？"
    answer: "在 generationConfig 物件內，跟 maxOutputTokens、temperature 同層。正確結構：`{ contents: [...], generationConfig: { maxOutputTokens, temperature, thinkingConfig: { thinkingBudget } } }`。錯誤結構是把 thinkingConfig 放在 body 頂層跟 generationConfig 平行。"
  - question: "為什麼以前頂層寫法能用，現在不能用？"
    answer: "Google 早期 API 對未知欄位寬鬆，收到不認得的欄位會 silently ignore。但近期收緊 schema 驗證後，未知欄位直接拒絕請求並回傳錯誤。所以同一段程式碼可能上週還 work、這週突然壞掉。「Unknown name X」錯誤的本質就是：「我不認得 X 在這個位置出現」。"
  - question: "怎麼判斷其他 Gemini 欄位是不是也放錯位置？"
    answer: "Gemini API 的所有 generation 設定（maxOutputTokens、temperature、topP、topK、stopSequences、responseSchema、thinkingConfig 等）都在 generationConfig 內。safety 設定在 safetySettings 內。tools 設定在 tools 內。看到「Unknown name」錯誤就先把欄位往 generationConfig 內搬，9 成是這個原因。"
  - question: "Vertex AI 跟 Gemini API 的 thinkingConfig 寫法一樣嗎？"
    answer: "REST 介面一樣，都嵌在 generationConfig 內。但 Vertex AI 的 endpoint 不同（aiplatform.googleapis.com 而非 generativelanguage.googleapis.com），且需要 Google Cloud OAuth token 而非 API key。如果你是從 Gemini API 遷到 Vertex AI，body schema 不用改，只改 endpoint + 認證方式。"
howToSteps:
  - name: "搜錯誤訊息確認原因"
    text: "看到「Invalid JSON payload received. Unknown name 'X'」這類錯誤，先確認 X 是什麼欄位。Gemini 的話多半是 generation 相關設定放錯位置。日誌或客戶截圖貼上錯誤訊息，搜 X 跟 Gemini API spec 比對。"
  - name: "把 thinkingConfig 搬進 generationConfig"
    text: "改 body：把頂層的 thinkingConfig 物件整個搬進 generationConfig 內。其他欄位（maxOutputTokens、temperature）位置不變。重新部署 5 分鐘搞定。"
  - name: "測試 happy path + thinking 關閉效果"
    text: "修完跑一個 dummy request 確認回 200，再對比修前後的 latency 看 thinkingBudget:0 是否生效（一般會省 30-50% 回應時間）。如果還是慢可能是 model 字串選錯（要 gemini-2.5-flash 不能 gemini-2.0-flash）。"
---

某個客戶的 LINE Bot AI 管家突然壞掉。客戶傳截圖給我看，畫面上夥伴問問題、Bot 回了一行錯誤：

```
系統暫時無法回應，請稍後再試。
(Invalid JSON payload received. Unknown name "thinkingConfig": Cannot find field.)
```

5 分鐘診斷 + 修復紀錄如下。

--

## 錯誤訊息直接告訴你問題

「Unknown name "thinkingConfig"」這種訊息很明確：Google API 在 request body 找到一個叫 thinkingConfig 的欄位，但它不認得這個欄位「在這個位置」應該存在。

兩個可能：

A. 欄位名拼錯
B. 欄位放錯位置

這個 case 是 B。我打開 webhook 程式碼看到：

```javascript
body: JSON.stringify({
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: { maxOutputTokens: 200, temperature: 0 },
  thinkingConfig: { thinkingBudget: 0 }  // ← 在 body 頂層
})
```

thinkingConfig 跟 generationConfig 平行放在 body 頂層。看起來合理，但 Gemini API 不認。

--

## 正確位置：嵌在 generationConfig 內

對的寫法是把 thinkingConfig 搬進 generationConfig 內：

```javascript
body: JSON.stringify({
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    maxOutputTokens: 200,
    temperature: 0,
    thinkingConfig: { thinkingBudget: 0 }  // ← 在 generationConfig 內
  }
})
```

兩段程式碼差距只在縮排，但 Google API 對位置嚴格。

修完重新部署，5 分鐘 LINE Bot 恢復正常。

--

## 為什麼以前 work 現在不 work

這個 bug 的弔詭點是：上週還 work、這週突然壞掉。

原因是 Google API 對未知欄位的處理策略改了。

早期：寬鬆模式，收到不認得的欄位會 silently ignore。所以你寫頂層 thinkingConfig 雖然位置不對，但因為它就是個 object 看起來像 config，Google 會視而不見繼續處理 request。但代價是 thinkingConfig 也沒生效，你以為設了 thinkingBudget:0 結果根本沒省 quota。

近期：收緊 schema 驗證，未知欄位直接拒絕。同一段程式碼從「悄悄無效」變「明顯壞掉」。

這個改變其實是好事（讓你的 bug 早點被發現），但對既有專案就是「沒改 code 突然壞掉」的體驗。

--

## thinkingBudget 是幹嘛的

Gemini 2.5 系列預設會「思考」。看到 prompt 後會花 token 在心裡 reasoning，再給最終答案。對複雜推理有幫助，但對「找答案」「分類」「翻譯」這種任務反而是浪費。

thinkingConfig.thinkingBudget 控制思考預算：

設 0：完全關閉思考，直接回答（省 30-50% latency + token 費用）
設正整數：思考的 token 上限
設 -1：動態，依任務複雜度自動決定

QA 機器人找答案是「直接抓答案」型任務，設 0 最划算。我這個 LINE Bot 客戶就是這個 case。

--

## 怎麼判斷其他欄位是不是也放錯

Gemini REST API 的所有 generation 設定都在 generationConfig 內：

maxOutputTokens、temperature、topP、topK、stopSequences、candidateCount、responseSchema、responseMimeType、thinkingConfig

safety 設定在 safetySettings 內。tools 設定在 tools 內。

看到「Unknown name」錯誤的第一反應：把欄位往 generationConfig 內搬，9 成是這個原因。

--

## 學到什麼

API schema 收緊是常見事件。今天還 work 的程式碼，明天可能因為 provider 改驗證策略而壞掉。第三方 API 整合不能假設「現在 work 就一直 work」。

訂閱 provider 的 changelog 是其中一招。但更務實的：寫程式碼時就照官方 spec 嚴格寫，不要靠寬鬆模式 silently 忽略你的錯誤。位置該放哪就放哪，省下未來突然壞掉的成本。
