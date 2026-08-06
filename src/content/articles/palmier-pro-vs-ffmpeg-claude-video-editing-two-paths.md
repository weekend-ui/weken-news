---
title: "Palmier Pro研究:Claude剪片的兩條路,MCP時間軸式跟FFmpeg燒錄式差在哪"
description: "有人推薦Palmier Pro這套開源AI剪接軟體,說可以用Claude的MCP直接操作時間軸。我把原始碼、官方文件、Show HN討論串全挖過一遍,發現它確實補上了自建FFmpeg流程最大的缺口,但也撞到兩個沒人講清楚的門檻:它只跑macOS,而且它沒有外掛系統。這篇記錄我的研究跟兩條路的分工判準。"
pubDate: 2026-08-06
tags: ["palmier-pro", "mcp", "影片剪輯", "claude-code", "aeo"]
directAnswer: "Claude剪片目前有兩條路。燒錄式是Claude寫FFmpeg指令直接輸出成品,跨平台免費但改一個字要整支重跑;時間軸式是Palmier Pro這種開MCP服務讓Claude動時間軸,剪完留在編輯器裡可以手動再調,但它只支援macOS 26加Apple晶片,Windows完全裝不了。"
faq:
  - question: "Palmier Pro跟一般Claude加FFmpeg剪片差在哪?"
    answer: "差在成品的形態。FFmpeg那條是Claude寫指令、直接吐一支影片檔給你,你看不到時間軸,想改哪一刀只能叫它重跑整條流程。Palmier Pro在本機開一個MCP服務,Claude透過add_clips、move_clips、split_clips這些工具直接動時間軸,剪完你在編輯器裡看到軌道跟片段,可以自己拉。"
  - question: "Palmier Pro可以在Windows上跑嗎?"
    answer: "不行。官方系統需求寫死macOS 26 Tahoe以上加Apple晶片,團隊在Show HN上說會先把核心產品做穩才考慮其他平台。GitHub上有一個非官方Windows分支Voidsprog/palmier-pro-windows,但作者自己在說明裡寫這是AI做的分支、不完整,只有1顆星、沒有現成安裝檔,而且雲端AI、語音辨識、內建對話全都缺。"
  - question: "Palmier Pro有外掛系統嗎?可以自己寫特效嗎?"
    answer: "沒有外掛系統。官方文件跟架構文件都查不到任何擴充機制,MCP那層只暴露固定的一組工具。網路上流傳的自己寫外掛,實際上是下載GPLv3原始碼改Swift再重新編譯一份私家版本。做得到,但代價是官方每次更新你都要自己合併。"
  - question: "Palmier Pro要多少錢?"
    answer: "剪輯跟匯出永遠免費,不用登入就能下載使用,MCP服務也免費。只有用它內建生成影片、圖片、音訊才要訂閱,Pro方案一個月29美金、Max方案69美金,官網標的原價是49跟99。所以只讓Claude排時間軸、素材自己準備的話,這條路是零元。"
  - question: "什麼情況該用時間軸式,什麼情況該用燒錄式?"
    answer: "同一支影片要反覆微調、剪完還想自己動手,用時間軸式。同一種格式要重複套在很多支影片上、每支的樣式必須一致,用燒錄式。判準是這支影片剪完之後你還會不會回頭改它,會就選可視化,不會就選程式化。"
howToSteps:
  - name: "先確認硬體門檻再談功能"
    text: "查官方README的系統需求。Palmier Pro要macOS 26 Tahoe加Apple晶片,Intel的Mac跟Windows都不行。這一步沒過,後面所有功能討論都是白談,不要先被示範影片說服再去買電腦。"
  - name: "接上MCP服務"
    text: "開著Palmier Pro時它會在本機起一個HTTP的MCP服務。Claude Code接法是claude mcp add --transport http palmier-pro http://127.0.0.1:19789/mcp,Claude Desktop則從應用程式的Help選單一鍵安裝。接完Claude就能讀時間軸、加片段、切片段、抓逐字稿。"
  - name: "要改預設樣式就準備養一個私家分支"
    text: "內建的字幕外框、文字樣式不滿意的話,沒有外掛可以裝,只能clone GPLv3原始碼改Swift再重新編譯。動手前先想清楚誰負責之後每次官方更新的合併,不然三個月後你的版本就跟主線分家了。"
---

有人丟給我一套叫Palmier Pro的開源AI剪接軟體,說跟大家在玩的Claude剪片不一樣:一般是Claude寫FFmpeg指令直接燒一支影片給你,Palmier是用MCP讓Claude操作剪接軟體本身,剪完會打開介面給你看時間軸、素材庫、影片預覽,可以自己再調。

