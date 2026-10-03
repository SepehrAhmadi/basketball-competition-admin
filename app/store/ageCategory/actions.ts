import { useApi } from "~/composables/useApi";
import type { useAgeCategoryState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useAgeCategoryState>;

export function useAgeCategoryActions(state: StateType) {
  const handlerStore = useHandlerStore();

  // GET /admin/age-categories — verifyPermission("age-categories.view")
  const getAgeCategories = (params: any) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get("/admin/age-categories", { params })
      .then((res) => {
        state.ageCategoryList.value = res.data.data.items ?? res.data.data;
        state.ageCategoryListMeta.value = res.data.data.meta ?? {
          total: res.data.data.total,
          page: res.data.data.page,
          pageSize: res.data.data.pageSize,
        };
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          state.loading.value = false;
        }, 2000);
      });
  };

  // GET /admin/age-categories/:ageCategoryId — verifyPermission("age-categories.view")
  const getAgeCategoryById = (id: number | string) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get(`/admin/age-categories/${id}`)
      .then((res) => {
        state.ageCategoryDetail.value = res.data.data;
        return res.data.data;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          state.loading.value = false;
        }, 2000);
      });
  };

  // POST /admin/age-categories — verifyPermission("age-categories.create")
  const createAgeCategory = (value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post("/admin/age-categories", value)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return res.data.data;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  // PUT /admin/age-categories/:ageCategoryId — verifyPermission("age-categories.update")
  const updateAgeCategory = (id: number | string, value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/admin/age-categories/${id}`, value)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return res.data.data;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  // DELETE /admin/age-categories/:ageCategoryId — verifyPermission("age-categories.delete")
  const deleteAgeCategory = (id: number | string) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .delete(`/admin/age-categories/${id}`)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  // GET /admin/age-category-cutoffs — verifyPermission("age-categories.view")
  const getCutoffs = (params?: any) => {
    const axios = useApi();
    state.cutoffLoading.value = true;

    return axios
      .get("/admin/age-category-cutoffs", { params })
      .then((res) => {
        state.cutoffList.value = res.data.data.items ?? res.data.data;
        state.cutoffListMeta.value = res.data.data.meta ?? {
          total: res.data.data.total,
          page: res.data.data.page,
          pageSize: res.data.data.pageSize,
        };
        return state.cutoffList.value;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          state.cutoffLoading.value = false;
        }, 2000);
      });
  };

  // GET /admin/age-category-cutoffs/:cutoffId — verifyPermission("age-categories.view")
  const getCutoffById = (id: number | string) => {
    const axios = useApi();
    state.cutoffLoading.value = true;

    return axios
      .get(`/admin/age-category-cutoffs/${id}`)
      .then((res) => {
        state.cutoffDetail.value = res.data.data;
        return res.data.data;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          state.cutoffLoading.value = false;
        }, 2000);
      });
  };

  // POST /admin/age-category-cutoffs — verifyPermission("age-categories.create")
  const createCutoff = (value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post("/admin/age-category-cutoffs", value)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return res.data.data;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  // PUT /admin/age-category-cutoffs/:cutoffId — verifyPermission("age-categories.update")
  const updateCutoff = (id: number | string, value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/admin/age-category-cutoffs/${id}`, value)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return res.data.data;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  // DELETE /admin/age-category-cutoffs/:cutoffId — verifyPermission("age-categories.delete")
  const deleteCutoff = (id: number | string) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .delete(`/admin/age-category-cutoffs/${id}`)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  return {
    getAgeCategories,
    getAgeCategoryById,
    createAgeCategory,
    updateAgeCategory,
    deleteAgeCategory,
    getCutoffs,
    getCutoffById,
    createCutoff,
    updateCutoff,
    deleteCutoff,
  };
}
