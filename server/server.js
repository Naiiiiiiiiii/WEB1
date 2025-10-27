import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

// Cho phép override vị trí lưu data qua biến môi trường, để tránh OneDrive/Documents nếu cần
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

// Helpers
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// Ghi an toàn: viết vào file tạm rồi rename
function safeWriteJson(filePath, dataObj) {
  ensureDir(path.dirname(filePath));
  const json = JSON.stringify(dataObj, null, 2);
  const tmp = path.join(
    path.dirname(filePath),
    `.tmp-${path.basename(filePath)}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`
  );
  // Ghi file tạm trước
  fs.writeFileSync(tmp, json, { encoding: "utf8" });
  // Đổi tên file tạm thành file đích (atomic trên hầu hết hệ thống)
  fs.renameSync(tmp, filePath);
}

function readProducts() {
  try {
    const txt = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(txt);
  } catch (e) {
    return [];
  }
}

app.get("/api/products", (req, res) => {
  const data = readProducts();
  return res.json(data);
});

app.post("/api/products", (req, res) => {
  if (ADMIN_TOKEN) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (token !== ADMIN_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  const body = req.body;
  if (!Array.isArray(body)) {
    return res.status(400).json({ error: "Expected an array of products" });
  }

  try {
    // Sanitize tối thiểu phía server (tránh trường lạ)
    const safe = body.map((p) => ({
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
    }));

    safeWriteJson(DATA_FILE, safe);
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

// Các endpoint debug giúp chẩn đoán nhanh
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
    const testObj = [{ id: "__test__", name: "ok" }];
    safeWriteJson(DATA_FILE, testObj);
    return res.json({ ok: true, wrote: DATA_FILE });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message, code: e.code });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`Open UI: http://localhost:${PORT}/WEB1/index.html`);
  console.log(`Open Admin: http://localhost:${PORT}/WEB1/admin-index.html`);
});
