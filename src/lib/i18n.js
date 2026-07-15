import { Converter } from "opencc-js";

// 三档语言 (与 typing.js 保持兼容, 旧代码里的 'zh' 视为简体, 'en' 保持不变)
export const TYPING_LANGUAGES = Object.freeze({
  ENGLISH: "en",
  SIMPLIFIED: "zh-Hans",
  TRADITIONAL: "zh-Hant",
});

// 语言 label (界面上 SegmentedControl 用)
export const LANGUAGE_OPTIONS = [
  { value: TYPING_LANGUAGES.ENGLISH, label: "English" },
  { value: TYPING_LANGUAGES.SIMPLIFIED, label: "简体" },
  { value: TYPING_LANGUAGES.TRADITIONAL, label: "繁體" },
];

// opencc-js 转换器 (惰性构建, tw↔cn 双向)
// 源数据是 TDX 台湾繁体 (tw), 简体档需要 tw→cn, 繁体档直接返回, 英文档不涉及
const toSimplified = Converter({ from: "tw", to: "cn" });
const toTraditional = Converter({ from: "cn", to: "tw" }); // 用于把用户简体输入回转匹配繁体目标

/**
 * 按语言返回站名 (TDX 数据里 nameZh 是繁体, nameEn 是英文)
 * - en          → 英文名
 * - zh-Hans     → nameZh 繁体经 tw→cn 转成简体
 * - zh-Hant     → nameZh 原样繁体
 */
export function localizeStationName(station, language) {
  if (!station) return "";
  if (language === TYPING_LANGUAGES.ENGLISH) return station.nameEn ?? "";
  const zh = station.nameZh ?? "";
  return language === TYPING_LANGUAGES.SIMPLIFIED ? toSimplified(zh) : zh;
}

/**
 * 供输入匹配: 把用户输入的中文 (可能简体也可能繁体) 归一化到"目标语言的字形"
 * 用户在简体档目标是简体, 输入也简体 → 直接比对
 * 用户在繁体档目标是繁体, 输入也繁体 → 直接比对
 * 但用户手机常没有繁体输入法, 会输入简体去打繁体目标 → 需要归一化
 */
export function normalizeChineseToLanguage(text, language) {
  if (!text) return "";
  if (language === TYPING_LANGUAGES.SIMPLIFIED) return toSimplified(text);
  if (language === TYPING_LANGUAGES.TRADITIONAL) return toTraditional(text);
  return text;
}

/** 判断是中文档 (简 or 繁) */
export function isChineseLanguage(language) {
  return (
    language === TYPING_LANGUAGES.SIMPLIFIED ||
    language === TYPING_LANGUAGES.TRADITIONAL
  );
}

/**
 * 通用: 把繁体源文本按语言本地化 (线路名、方向标签、任意繁体串).
 * 英文档保留繁体原样 (线路名如 "文湖線" 没有英文标准译名, 保留繁体优雅)
 */
export function localizeText(text, language) {
  if (!text) return "";
  if (language === TYPING_LANGUAGES.SIMPLIFIED) return toSimplified(text);
  if (language === TYPING_LANGUAGES.ENGLISH) {
    return LINE_NAME_EN[text] ?? OPERATOR_NAME_EN[text] ?? text;
  }
  return text;
}

// 线路名英文 override (数据里没 lineNameEn 字段, 这里 hardcode 官方译名)
const LINE_NAME_EN = {
  文湖線: "Wenhu Line",
  淡水信義線: "Tamsui-Xinyi Line",
  松山新店線: "Songshan-Xindian Line",
  中和新蘆線: "Zhonghe-Xinlu Line",
  板南線: "Bannan Line",
  環狀線: "Circular Line",
  淡海輕軌: "Danhai LRT",
  安坑輕軌: "Ankeng LRT",
  桃園機場捷運線: "Taoyuan Airport MRT",
  烏日文心北屯線: "Wuri-Wenxin-Beitun Line",
  紅線: "Red Line",
  橘線: "Orange Line",
  環狀輕軌: "Circular LRT",
};
const OPERATOR_NAME_EN = {
  台北捷運: "Taipei Metro",
  新北捷運: "New Taipei Metro",
  桃園捷運: "Taoyuan Metro",
  台中捷運: "Taichung Metro",
  高雄捷運: "Kaohsiung Metro",
  高雄輕軌: "Kaohsiung LRT",
};

