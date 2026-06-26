import { isServiceProviderRole } from "@meme/admin-rbac";
import type { AdminRole } from "../constants/admin-rbac.js";
import type { Handler, ServiceType } from "../types.js";

export { isServiceProviderRole };

export function serviceProviderRoleForType(serviceType: ServiceType): AdminRole {
  return serviceType === "companion" ? "companion" : "handler";
}

export function serviceTypeForProviderRole(role: AdminRole): ServiceType | null {
  if (role === "companion") return "companion";
  if (role === "handler") return "escort";
  return null;
}

export function rolesForHandlerProfile(serviceType: ServiceType): AdminRole[] {
  return [serviceProviderRoleForType(serviceType)];
}

/** 后台账号是否已绑定打手/陪玩档案 */
export function isLinkedServiceProviderAccount(
  user: { handlerId?: string; roles: AdminRole[] } | null | undefined,
) {
  return Boolean(user?.handlerId && user.roles.some(isServiceProviderRole));
}

/** 比较账号上已绑定的服务者角色是否与档案类型一致 */
export function serviceProviderRolesMatch(
  roles: AdminRole[],
  serviceType: ServiceType,
): boolean {
  const expected = rolesForHandlerProfile(serviceType)[0];
  return roles.some((role) => role === expected);
}

export function assertHandlerMatchesServiceType(
  handler: Handler,
  requiredServiceType: ServiceType,
  errorCode = "HANDLER_SERVICE_TYPE_MISMATCH",
) {
  if (handler.serviceType !== requiredServiceType) {
    throw new Error(errorCode);
  }
}

export function serviceProviderRoleLabel(serviceType: ServiceType) {
  return serviceType === "companion" ? "陪玩" : "护航打手";
}

export type ServiceProviderAccountInput = {
  username: string;
  password: string;
  displayName?: string;
};

export function buildServiceProviderAccountPayload(
  handler: Pick<Handler, "id" | "name" | "realName" | "serviceType">,
  account: ServiceProviderAccountInput,
) {
  return {
    username: account.username.trim(),
    password: account.password,
    displayName:
      account.displayName?.trim() || handler.name?.trim() || handler.realName?.trim() || "",
    roles: rolesForHandlerProfile(handler.serviceType),
    enabled: true as const,
    handlerId: handler.id,
  };
}
