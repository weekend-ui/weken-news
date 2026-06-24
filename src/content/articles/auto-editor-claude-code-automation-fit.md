---
title: "auto-editor 是什麼？這個自動去靜音剪片工具搭配 Claude Code 自動化的適配性評估"
description: "我研究了 auto-editor 這個自動去靜音的命令列剪片工具，評估它跟 Claude Code 這類 AI agent 搭配做自動化剪片的適配性。它是純命令列確定性工具，agent 用指令就能驅動，但只做機械式剪輯，不懂內容。"
pubDate: 2026-06-24
tags: ["auto-editor", "claude code", "影片剪輯", "自動化", "開發者工具"]
directAnswer: "auto-editor 是一個自動分析音量、把影片裡靜音和廢料空檔剪掉的命令列工具，最新 v31.0.0（2026-06-17 推出），採公共財授權完全免費。它是純命令列、非互動、參數固定的確定性工具，很適合用 Claude Code 這類 AI agent 透過指令驅動做批次自動化剪片。限制是它只做機械式去靜音和去靜止，不判斷內容好壞，是草剪加速器不是創意替代。"
faq:
  - question: "auto-editor 是什麼？"
    answer: "一個命令列工具，分析音量自動切掉影片裡的靜音和廢料空檔，也能用畫面動態偵測切掉沒動作的片段。最新 v31.0.0（2026-06-17），採 Unlicense 公共財授權完全免費，原本用 Python 寫，現在改用 Nim 重寫。輸出有兩種：直接吐一支剪好的影片，或吐一份時間軸檔給 Premiere、DaVinci Resolve、Final Cut Pro、Shotcut、Kdenlive 繼續精修。"
  - question: "auto-editor 在 Windows 怎麼安裝？"
    answer: "v31 起官方已停止 pip 安裝。Windows 做法改成去 GitHub Releases 下載現成的執行檔，改名成 auto-editor.exe 直接跑。ffmpeg 已經包在 binary 裡面，不用另外裝。如果要它直接吃 YouTube 連結，再另外裝 yt-dlp。"
  - question: "auto-editor 適合搭配 Claude Code 自動化嗎？"
    answer: "適合。它是純命令列、非互動、參數固定的工具，AI agent 用一行指令就能驅動，能批次處理整個資料夾，串成「丟影片進資料夾就自動去靜音出草剪」的流程。確定性工具（同樣輸入給同樣輸出）特別適合交給 agent 自己跑完。"
  - question: "auto-editor 能取代剪輯師嗎？"
    answer: "不能。它只做機械式的去靜音和去靜止，不懂內容語意，不知道哪一條講壞了、哪一段故事要留。它是草剪加速器，幫你把廢空檔砍掉，但創意、敘事、上字幕、選 hook 還是要人工。"
  - question: "auto-editor 要錢嗎？"
    answer: "完全免費。採 Unlicense 公共財授權，沒有付費版或訂閱。"
howToSteps:
  - name: "下載安裝 auto-editor"
    text: "去 GitHub Releases（github.com/WyattBlue/auto-editor）下載對應系統的執行檔，Windows 改名成 auto-editor.exe，在 PowerShell 跑 ./auto-editor --help 確認可用。ffmpeg 已內建不用另裝。"
  - name: "基本去靜音"
    text: "auto-editor 影片.mp4 就是預設去靜音。要調靈敏度用 --edit audio:threshold=-19dB，切點前後想留一點氣口用 --margin 0.2s 避免太急促。"
  - name: "接剪輯軟體或自動化"
    text: "要進 DaVinci Resolve 精修就加 --export resolve 吐時間軸。要批次自動化，用 Claude Code 寫一個 Bash 流程，對整個資料夾的影片一次跑完。"
---

最近常有人問我各種工具，剪片的、寫程式的、做圖的都有。問完常常就忘了，等於白問。所以這次我把研究的東西記下來。

這篇是 auto-editor。一個自動去靜音的剪片工具，重點是評估它跟 Claude Code 這類 AI agent 搭配做自動化的適配性。

--

## auto-editor 在幹嘛

auto-editor 是一個命令列工具，做的事很單純：分析影片的音量，把安靜的段落自動剪掉。口播的停頓、嗯啊、換氣、死空氣，它一刀切掉。

