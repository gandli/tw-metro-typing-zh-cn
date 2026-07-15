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
    getTypingTarget({ nameZh: "台北101/世贸" }, TYPING_LANGUAGES.CHINESE),
    "台北101世贸",
  );
  assert.equal(
    getTypingTarget({ nameZh: "湾仔内(大顺鼎山)" }, TYPING_LANGUAGES.CHINESE),
    "湾仔内大顺鼎山",
  );
});

test("committed Chinese input ignores punctuation and normalizes full-width text", () => {
  assert.equal(
    normalizeCommittedText("台北１０１／世贸", TYPING_LANGUAGES.CHINESE),
    "台北101世贸",
  );
});

test("Chinese typing accepts the common 台 and 台 variants", () => {
  assert.equal(
    isTypingCharacterMatch("台", "台", TYPING_LANGUAGES.CHINESE),
    true,
  );
  assert.equal(
    isTypingCharacterMatch("台", "台", TYPING_LANGUAGES.CHINESE),
    true,
  );
});

test("English typing remains case-insensitive", () => {
  assert.equal(
    isTypingCharacterMatch("T", "t", TYPING_LANGUAGES.ENGLISH),
    true,
  );
});