// ---- UI 文案字典 ----
// key → 三语翻译. 加新词只需在这里加一行. 缺 key 兜底英文档.
const UI_STRINGS = {
  // 导航
  back: { en: "Back", "zh-Hans": "返回选线", "zh-Hant": "返回選線" },
  routeName: { en: "Route", "zh-Hans": "路线", "zh-Hant": "路線" },
  // 方向 / 站
  from: { en: "From", "zh-Hans": "从", "zh-Hant": "從" },
  to: { en: "→", "zh-Hans": "往", "zh-Hant": "往" },
  nextStation: { en: "NEXT", "zh-Hans": "下一站", "zh-Hant": "下一站" },
  terminal: { en: "TERMINAL", "zh-Hans": "终点站", "zh-Hant": "終點站" },
  routeEnd: { en: "End of Line", "zh-Hans": "本线终点", "zh-Hant": "本線終點" },
  stations: { en: "stops", "zh-Hans": "站", "zh-Hant": "站" },
  // 打字对照 label (h2 对面的语言标签)
  labelEn: { en: "CHINESE", "zh-Hans": "ENGLISH", "zh-Hant": "ENGLISH" },
  labelZh: { en: "中文站名", "zh-Hans": "英文名", "zh-Hant": "英文名" },
  // scorebar
  remaining: { en: "TIME", "zh-Hans": "剩余", "zh-Hant": "剩餘" },
  elapsed: { en: "ELAPSED", "zh-Hans": "经过", "zh-Hant": "經過" },
  arrived: { en: "STOPS", "zh-Hans": "到站", "zh-Hant": "到站" },
  speed: { en: "SPEED", "zh-Hans": "速度", "zh-Hant": "速度" },
  accuracy: { en: "ACC", "zh-Hans": "正确率", "zh-Hant": "正確率" },
  seconds: { en: "s", "zh-Hans": "秒", "zh-Hant": "秒" },
  // 打字状态
  composing: { en: "Composing", "zh-Hans": "选字中", "zh-Hant": "選字中" },
  useIme: { en: "Use IME", "zh-Hans": "使用输入法选字", "zh-Hant": "使用輸入法選字" },
  typeEnglish: {
    en: "Type the station name",
    "zh-Hans": "直接输入画面上的英文站名",
    "zh-Hant": "直接輸入畫面上的英文站名",
  },
  // Home 选线 UI
  station: { en: "stops", "zh-Hans": "站", "zh-Hant": "站" },
  langLabel: { en: "Language", "zh-Hans": "站名", "zh-Hant": "站名" },
  modeLabel: { en: "Mode", "zh-Hans": "玩法", "zh-Hant": "玩法" },
  modeTimed: { en: "30 s", "zh-Hans": "30 秒", "zh-Hant": "30 秒" },
  modeLine: { en: "Full Line", "zh-Hans": "全线", "zh-Hant": "全線" },
  startRoute: {
    en: "Start This Route",
    "zh-Hans": "开始这条路线",
    "zh-Hant": "開始這條路線",
  },
  // 地图手势
  recenter: { en: "Recenter", "zh-Hans": "归位", "zh-Hant": "歸位" },
  mapA11y: {
    en: "Route map. Drag to pan, pinch to zoom, double tap to reset.",
    "zh-Hans": "路线图, 单指拖动, 双指缩放, 双击归位",
    "zh-Hant": "路線圖, 單指拖動, 雙指縮放, 雙擊歸位",
  },
  // SR
  nowArriving: {
    en: "Now arriving",
    "zh-Hans": "目前车站",
    "zh-Hant": "目前車站",
  },
  pleaseType: {
    en: "please type",
    "zh-Hans": "请输入",
    "zh-Hant": "請輸入",
  },
  // Home 顶部介绍 / 状态
  heroLine1: {
    en: "Station by station. ",
    "zh-Hans": "一站一站，",
    "zh-Hant": "一站一站，",
  },
  heroLine2: {
    en: "type your way through.",
    "zh-Hans": "越打越顺。",
    "zh-Hant": "越打越順。",
  },
  heroDesc: {
    en: "Pick a route on the real Taiwan map and type each station name in English or Chinese along the actual line. Each correct character moves the train one hop.",
    "zh-Hans": "在真实台湾地图上选择路线，沿著精确站点位置完成英文或中文站名。每打对一个字，列车就会往下一站前进一段。",
    "zh-Hant": "在真實台灣地圖上選擇路線，沿著精確站點位置完成英文或中文站名。每打對一個字，列車就會往下一站前進一段。",
  },
  heroCallout: {
    en: "Pick a route from the map or the list below",
    "zh-Hans": "从地图或下方路线列选择路线",
    "zh-Hant": "從地圖或下方路線列選擇路線",
  },
  routesCount: {
    en: "routes",
    "zh-Hans": "条路线",
    "zh-Hant": "條路線",
  },
  stationsSuffix: {
    en: "station coordinates",
    "zh-Hans": "笔站点座标",
    "zh-Hant": "筆站點座標",
  },
  backToTaiwan: {
    en: "Back to Taiwan Map",
    "zh-Hans": "返回台湾全图",
    "zh-Hant": "返回台灣全圖",
  },
  routeListLabel: {
    en: "Selectable metro routes",
    "zh-Hans": "可选择的捷运路线",
    "zh-Hant": "可選擇的捷運路線",
  },
  runPickerLabel: {
    en: "Segment",
    "zh-Hans": "区间",
    "zh-Hant": "區間",
  },
  runPickerAria: {
    en: "Choose the operating segment",
    "zh-Hans": "选择行驶区间",
    "zh-Hant": "選擇行駛區間",
  },
  directionLabel: {
    en: "Direction",
    "zh-Hans": "方向",
    "zh-Hant": "方向",
  },
  directionAria: {
    en: "Travel direction",
    "zh-Hans": "行驶方向",
    "zh-Hant": "行駛方向",
  },
  // 语言选项 label (自称 native name, 跨档统一, 与 macOS/iOS 语言列表一致)
  langEn: { en: "English", "zh-Hans": "English", "zh-Hant": "English" },
  langHans: { en: "简体", "zh-Hans": "简体", "zh-Hant": "简体" },
  langHant: { en: "繁體", "zh-Hans": "繁體", "zh-Hant": "繁體" },
  themeToggle: {
    en: "Toggle theme",
    "zh-Hans": "切换深色模式",
    "zh-Hant": "切換深色模式",
  },
  brandBack: {
    en: "Back to home",
    "zh-Hans": "回到首页",
    "zh-Hant": "回到首頁",
  },
  loading: {
    en: "Loading Taiwan metro network…",
    "zh-Hans": "正在载入台湾路网…",
    "zh-Hant": "正在載入台灣路網…",
  },
};

/** 取 UI 文案. t('back', 'zh-Hant') → '返回選線' */
export function t(key, language) {
  const entry = UI_STRINGS[key];
  if (!entry) return key;
  return entry[language] ?? entry.en ?? key;
}
