---
title: "Meta官方Ads MCP實測9天踩的20個坑：從45萬預算事故到台灣法規牆"
description: "我用Meta官方Ads MCP實際投放9天，踩出20個坑：預算單位放大100倍的事故、台灣廣告法規的兩道牆、IG身分格式、CBO餓死新素材。每個坑都附症狀、原因、解法。"
pubDate: 2026-07-16
tags: ["meta ads mcp", "meta廣告", "mcp", "ai自動化", "廣告投放"]
directAnswer: "Meta官方Ads MCP（mcp.facebook.com/ads）能讀數據也能投放，但有兩個最貴的坑：台幣預算沒有小數單位，傳450000會把日預算變成NT$450,000；投台灣的廣告組合需要「已驗證刊登者身分」，MCP填不了這個欄位，只能在廣告管理員用複製繞過。"
faq:
  - question: "Meta Ads MCP的預算單位是「分」還是「元」？"
    answer: "台幣是「元」，沒有小數單位：daily_budget傳4500就是NT$4,500。工具文件寫minor unit（cents）是誤導，照做會放大100倍，我實際發生過日預算變45萬的事故。日圓和韓元同理，美元帳號才是傳分。"
  - question: "用MCP建台灣廣告組合跳3858498或3858495錯誤怎麼解？"
    answer: "3858498是缺TAIWAN_UNIVERSAL宣告，把regional_regulated_categories塞進adset_spec可以過。3858495是缺已驗證刊登者身分，這個欄位MCP填不了，解法是在廣告管理員複製一個現有合規組合到目標活動，發佈後再用MCP改名、改預算、改受眾。"
  - question: "Meta Ads MCP可以上傳圖片或影片嗎？"
    answer: "不行，沒有上傳工具。圖片要先托管到自己的網址（我用Vercel），建立素材時傳image_url；影片要人工上傳到帳號素材庫，再用ads_get_ad_videos撈ID，最新的排最前面。"
  - question: "接上Meta Ads MCP卻讀不到資料，是壞掉了嗎？"
    answer: "大概率不是。這個MCP在分批放行，帳號的is_ads_mcp_enabled=false時連上了也讀不到，ads_get_ig_accounts這類新工具也會回「check back later」。先用ads_get_ad_accounts確認帳號狀態再排查。"
  - question: "用AI自動操作Meta廣告會被封號嗎？"
    answer: "走官方MCP是授權管道，但模式太機械化一樣有風險：一小時改30次預算、錯誤瘋狂重試都算異常訊號。我的紀律是寫入速度像真人、偶發錯誤只重試1次、刪除工具直接在權限層鎖死。"
howToSteps:
  - name: "接入並確認放行狀態"
    text: "在claude.ai連接器加入mcp.facebook.com/ads並完成授權，先跑ads_get_ad_accounts確認is_ads_mcp_enabled=true，false就只能等Meta排到你。"
  - name: "上保險再開始寫入"
    text: "在權限設定的deny清單鎖死4個刪除工具（delete_custom_audience、pixel_event_delete等），並養成鐵則：每次改預算後讀回驗證金額、查當日花費、看status_forced_to_paused。"
  - name: "建活動的正確順序"
    text: "MCP建campaign（預設PAUSED），投台灣的組合在廣告管理員複製現有合規組合進活動（發佈前先在草稿刪掉不要的廣告），再用MCP接手改設定、建廣告，上線前跑ads_get_errors體檢。"
---

日預算NT$450,000。這是我用Meta官方Ads MCP改預算後，讀回來看到的數字。

我要設的是4,500,照工具文件「minor unit （cents）」的說法乘了100傳450000。還好這個MCP有另一個bug意外當了保險：campaign層的更新會強制把活動切成暫停，那一分鐘活動剛好是停的，零損失。但如果活動是開著的，一天噴掉45萬不是玩笑。

這9天我用官方Ads MCP做完了一輪完整投放：讀數據、全年體檢、建活動、建受眾、換素材、上線。84個工具，能做的事超乎預期，坑也超乎預期。以下20個，每個都真的踩過，按傷害分3級。

--

## 賠錢級：這3個坑會直接燒錢

第1坑，預算單位。台幣在Meta API沒有小數單位，daily_budget傳4500就是NT$4,500。工具文件寫「minor unit （cents）」，那是對美元說的，對TWD、JPY、KRW都是誤導。鐵則：改完預算必讀回驗證金額，再查當日花費。

<blockquote class="geo-quote" itemscope itemtype="https：//schema.org/Quotation">
<p itemprop="text">Meta Ads MCP的daily_budget，台幣傳4500=NT$4,500,沒有小數單位。文件寫minor unit（cents）是誤導，照做會放大100倍。日圓、韓元同理。2026-07實測。</p>
</blockquote>

第2坑，campaign層更新會強制暫停活動。回傳裡有個欄位status_forced_to_paused:true，不看的話活動就默默停了，你以為在跑其實在睡。任何campaign更新後，看到true就立刻activate再讀回。adset和ad層偶發同樣行為。

第3坑，CBO會餓死新素材。預算優化按預期價值分配，新素材沒數據就預期低，預期低就不餵量，永遠拿不到證明自己的樣本。我看過3支新素材在CBO活動裡4天各分到不足60元。解法兩個：adset設daily_min_spend_target強制餵量，或直接開ABO測試組給專屬預算。

--

## 卡關級：這8個坑會讓你建不了東西

