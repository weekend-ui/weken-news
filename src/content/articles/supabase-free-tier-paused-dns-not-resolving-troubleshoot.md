---
title: "Supabase free tier project paused 後 DNS 變 Non-existent：判斷死活的 3 個方法"
description: "Supabase 免費方案 7 天沒活動會 pause，paused 後 project URL 直接 DNS Non-existent（不是 503），跟「project 被刪」表面看起來一樣。實測台灣連線從 Cloudflare 1.1.1.1 跟 Google 8.8.8.8 都解析失敗。判斷死活 3 個方法 + Resume 後等待時間實測。"
pubDate: 2026-05-09
tags: ["supabase", "vibe-coding", "free-tier", "troubleshoot", "aeo"]
directAnswer: "Supabase free tier project paused 後 DNS 變 Non-existent，3 家公共 DNS（默認 / 8.8.8.8 / 1.1.1.1）都解析不到，跟 project 被刪掉一樣症狀。判斷死活看 supabase.com/dashboard：still listed but「Paused」可以 Resume，dashboard 找不到才是真的刪掉。Resume 後幾分鐘到幾小時 DNS 才會重新生效。"
faq:
  - question: "Supabase paused project 為什麼 DNS 直接 Non-existent？"
    answer: "Supabase 免費方案 paused 不是只關掉 service 503，是把整個 project URL 的 DNS record 撤掉。實測 nslookup 從 Cloudflare 1.1.1.1、Google 8.8.8.8、DoH 都回 Non-existent domain。意思是平台層級從 DNS 就不解析，省下整個 hosting 資源。"
  - question: "Supabase paused 跟 deleted 怎麼分？"
    answer: "從 client 端症狀完全一樣（DNS Non-existent + service unreachable）。判斷只能去 supabase.com/dashboard 看：project 還在列表但標 Paused 是 paused 可 Resume；project 找不到才是真的 deleted。所以 client 端怎麼測都分不出來，必須去 dashboard 確認。"
  - question: "Supabase free tier 多久會 auto-pause？"
    answer: "7 天沒任何 DB 活動（query / write / function call）就會自動 pause。不只用戶端沒 query，跑 cron 或排程的 API 也算活動。如果你跑了個 free tier project 但沒人用，1 週後就會 pause。"
  - question: "Supabase Resume 後多久 DNS 才生效？"
    answer: "Supabase 官方說「幾分鐘到幾小時」。實測 Resume 後 5 分鐘 DNS 已生效，client 連線正常 200。但個案會有差，特別是熱門時段或基礎建設遷移期間。Resume 過程不會丟資料，DB schema + 資料完整保留。"
  - question: "怎麼防止 Supabase project 自動 paused？"
    answer: "1) 每週至少 call 一次 query 維持活動（cron 跑簡單 SELECT）；2) 升級到 Pro plan 沒 pause 機制（$25/月）；3) 把這個 project 跟有真實流量的 production app 連結。對「個人用 / 偶爾測」project，自動 pause 是省錢機制不是壞事，需要時 Resume 即可。"
howToSteps:
  - name: "確認 project 狀態（client 端 + dashboard 雙驗）"
    text: "client 端 curl + nslookup 看 DNS 跟連線：nslookup <project>.supabase.co 1.1.1.1。回 Non-existent 不能下結論「刪掉」。一定要去 supabase.com/dashboard 看 project 是還在 paused 還是真的不見。"
  - name: "Resume paused project"
    text: "去 supabase.com/dashboard 進該 project，會看到「Project is paused」橫幅 + Resume 按鈕。點下去，等幾分鐘到幾小時 DNS 重新生效。Resume 不會丟資料，schema + table + row 全保留。"
  - name: "驗證 Resume 完成"
    text: "等幾分鐘後 nslookup <project>.supabase.co 1.1.1.1，回 IP（不是 Non-existent）就 OK。再用 client 連線跑 SELECT count(*) FROM <table> 確認資料完整。"
---

評估一個工具自建可行性的時候撞到這個坑，記下來給 vibe coder 同好。

--

要 query wk-meta-analyst 那個 Supabase project 看 8839 筆 interest 是不是還在。從 .env.local 拿 URL + service key，跑 supabase-js client，回 `TypeError: fetch failed`。

