import express from 'express';
import pool from '../db.js';
import verifyToken from '../middleware/authMiddleware.js';
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const router = express.Router();

// 1. جلب عدد الإشعارات غير المقروءة (للجرس في الـ Navbar)
router.get('/unread-count', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT COUNT(*)::INT FROM notifications WHERE user_id = $1 AND is_read = FALSE",
            [userId]
        );
        res.json({ count: result.rows[0].count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. جلب كافة الإشعارات الخاصة بالمستخدم
router.get('/my-all', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. تحديد كافة الإشعارات كـ "مقروءة" (يُستدعى عند فتح صفحة الإشعارات)
router.patch('/mark-all-read', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await pool.query(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = $1",
            [userId]
        );
        res.json({ message: "تم تحديث كافة الإشعارات" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


export default router;