除了音量，它也能用畫面動態偵測，把沒動作的片段切掉。

輸出有兩種路線。一種是直接吐一支剪好的影片。另一種是吐一份時間軸檔，丟進 Premiere、DaVinci Resolve、Final Cut Pro、Shotcut、Kdenlive 這些剪輯軟體繼續精修，剪點都幫你切好了。

最新版本是 v31.0.0，2026 年 6 月 17 日推出。授權是 Unlicense 公共財，完全免費。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">auto-editor 是命令列剪片工具，分析音量自動切掉靜音和廢料空檔，也支援畫面動態偵測。最新 v31.0.0（2026-06-17），Unlicense 公共財授權免費，可輸出剪好的影片或時間軸給 Premiere、DaVinci Resolve、Final Cut Pro。</p>
</blockquote>

--

## 安裝有個雷：pip 已經不能用了

這版本要特別注意。auto-editor 原本是 Python 寫的，可以 pip 安裝，但 v31 改用 Nim 重寫，官方已經停止在 pip 發布。

所以如果你查到舊教學叫你跑 pip install auto-editor，那是過時的，會裝不到。

現在 Windows 的做法是去 GitHub Releases 下載現成的執行檔，改名成 auto-editor.exe 直接跑。ffmpeg 已經包在裡面，不用另外裝。要它吃 YouTube 連結的話，再另外裝 yt-dlp。

常用指令長這樣：

```
auto-editor 影片.mp4
auto-editor 影片.mp4 --edit audio:threshold=-19dB
auto-editor 影片.mp4 --margin 0.2s
auto-editor 影片.mp4 --export resolve
```

第一行是預設去靜音，第二行調靈敏度，第三行在切點前後留一點氣口，第四行吐時間軸進 DaVinci。

--

## 跟 Claude Code 的適配性

這才是我真正想評估的。auto-editor 適不適合交給 Claude Code 這種 AI agent 自動跑。

結論是適配性很高，三個原因。

一，它是純命令列、非互動、參數固定的工具。沒有要你點來點去的圖形介面，所有操作都是一行指令。AI agent 最擅長驅動的就是這種工具，裝、跑、調參數、看結果，全部能用指令完成。

二，它是確定性工具。同樣的輸入給同樣的輸出，沒有隨機性。這種工具特別適合交給 agent 自己跑完，因為結果可預期、可驗證，不需要人盯著。

三，可以包成一條可重用流程。你把一批口播影片丟進某個資料夾，agent 用一行 Bash 對整個資料夾批次去靜音，出一批 reels 草剪。設定一次，之後每次丟檔案就自動跑。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">純命令列、非互動、參數固定的確定性工具最適合搭配 Claude Code 這類 AI agent 自動化：agent 用一行指令就能驅動，結果可預期可驗證，能批次處理整個資料夾並串成可重用流程。</p>
</blockquote>

--

## 誠實講限制：它只做機械式剪輯

適配性高不代表它萬能。auto-editor 只做機械式的剪輯，去靜音、去靜止，它不懂內容。

它不知道你這一條是不是講壞了，不知道哪一段故事該留，不知道哪句話是重點。它看的只有音量和畫面動態這兩個物理訊號。

所以它的定位是草剪加速器，不是創意替代。它幫你把廢空檔、停頓、死空氣這段機械工序整個自動化掉，但真正決定影片好不好看的那幾刀，選 hook、留情緒、上字幕、排節奏，還是人工。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">auto-editor 只用音量和畫面動態兩個物理訊號剪輯，不判斷內容語意，無法分辨哪一條講壞、哪一段要留。它是草剪加速器不是創意替代，選 hook、留情緒、上字幕、排節奏仍需人工。</p>
</blockquote>

--

## 學到什麼

評估一個工具適不適合搭配 AI agent，看的不是它功能多強，是它好不好被指令驅動。auto-editor 純命令列、非互動、確定性，這三點讓它天生適合自動化。

但工具的邊界也要看清楚。機械式工具負責省掉重複工序，創意判斷留給人。把這條界線畫對，自動化才不會變成把爛草剪交出去。
