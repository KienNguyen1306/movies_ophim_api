/**
 * src/lib/db.js
 * MySQL connection pool — dùng chung cho toàn bộ API routes.
 *
 * Biến môi trường cần thiết (đặt trong .env.local):
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */

import mysql from "mysql2/promise";

const globalForDb = globalThis;

if (!globalForDb._mysqlPool) {
  globalForDb._mysqlPool = mysql.createPool({
    host:              process.env.DB_HOST     ?? "localhost",
    port:              Number(process.env.DB_PORT ?? 3306),
    user:              process.env.DB_USER     ?? "root",
    password:          process.env.DB_PASSWORD ?? "",
    database:          process.env.DB_NAME     ?? "cinetube",
    waitForConnections: true,
    connectionLimit:   10,
    queueLimit:        0,
    charset:           "utf8mb4",
  });
}

/** @type {import('mysql2/promise').Pool} */
const pool = globalForDb._mysqlPool;
export default pool;
