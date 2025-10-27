import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình
const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ""; // để trống = không bắt buộc auth (DEV)

// Đường dẫn thư mục WEB1 (nằm cạnh thư mục /server)
const WEB1_DIR = path.resolve(__dirname, "../WEB1");

// File dữ liệu
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "products.json");

const app = express();
app.use(express.json());

// Cho phép CORS (DEV). Khi deploy, giới hạn origin cụ thể.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // PROD: set origin frontend của bạn
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Serve tĩnh giao diện WEB1 tại đường dẫn /WEB1
console.log("[static] Serving /WEB1 from", WEB1_DIR);
app.use("/WEB1", express.static(WEB1_DIR));

// Helpers đọc/ghi
function readProducts() {
  try {
    const txt = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(txt);
  } catch (e) {
    return [];
  }
}
function writeProducts(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
}

// API: GET products
app.get("/api/products", (req, res) => {
  const data = readProducts();
  return res.json(data);
});

// API: POST products (ghi toàn bộ mảng)
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
    writeProducts(body);
    return res.json({ ok: true });
  } catch (e) {
    console.error("Write error", e);
    return res.status(500).json({ error: "Write failed" });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`Open UI: http://localhost:${PORT}/WEB1/index.html`);
  console.log(`Open Admin: http://localhost:${PORT}/WEB1/admin-index.html`);
});
