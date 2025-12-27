import dotenv from "dotenv";
import pg from "pg";

dotenv.config(); // ✅ MUST be here, before using process.env

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD), // force string
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
});

export default pool;
