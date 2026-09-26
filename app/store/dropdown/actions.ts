import { useApi } from "~/composables/useApi";
import type { useDropdownState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useDropdownState>;

export function useDropdownActions(state: StateType) {
  const handlerStore = useHandlerStore();

  const getUnits = () => {
    const axios = useApi();
    handlerStore.loading = true;

    return axios
      .get("/dropdown/units")
      .then((res) => {
        state.unitsResult.value = res.data.data.units;
      })
      .catch((err) => {
        console.log(err);

        const message =
          err.response?.data?.message || "خطایی در  سرور رخ داده است";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          handlerStore.loading = false;
        }, 500);
      });
  };

  const getPackagings = () => {
    const axios = useApi();
    handlerStore.loading = true;

    return axios
      .get("/dropdown/packagings")
      .then((res) => {
        state.packagingsResult.value = res.data.data.packagings;
      })
      .catch((err) => {
        console.log(err);

        const message =
          err.response?.data?.message || "خطایی در  سرور رخ داده است";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          handlerStore.loading = false;
        }, 500);
      });
  };

  const getCompanies = () => {
    const axios = useApi();
    handlerStore.loading = true;

    return axios
      .get("/dropdown/companies")
      .then((res) => {
        state.companiesResult.value = res.data.data.companies;
      })
      .catch((err) => {
        console.log(err);

        const message =
          err.response?.data?.message || "خطایی در  سرور رخ داده است";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          handlerStore.loading = false;
        }, 500);
      });
  };

  const getBrands = () => {
    const axios = useApi();
    handlerStore.loading = true;

    return axios
      .get("/dropdown/brands")
      .then((res) => {
        state.brandsResult.value = res.data.data.brands;
      })
      .catch((err) => {
        console.log(err);

        const message =
          err.response?.data?.message || "خطایی در  سرور رخ داده است";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          handlerStore.loading = false;
        }, 500);
      });
  };

  const getCategories = () => {
    const axios = useApi();
    handlerStore.loading = true;

    return axios
      .get("/dropdown/categories")
      .then((res) => {
        state.categoriesResult.value = res.data.data.categories;
      })
      .catch((err) => {
        console.log(err);

        const message =
          err.response?.data?.message || "خطایی در  سرور رخ داده است";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          handlerStore.loading = false;
        }, 500);
      });
  };

  const getProducts = () => {
    const axios = useApi();
    handlerStore.loading = true;

    return axios
      .get("/dropdown/products")
      .then((res) => {
        state.productsResult.value = res.data.data.products;
      })
      .catch((err) => {
        console.log(err);

        const message =
          err.response?.data?.message || "خطایی در  سرور رخ داده است";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          handlerStore.loading = false;
        }, 500);
      });
  };

  const getCompanyType = () => {
    const axios = useApi();
    handlerStore.loading = true;

    return axios
      .get("/dropdown/companyType")
      .then((res) => {
        state.companyTypeResult.value = res.data.data.companyType;
      })
      .catch((err) => {
        console.log(err);

        const message =
          err.response?.data?.message || "خطایی در  سرور رخ داده است";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          handlerStore.loading = false;
        }, 500);
      });
  };

  const getPaymentStatus = () => {
    const axios = useApi();
    handlerStore.loading = true;

    return axios
      .get("/dropdown/paymentStatus")
      .then((res) => {
        state.paymentStatusResult.value = res.data.data.paymentStatus;
      })
      .catch((err) => {
        console.log(err);

        const message =
          err.response?.data?.message || "خطایی در  سرور رخ داده است";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          handlerStore.loading = false;
        }, 500);
      });
  };

  const getRoles = () => {
    const axios = useApi();
    handlerStore.loading = true;

    return axios
      .get("/roles")
      .then((res) => {
        // Domain roles only — ADMIN / SUPER_ADMIN live in `adminLevel`.
        const allowed = ["ORG_MANAGER", "COACH", "PLAYER", "REFEREE"];
        const list = res.data.data.roles ?? res.data.data ?? [];
        state.roles.value = Array.isArray(list)
          ? list.filter((r: any) => allowed.includes(r?.value ?? r))
          : [];
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          handlerStore.loading = false;
        }, 500);
      });
  };

  return {
    getUnits,
    getPackagings,
    getCompanies,
    getBrands,
    getCategories,
    getProducts,
    getCompanyType,
    getPaymentStatus,
    getRoles,
  };
}
