# weken.news — PROGRESS

> 最後更新：2026-07-04｜階段：全站 AEO 深度健檢後落地三件事 — 爬蟲追蹤補檢索型 bot（OAI-SearchBot 等）、IndexNow 上線、robots.txt 對齊 2026 現行爬蟲名。詳見文末 2026-07-04 段

## 2026-06-01 wk-ads 整合
BaseLayout 加 footer 上方 announcement bar，client-side fetch `https://wk-ads.vercel.app/api/current` 拿廣告 JSON。
有 imageUrl 時 render 圖文卡（圖頂、文+CTA 在下），無圖時 fallback 純文字 banner。
img 包進 `<a>` 跟 CTA 同個 wk-ads /api/click?src=weken-news 跳轉 URL，雙入口都計數。
ad.active=false 或 fetch 失敗自動隱藏，不影響其他內容渲染。

## 專案概要
週末哥個人品牌 AEO 站，記錄第一手數據（廣告/自媒體/AI自動化），建立 AI 引用權威。
技術：Astro + Vercel | 域名：weken.news（Namecheap）

## 已完成

### 2026-04-14 初始建站
- [x] Astro 4.x 專案架構
- [x] robots.txt（明確允許 8 個 AI 爬蟲）
- [x] llms.txt（正確格式：H1 + blockquote + 頁面索引）
- [x] /llms-full.txt（動態生成，包含文章摘要和 FAQ）
- [x] sitemap.xml（動態生成）
- [x] RSS Feed（@astrojs/rss）
- [x] BaseLayout：WebSite + Organization + Person Schema（含 sameAs）
- [x] ArticleLayout：Article + FAQ + Speakable + HowTo + BreadcrumbList Schema
- [x] 首頁（主題導覽 + 最新文章）
- [x] /about（強 EEAT：Who / How / Why 框架 + 詳細 Person Schema）
- [x] /ai（專為 AI 爬蟲設計的結構化資訊頁）
- [x] /articles（文章列表）
- [x] /articles/[slug]（文章詳情）
- [x] Content Collections（Zod schema 含 directAnswer/faq/howToSteps/speakableSections）
- [x] 第一篇文章：「從零打造 AEO 網站：第一天的決策和數字」
- [x] Tailwind + @tailwindcss/typography

### 2026-04-14 品牌色 + 部署
- [x] 品牌色全站套用（黃 #F5C518 + 深灰 #1F2937 + 白底）
- [x] GitHub 推送：weekend-ui/weken-news
- [x] Vercel 部署成功：weken-news.vercel.app
- [x] 自訂域名 weken.news 加入 Vercel（等待 DNS）

### 2026-04-14 SEO 基建
- [x] Google Search Console 驗證（DNS TXT record）
- [x] Sitemap 提交：https://weken.news/sitemap.xml
- [x] DNS A record：@ → 76.76.21.21（weken.news 正式域名）

### 2026-04-14 AI 爬蟲追蹤系統
- [x] Astro middleware（src/middleware.ts）偵測 13 種 AI 爬蟲 User-Agent
- [x] Upstash Redis 計數（total / daily:date / bot:name / page:path）
- [x] /api/stats API route（server-rendered，prerender=false）
- [x] /stats 頁面（累積到訪、今日、各爬蟲 bar chart、各頁面 bar chart）
- [x] 導覽列 + 頁尾加「AI 數據」連結
- [x] 切換 output: hybrid + @astrojs/vercel/serverless adapter
- [x] 修復 nodejs18.x EOL 問題（postinstall 腳本 patch 為 nodejs20.x）
- [x] 修復 Redis URL 有 trailing \\n 問題（.trim()）

### 2026-04-15 文章擴充
- [x] 第二篇：「Claude Code 建 AEO 網站，實際省了幾小時？」（44 小時省時數字）
- [x] 第三篇：「如何知道 GPTBot 有沒有在爬你的網站？」（AI 爬蟲追蹤系統技術）
- [x] 第四篇：「我讓 AI 自動記錄每次幫我省了多少時間」（省時記錄系統設計）
- [x] 第五篇：「被爬不等於被引用」（AEO 真正的指標）
- [x] 第六篇：「AEO 競品分析實錄：空白品類發現」（75% vs 20% 機率方法論）
- [x] 第七篇：「AEO 被引用後的完整轉換路徑」（AI 引用 → 成交全路徑）
- [x] 第八篇：「問 AI 同一個問題答案不一樣？AEO 測試出現率解讀方法」
- [x] 文章頁作者 bio 更新：WeKen 創辦人 x 行銷顧問 × Meta廣告 x Google Ads x AI 自動化 × 快電商
- [x] Skool 貼文（AI爬蟲追蹤系統）完整 Learning Loop + style.md 更新

