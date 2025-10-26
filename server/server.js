import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

// Dùng thư mục dữ liệu ngoài Documents/OneDrive nếu cần (ví dụ: C:\temp\shoestore-data)
const DATA_ROOT = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_ROOT, "products.json");

// Phục vụ UI
const WEB1_DIR = path.resolve(__dirname, "../WEB1");

const app = express();
app.use(express.json());

// CORS (DEV)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

console.log("[static] Serving /WEB1 from", WEB1_DIR);
app.use("/WEB1", express.static(WEB1_DIR));

// ---------- IO utils ----------
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
function robustWriteJson(filePath, dataObj) {
  ensureDir(path.dirname(filePath));
  const json = JSON.stringify(dataObj, null, 2);

  // Ghi an toàn: nhiều lớp fallback phù hợp Windows
  const tmp1 = path.join(
    path.dirname(filePath),
    `tmp-${path.basename(filePath)}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`
  );
  try {
    fs.writeFileSync(tmp1, json, { encoding: "utf8" });
    fs.renameSync(tmp1, filePath);
    return;
  } catch (e1) {
    try {
      if (fs.existsSync(tmp1)) fs.unlinkSync(tmp1);
    } catch {}
    try {
      fs.writeFileSync(filePath, json, { encoding: "utf8" });
      return;
    } catch (e2) {
      try {
        const fd = fs.openSync(filePath, "w");
        try {
          fs.writeSync(fd, json);
        } finally {
          fs.closeSync(fd);
        }
        return;
      } catch (e3) {
        try {
          fs.writeFileSync(filePath + ".tmp", json, { encoding: "utf8" });
          fs.renameSync(filePath + ".tmp", filePath);
          return;
        } catch (e4) {
          const err = new Error(
            `robustWriteJson failed: tmp=${e1?.message}; direct=${e2?.message}; fd=${e3?.message}; tmp2=${e4?.message}`
          );
          err.code = e4?.code || e3?.code || e2?.code || e1?.code;
          throw err;
        }
      }
    }
  }
}

// ---------- Store helpers ----------
function slugCode(name = "") {
  const base = String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  return base || "CAT";
}
function deriveCategoriesFromProducts(products = []) {
  const names = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );
  const now = Date.now();
  return names.map((n, i) => ({
    id: `C${(i + 1).toString().padStart(3, "0")}`,
    code: slugCode(n),
    name: n,
    desc: "",
    hidden: false,
    createdAt: now,
  }));
}

// Hỗ trợ đọc file cũ (chỉ có mảng products) và file mới (object store)
function toStoreFromAny(parsed) {
  if (Array.isArray(parsed)) {
    const products = parsed;
    const categories = deriveCategoriesFromProducts(products);
    return { products, categories };
  }
  if (parsed && typeof parsed === "object") {
    const products = Array.isArray(parsed.products) ? parsed.products : [];
    const categories = Array.isArray(parsed.categories)
      ? parsed.categories
      : deriveCategoriesFromProducts(products);
    return { products, categories };
  }
  return { products: [], categories: [] };
}

function readStore() {
  try {
    const txt = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(txt);
    return toStoreFromAny(parsed);
  } catch {
    return { products: [], categories: [] };
  }
}
function writeStore(store) {
  const safe = {
    products: Array.isArray(store.products) ? store.products : [],
    categories: Array.isArray(store.categories) ? store.categories : [],
  };
  robustWriteJson(DATA_FILE, safe);
}

function requireAdmin(req, res) {
  if (!ADMIN_TOKEN) return true;
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

// ---------- API: Products ----------
app.get("/api/products", (req, res) => {
  const store = readStore();
  return res.json(store.products);
});

app.post("/api/products", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body;
  if (!Array.isArray(body)) {
    return res.status(400).json({ error: "Expected an array of products" });
  }
  try {
    const store = readStore();
    const products = body.map((p) => ({
      id: p.id,
      name: p.name || "",
      category: p.category || "",
      price: p.price ?? null,
      oldPrice: p.oldPrice ?? null,
      img: p.img || "",
      description: p.description || "",
      rating: p.rating || 0,
      ratingCount: p.ratingCount || 0,
      badge: p.badge || null,
      hidden: !!p.hidden,
      images: Array.isArray(p.images) ? p.images : p.img ? [p.img] : [],
      costPrice: p.costPrice ?? undefined,
      initialStock: p.initialStock ?? undefined,
      lowStockThreshold: p.lowStockThreshold ?? undefined,
      imports: Array.isArray(p.imports) ? p.imports : undefined,
    }));
    writeStore({ ...store, products });
    return res.json({ ok: true });
  } catch (e) {
    console.error("Write error", e);
    return res
      .status(500)
      .json({
        error: "Write failed",
        detail: e.message || String(e),
        code: e.code || "",
      });
  }
});

// ---------- API: Categories ----------
app.get("/api/categories", (req, res) => {
  const store = readStore();
  let cats = store.categories;
  if (!cats || !cats.length) {
    cats = deriveCategoriesFromProducts(store.products);
  }
  return res.json(cats);
});

app.post("/api/categories", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body;
  if (!Array.isArray(body)) {
    return res.status(400).json({ error: "Expected an array of categories" });
  }
  try {
    const store = readStore();
    const categories = body.map((c, i) => ({
      id: c.id || `C${(i + 1).toString().padStart(3, "0")}`,
      code: c.code || slugCode(c.name || ""),
      name: c.name || "",
      desc: c.desc || "",
      hidden: !!c.hidden,
      createdAt: c.createdAt ?? Date.now(),
    }));
    writeStore({ ...store, categories });
    return res.json({ ok: true });
  } catch (e) {
    console.error("Write error", e);
    return res
      .status(500)
      .json({
        error: "Write failed",
        detail: e.message || String(e),
        code: e.code || "",
      });
  }
});

// ---------- Debug ----------
app.get("/api/debug/paths", (req, res) => {
  const info = {
    __dirname,
    cwd: process.cwd(),
    DATA_ROOT,
    DATA_FILE,
    existsRoot: fs.existsSync(DATA_ROOT),
    existsFile: fs.existsSync(DATA_FILE),
  };
  try {
    const st = fs.existsSync(DATA_ROOT) ? fs.statSync(DATA_ROOT) : null;
    info.rootIsDir = !!st && st.isDirectory();
  } catch {}
  return res.json(info);
});

app.get("/api/debug/write-check", (req, res) => {
  try {
    const store = readStore();
    writeStore(store);
    return res.json({ ok: true, wrote: DATA_FILE });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message, code: e.code });
  }
});

app.get("/api/debug/store", (req, res) => {
  try {
    const store = readStore();
    return res.json(store);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`Open UI:   http://localhost:${PORT}/WEB1/index.html`);
  console.log(`Open Admin: http://localhost:${PORT}/WEB1/admin-index.html`);
});
