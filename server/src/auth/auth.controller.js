import * as authService from "./auth.service.js";

export const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: "Registration failed" });
    }
};

export const login = async (req, res) => {
    try {
        const token = await authService.loginUser(req.body);
        res.json({ token });
    } catch {
        res.status(401).json({ error: "Invalid credentials" });
    }
};
