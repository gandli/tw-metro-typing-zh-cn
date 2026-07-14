import test from "node:test";
import assert from "node:assert/strict";
import {
  getTypingTarget,
  isTypingCharacterMatch,
  normalizeCommittedText,
  TYPING_LANGUAGES,
} from "./typing.js";

test("Chinese targets keep words and numbers while dropping punctuation", () => {
  assert.equal(
    getTypingTarget({ nameZh: "台北101/世貿" }, TYPING_LANGUAGES.CHINESE),
    "台北101世貿",
  );
  assert.equal(
    getTypingTarget({ nameZh: "灣仔內(大順鼎山)" }, TYPING_LANGUAGES.CHINESE),
    "灣仔內大順鼎山",
  );
});

test("committed Chinese input ignores punctuation and normalizes full-width text", () => {
  assert.equal(
    normalizeCommittedText("台北１０１／世貿", TYPING_LANGUAGES.CHINESE),
    "台北101世貿",
  );
});

test("Chinese typing accepts the common 台 and 臺 variants", () => {
  assert.equal(
    isTypingCharacterMatch("台", "臺", TYPING_LANGUAGES.CHINESE),
    true,
  );
  assert.equal(
    isTypingCharacterMatch("臺", "台", TYPING_LANGUAGES.CHINESE),
    true,
  );
});

test("English typing remains case-insensitive", () => {
  assert.equal(
    isTypingCharacterMatch("T", "t", TYPING_LANGUAGES.ENGLISH),
    true,
  );
});
