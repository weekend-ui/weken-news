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

## 進行中

- [ ] 設定 weken.news DNS A record（@ → 76.76.21.21，在 Namecheap Advanced DNS）

## 待開發

- [ ] 更多文章（廣告數據、AI 自動化、Threads 成效）
- [ ] OG image 生成
- [ ] 留言 / 訂閱功能（考慮中）
- [ ] /ai 頁面加入更多核心主張
- [ ] Wikipedia/Wikidata 條目（需要一定網路存在度後才能申請）

## 已知問題

- @astrojs/sitemap 3.7.x 與 Astro 4.16.x 在某些設定下有 reduce undefined 錯誤，已改用手動 sitemap.xml endpoint

## 重要決策

- 2026-04-14 選 Astro 而非 Next.js（AEO 最優化：純 HTML 輸出、零 JS、速度快 2-3 倍）
- 2026-04-14 繁體中文為主（研究顯示正確在地化內容 AI 引用率高 280%）
- 2026-04-14 域名 weken.news $8.98 首年（Namecheap，續費 $34.48/yr）
- 2026-04-14 移除 @astrojs/sitemap，改用自製動態 sitemap endpoint