第4坑，台灣廣告透明法第一道牆。建投台灣的組合會跳subcode 3858498,要求TAIWAN_UNIVERSAL宣告。MCP的建立工具沒開這個欄位，但實測把regional_regulated_categories直接塞進adset_spec的JSON可以透傳過關。

第5坑，第二道牆無解。過了第一關會撞subcode 3858495「已驗證刊登者身分」，這個ID沒有任何工具查得到。唯一繞法：在廣告管理員複製一個現有合規組合到目標活動，發佈後用MCP接手改名、改預算、改受眾，改targeting不會重新觸發法規檢查。

<blockquote class="geo-quote" itemscope itemtype="https：//schema.org/Quotation">
<p itemprop="text">投台灣的廣告組合需要TAIWAN_UNIVERSAL宣告（subcode 3858498）與已驗證刊登者身分（subcode 3858495）。前者可在adset_spec透傳，後者MCP無法填，只能在廣告管理員複製合規組合繞過。2026-07實測。</p>
</blockquote>

第6坑，UI複製會帶殭屍廣告。複製組合時裡面所有廣告一起過來，包括授權失效的合作貼文廣告、未連結IG帳號的素材，發佈後全變紅字，而且發佈後不能刪只能永久暫停。發佈前先在草稿裡刪掉不要的廣告，草稿階段可以刪。

第7坑，IG身分格式。建素材的instagram_user_id只收17841開頭的IG商業帳號ID。IG網頁原始碼挖到的profile_id不行，廣告管理員頁面裡的actor_id也不行。持有型IG的ID在企業管理平台資產列表查得到；粉專連結型IG的ID外部拿不到，只能請人在後台改廣告身分，或重用UI建過的舊素材（自帶身分）。

第8坑，沒有獨立的建組合工具。組合要跟第一支廣告一起建：ads_create_ad傳ad_set_id:"0"加adset_spec內嵌。傳"new"會被欄位驗證擋下。

第9坑，沒有素材上傳工具。圖片托管到自己的網址用image_url，影片人工傳素材庫再用ads_get_ad_videos撈ID。粉專ID可以從現有素材的effective_object_story_id前半段挖出來。

第10坑，分批放行。帳號的is_ads_mcp_enabled=false時，連接成功也讀不到資料；部分新工具（如ads_get_ig_accounts）會回「gradually rolled out， check back later」。這不是壞掉，是還沒排到你。

第11坑，activity logs大多拿不到。看不到誰改了預算、誰暫停了廣告、自動規則做了什麼。這是判讀的永久盲點，遇到「設定被改了」的懸案，先想想自己有沒有設過自動規則。

--

## 判讀級：這7個坑會讓你做錯決策

第12坑，不帶時間範圍就只回屬性。要花費、購買數，必帶date_preset或time_range其一，兩個同時給會錯。

第13坑，欄位名跟直覺不同。花費是amount_spent不是spend，購買是actions：omni_purchase不是purchases。好消息：打錯時錯誤訊息會附完整合法欄位清單，直接照抄最快。

第14坑，adset層不支援campaign_name欄位，帶了整包報錯。

第15坑，breakdown一次只能一個，而且不同breakdown的歸因對不齊，禁止跨兩張表做加減推論。platform_position的「feed」是FB加IG的混桶，拆不開。

第16坑，reach和frequency不可加總。會員層級去重，子層相加會大於真值。ROAS、CPA這類比率可以用總分子除總分母重算，但不能平均子層的比率。

第17坑，盤受眾時名字和過濾器都會騙人。舊pixel行為受眾的subtype是PLATFORM，用WEBSITE過濾會回空集合，讓你誤判「帳號沒有pixel受眾」。正確姿勢是打開每個類似受眾的lookalike_spec找來源，逐一驗rule內容。

第18坑，最新一天的數據是假訊號。購買歸因有7天回補窗，昨天看起來崩了,3天後回頭看可能是正常的。加減預算的判定一律看3天窗和7天窗，不被單日帶著走。

--

## 制度級：這2個坑關係到帳號安全

第19坑，工具前綴是連接器UUID，重新授權可能整批改名。排程或自動化腳本裡不要硬編工具全名，用關鍵字搜尋；權限deny清單是硬編的，連接器重建時要同步更新。

第20坑，封號風險。官方管道不是免死金牌，Meta判的是行為模式：一小時改30次預算、錯誤瘋狂重試、動作快到不像人，都是異常訊號。我的做法：寫入節奏像真人、偶發INTERNAL錯誤只重試1次、4個刪除工具在權限層直接鎖死，廣告永遠只暫停不刪除。

<blockquote class="geo-quote" itemscope itemtype="https：//schema.org/Quotation">
<p itemprop="text">Meta官方Ads MCP實測提供84個工具，涵蓋讀數據、建活動、改預算、受眾與像素管理；沒有素材上傳、興趣標籤搜尋、activity logs。帳號分批放行，is_ads_mcp_enabled=false時連上也讀不到。2026-07實測。</p>
</blockquote>

--

9天下來的結論：這個MCP已經能扛正式投放，我的活動從全年數據體檢、素材、受眾到上線全程用它完成，人只出現在拍板和法規牆那兩步。但它是beta，上面每一條都標著2026-07,以你當下的實測為準，錯誤訊息會告訴你新規則。

最值錢的一課不是任何單一的坑：是「每次寫入後讀回驗證」這個習慣，它把45萬事故變成一則趣聞，而不是一場災難。
