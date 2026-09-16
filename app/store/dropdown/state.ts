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
  const roles = ref<{ value: string; label: string }[]>([]);

  return {
    unitsResult,
    packagingsResult,
    companiesResult,
    brandsResult,
    productsResult,
    categoriesResult,
    companyTypeResult,
    paymentStatusResult,
    roles,
  };
}
