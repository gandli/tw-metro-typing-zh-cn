# Changelog

本项目所有值得注意的变更都记录在这里。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循 [语义化版本 SemVer 2.0](https://semver.org/lang/zh-CN/)。

从 v0.3.0 起改由 [release-please](https://github.com/googleapis/release-please) 依 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 自动生成。

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
