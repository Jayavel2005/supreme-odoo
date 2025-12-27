import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const registerUser = async ({ name, email, password, role_id }) => {
    if (!email || !password) throw new Error("INVALID_INPUT");

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO auth.users (name, email, password_hash, role_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, role_id`,
        [name, email, hashedPassword, role_id]
    );

    return result.rows[0];
};

export const loginUser = async ({ email, password }) => {
    const result = await pool.query(
        "SELECT * FROM auth.users WHERE email = $1",
        [email]
    );

    if (!result.rows.length) throw new Error("INVALID_CREDENTIALS");

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error("INVALID_CREDENTIALS");

    const token = jwt.sign(
        { id: user.id, role_id: user.role_id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return token;
};
