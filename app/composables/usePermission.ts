import { storeToRefs } from "pinia";
import { useAuthStore } from "~/store/auth";
import type { DomainRole } from "~/store/auth/state";

// UI-only claim check. Real enforcement stays 100% server-side
// (verifyJWT / verifyRole / verifyPermission).
export function usePermission() {
  const authStore = useAuthStore();
  const { adminLevel, roles, permissions } = storeToRefs(authStore);

  const isAdmin = computed(() => adminLevel.value !== null);
  const isSuperAdmin = computed(() => adminLevel.value === "SUPER_ADMIN");
  const hasRole = (r: DomainRole) => roles.value.includes(r);
  const can = (p: string) => isSuperAdmin.value || permissions.value.includes(p);
  const hasPermission = (permission: string) => can(permission);

  return { hasPermission, can, hasRole, isAdmin, isSuperAdmin };
}
