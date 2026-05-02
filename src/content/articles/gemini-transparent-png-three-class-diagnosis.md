---
title: "Gemini 不出透明 PNG 怎麼辦？實測 N 次才搞懂的 AI 輸出三類分類法"
description: "做 wk-pet-sticker 寵物貼圖時要 Gemini 輸出透明 PNG，反覆改 prompt 幾十次都失敗。後來才發現是 model 能力上限不是 prompt 問題。整理出 AI 輸出三類分類法 + 實測解法（chroma key pipeline）+ 下次該設的剎車條件。"
pubDate: 2026-05-02
tags: ["gemini", "image-generation", "prompt-engineering", "chroma-key", "ai-debug"]
directAnswer: "Gemini 任何 model（含 Nano Banana / Gemini 2.5 flash image）都不會輸出 RGBA 真透明 PNG，輸出檔案是 PNG 容器但 alpha channel 永遠是 255（不透明）。我實測幾十次 prompt 變體全部失敗，最後改用 chroma key pipeline 解決：讓 Gemini 輸出純綠色背景的圖（這它能做），後製用 HSV + Floodfill 演算法把綠色去掉換成透明。"
faq:
  - question: "Gemini 可以輸出透明 PNG 嗎？"
    answer: "不能。Gemini 任何 model（包括 Gemini 2.5 flash image / Nano Banana）都不會輸出 RGBA 真透明 PNG。輸出檔案是 PNG 格式沒錯，但 alpha channel 永遠是 255（完全不透明）。我實測過幾十次 prompt 變體，包括「transparent background」「pure transparent」「alpha channel」「isolated subject on transparent」這些寫法，全部失敗。"
  - question: "為什麼 prompt engineering 對某些 AI 輸出問題沒用？"
    answer: "因為 AI 輸出問題分三類，只有第一類（prompt 不清楚）能用 prompt 解決。第二類是 model 能力上限，第三類是 API config 設錯。我這次踩的是第二類：Gemini 不支援 RGBA 輸出，這是能力天花板，再怎麼改 prompt 都不會出來。用第一類的方法解第二類的問題就是 prompt-first bias 的災難現場。"
  - question: "AI 輸出不符預期時怎麼 debug？"
    answer: "動手改 prompt 之前先做分類。三類症狀不同：prompt 問題的症狀是輸出隨機性高、不同 phrasing 結果差很多；能力上限的症狀是永遠輸出同一類錯誤、不管 prompt 怎麼改方向都一致；config 錯的症狀是完全沒輸出或報錯訊息提到 parameter。連續 2 次同類失敗就是訊號告訴你不是 prompt 問題。"
  - question: "怎麼讓 AI 出真透明 PNG？"
    answer: "我的解法是不要叫 Gemini 直接出透明，改用 chroma key pipeline。Prompt 讓 Gemini 出純綠色背景的圖（純色背景它能做得很好），後製用 HSV 色彩空間 + Floodfill 演算法在 server 端把綠色去掉換成透明。實測比硬要 Gemini 出透明可靠很多，輸出品質也比 RGB threshold 好。"
howToSteps:
  - name: "動手前 5 分鐘 capability sanity check"
    text: "用最簡單的 prompt 跑一次小測試，把輸出存成檔案，用 imagemagick 或 Python PIL 看 alpha channel 真實值。確認 model 真的能做這件事再開始 iterate prompt。文件寫「支援 PNG 輸出」不等於「支援 RGBA pixel」，這是兩件事。"
  - name: "連續失敗 2 次強制重新分類"
    text: "同類錯誤連續發生 2 次以上不要繼續加 prompt 詞。停下來問自己：是 prompt 不清楚（隨機性高）、能力上限（永遠同一類錯）、還是 config 錯（報錯或沒輸出）？分類錯就是用錯解法的根因。"
  - name: "確認類別後選對解法"
    text: "第 1 類改 prompt phrasing。第 2 類換 model 或改用其他工具（像我這次的 chroma key 後製 pipeline）。第 3 類查 endpoint、auth、param 名稱、版本。新 model（剛發布幾個月內）預設可能缺常見能力，先 WebSearch capability matrix 再動手。"
---