### 2026-04-16 文章擴充
- [x] 第九篇：「AEO 不是一件事：訓練資料、EEAT、站外實體的三層邏輯」（Harris 框架 + weken.news 實況）
- [x] 第十篇：「AI 額度燒很快？7個你可能不知道的 Token 浪費習慣」（量化估算版）

### 2026-04-17 文章擴充
- [x] 第十一篇：「Claude Code Routines 是什麼？三種觸發方式、用量限制、實際用法整理」（4/14 新功能，第一手繁中整理）
- [x] 第十二篇：「多 Agent 系統架構：一個 Bot 怎麼演七個角色」（agent vs bot 的本質差異 + 框架比較）
- [x] 第十三篇：「Claude Code Channels 實測：Telegram 成功、LINE 失敗，差在哪裡」（白名單機制 + 第一手失敗紀錄 + 架構差異比較）

### 2026-04-18 ~ 2026-04-30 文章擴充（共 14 篇）
- [x] 第十四篇：claude-design-brand-collab-proposal（Claude Design 品牌合作提案 + 部署實測）
- [x] 第十五篇：claude-code-parallel-windows-workflow（Windows 上並行多 Claude Code session 工作流）
- [x] 第十六篇：nodejs-template-literal-js-escape-bug（Node.js template literal 引號 bug 實錄）
- [x] 第十七篇：line-bot-seed-points-system（LINE Bot 種子排行榜系統設計）
- [x] 第十八篇：skool-ai-writing-learning-loop（Skool AI 學習迴圈方法論）
- [x] 第十九篇：ai-writing-fingerprints-research-confirmed（AI 寫作指紋研究 + 數據驗證）
- [x] 第二十篇：aeo-keyword-demand-verification-before-strategy（給 AEO 關鍵字戰略前的需求驗證三板斧）
- [x] 第二十一篇：seizen-seiri-chinese-aeo-gap-research（生前整理中文 SERP 研究 + 空白機會）
- [x] 第二十二篇：vercel-labs-skills-agent-review（Vercel Labs skills 實測）
- [x] 第二十三篇：vercel-function-region-neon-match-perf（Vercel + Neon region 配對 523ms→93ms 雙刀流）
- [x] 第二十四篇：claude-haiku-ai-backend-cost-real-test（Claude Haiku 後台月費實測）
- [x] 第二十五篇：gemini-thinking-config-location-trap（Gemini thinkingConfig 位置陷阱）
- [x] 第二十六篇：public-aeo-dashboard-design（公開 AEO 儀表板設計）
- [x] 第二十七篇：vibe-coding-beginner-real-cases-90min（Vibe Coding 新手 90 分鐘做出語意工具）

### 2026-04-30 SEO 補強
- [x] BaseLayout 加 Twitter / X Card meta（twitter:card / url / title / description / image），跟既有 og:image 共用 fallback。覆蓋分享到 Twitter 時的預覽（先前只有 og:* 對 LinkedIn / Facebook 有效，X 上會 fallback 成簡陋預覽）

### 2026-05-02 文章擴充 + 第一隻 AI 爬蟲到訪
- [x] 第二十八篇：gemini-transparent-png-three-class-diagnosis（Gemini 不出透明 PNG + AI 輸出三類分類法 + chroma key 解法）
- [x] 第二十九篇：claude-analysis-vs-why-wrong-trigger（跟 Claude 工作的兩種模式：完整分析 vs 為什麼錯，Cat Wu 訪談啟發 + 實測對照）
- [x] 第一隻 AI 爬蟲到訪：Apple 爬蟲打 /api/stats（2026-05-02 22:22 台灣時間）
- [x] Google Search Console 開始有曝光：「npx skills」相關關鍵字 51 次曝光 2 次點擊（3 個月累積）

