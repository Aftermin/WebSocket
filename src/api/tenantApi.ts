import apiClient from "./client";

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  owner_email: string;
  status: string;
  plan: string;
}

export const tenantApi = {
  list: async (): Promise<Tenant[]> => {
    const res = await apiClient.get("/tenants");
    return res.data;
  },
};
