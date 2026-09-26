import { ref } from "vue";

export type DomainRole = "ORG_MANAGER" | "COACH" | "PLAYER" | "REFEREE";
export type AdminLevel = "ADMIN" | "SUPER_ADMIN" | null;
export interface AccessTokenPayload {
  userId: number;
  roles: DomainRole[];
  adminLevel: AdminLevel;
  permissions: string[];
}

export function useAuthState() {
  const loading = ref<boolean>(false);
  const loginResult = ref<any>(null);
  const adminUser = ref<any>(null);

  // ─── In-memory session (never persisted client-side) ──
  // Note: accessToken is now stored in a "token" cookie (useCookie).
  const userId = ref<number | null>(null);
  const roles = ref<DomainRole[]>([]);
  const adminLevel = ref<AdminLevel>(null);
  const permissions = ref<string[]>([]);
  // true once the boot-time refresh attempt has finished, success or fail
  const isReady = ref<boolean>(false);

  return {
    loading,
    loginResult,
    adminUser,
    userId,
    roles,
    adminLevel,
    permissions,
    isReady,
  };
}