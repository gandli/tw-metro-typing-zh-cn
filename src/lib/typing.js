import {
  TYPING_LANGUAGES as I18N_LANGUAGES,
  isChineseLanguage,
  localizeStationName,
  normalizeChineseToLanguage,
} from "./i18n.js";

// 保持旧 API 名字 (test 仍 import TYPING_LANGUAGES 和 CHINESE 常量)
// 新增: SIMPLIFIED / TRADITIONAL, 而旧 CHINESE 等同 SIMPLIFIED
export const TYPING_LANGUAGES = Object.freeze({
  ENGLISH: I18N_LANGUAGES.ENGLISH,
  CHINESE: I18N_LANGUAGES.SIMPLIFIED, // 向后兼容: 老测试用 CHINESE
  SIMPLIFIED: I18N_LANGUAGES.SIMPLIFIED,
  TRADITIONAL: I18N_LANGUAGES.TRADITIONAL,
});

const NON_WORD_CHARACTERS = /[^\p{Letter}\p{Number}]/gu;

export function getTypingTarget(station, language) {
  if (!station) return "";
  if (isChineseLanguage(language)) {
    // 站名按目标语言本地化 (简/繁) 后剥去标点
    return localizeStationName(station, language)
      .normalize("NFKC")
      .replace(NON_WORD_CHARACTERS, "");
  }
  return (station.target ?? station.nameEn ?? "")
    .normalize("NFKC")
    .toLowerCase();
}

export function normalizeCommittedText(value, language) {
  const normalized = value.normalize("NFKC");
  if (!isChineseLanguage(language)) return normalized;
  // 中文输入: 剥标点 + 按语言归一化 (用户输入简体也能过繁体目标)
  return normalizeChineseToLanguage(normalized, language).replace(
    NON_WORD_CHARACTERS,
    "",
  );
}

export function isTypingCharacterMatch(typed, expected, language) {
  if (!typed || !expected) return false;
  if (isChineseLanguage(language)) {
    // 双端都归一化到目标语言字形, 再比对
    return (
      normalizeChineseVariant(
        normalizeChineseToLanguage(typed, language),
      ) ===
      normalizeChineseVariant(
        normalizeChineseToLanguage(expected, language),
      )
    );
  }
  return typed.toLowerCase() === expected;
}

function normalizeChineseVariant(value) {
  // "台/台" 异体字统一 (opencc 也会处理但保底一层)
  return value.normalize("NFKC").replaceAll("台", "台");
}
