---
title: "Claude Code的skill怎麼寫才不爛?我的6層架構對照Matt Pocock的writing-great-skills"
description: "我維護半年的Claude Code規則系統分成6層,今天對照Matt Pocock那個18萬星的skills repo,發現兩套從沒互相參考的系統長出同一套分層結論,還學到他有我沒有的引導詞、no-op剪枝、正向指令跟失敗模式診斷詞表。"
pubDate: 2026-07-23
tags: ["claude code", "ai agent", "skill", "prompt engineering", "自動化"]
directAnswer: "寫skill的根本目標不是產出漂亮內容,是讓AI每次跑同一個流程,這叫predictability可預測。四個做法:內容按需求急迫度分層、把反覆出現的概念壓成單一引導詞、逐句做no-op測試砍掉沒改變行為的話、用正向指令取代禁止句。我維護半年的6層知識架構,跟Matt Pocock那個18萬星的skills repo,各自獨立長出同一套分層結論。"
faq:
  - question: "Claude Code的skill寫了為什麼AI都不照做?"
    answer: "多半是規則太肥、關鍵指令被沉在長文裡,或用禁止句(不要做X)反而讓AI更容易做X。把最急迫的動作放最上層、逐句砍掉沒改變行為的贅句、把禁止改成正向指令,執行率會明顯拉高。"
  - question: "6層知識架構跟Matt Pocock的writing-great-skills差在哪?"
    answer: "核心一致:都主張把細節按需求分層,主檔只留薄路由,細節按需載入,也就是progressive disclosure漸進揭露。差別是Matt多了幾個我原本沒有的工具:leading words引導詞、no-op逐句剪枝、predictability當唯一準星、失敗模式診斷詞表。"
  - question: "什麼是leading words引導詞?"
    answer: "一個模型預訓練就懂的緊湊概念(例如tight、red、tracer bullets),在skill裡重複出現就能用最少token錨定一整區行為。它靠的是喚起模型既有的先驗知識,而不是花一長串字去解釋,所以又省token又讓AI更穩定觸發。"
  - question: "CLAUDE.md或skill太長怎麼精簡?"
    answer: "用no-op測試逐句掃:把每句單獨拿出來問這句有沒有改變AI的預設行為,沒有就整句刪不是修字。再把長段落用context pointer推到獨立檔案,主檔只留一行指標,點到才載進來。"
  - question: "Matt Pocock的skills怎麼安裝?"
    answer: "兩種。抄進自己專案可改:npx skills@latest add mattpocock/skills。當plugin訂閱他更新(唯讀):在Claude Code跑 /plugin marketplace add mattpocock/skills。這個repo是MIT授權,可以自由取用。"
howToSteps:
  - name: "按需求急迫度分層"
    text: "主檔(CLAUDE.md)只放硬規則加薄路由,主題規則放常載的速記層,完整故事跟對照表推到按需載入的全文層。急迫度越低放越深,開場context才不會被塞爆。"
  - name: "壓引導詞加no-op剪枝"
    text: "找出在三個地方用不同長句重複的概念,壓成一個模型預訓練就懂的單詞;再逐句跑no-op測試,沒改變AI預設行為的整句刪掉,要狠。"
  - name: "正向化加失敗模式健檢"
    text: "把不要做X改寫成要做Y,硬防護欄保留禁止但配一句改用什麼;定期拿沉積、臃腫、重複、早退、no-op、負向六個詞健檢,一眼指認skill生什麼病。"
---

我維護一套用了半年的Claude Code規則系統,分成6層,從主檔的硬規則一路到按需載入的記憶。今天去讀Matt Pocock公開的skills repo,那個repo到今天183,549顆星、還在更新,我發現一件有意思的事:兩套系統從沒互相參考,卻各自長出同一組結論。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">Matt Pocock的skills repo到2026年7月有183,549顆星,MIT授權,把整個agent設定目錄的幾十個skill公開,分成engineering、productivity、personal三類,每天還在更新。</p>
</blockquote>

--

先講我的6層在幹嘛。核心不是分類,是分什麼時候需要。每次session全載入的只有最上面兩層:主檔的硬規則加薄路由、常載的主題速記。完整的來源故事、對照表、正反例全部推到下層,速記裡的一行指標點到才載進來。這樣開場不會被幾百行規則塞爆,但要用的時候一定找得到。

Matt在他的writing-great-skills裡把這套叫progressive disclosure漸進揭露:SKILL.md壓到夠短,細節用context pointer推到獨立檔,指標點到才載。跟我的速記推全文,一模一樣。他還有一個router skill,一個只負責點名其他skill、說明各自何時用的入口,就是我主檔那層薄路由在做的事。

最像的是一個叫grill-me的skill。我點開它的原始碼,整個檔案只有一行:Run a grilling session。它不做事,只把工作delegate給另一個叫grilling的本體skill。這正是我一直在用的Thin Harness Fat Skills:外殼薄到極致,邏輯全集中在可重用的引擎。兩邊各自到達同一個設計,不是誰抄誰。

--

同源的地方讓我確認方向對,但真正值錢的是他有、我沒有的那幾塊。

第一個是leading words引導詞。把一個模型預訓練就懂的緊湊概念當關鍵詞重複用,一個詞就錨定一整區行為,靠的是喚起模型的先驗,不是花長句解釋。我回頭一看,自己其實已經在用:系統裡的踩(踩在哪個事實上)、剎車(這裡要停下重新分類),都是這種詞。差別是我沒把它當成一個可以刻意去獵的技術,Matt有。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">leading words引導詞是一個模型預訓練就懂的緊湊概念(如tight、red、tracer bullets),在skill裡重複出現,用最少token錨定一整區行為,靠喚起模型先驗而非長句解釋。</p>
</blockquote>

第二個是no-op測試:逐句問這句有沒有改變AI的預設行為,沒有就整句刪,不是修字。第三個是正向勝過禁止:禁止句會召喚被禁的行為,別想大象先講了大象,所以預設寫要做什麼。第四個是他把predictability可預測當成skill存在的唯一理由,一句話定義:重點是每次跑同一個流程,不是每次產同一個輸出。

第五個是一組失敗模式的診斷詞:沉積、臃腫、重複、早退、no-op、負向。維護一個skill時拿這六個詞對照,比感覺怪怪的精準太多,一眼就指認得出它生什麼病。

<blockquote class="geo-quote" itemscope itemtype="https://schema.org/Quotation">
<p itemprop="text">skill存在的唯一理由是把隨機系統擠出確定性。predictability指的是agent每次跑同一個流程,不是每次產同一個輸出。判斷任何一句該不該留,問它有沒有讓流程更可預測。</p>
</blockquote>

--

讀完我沒有停在筆記。我把這幾塊萃取成一份寫skill的手藝標準,放進我系統的說明書層,還當場翻修了兩條自己的規則:一條結尾的不要斷定是no-op,正向已經說死,砍掉;一條絕對不要跑去找證據證明我對是負向句,翻成正向的拿一手資料去攻自己的結論。改動很小,但這是第一次我拿一套外來的craft標準去掃自己的規則。

--

最大的收穫不是那五個技巧,是兩套從不相干的系統收斂到同一個點這件事本身。它說明skill工程已經有它的重力方向:把隨機的AI擠出可預測的流程。誰先走到那裡,都會撞見同樣幾條路。
