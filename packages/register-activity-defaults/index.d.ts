export type RegisterActivityPayload = {
  enabled: boolean;
  title: string;
  subtitle: string;
  /** 新用户注册成功后发放的优惠券模板 ID */
  templateIds: string[];
};

export declare const REGISTER_ACTIVITY_DEFAULTS: RegisterActivityPayload;

export declare function normalizeRegisterActivityPayload(
  raw?: Partial<RegisterActivityPayload> | null,
): RegisterActivityPayload;
