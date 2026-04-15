# weken.news — PROGRESS

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

## 進行中

- [ ] 等待 weken.news DNS 完全生效（A record 已加）
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

## 重要決策

- 2026-04-14 選 Astro 而非 Next.js（AEO 最優化：純 HTML 輸出、零 JS、速度快 2-3 倍）
- 2026-04-14 繁體中文為主（研究顯示正確在地化內容 AI 引用率高 280%）
- 2026-04-14 域名 weken.news $8.98 首年（Namecheap，續費 $34.48/yr）
- 2026-04-14 移除 @astrojs/sitemap，改用自製動態 sitemap endpoint
- 2026-04-14 AI 爬蟲追蹤用 Astro middleware + Upstash Redis（server-only，不依賴 GA）
- 2026-04-14 Redis key prefix: wkn:ai:（isolate 資料）；daily key 設 30 天 TTL