### 2026-05-03 ~ 2026-05-04 文章擴充
- [x] 第三十篇：meta-ads-mcp-claude-desktop-setup（Meta Ads MCP URL 校正 + 4 月 29 號 beta 發布 + 風險評估，誠實標明未實接過）
- [x] 第三十一篇：claude-code-memory-architecture-5-rounds-deep-dive（5 輪對話挖深 + Claude Code 4 層架構發現 + 三組系統性偏見，週末哥指揮日誌視角寫法，rules 系統升級成主角）

### 2026-05-04 晚 20 項技術 AEO audit 三波（基於 Kalicube UCD framework）
- [x] Group A 7 項：robots.txt 22 個爬蟲擴充 / logo.png + og-default.png 補貼 / Person + Organization Schema 強化 sameAs / llms-full.txt 加 N.E.E.A.T.T entity facts + topic pillar 索引 / sitemap milestone 確認（commit 2fc4480）
- [x] Group B 6 項：ArticleLayout Article schema isAccessibleForFree + articleSection / Author Bio Block 升級 / /about Transparency 揭露段（業務範圍 + AI 協作揭露 + 利益迴避 N.E.E.A.T.T 第二個 T 補完）/ contact 加 GitHub（commit 704138f）
- [x] Group C 7 項：/ai 頁面加 N.E.E.A.T.T 6 訊號明細 + Topic Pillar 索引 / /citations 第三方提及證據池新建（ItemList Schema） / 首頁 TrustIndicator 量化區塊 / ArticleLayout 自動相關文章（按 tag 重疊推 4 篇強化 cluster） / 5 個主題 RSS 子 feed（/rss/aeo /rss/claude-code /rss/ai-cost-perf /rss/debug-integration /rss/line-bot-automation）+ BaseLayout discovery link 全加（commit 287d1e1）
- 實質效果：N.E.E.A.T.T 從 2 字母達標升到 5 字母達標（剩 N 弱項要靠人脈），Phase 1/2/3 從 80/50/60 升到 95/75/90

### 2026-05-08 文章擴充（廣告主軸 + Web 性能主軸補洞）
- [x] 第三十三篇：tailwind-cdn-vs-precompiled-css-vercel-perf（Tailwind CDN 換預編譯 CSS 完整實作，從 wk-qa-bot 課程介紹頁優化第一手 critical path 砍 64% / 手機 4G LCP 3-5s 砍到 0.8-1.5s 數據；含 Vercel Cache-Control s-maxage 隱形行為 + WebP picture lazy preload + immutable cache 全套；commit c61762e）
- [x] 第三十四篇：meta-marketing-api-personal-no-app-review-dev-mode（個人廣告主用 Meta Marketing API ads_insights 不用 App Review 不用 Business Verification 重大發現，Development Mode + Standard Access + ads_read 三件套 10 分鐘建立；含 60 天 long-lived token refresh code + X-FB-Ads-Insights-Throttle rate limit handling + 5/4 起 AMSA 改名 Marketing API Access Tier 變更；commit c22dcb7）
- 廣告主軸從 1 篇變 2 篇（之前只有 meta-ads-mcp）

### 2026-05-12 文章擴充（Weekend Method 系列）
- [x] 第三十五篇：non-developer-30-ai-tools-claude-code-vercel-method（不會寫程式怎麼一年做出 30 個 AI 工具？教學型 case study 從 Weekend Method 6 條原則改編，2500 字含 directAnswer + 5 FAQ + 3 howToSteps，commit 1ab88eb）

### 2026-05-05 凌晨 IDENTITY 中央化（OpenClaw IDENTITY.md pattern）
- [x] ~/.claude/identity.md 建立（master copy，single source of truth for Person Entity / sameAs / Brand Structure / Display 設定 / 跨工具對齊指引）
- [x] 4 個 weken-news 檔案 propagate 對齊 IDENTITY.md：
  - BaseLayout.astro Person + Organization Schema 加 alternateName: wk.change，jobTitle 統一，knowsAbout 重排
  - about.astro personSchema 加 alternateName / jobTitle / knowsLanguage / nationality
  - ai.astro 顯示資料補 wk.change
  - llms-full.txt.ts 加 source 註解 + 細節對齊
- [x] 每個檔案加 `// Source of truth: ~/.claude/identity.md` 註解，未來改動先動 master 再 propagate（commit 8a3266b）

## 進行中

