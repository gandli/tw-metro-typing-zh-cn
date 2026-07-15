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
  return text; // 繁体 / 英文档都保留繁体原文
}
