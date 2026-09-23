import { ref } from "vue";

export interface AccessTokenPayload {
  userId: number;
  roles: string[];
  permissions: string[];
}

export function useAuthState() {
  const loading = ref<boolean>(false);
  const loginResult = ref<any>(null);
  const adminUser = ref<any>(null);

  // ─── In-memory session (never persisted client-side) ──
  const accessToken = ref<string | null>(null);
  const userId = ref<number | null>(null);
  const roles = ref<string[]>([]);
  const permissions = ref<string[]>([]);
  // true once the boot-time refresh attempt has finished, success or fail
  const isReady = ref<boolean>(false);

  return {
    loading,
    loginResult,
    adminUser,
    accessToken,
    userId,
    roles,
    permissions,
    isReady,
  };
}