直覺：是不是 service key 過期？看 length 41 char 確實怪（service key 通常 200+）。換從 Vercel pull production env 拉一次，URL 一樣 `wxliyvjsskwcgwsdjclv.supabase.co`，service key 換成 `sb_secret_...` 開頭 43 chars（這是 Supabase 2024 新格式 publishable / secret key，不是 JWT），跑下去同樣 `fetch failed`。

奇怪。換打 production /api/search endpoint 確認不是我網路：

```bash
curl -s -X POST -H "Content-Type: application/json" \
  -H "X-Access-Password: <real_password>" \
  -d '{"query":"yoga"}' \
  https://wk-meta-analyst.vercel.app/api/search
```

回 HTTP 500，body：`{"success":false,"error":"TypeError: fetch failed"}`。

意思是 Vercel 自己 server 端也連不上 Supabase。不是我本機網路問題。

--

換深 DNS 排查

從多個 DNS 解析：

```bash
nslookup wxliyvjsskwcgwsdjclv.supabase.co 8.8.8.8   # Google → Non-existent domain
nslookup wxliyvjsskwcgwsdjclv.supabase.co 1.1.1.1   # Cloudflare → Non-existent domain
curl 'https://cloudflare-dns.com/dns-query?name=wxliyvjsskwcgwsdjclv.supabase.co&type=A' \
  -H 'accept: application/dns-json'                 # DoH → 沒 Answer
```

3 家獨立 DNS 全部回 Non-existent。代表這個 hostname 在全球 DNS 不存在。

--

第一輪錯誤判斷

我看到 DNS Non-existent 就下結論：「Supabase project 被刪了」。

理由：paused project 我以為是 service 端 503，DNS 應該還在。被刪才會整個 DNS record 拿掉。

跟用戶報告：「DB 沒了，要重建。預估工程量加 2-4 小時匯 8839 筆」。

用戶 push back：「DB 不可能沒有，我前天才用過」。

對。Push back 對。

--

去 supabase.com/dashboard 看實際狀態

用戶手動進 dashboard 看：project 還在，但被 Paused。點 Resume，Supabase 顯示「可能要等幾分鐘到幾小時」。

實測 5 分鐘後 DNS 重新解析：

```bash
$ nslookup wxliyvjsskwcgwsdjclv.supabase.co 1.1.1.1
Address: <IP>
```

通了。連 Supabase 跑 query 拿到 8839 筆完整。

--

學到的事實

Supabase free tier 7 天沒活動會 auto-pause。

paused 不是只關掉 service 503，是把整個 project URL 的 DNS record 撤掉。client 端從 DNS 層直接看不到。

paused 跟 deleted 從 client 端症狀一模一樣。要分辨只能去 supabase.com/dashboard 看。

Resume 不會丟資料。schema + table + row 全保留。等 DNS 重新生效幾分鐘到幾小時。

--

判斷死活的 3 個方法

第 1：看 Supabase dashboard

最快最準。supabase.com/dashboard 點進該 project：
還在 + 標 Paused：paused，可 Resume
還在 + 顯示正常：active 但你 client 端有別的問題（檢查 key / network / firewall）
找不到：真的 deleted，要重建或從 backup restore

第 2：client 端 dual-DNS check

只能間接判斷：
3 家公共 DNS（默認 / 8.8.8.8 / 1.1.1.1）都回 Non-existent → paused or deleted（不能分）
單一 DNS Non-existent，其他 OK → 你本機 DNS 問題或 ISP cache stale
全 DNS 回 IP，但 connection refused/timeout → service 端問題（active 但 down）

第 3：production server 側測

如果你的 backend 部署在 Vercel / Render，從那邊 call 你的 API，看 server 端有沒有同樣 error：
有 → DB 問題（paused / deleted / down）
沒有 → 你本機網路問題

--

防止 Supabase auto-pause 的選項

1. 每週至少跑一次 query：cron + 簡單 SELECT 1，5 分鐘 setup
2. 升級 Pro plan：$25/月，沒 pause
3. 跟有流量的 production app 綁：用戶實際用就有活動

對「個人用 / 偶爾測」的 project，free tier auto-pause 其實是好機制，省成本。需要時 Resume 即可。

--

學到的是：DNS Non-existent 不一定代表「永久消失」。Supabase free tier 跟其他平台的「省錢機制」可能讓 client 端看起來像 deleted。診斷時不要直接下「刪掉」結論，先去 platform dashboard 確認。從這次 paused 場景看，從用戶 push back「我前天才用過」校準到 8 分鐘內找到真因，比堅持「DB 沒了要重建」省了 2-4 小時白工。
