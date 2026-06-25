/**
 * 与 packages/user-profile/index.js 同步，运行 npm run miniprogram:sync-profile 更新。
 * 小程序无法 require 项目根 packages，故保留此副本。
 */
"use strict";

const AVATAR_GENDERS = ["male", "female", "bag"];

const AVATAR_GENDER = {
  MALE: "male",
  FEMALE: "female",
  BAG: "bag",
};

const NICKNAME_MAX_LENGTH = 20;
const PHONE_CN_PATTERN = /^1\d{10}$/;

const VALID_AVATAR_GENDERS = new Set(AVATAR_GENDERS);

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return PHONE_CN_PATTERN.test(digits) ? digits : null;
}

function normalizeAvatarGender(value, avatar) {
  if (typeof value === "string" && VALID_AVATAR_GENDERS.has(value)) {
    return value;
  }
  if (avatar && avatar.includes("girls")) return AVATAR_GENDER.FEMALE;
  if (avatar && avatar.includes("bag")) return AVATAR_GENDER.BAG;
  return AVATAR_GENDER.MALE;
}

function avatarPathForGender(gender) {
  if (gender === AVATAR_GENDER.FEMALE) return "/assets/profile/girls.webp";
  if (gender === AVATAR_GENDER.BAG) return "/assets/profile/bag.webp";
  return "/assets/profile/boys.webp";
}

module.exports = {
  AVATAR_GENDERS,
  AVATAR_GENDER,
  NICKNAME_MAX_LENGTH,
  PHONE_CN_PATTERN,
  normalizePhone,
  normalizeAvatarGender,
  avatarPathForGender,
};