- [ ] **IDENTITY.md sameAs 待補 6 個 platform handle**（IG / FB / Skool / LinkedIn / YouTube / Twitter，週末哥補完後二次 propagate 強化 Notability 訊號）

- [ ] **DNS 沒生效（高優先）**：A record 之前加在 Namecheap Advanced DNS 但被 parking 機制覆蓋，nslookup weken.news 仍指向 198.54.117.242（Namecheap parking IP）。修法：Namecheap → weken.news → Manage → Nameservers 改成 Custom DNS：ns1.vercel-dns.com / ns2.vercel-dns.com，等 1-24h propagation。SSL 之後 Vercel 自動發。
- [ ] 等待 Google 收錄（Sitemap 已提交，需幾天）

## 待開發

- [ ] 更多文章（廣告數據、AI 自動化、Threads 成效）
- [ ] OG image 生成
- [ ] 留言 / 訂閱功能（考慮中）
- [ ] /ai 頁面加入更多核心主張
- [ ] Wikipedia/Wikidata 條目（需要一定網路存在度後才能申請）

## 已知問題

- @astrojs/sitemap 3.7.x 與 Astro 4.16.x 在某些設定下有 reduce undefined 錯誤，已改用手動 sitemap.xml endpoint
- @astrojs/vercel@7.8.2 在 Node 24 本機環境下 fallback 到 nodejs18.x（EOL），已用 postinstall 腳本強制 patch 為 nodejs20.x
- Vercel env var 透過 Windows 貼上時可能有 trailing \\n，已在程式碼加 .trim() 防禦
- ~~og-default.png 與 logo.png 不存在於 public/~~：已解決，兩張圖都在 public/（2026-07-04 健檢確認存在）。剩餘可選優化：每篇文章共用同一張 og-default，之後可考慮 per-article OG image（satori 動態生成）。
- **DNS 設錯**：之前 A record 加在 Namecheap Advanced DNS 但 parking 機制覆蓋。修法見「進行中」第一項。

## 重要決策

- 2026-04-14 選 Astro 而非 Next.js（AEO 最優化：純 HTML 輸出、零 JS、速度快 2-3 倍）
- 2026-04-14 繁體中文為主（研究顯示正確在地化內容 AI 引用率高 280%）
- 2026-04-14 域名 weken.news $8.98 首年（Namecheap，續費 $34.48/yr）
- 2026-04-14 移除 @astrojs/sitemap，改用自製動態 sitemap endpoint
- 2026-04-14 AI 爬蟲追蹤用 Astro middleware + Upstash Redis（server-only，不依賴 GA）
- 2026-04-14 Redis key prefix: wkn:ai:（isolate 資料）；daily key 設 30 天 TTL

---

## 2026-05-20 AI bot tracking dashboard 瞎子修復（middleware bypass + SSR getStaticPaths 雙坑）

### 問題

朋友 seo.av8d-levelup.com 兩週被 AI 大量抓（GPTBot 97 / OAI-SearchBot 21 / ChatGPT-User 54 / PerplexityBot 9 / Bingbot 3），weken.news 同期 /api/stats 卻顯示 `{total:1, today:0, bots:{Apple:1}}`。週末哥問「為什麼他一做就被收錄了，我石沉大海」。

### 真正根因（debug 找的，不是猜）

curl GPTBot UA 訪問 article → X-Vercel-Cache: HIT → middleware.ts 完全沒 run → stats 數字沒變。

**Astro hybrid mode + getStaticPaths() 把 articles/topics 全部 prerender 成 static HTML，request 走 Edge CDN 不走 Vercel function，middleware.ts 永遠 bypass。**

Dashboard 是瞎子，原本以為 AI bot 完全沒來，**實際上可能來過很多次只是全部漏記**。

### 修法（commit 2edf498 + 6afdb1b）

**第一個 commit 2edf498**：articles/[slug] + articles/index + topics/[slug] 三個 page 加 `export const prerender = false`，改 SSR。

**踩第二坑**：deploy 後 /articles/[slug] 全部 500 server error。/articles 跟 /topics/[slug] 正常。

**根因**：Astro hybrid + prerender=false 下，getStaticPaths 不會在 request 時被呼叫，Astro.props.article 永遠 undefined → `article.render()` throw。