最近做 wk-pet-sticker，要讓 AI 把寵物照片背景去掉變成透明 PNG 貼圖。選了 Google Gemini 2.5 flash image（俗稱 Nano Banana），文件寫支援 PNG 輸出，看起來該能做。

結果反覆改了幾十次 prompt，沒有一次出來是真透明。

--

## 動機很單純

用戶上傳寵物照，AI 自動去背輸出可貼在 LINE 對話的透明 PNG 貼圖。這是核心功能。

選 Gemini 是因為它便宜、有官方 image generation API、文件寫支援 PNG 格式輸出。表面條件都符合。

--

## 我當時的判斷鏈，每一步都錯

第一次出來不透明。我以為是 prompt 不夠精準。加了「transparent background」。

還是不透明。加「pure transparent background, alpha channel, no fill, isolated subject on transparent」。

還是不透明。換 model，從 Nano Banana 換到 Gemini 2.5 flash image preview 版。

還是不透明。N 次後我才停下來問一個本來就該先問的問題：這 model 到底支不支援 RGBA 輸出？

--

## 答案很乾脆

WebSearch 一下，加上自己實際下載輸出檔用 PIL 檢查 alpha channel：

```python
from PIL import Image
img = Image.open("output.png")
print(img.mode)  # RGB，不是 RGBA
```

Gemini 任何 model 都不會吐 RGBA 真透明 PNG。輸出檔案是 PNG 格式沒錯，但 alpha channel 永遠是 255（不透明），實際上就是 RGB 套個 PNG 容器。

PNG 是容器，RGBA 是內容。容器支援 alpha 不代表 model 會實際輸出 alpha 像素值。這個區分我之前沒搞清楚，所以一直在改 prompt，根本是用錯方法解錯類型的問題。

--

## 解法：放棄硬要 Gemini 出透明

改成 chroma key pipeline。

第一步，prompt 讓 Gemini 出純綠色（#00FF00）背景的圖。純色背景它能做得很好，沒有能力天花板問題。

第二步，後製用 HSV 色彩空間 + Floodfill 演算法在 server 端把綠色去掉換成透明。HSV 比 RGB threshold 可靠，因為陰影和反光的綠色在 HSV 裡仍然是綠色色相，但 RGB 值會差很多。

第三步，做 spill 處理（去除主體邊緣的綠色滲色）+ feathering（邊緣抗鋸齒）。

結果可用，bug 修完。但花的時間比預期多三倍。

--

## 我事後整理的根因：prompt-first bias

我有一個系統性偏見：預設所有 AI 輸出問題都是 prompt 問題。動手就改 prompt。

實際上 AI 輸出問題有三類，動手改 prompt 之前必須先分類：

1. Prompt 不清楚 → 改 prompt
症狀：輸出有時對有時錯、隨機性高、不同 phrasing 結果差很多。
解法：iterate prompt phrasing。

2. Model 能力上限 → 換 model 或換做法
症狀：永遠輸出同一類錯誤、不管 prompt 怎麼改方向都一致。
解法：WebSearch model capability matrix，換 model 或改用其他工具（像我這次的 chroma key）。

3. API config 設錯 → 檢查設定
症狀：完全沒輸出、輸出格式錯、報錯訊息提到 parameter。
解法：檢查 endpoint、auth、param 名稱、版本。

我這次踩的是第 2 類，但用第 1 類的方法解，所以怎麼試都沒用。

--

## 下次的剎車條件

我給自己設了三條剎車條件，下次這類問題出現時強制觸發：

A. 動手前 5 分鐘 capability sanity check
用最簡單的 prompt 跑一次，把輸出存成檔案，看 output bytes / metadata，確認 model 真的能做。

B. 同類失敗連續 2 次必須停下來重新分類
不能繼續第三次加 prompt 詞。連續 2 次同類失敗本身就是訊號，告訴我這不是 prompt 隨機性問題，是能力上限或 config 問題。

C. 新 model（剛發布幾個月內）預設可能缺常見能力
Gemini 2.5 flash image / Nano Banana 是 2024 末才出來的 model。新 model 容易踩坑因為功能 matrix 還在演進，不能假設跟其他 image gen API（DALL-E、Replicate 等）parity。先 WebSearch capability matrix 再動手。

--

## 學到的一件事

AI 輸出問題的第一個動作不是改 prompt，是分類。
