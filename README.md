# TAIWAN METRO TYPING

![TAIWAN METRO TYPING 预览图](./public/og-image.png)

以台湾捷运中英文站名为题目的打字游戏。首页使用台湾行政区 TopoJSON，并依 WGS84 经纬度投影捷运站与路线。

## 功能

- 真实台湾海岸与县市边界
- 台北、新北、桃园、台中与高雄捷运及轻轨共 13 条路线、275 笔站点座标
- 依真实站序与经纬度绘制路线，支线以独立 segment 呈现
- 选线放大、行驶方向选择、30 秒快打、全线挑战
- 英文逐字输入与支援桌机、手机输入法选字的中文模式
- WPM／CPM、正确率、完成站数与列车移动回馈
- 深色模式、键盘操作与响应式版面

## 技术架构

- pnpm 9
- Vite 5
- React 18
- d3-geo + topojson-client

## 本机执行

```bash
pnpm install
pnpm dev
```

开启 <http://127.0.0.1:5173>。

正式建置：

```bash
pnpm build
pnpm preview
```

## 地图与站点资料

- 台湾县市边界：[Taiwan.md 开源地图资料集](https://taiwan.md/taiwan-shape/)，来源为 `waiting7777/taiwan-vue-components`，MIT 授权
- 捷运站、路线与站序：[TDX 运输资料流通服务](https://tdx.transportdata.tw/)

重新下载台湾县市边界资料：

```bash
pnpm data:map
```

目前专案的捷运站点与路线资料皆来自 TDX。将手动下载的 `Line`、`Station` 与 `StationOfLine` JSON 放入 `data/` 后，重新产生 `public/data/metro.json`：

```bash
pnpm data:tdx-files
```

档名格式为 `<operator>-line.json`、`<operator>-station.json` 与 `<operator>-station-of-line.json`，例如 `trtc-line.json`。目前需包含 TRTC、NTMC、NTDLRT、NTALRT、TYMC、TMRT、KRTC 与 KLRT 八个营运单位的完整资料；缺少档案或必要路线时，汇入会直接失败。

本专案不是捷运公司的官方服务，仅供打字练习使用。