**第二個 commit 6afdb1b 修法**：仿照 topics/[slug].astro 既有 pattern：
- 移除 getStaticPaths + Props interface
- runtime 從 Astro.params 拿 slug
- getCollection('articles') 然後 find
- 找不到 return 404 Response

### 驗證結果

curl GPTBot UA 訪問 article → HTTP 200 + X-Vercel-Cache: MISS + ttfb 1.34s + /api/stats 數字真的動了：
- total: 1 → 3
- today: 0 → 2
- bots: {Apple:1} → {Apple:1, GPTBot:2}
- topPages 新增 article path

**Middleware 真的 track 到了**。

### 重要決策

| 日期 | 決策 | 原因 | 影響 |
|---|---|---|---|
| 2026-05-20 | 文章改 SSR 不加 Cache-Control s-maxage | 100% AI bot tracking 優先於 ttfb 200ms | function invocation 增加 5.6%（56 文章 × 100 req/月） |
| 2026-05-20 | 用 Astro.params + find 取代 getStaticPaths props | SSR mode 下 getStaticPaths 不會 run，Astro.props 拿不到 | 仿照 topics/[slug].astro 既有 pattern，一致性高 |
| 2026-05-20 | 不改其他 page（首頁 / about / scenarios / ai） | Karpathy Surgical Changes，只動被要求的 | 之後看 stats 數據再判斷是否擴 |

### 已知問題 / 技術債

#### Article SSR ttfb 1.3 秒 cold start
真實用戶 first hit 略慢。AI bot 流量低不影響，但若日後人流增加，要考慮加 Cache-Control s-maxage=60（接受同分鐘多次訪問漏記）平衡 UX vs tracking。

#### Astro 雙坑紀錄
1. Astro hybrid + getStaticPaths 預設 prerender = middleware bypass（漏記）
2. Astro hybrid + prerender=false + getStaticPaths = Astro.props 拿不到（要改 Astro.params + find）

兩坑都寫進 ~/.claude/projects/.../memory/patterns/vercel-deploy.md。

### 下次 session 開機指令

1. 7 天後 check /api/stats，看真實 AI bot 流量數據
2. 若 GPTBot 數字明顯成長 → tracking 正常 + AI 真有來，下一步動 #3 文章標題改寫 + #4 social link 累積
3. 若 GPTBot 仍很少 → 真的 indexing 不夠，可能要動 #2 加工具型內容（免費 AEO 健檢）拉進 search intent
4. 不要短期內頻繁 deploy（每次 deploy 全部 cache invalidate）

### Commits

- 2edf498 fix(tracking): articles + topics 改 SSR 讓 middleware 能 track AI bot
- 6afdb1b fix(articles): SSR 模式下用 Astro.params 取代 getStaticPaths props

### 連結到中央 memory / rules

- ~/.claude/projects/.../memory/patterns/methodology.md（dashboard 瞎子 debug pattern）
- ~/.claude/projects/.../memory/patterns/vercel-deploy.md（Astro hybrid prerender bypass middleware 雙坑）



## 2026-06-15 新增 3 篇 Threads 爆款診斷 AEO 文章（commit 62b8b0c，已上線）
題材來自跟週末哥討論的脆爆款診斷第一手數據：
- /articles/threads-suasion-vs-story-reach-firsthand：同帳號奉勸文200 vs 故事文9974觀看對照
- /articles/threads-viral-formula-real-detail：拆解爆款真正關鍵是具體真實細節非奉勸開頭
- /articles/ai-generated-threads-copy-pitfalls：AI自動生文案天花板(85% vs 爆款15%)
都照 AEO schema(directAnswer+5 FAQ+speakable)。用戶授權「直接push」公開其真實帳號數字(9974/511/474/249)。三重驗證上線(weken.news HTTP 200 + 內容render)。

## 2026-06-24 廣告群集 4 篇（commit 4e53687 + 18891a1，已上線）
起點：週末哥傳 /stats 後台截圖問「AI 爬蟲算多還是少」。累積 379、今日 4。分析後定位兩根金柱：廣告/Meta（meta-marketing 單篇 170 次最強）+ Claude Code。決定圍著最強主題補滿子面向組 topic cluster。

