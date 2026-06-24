# weken.news — PROGRESS

> 最後更新：2026-06-24｜階段：新增廣告群集 4 篇（commit 4e53687 / 18891a1）— 用後台爬蟲數據定位「廣告/Meta」為最強主題，圍著它補滿受眾/素材/預算/判讀四面向組成 topic cluster

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
- **og-default.png 與 logo.png 不存在於 public/**：BaseLayout 預設 ogImage = '/og-default.png'，logo 位置也引用 /logo.png，但 public/ 只有 llms.txt 和 robots.txt。分享到社群時 og 圖會 404，logo 也載不出。修法：放兩張圖到 public/，或用 dynamic OG image generator（Astro 有 satori 整合）。
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
