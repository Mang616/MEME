export type AvatarGender = "male" | "female" | "bag";

export const AVATAR_GENDERS: readonly AvatarGender[];
export const AVATAR_GENDER: {
  readonly MALE: "male";
  readonly FEMALE: "female";
  readonly BAG: "bag";
};
export const NICKNAME_MAX_LENGTH: 20;
export const PHONE_CN_PATTERN: RegExp;

export function normalizePhone(phone: unknown): string | null;
export function normalizeAvatarGender(value: unknown, avatar?: string): AvatarGender;
export function avatarPathForGender(gender: AvatarGender): string;