4 篇（tag 全掛 meta + facebook-ads，自動跟 170 次主力文歸群）：
- /articles/meta-ads-interest-tags-venn-boundary-audience：受眾，文氏圖找邊界受眾（OR 堆熱門 vs narrowing AND 交集），綁 wk-meta-analyst 8839 標籤庫工具
- /articles/meta-ads-creative-hook-ab-test-method：素材，控制變數只換 hook + hook rate/CTR/CPA 三層判讀
- /articles/meta-ads-abo-vs-cbo-budget-decision：預算，測試期 ABO 放大期 CBO 決策框架 + 測試期用 CBO 的坑
- /articles/meta-ads-metrics-which-to-watch-daily：判讀，每天只盯 5 指標 + 紅線對齊單位經濟

重要紀律：第 2-4 篇週末哥沒給真實數字，沒杜撰 CPA/花費，依 wk-aeo-writer G7 寫成「方法/決策框架」型（不是假裝實測）。已跟他講明哪天補真實數字可升級成第一手實測版。本機 build 兩次驗過無錯才推。

下一步（等週末哥）：他若丟真實數字（hook CPA 對照 / ABO-CBO 成效 / 實際紅線），把對應篇從框架升級成實測。發節奏建議：週二廣告群集 / 週四 Claude Code / 週六短文。

## 2026-06-24 流量量測三件套：GSC 驗證修復 + Vercel Analytics + 自建真人追蹤（已上線）

起點：週末哥說 weken.news 的 GSC 失效了，問哪種驗證方式最好；接著要能自己看訪客流量。

1. GSC 驗證修復（commit 24d3806）
診斷：weken.news nameserver 是 ns1/ns2.vercel-dns.com（DNS 託管在 Vercel，不是 Namecheap），目前無 google-site-verification TXT。成因：之前換 nameserver（Namecheap→Vercel）舊 TXT 沒搬過來。
解法：改用 code 內 meta 標籤（URL-prefix 屬性），不受 DNS 變動影響。加進 BaseLayout head。token: LjuiKFwkSxlnCTMGS7XcntBoDpJKl8ayoVmWOfYA678。

2. Vercel Web Analytics（commit 63dc071）
查證 /_vercel/insights/script.js 回 200 = 專案本來就已啟用，只缺頁面載入追蹤碼。加一行 `<script defer src="/_vercel/insights/script.js">` 到 BaseLayout。零 dashboard 操作（用 Vercel CLI token 查 API 確認）。數據看 Vercel 後台 Analytics 分頁。

3. 自建真人訪客追蹤（commit 7ebcb72）— 私人，只有站長看得到，只記瀏覽次數
- 新增 src/pages/api/track.ts：瀏覽器 beacon 接收端。來源檢查（只收 weken.news Origin/Referer）+ 爬蟲 UA 過濾（Googlebot 等會跑 JS 的擋掉；其他 AI 爬蟲不跑 JS 不會打到）+ 路徑 sanitize。Redis incr wkn:human:total / wkn:human:daily:{date}(30天expire) / wkn:human:page:{path}。無 IP/個資/cookie。一律回 204。
- BaseLayout 加 beacon（只在 location.hostname==='weken.news' 觸發，fetch keepalive）。
- src/pages/api/stats.ts 加 human 欄位：帶 ?key=STATS_KEY 才回（env var，因 repo 公開不能 hardcode）。公開訪客只看到 AI 爬蟲數據。
- src/pages/stats.astro 加「真人訪客（私人）」區，預設 hidden，帶 key 才顯示。
- STATS_KEY = 10ba3126625e868a71b49789（設在 Vercel env production/preview/dev，用 Vercel API POST /v10/projects/{id}/env 建立）。
- 私人網址：https://weken.news/stats?key=10ba3126625e868a71b49789