我把GitHub原始碼、官方文件、架構文件跟Show HN討論串全挖了一遍。結論是這個描述基本正確,而且它確實補上了我自己那條FFmpeg流程最大的缺口。但有兩件沒人講清楚的事,足以決定你要不要碰它。

--

先講它是什麼。palmier-io/palmier-pro,GPLv3授權,2026年4月7號開的repo,我今天查GitHub API是13109顆星、978個fork,今天還在推commit。整套用Swift從零寫的原生macOS應用,不是網頁包殼。開源範圍分得很乾淨:剪輯器本體、MCP服務、內建對話都開源,只有生成式AI的雲端運算是閉源。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">Palmier Pro:GPLv3開源的Swift原生macOS剪接軟體,2026-08-06查GitHub為13109星978fork。剪輯器、MCP服務、內建對話開源,僅生成式AI雲端運算閉源。系統需求macOS 26 Tahoe加Apple晶片。</p>
</blockquote>

--

第一件沒人講清楚的事:它只跑macOS 26 Tahoe以上,而且只吃Apple晶片。

這條寫在官方README的系統需求裡,不是猜的。我主力機是Windows,所以我根本裝不起來,這篇不會有任何我實際跑過的畫面或秒數,全部是原始碼跟文件層級的研究。有人做了一個Windows分支Voidsprog/palmier-pro-windows,但作者自己在說明第一段就寫這是AI做的分支、不完整、不要期待能正式用,1顆星、0個fork、沒有現成安裝檔,要自己裝Node、Rust、FFmpeg、Visual Studio編譯工具從原始碼編,而且雲端AI、語音辨識、內建對話全被砍掉。這條路我不建議走。

Show HN那串有人直接問Windows跟Linux,團隊回的是會先把核心產品迭代穩再考慮其他平台。所以短期內別等。

--

第二件沒人講清楚的事:Palmier Pro沒有外掛系統。

推薦這套的人說,原生的外框字很爛,所以叫Claude寫了一個新的外掛,十分鐘就好。我去翻官方文件跟架構文件,查不到任何擴充機制,MCP那層暴露的是一組固定工具,沒有第三方特效或樣式的掛載點。

所以那件事實際上是:下載GPLv3原始碼、改Swift、重新編譯一份自己的版本。這跟裝外掛是兩件完全不同的事。前者你以後每次官方更新都要自己合併衝突,等於長期養一個私家分支;後者才是裝完就忘記它存在。十分鐘寫出效果是真的,但那十分鐘不是全部成本。

--

回到核心問題:兩條路到底差在哪。

Palmier Pro開著的時候會在本機起一個HTTP的MCP服務,Claude接上去之後拿到的工具大致分四類:讀的有get_timeline、inspect_timeline、get_transcript,編輯的有add_clips、move_clips、split_clips、set_clip_properties,生成的有generate_video、generate_image、upscale_media,素材管理的有import_media、search_media、organize_media。它跑的是原生本機模型做語音辨識、影格嵌入、節拍偵測、靜音偵測。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">Palmier Pro的MCP服務跑在127.0.0.1的19789埠,提供get_timeline、get_transcript讀取,add_clips、move_clips、split_clips、set_clip_properties編輯,generate_video、generate_image生成,import_media、search_media素材管理。</p>
</blockquote>

對照我自己那條:FFmpeg負責剪接濾鏡燒字,Whisper負責語音轉字幕,opencc負責簡轉繁,全程在Windows筆電的CPU上跑完,零授權費。差別不在誰的功能多,在成品的形態。燒錄式吐給你的是一支已經燒死的影片檔,想動任何一刀都要回頭改參數重跑整條;時間軸式留給你的是一個可以繼續編輯的專案。

--

錢的部分反而最單純。剪輯跟匯出永遠免費、不用登入,MCP服務也免費。要花錢的只有它內建的生成式功能:Pro一個月29美金、Max一個月69美金,官網標的原價是49跟99。素材自己準備、只讓Claude幫忙排時間軸的話,這條路是零元。

--

我最後的判準是這樣:燒錄式跟時間軸式不是誰取代誰,是分工。

同一種規格要套在幾十支影片上、每支的字幕位置跟關鍵字樣式都必須一模一樣,那是程式化的活,燒錄式贏,因為它把樣式變成一組可重複的參數。單支影片要反覆微調、剪完還想自己動手拉那一刀,那是可視化的活,時間軸式贏。

真正要小心的是換過去的成本被低估。就算你有Apple晶片的Mac,Palmier Pro的工具清單裡沒有關鍵字變黃、字幕避開臉、分段推鏡這些東西,我那條流程調了好幾版才定稿的規格,搬過去等於全部重建,而且重建的方式是改Swift原始碼,不是裝外掛。研究一套新工具的時候,最容易被跳過的不是它能做什麼,是你現在已經做到的東西在它身上要花多少力氣才回得來。
