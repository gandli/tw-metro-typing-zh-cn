export const TYPING_LANGUAGES = {
  ENGLISH: "en",
  CHINESE: "zh",
};

const NON_WORD_CHARACTERS = /[^\p{Letter}\p{Number}]/gu;

export function getTypingTarget(station, language) {
  if (!station) return "";
  if (language === TYPING_LANGUAGES.CHINESE) {
    return (station.nameZh ?? "")
      .normalize("NFKC")
      .replace(NON_WORD_CHARACTERS, "");
  }
  return (station.target ?? station.nameEn ?? "")
    .normalize("NFKC")
    .toLowerCase();
}

export function normalizeCommittedText(value, language) {
  const normalized = value.normalize("NFKC");
  return language === TYPING_LANGUAGES.CHINESE
    ? normalized.replace(NON_WORD_CHARACTERS, "")
    : normalized;
}

export function isTypingCharacterMatch(typed, expected, language) {
  if (!typed || !expected) return false;
  if (language === TYPING_LANGUAGES.CHINESE) {
    return normalizeChineseVariant(typed) === normalizeChineseVariant(expected);
  }
  return typed.toLowerCase() === expected;
}

function normalizeChineseVariant(value) {
  return value.normalize("NFKC").replaceAll("臺", "台");
}
