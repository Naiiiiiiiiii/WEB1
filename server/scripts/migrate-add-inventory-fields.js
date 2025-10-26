#!/usr/bin/env node
/**
 * Migration: Thêm trường tồn kho mặc định cho tất cả sản phẩm trong products.json
 * - Hỗ trợ 2 dạng tệp:
 *   + Legacy: [ { ...product } ]
 *   + Store:  { products: [...], categories: [...] }
 * - Trường được thêm nếu thiếu:
 *   costPrice: null
 *   initialStock: 0
 *   lowStockThreshold: 0
 *   imports: []
 * - Giữ nguyên các trường khác.
 * - Tạo file backup trước khi ghi.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vị trí file data
const DATA_ROOT = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_ROOT, "products.json");

// Utils
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
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
function robustWriteJson(filePath, dataObj) {
  ensureDir(path.dirname(filePath));
  const json = JSON.stringify(dataObj, null, 2);
  const tmp1 =
    path.join(
      path.dirname(filePath),
      `tmp-${path.basename(filePath)}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`
    ) + ".json";

  try {
    fs.writeFileSync(tmp1, json, { encoding: "utf8" });
    fs.renameSync(tmp1, filePath);
  } catch (e1) {
    try {
      if (fs.existsSync(tmp1)) fs.unlinkSync(tmp1);
    } catch {}
    // Fallback: ghi trực tiếp
    fs.writeFileSync(filePath, json, { encoding: "utf8" });
  }
}

function isNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function normalizeProduct(p) {
  const out = { ...p };
  if (!("costPrice" in out)) out.costPrice = null;
  if (!("initialStock" in out) || !isNumber(out.initialStock))
    out.initialStock = 0;
  if (!("lowStockThreshold" in out) || !isNumber(out.lowStockThreshold))
    out.lowStockThreshold = 0;
  if (!Array.isArray(out.imports)) out.imports = [];
  if (!Array.isArray(out.images)) out.images = out.img ? [out.img] : [];
  return out;
}

function toStoreFromAny(parsed) {
  if (Array.isArray(parsed)) {
    return { products: parsed, categories: [] };
  }
  if (parsed && typeof parsed === "object") {
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    };
  }
  return { products: [], categories: [] };
}

function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error("[migrate] Không tìm thấy file:", DATA_FILE);
    process.exit(1);
  }
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("[migrate] JSON parse lỗi:", e.message);
    process.exit(1);
  }

  const isLegacyArray = Array.isArray(parsed);
  const store = toStoreFromAny(parsed);
  const before = store.products.length;

  const migratedProducts = store.products.map(normalizeProduct);

  // Backup
  const backupFile = path.join(DATA_ROOT, `products.json.bak-${ts()}`);
  fs.copyFileSync(DATA_FILE, backupFile);

  // Ghi theo định dạng cũ (legacy) nếu đầu vào là legacy; nếu không, ghi dạng store
  const out = isLegacyArray
    ? migratedProducts
    : { products: migratedProducts, categories: store.categories };

  robustWriteJson(DATA_FILE, out);

  console.log("[migrate] Done.");
  console.log(" - Data file:", DATA_FILE);
  console.log(" - Backup   :", backupFile);
  console.log(" - Products :", before);
}

main();