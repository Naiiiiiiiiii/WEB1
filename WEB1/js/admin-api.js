// Helper API cho Admin
import { API_BASE } from "./api-config.js";

export const AdminAPI = {
  async getProducts() {
    const res = await fetch(`${API_BASE}/api/products`, { cache: "no-store" });
    return await res.json();
  },
  async saveProducts(list, opts = {}) {
    const headers = { "Content-Type": "application/json" };
    if (opts.token) headers["Authorization"] = "Bearer " + opts.token; // nếu bạn bật ADMIN_TOKEN ở server
    const res = await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers,
      body: JSON.stringify(list),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Save failed");
    return j;
  },
};
