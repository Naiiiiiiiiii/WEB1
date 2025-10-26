import { AdminAPI } from "./admin-api.js";

(function () {
  let bc = null;

  function $(sel) {
    return document.querySelector(sel);
  }

  function getToken() {
    const el = $("#adminToken");
    return el ? el.value || "" : "";
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }

  function ts() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      "-" +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  async function doExport() {
    const [products, categories] = await Promise.all([
      AdminAPI.getProducts(),
      (async () => {
        try {
          return await AdminAPI.getCategories();
        } catch {
          return [];
        }
      })(),
    ]);

    const store = {
      products: Array.isArray(products) ? products : [],
      categories: Array.isArray(categories) ? categories : [],
      exportedAt: new Date().toISOString(),
    };
    downloadJson(`products-backup-${ts()}.json`, store);
  }

  function deriveCategoriesFromProducts(products) {
    const names = Array.from(
      new Set((products || []).map((p) => p.category).filter(Boolean))
    );
    const now = Date.now();
    return names.map((n, i) => ({
      id: `C${(i + 1).toString().padStart(3, "0")}`,
      code: String(n).toUpperCase().replace(/\s+/g, "_"),
      name: n,
      desc: "",
      hidden: false,
      createdAt: now,
    }));
  }

  async function doImport(file) {
    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      alert("File JSON không hợp lệ.");
      return;
    }

    let products = [];
    let categories = [];

    if (Array.isArray(parsed)) {
      products = parsed;
      categories = deriveCategoriesFromProducts(products);
    } else if (parsed && typeof parsed === "object") {
      products = Array.isArray(parsed.products) ? parsed.products : [];
      categories = Array.isArray(parsed.categories)
        ? parsed.categories
        : deriveCategoriesFromProducts(products);
    } else {
      alert("Cấu trúc JSON không hợp lệ.");
      return;
    }

    const token = getToken();
    try {
      await AdminAPI.saveProducts(products, { token });
      try {
        await AdminAPI.saveCategories(categories, { token });
      } catch (e) {
        console.warn("[backup] saveCategories failed:", e?.message || e);
      }

      try {
        bc?.postMessage({
          type: "updated",
          at: Date.now(),
          source: "admin-backup",
        });
      } catch {}
      alert("Khôi phục thành công!");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Khôi phục thất bại: " + e.message);
    }
  }

  function buildToolbar() {
    const wrap = document.createElement("div");
    wrap.className = "backup-toolbar";
    wrap.style.position = "fixed";
    wrap.style.right = "20px";
    wrap.style.bottom = "20px";
    wrap.style.zIndex = "9999";
    wrap.style.display = "flex";
    wrap.style.gap = "8px";
    wrap.style.alignItems = "center";
    wrap.style.background = "rgba(32,32,32,0.85)";
    wrap.style.color = "#fff";
    wrap.style.padding = "10px 12px";
    wrap.style.borderRadius = "10px";
    wrap.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
    wrap.style.backdropFilter = "blur(6px)";

    const title = document.createElement("span");
    title.textContent = "Backup:";
    title.style.opacity = "0.9";

    const btnExport = document.createElement("button");
    btnExport.className = "btn btn-export-json";
    btnExport.textContent = "Export JSON";
    btnExport.style.cursor = "pointer";
    btnExport.addEventListener("click", () => {
      doExport().catch((e) => alert("Export lỗi: " + e.message));
    });

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.style.display = "none";
    fileInput.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      doImport(f).finally(() => {
        fileInput.value = "";
      });
    });

    const btnImport = document.createElement("button");
    btnImport.className = "btn btn-import-json";
    btnImport.textContent = "Import JSON";
    btnImport.style.cursor = "pointer";
    btnImport.addEventListener("click", () => fileInput.click());

    wrap.appendChild(title);
    wrap.appendChild(btnExport);
    wrap.appendChild(btnImport);
    wrap.appendChild(fileInput);

    document.body.appendChild(wrap);
  }

  function init() {
    try {
      bc = new BroadcastChannel("products-sync");
    } catch {}
    buildToolbar();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
