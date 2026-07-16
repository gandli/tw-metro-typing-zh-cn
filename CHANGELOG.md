# Changelog

本项目所有值得注意的变更都记录在这里。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循 [语义化版本 SemVer 2.0](https://semver.org/lang/zh-CN/)。

从 v0.3.0 起改由 [release-please](https://github.com/googleapis/release-please) 依 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 自动生成。

## [0.3.0](https://github.com/gandli/tw-metro-typing-zh-cn/compare/v0.2.0...v0.3.0) (2026-07-16)


### ✨ 新功能 · Features

* add bilingual typing mode ([e4d05fc](https://github.com/gandli/tw-metro-typing-zh-cn/commit/e4d05fc75e52301a63fab5445fbed2405e5b9c99))
* add Danhai and Ankeng LRT lines ([cbb43eb](https://github.com/gandli/tw-metro-typing-zh-cn/commit/cbb43eb505678bb2876ba65628fcb321801eade8))
* add GitHub link to footer ([5c2fef2](https://github.com/gandli/tw-metro-typing-zh-cn/commit/5c2fef2323d82d03ce3b4b4e7b77b2a03c21095b))
* add route direction picker for line runs ([c86c26d](https://github.com/gandli/tw-metro-typing-zh-cn/commit/c86c26d154a7b8b5a3ad3f78589d3a052ddfb509))
* add TMRT/KRTC/KLRT metro data support ([add1ac1](https://github.com/gandli/tw-metro-typing-zh-cn/commit/add1ac104ca358c469f71a64b416ffee648799bb))
* animate train progress while typing and enforce complete TDX data imports ([93999fe](https://github.com/gandli/tw-metro-typing-zh-cn/commit/93999febfa35f1c6a54373a27ed28eafae1e92c2))
* **i18n:** 全站简体中文化 (UI 源码 + 展示层数据) ([1f4a829](https://github.com/gandli/tw-metro-typing-zh-cn/commit/1f4a8295a2901d9dd2ad661271ba9c569ff6fcc8))


### 🐛 修复 · Bug Fixes

* **mobile-map:** TaiwanMap focused 状态路线视口自适应 ([#9](https://github.com/gandli/tw-metro-typing-zh-cn/issues/9)) ([e8b01ea](https://github.com/gandli/tw-metro-typing-zh-cn/commit/e8b01eacd9e1263a3bc0f61a7f2b37567341a919))
* **mobile-map:** 修复移动端游戏页路线被压成中央小坨的问题 ([#4](https://github.com/gandli/tw-metro-typing-zh-cn/issues/4)) ([51c881e](https://github.com/gandli/tw-metro-typing-zh-cn/commit/51c881ebd992123e536a11b73fdf17f2e37927d6))
* **mobile:** focused 页面显示地图路线预览 (flex 流式, 无遮挡) ([#10](https://github.com/gandli/tw-metro-typing-zh-cn/issues/10)) ([7b3bc0d](https://github.com/gandli/tw-metro-typing-zh-cn/commit/7b3bc0d17188dec34bc57129037093edf770a680))


### 💅 打磨 · Polish (a11y / UI / copy)

* **a11y:** impeccable P1 修复批 1 — focus ring 呼吸 + dark tokens 提亮 ([#14](https://github.com/gandli/tw-metro-typing-zh-cn/issues/14)) ([2055abe](https://github.com/gandli/tw-metro-typing-zh-cn/commit/2055abed0b47083039353846c5c7aea175d3b3b7))
* **a11y:** impeccable P1 批2 — dark 徽章 + CJK 排版 + 简繁污染 ([#15](https://github.com/gandli/tw-metro-typing-zh-cn/issues/15)) ([71eee5a](https://github.com/gandli/tw-metro-typing-zh-cn/commit/71eee5a9f034ba4912a2f5ed9312e15b908a980c))
* **a11y:** impeccable P1-1 — home hero 瘦身让路线卡片挤上首屏 ([#16](https://github.com/gandli/tw-metro-typing-zh-cn/issues/16)) ([4a56022](https://github.com/gandli/tw-metro-typing-zh-cn/commit/4a560229d7cd464e4c206c40e207eee012a403e9))
* **a11y:** impeccable P1-6 — game 打字目标层级倒置修正 ([#17](https://github.com/gandli/tw-metro-typing-zh-cn/issues/17)) ([9860e22](https://github.com/gandli/tw-metro-typing-zh-cn/commit/9860e22bc4ecb17a170446345bd857f64fe59985))
* **a11y:** 全局 :focus-visible ring 提升到 tokens 层 ([#7](https://github.com/gandli/tw-metro-typing-zh-cn/issues/7)) ([7c31e63](https://github.com/gandli/tw-metro-typing-zh-cn/commit/7c31e6329e4ba309914830bcf15f01d13a024798))
* **a11y:** 暗色手机 game 页 back button 白字白底修正 + README 截图刷新 ([#23](https://github.com/gandli/tw-metro-typing-zh-cn/issues/23)) ([b8de683](https://github.com/gandli/tw-metro-typing-zh-cn/commit/b8de68378561e8dc7cbbd8b7923ddc26f70ebe22))
* **copy:** UI 文案精修 - 叠字/翻译腔/冗余/半角标点 ([#27](https://github.com/gandli/tw-metro-typing-zh-cn/issues/27)) ([cc020ac](https://github.com/gandli/tw-metro-typing-zh-cn/commit/cc020ac922a470e19af77a3061ff087a4f1ea0d4))
* **design:** impeccable P2 UI 批 — direction 卡 + pill 对齐 + 计数补总数 ([#19](https://github.com/gandli/tw-metro-typing-zh-cn/issues/19)) ([17d39e0](https://github.com/gandli/tw-metro-typing-zh-cn/commit/17d39e022f4ba2e9bbac17d0b8d1452309f1eaef))
* **design:** impeccable P2-7 + P2-8 — hero AI-slop + 卡片默认边解耦 ([#18](https://github.com/gandli/tw-metro-typing-zh-cn/issues/18)) ([6573a0e](https://github.com/gandli/tw-metro-typing-zh-cn/commit/6573a0e2f18781dc60d4589851394ae6008f86f6))
* **design:** impeccable P3-12 — 徽章光学居中稳定 ([#20](https://github.com/gandli/tw-metro-typing-zh-cn/issues/20)) ([89237cc](https://github.com/gandli/tw-metro-typing-zh-cn/commit/89237ccd9432222bc2f46177c7a3fcadd9329a82))
* **i18n:** eyebrow/kicker 三档 i18n 化 + ResultScreen 补全英文 ([#8](https://github.com/gandli/tw-metro-typing-zh-cn/issues/8)) ([eab4cc5](https://github.com/gandli/tw-metro-typing-zh-cn/commit/eab4cc5690116f855ed82ef38f5323fbcd4ce27b))
* **mobile-focused:** 一屏紧凑布局 - 路线卡→地图→控制组 ([#11](https://github.com/gandli/tw-metro-typing-zh-cn/issues/11)) ([04d602a](https://github.com/gandli/tw-metro-typing-zh-cn/commit/04d602a246d83f11098ae179537766ad8a7a91f8))
* **mobile-focused:** 收紧地图与控制组间距 (10→6px) ([#12](https://github.com/gandli/tw-metro-typing-zh-cn/issues/12)) ([81fb839](https://github.com/gandli/tw-metro-typing-zh-cn/commit/81fb8394a825cf2476985fad4d7266b67733d885))
* **mobile-focused:** 消除地图到方向按钮的隐形 68px 空白 ([#13](https://github.com/gandli/tw-metro-typing-zh-cn/issues/13)) ([052859c](https://github.com/gandli/tw-metro-typing-zh-cn/commit/052859c7e591d6ab52117fce6e51017e17f6053e))


### 📚 文档 · Documentation

* **hero:** '站站打字练习' → '站名打字练习' ([#26](https://github.com/gandli/tw-metro-typing-zh-cn/issues/26)) ([0aa9fba](https://github.com/gandli/tw-metro-typing-zh-cn/commit/0aa9fba8f0428ed59b56772592b2c93eb0852c87))
* **readme:** impeccable 装修 — SVG hero + 4 张预览 + 内容重构 ([#21](https://github.com/gandli/tw-metro-typing-zh-cn/issues/21)) ([b22931a](https://github.com/gandli/tw-metro-typing-zh-cn/commit/b22931a346e3a38b9761321483d3fface6cd3701))
* **readme:** pnpm → bun (与实际工作流对齐) ([#24](https://github.com/gandli/tw-metro-typing-zh-cn/issues/24)) ([5468f33](https://github.com/gandli/tw-metro-typing-zh-cn/commit/5468f33077223db061d89d8c7bf35bdffdffaf8d))
* **readme:** 增加灵感来源致谢 (X credits) ([#25](https://github.com/gandli/tw-metro-typing-zh-cn/issues/25)) ([6c396de](https://github.com/gandli/tw-metro-typing-zh-cn/commit/6c396de152c353e81c8d1d320a90b885c57d4512))


### 📦 构建 · Build System

* **deps:** bump vite 5.4.21 → 6.4.3 ([#22](https://github.com/gandli/tw-metro-typing-zh-cn/issues/22)) ([c18adff](https://github.com/gandli/tw-metro-typing-zh-cn/commit/c18adff52af874a0a442e816e4e92513199a0737))

## [0.2.0] · 2026-07

impeccable 全页精修 + 简体本地化 + 数据/展示层解耦。

### 💅 打磨 · Polish

- P1 焦点环呼吸 + 深色主题 tokens 提亮（WCAG 1.4.11 3:1 ✓） (#14)
- P1 深色徽章融入 + CJK 排版 + 简繁污染修正 (#15)
- P1 首页 hero 瘦身：首屏路线卡 3 张 → 7 张 (#16)
- P1 game 页打字目标信息层级修正（目标提为 h1，中文原名降为辅助） (#17)
- P2 hero AI-slop 去除 + 卡片默认边解耦 (#18)
- P2 方向卡箭头对齐 + 顶栏 pill 基线 + 打字目标补总站数（`01/24`） (#19)
- P3 徽章光学居中（tabular-nums + letter-spacing:0） (#20)
- 暗色 game 页返回按钮白字白底修正 + README 截图刷新 (#23)
- UI 文案精修：叠字/翻译腔/冗余/半角标点 7 处 (#27)

### 📚 文档 · Documentation

- README impeccable 装修：SVG hero + 4 张预览 + 内容重构 (#21)
- hero 副标"站站"→"站名"打字练习 (#26)
- 增加灵感来源致谢（X credits） (#25)
- pnpm → bun 与实际工作流对齐 (#24)

### 📦 构建 · Build

- Vite 5.4.21 → 6.4.3（含 CVE 相关 patch） (#22)
- ImgBot public/ 图片优化 (#2)

---

## [0.1.x]

初版：13 条捷运路线、275 站点、d3-geo 真实经纬度投影、Playwright E2E TDD、opencc-js 简繁转换。
