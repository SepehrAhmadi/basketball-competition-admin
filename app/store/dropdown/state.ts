import { ref } from "vue";

export function useDropdownState() {
  const unitsResult = ref<any[]>([]);
  const packagingsResult = ref<any[]>([]);
  const companiesResult = ref<any[]>([]);
  const brandsResult = ref<any[]>([]);
  const productsResult = ref<any[]>([]);
  const categoriesResult = ref<any[]>([]);
  const companyTypeResult = ref<any[]>([]);
  const paymentStatusResult = ref<any[]>([]);
  const usersResult = ref<any[]>([]);
  const roles = ref<{ value: string; label: string }[]>([]);
  const organizationStatuses = ref<{ value: string; label: string }[]>([]);
  const seasonsResult = ref<{ value: string; label: string }[]>([]);
  const organizationsResult = ref<
    { value: number; label: string; status?: string }[]
  >([]);
  const teamStatuses = ref<{ value: string; label: string }[]>([]);

  return {
    unitsResult,
    packagingsResult,
    companiesResult,
    brandsResult,
    productsResult,
    categoriesResult,
    companyTypeResult,
    paymentStatusResult,
    usersResult,
    roles,
    organizationStatuses,
    seasonsResult,
    organizationsResult,
    teamStatuses,
  };
}
