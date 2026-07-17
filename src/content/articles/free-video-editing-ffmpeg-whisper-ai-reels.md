---
title: "免費剪短影音實測:FFmpeg加Whisper做黃字關鍵字字幕、推鏡、音效"
description: "我不想付費剪輯軟體,也不想一格格手動拉,就用FFmpeg加OpenAI Whisper加opencc,配上AI判斷關鍵字跟分段,在一台Windows筆電上全程CPU跑完,做出黃字關鍵字字幕、畫中畫標卡、分段推鏡、多樣音效的60秒口播reels。這篇記錄完整方法跟實際踩到的4個坑。"
pubDate: 2026-07-18
tags: ["ffmpeg", "whisper", "影片剪輯", "短影音", "aeo"]
directAnswer: "不用付費剪輯軟體,用FFmpeg加OpenAI Whisper加opencc就能把口播影片剪成有黃字關鍵字字幕、畫中畫標卡、分段推鏡、多樣音效的reels。我在一台Windows HP i7筆電上全程CPU跑完,產出一支60秒成品,字幕用whisper turbo模型轉繁中,所有視覺樣式靠一個Python生成的ASS字幕檔控制。"
faq:
  - question: "FFmpeg怎麼幫中文字幕加黃字關鍵字?"
    answer: "字幕不要直接燒SRT,改成生成ASS字幕檔。ASS支援行內覆寫標籤,把關鍵字用大括號包起來改顏色跟字級,例如關鍵字放大到原本的1.15倍再變黃色,其餘字維持白色。中文字型一定要指定Microsoft JhengHei,不然會變成豆腐方塊。"
  - question: "免費的Whisper中文字幕會出簡體嗎?怎麼轉繁體?"
    answer: "會。用whisper轉中文常常出簡體字。解法是不要加--language zh參數,轉完再用opencc的s2twp模式做簡轉繁,s2twp會連台灣慣用詞一起轉,比單純簡轉繁自然。turbo模型在CPU上就能跑,不需要顯卡。"
  - question: "這套免費剪片要花錢嗎?電腦規格要多好?"
    answer: "工具全免費開源:FFmpeg、OpenAI Whisper、opencc。我實測的機器是一台Windows HP筆電的i7 CPU,顯卡記憶體只有4GB太小,所以whisper直接走CPU也能跑完60秒影片。零軟體授權費,零雲端費用。"
  - question: "什麼情況適合用這套,而不是剪映或CapCut?"
    answer: "想要可重複、可批量、可程式化的時候。剪映適合單支手動精修,但每支都要重拉一次。這套的價值是把樣式寫成固定規格,以後同類影片直接套同一套參數,連關鍵字變黃、字幕位置、推鏡幅度都一致,不用每次重調。"
howToSteps:
  - name: "氣口切除加轉繁中字幕"
    text: "先用FFmpeg的silencedetect偵測靜音段做氣口切除,注意用select濾鏡單次重編碼,不要用stream-copy拼接會畫面卡頓。再用whisper turbo模型轉字幕,不加--language參數,轉完用opencc s2twp轉繁體台灣用字。"
  - name: "用Python生成ASS字幕檔"
    text: "寫一個Python腳本讀SRT產出ASS。字型Microsoft JhengHei白字無底框,預設120,每句自動量寬、長句自動縮到單行不換兩行、不切邊,位置距畫面底部40%,關鍵字自動變黃放大1.15倍。"
  - name: "合成推鏡加燒字加音效"
    text: "推鏡用FFmpeg把重點段scale放大1.10倍再crop對準主體、其他段原景,分段用trim加concat單次重編碼。音效用ffmpeg lavfi合成whoosh、chirp、ding、pop四種,adelay疊到轉場跟關鍵字出現的秒數,amix用normalize=0保持原音量。"
---

