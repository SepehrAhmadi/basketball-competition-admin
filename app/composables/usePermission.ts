import { storeToRefs } from "pinia";
import { useAuthStore } from "~/store/auth";

// UI-only claim check. Real enforcement stays 100% server-side
// (verifyJWT / verifyRole / verifyPermission).
export function usePermission() {
  const authStore = useAuthStore();
  const { roles, permissions } = storeToRefs(authStore);

  const hasPermission = (permission: string) => {
    return (
      roles.value.includes("SUPER_ADMIN") ||
      permissions.value.includes(permission)
    );
  };

  return { hasPermission };
}