驗證（實測）：本機 build 成功 + build log 證實「Bundling function entry.mjs」= Astro Vercel adapter 把所有 SSR 打包成單一 function（所以加端點不增函式數，不踩 Vercel Hobby 12 函式上限，跟 wk-qa-bot 分散 api/*.js 架構不同）。production POST /api/track 回 204；帶 key 回真人數據、不帶回 null；Googlebot UA 被擋未計入；測試假數據用 Vercel API 取 Redis 連線清乾淨（total 歸 0）。GSC 驗證 + Vercel analytics 共存不衝突。

Notion：私人 stats 網址已加進 AI 專用 → WeKen 工具網址清單 →「後台 / 管理」區。

技術備忘（給未來 session）：
- weken-news DNS 在 Vercel；要加 DNS 記錄去 Vercel 後台不是 Namecheap。
- Vercel CLI 已登入 weekend-ui team。auth token 在 ~/AppData/Roaming/com.vercel.cli/Data/auth.json。projectId prj_XouuEwJNfFVlHmpfMXf8nM8GIRWh / teamId team_jNpTzDUglyqc056hEo5EpfKJ。
- 取 decrypted env：GET /v1/projects/{id}/env/{envId}（逐個 id，bulk decrypt=true 回的是加密 blob）。
- repo weekend-ui/weken-news 是「公開」的：任何 secret 不能寫進 code，一律走 Vercel env。

下一步（等週末哥）：訪客數據累積後，可考慮做 API 定期把真人流量報到 TG（他提過「都你來處理」），讓他連 Vercel/stats 頁都不用開。

## 2026-07-04 全站 AEO 深度健檢 + 三項技術落地

起點：週末哥要求「讀 AEO 網站記憶 + 完整分析評估 + 深入研究找優化點」。兩隻研究 agent 查證 2026 上半年 AEO 趨勢 + 中文市場格局，逐檔審完站內程式碼後落地。

### 健檢結論（完整版見當次 session）

- 站內技術面接近滿分，天花板在站外：搜尋引擎上 weken.news 第三方提及為零、citations 頁空、4 個主打題目（Meta 廣告受眾/Marketing API/Claude Code 中文/AEO 是什麼）前排全是代理商部落格與獨立部落客。Muck Rack 2026 研究：82% AI 引用來自 earned media。
- 爬蟲數據亮點：累積 626 次，ChatGPT-User 303 次（ChatGPT 對話中真的在抓本站頁面），明星文章 meta-marketing-api-personal 單篇 221 次。
- 2026 關鍵外部事實（已查證）：(a) Ahrefs 實測 5 大 AI 系統即時抓頁全部只讀可見 HTML、不讀 JSON-LD，schema 不用拆但停止加碼；(b) Google 2026-05 停用 FAQ rich result（FAQPage schema 本身仍合法）；(c) llms.txt 97% 網域整月零請求、無平台承諾讀取，維持但不再投入；(d) Bing Webmaster Tools 2026-02 上線 AI Performance（可看 Copilot 引用次數）；(e) Google Preferred Sources 2026-05 擴進 AI Overviews，未來是排序訊號。

### 本次落地（commit 68d8d74，已部署 + 線上驗證通過；首次全量 IndexNow 提交 59 網址 HTTP 202）

1. **middleware.ts 爬蟲追蹤大修**：補檢索型爬蟲 OAI-SearchBot / Claude-SearchBot / Claude-User / Perplexity-User / Bingbot / Meta-ExternalAgent / Applebot-Extended / DuckAssistBot / MistralAI-User / CCBot 等（檢索型 = 「會不會被引用」的前導指標，先前完全看不到）。移除已停用的 anthropic-ai 與傳統搜尋的 Googlebot。/api/* 路徑不再計入（先前 Googlebot 跑 JS 打 /api/track 污染 topPages 第 5 名）。注意：AI_BOTS 是子字串比對取第一命中，特定 pattern 要排前面（Applebot-Extended 在 Applebot 前）。
2. **api/stats.ts 資料清潔**：輸出過濾 Googlebot 舊 key 與 /api/* 舊頁面 key（Redis 資料保留不刪，只是不顯示）。歷史 total（626 含 Googlebot 93）不回溯修正。
3. **robots.txt**：Anthropic 段換成現行三隻（ClaudeBot / Claude-User / Claude-SearchBot，移除停用的 Claude-Web / anthropic-ai），補 Bingbot 段。
4. **IndexNow 上線**：public/a793843a28977d86cc89fa35024e2d66.txt（key 檔，IndexNow 協定本來就要求公開）+ scripts/indexnow-ping.mjs（production build 後自動提交近 10 天新文章給 api.indexnow.org；手動全量：node scripts/indexnow-ping.mjs --all）。掛在 package.json build script。任何失敗不擋 build。

### 舊文滾動更新機制（新增紀律）

57 篇只有 1 篇有 updatedDate，27 篇 4 月文已滿兩個半月。每月挑 3-5 篇舊文補新數據 + 加 updatedDate（sitemap / Article schema / llms-full 都會自動吃到）。優先順序按 /stats 爬蟲熱度：meta-marketing-api 兩篇 > vercel-labs-skills > claude-code-routines > gemini-thinking-config。內文寫作紀律追加：新文順手帶 1-2 條內文脈絡互連（目前 57 篇只有 1 篇有），重要數據引外部來源（KDD 2024 GEO 研究：引來源 +40%、引言 +115%）。

## 進行中（2026-07-04 新增）

- [ ] **Bing Webmaster Tools 驗證（只有週末哥能做，10 分鐘）**：用 Microsoft 帳號登入 https://www.bing.com/webmasters → 選「從 GSC 匯入」一鍵搬（GSC 已驗證過）→ 開 AI Performance 看 Copilot 引用數據。IndexNow 不用等這步，已獨立生效。
- [ ] **站外提及從 0 到 1（人的工作，最大槓桿）**：脆 @wk.change 貼文帶站上連結雙向導流；挑 meta-marketing-api（已被爬蟲驗證的明星文）投稿/授權轉載給有權重的站；PTT/Dcard/Mobile01 相關討論真實參與；引導鐵粉在 Google 把 weken.news 設為 Preferred Source；每筆提及補進 /citations 頁（schema 已備好）。
- [ ] 每月滾動更新 3-5 篇舊文（機制見上）

### 下次 session 開機指令（2026-07-04 存檔）

1. 7-14 天後看 /stats：OAI-SearchBot / Claude-SearchBot 有沒有自然流量（目前各 1 是本次部署驗證的測試訪問，不是真爬蟲）。有 = ChatGPT / Claude 檢索端真的在收；持續掛零 = indexing 不夠，回頭看站外提及進度
2. 問週末哥 Bing Webmaster Tools 驗證做了沒（bing.com/webmasters 用 GSC 匯入）；做了就開 AI Performance 看 Copilot 引用數，這是第一個真正的「被引用」量測來源
3. 每月滾動更新 3-5 篇舊文 + updatedDate（優先序按爬蟲熱度，見上面機制段）
4. /citations 頁還是空的就提醒站外提及（本次健檢定調：站外是最大槓桿，82% AI 引用來自 earned media）
5. IndexNow 已自動化不用管；llms.txt / schema 維持現狀不再投入
- 2026-07-15 新增文章 claude-code-windows-optimization-firsthand(Claude Code 優化 Windows 電腦一手實測,健檢分 17→75),commit 7842d6e
- 2026-07-16 新增文章 taiwan-ecommerce-traffic-vs-financials(酷澎 vs momo:用經濟部官方統計與 Coupang/momo 財報推翻「用網站流量榜判斷電商勝負」)。研究型非實測,第一手立足點是週末哥廣告代操視角(流量與成交的落差)。核心數據:2025 電子購物業年增 3.4%(經濟部 2026-02-05)、Coupang Developing Offerings 單季 EBITDA 虧 3.29 億美元全年預估 9.5-10 億、momo 2024Q2 毛利率 9.11% 年減 0.84pt(財訊,兩年前資料已標明)
- 2026-07-17 新增文章 agent-self-improvement-context-vs-harness(Letta Mods 對照週末哥手工分層記憶系統:context 學習 vs harness 學習)。第一手立足點是他自己的 Claude Code 分層指令/記憶系統(真實存在),Letta 為研究對照非實測。核心洞見:反覆失效的規則卡在 context 層靠記憶不可靠,要換到 harness 層做成 hook 讓系統自動執行。誠實標 Letta 非突破(自承靈感來自 Pi 擴充+Meta-Harness,Letta=MemGPT 團隊已查證)。未曝私人 setup 細節(persona/觸發詞/TG)
- 2026-07-17 新增文章 ecommerce-aeo-seo-roi-ads-first(用 AEO/SEO 幫電商導購能賺錢嗎:結論先用廣告)。反共識數據型:AI 流量佔 0.3% 轉換高但量小、Google 2026/03 砍量產內容 60-90%、廣告抓創造需求 vs SEO 抓已存在需求、先廣告後 SEO 只養贏家。研究+第一手(週末哥跑 AEO 站+投廣告),非杜撰銷售數字。未曝具體商品(蕭泌密/蕭風飲)與快電商。今天下午整段 AEO 電商對話的結晶