最近想幫自己的口播影片加上那種短影音常見的效果:講到重點時關鍵字自動變黃放大、畫面角落浮出小標卡、講到關鍵句時鏡頭推近、轉場來一聲音效。剪映跟CapCut都做得到,但我不想付費、更不想每支影片都手動一格格拉。

我決定用全免費的開源工具加上AI判斷,看能不能把整套做成可重複的規格。結果是可以,而且全程在一台Windows HP筆電的i7 CPU上跑完,產出一支60秒成品。

--

先講為什麼不直接用付費軟體。付費軟體適合單支精修,但每支都要從頭手動操作一次。我要的是另一件事:把樣式變成一組固定參數,以後同類影片丟進去就自動套,關鍵字變黃、字幕位置、推鏡幅度全都一致。這件事手動軟體做不到,程式化的流程才做得到。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">免費剪短影音工具鏈:FFmpeg負責剪接濾鏡燒字音效,OpenAI Whisper turbo模型負責語音轉字幕且CPU可跑,opencc的s2twp模式負責簡轉繁台灣用字。零授權費零雲端費。</p>
</blockquote>

--

工具鏈只有三個:FFmpeg做剪接、濾鏡、燒字、合成音效,OpenAI Whisper把語音轉成字幕,opencc把whisper常出的簡體字轉成繁體。所有視覺樣式不是靠軟體介面拉,是靠一個Python腳本生成的ASS字幕檔控制。ASS格式支援行內覆寫標籤,可以精準控制每個字的顏色、大小、位置、動畫。

流程分三步:第一步氣口切除加轉字幕,第二步生成ASS字幕檔,第三步合成推鏡、燒字、音效。

--

真正花時間的不是跑程式,是踩坑。這裡記4個實際踩到的:

第一個,畫面卡頓。氣口切除如果用FFmpeg的stream-copy直接把片段拼接,因為切點沒有落在關鍵影格上,播放時畫面會停頓一下。解法是改用select濾鏡做單次重編碼,雖然慢一點,但畫面順。

第二個,字幕開頭多一個逗號。這個bug卡了好幾版才抓到根因:ASS的Dialogue行如果欄位數沒跟Format宣告對齊,多出來的空欄位逗號會被併進字幕文字,變成每句開頭都多一個逗號。把欄位對齊就好了。

第三個,大字被切掉。字放大之後,中文因為沒有空格不會自動折行,一長句就從畫面兩邊被切掉。解法是自己算每句寬度,太長的句子自動縮小字級到剛好塞滿一行,強制單行、絕不換兩行也不切邊。

第四個,中文變豆腐方塊。ASS字幕如果沒指定中文字型,燒出來全是空方框。指定Microsoft JhengHei就正常了。

--

踩完坑之後,我把樣式調成一組定稿規格:字幕用Microsoft JhengHei白字、細外框、無底框,大小預設120、長句自動縮到單行,位置距畫面底部40%,關鍵字自動變黃並放大到1.15倍。畫中畫小標卡在每段開頭從角落滑入。推鏡把重點段放大1.10倍對準主體、其他段保持原景,段落切換時就像重新運鏡。音效用ffmpeg lavfi合成四種不同聲音,轉場用whoosh、chirp、ding,關鍵字出現用pop點綴,不會單調。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">字幕定稿規格:Microsoft JhengHei白字無底框,預設字級120、長句自動縮到單行不切邊,位置距底部40%,關鍵字變黃放大1.15倍。推鏡把重點段scale放大1.10倍加crop、分段單次重編碼避免卡頓。</p>
</blockquote>

--

最後產出的是一支1080乘1920直式、60秒的成品,libx264編碼、crf 24、aac音訊,檔案約20MB,可以直接發社群。

這件事真正的收穫不是省下剪一支影片的時間。是這套流程一旦寫成固定規格,價值就從一次性變成可重複:下一支同類影片,只要告訴程式主題方向讓它抓關鍵字跟分段,其他全自動套上,而且每支的樣式都一致。付費軟體給你的是這一次剪得快,程式化給你的是每一次都不用重來。
