import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000"
dotenv.config();
const router = express.Router();
// ✅ السطر المحدث: الآن الكود يقرأ المفتاح من ملف .env المخفي
const JWT_SECRET = process.env.JWT_SECRET;

// 1. إنشاء حساب جديد (Register)
router.post('/register', async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExist.rows.length > 0) return res.status(400).json({ error: "الإيميل مسجل مسبقاً" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role",
            [name, email, hashedPassword, phone, 'user']
        );

        const user = newUser.rows[0];
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: "فشل التسجيل: " + err.message });
    }
});

// 2. تسجيل الدخول (Login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: "بيانات الدخول خاطئة" });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "بيانات الدخول خاطئة" });

        const token = jwt.sign({ id: user.id, role: user.role },
             JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: "خطأ في السيرفر" });
    }
});


export default router;
