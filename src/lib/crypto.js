/**
 * Tiện ích mã hóa / giải mã AES-GCM
 * Dùng Web Crypto API — hoạt động cả server (Node 18+) lẫn browser.
 *
 * Khóa được đọc từ biến môi trường:
 *   - Server-only:  CRYPTO_SECRET
 *   - Client-side:  NEXT_PUBLIC_CRYPTO_KEY  (nhúng vào bundle)
 *
 * Ưu tiên CRYPTO_SECRET (server) → NEXT_PUBLIC_CRYPTO_KEY (client) → fallback.
 */

const SECRET =
  (typeof process !== "undefined" && process.env?.CRYPTO_SECRET) ||
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CRYPTO_KEY) ||
  "cinetube_default_secret_key_2024!";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function strToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToBase64(bytes) {
  let bin = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

// ─── Key derivation ───────────────────────────────────────────────────────────

let _cachedKey = null;

async function getKey() {
  if (_cachedKey) return _cachedKey;

  const raw = await crypto.subtle.importKey(
    "raw",
    strToBytes(SECRET),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  _cachedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: strToBytes("cinetube-aes-salt-v1"),
      iterations: 50_000,
      hash: "SHA-256",
    },
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return _cachedKey;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Mã hóa bất kỳ giá trị JSON-serializable.
 * Trả về chuỗi base64 (iv + ciphertext).
 *
 * @param {unknown} data
 * @returns {Promise<string>}
 */
export async function encrypt(data) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV cho AES-GCM
  const encoded = strToBytes(JSON.stringify(data));

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // Ghép: [iv (12 bytes)] + [ciphertext]
  const combined = new Uint8Array(12 + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), 12);

  return bytesToBase64(combined);
}

/**
 * Giải mã chuỗi được tạo bởi {@link encrypt}.
 * Trả về dữ liệu gốc.
 *
 * @param {string} token  Chuỗi base64 do encrypt() tạo ra
 * @returns {Promise<unknown>}
 */
export async function decrypt(token) {
  const key = await getKey();
  const combined = base64ToBytes(token);

  const iv = combined.slice(0, 12);
  const cipher = combined.slice(12);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher
  );

  return JSON.parse(new TextDecoder().decode(plainBuffer));
}
