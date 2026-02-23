import jwt from 'jsonwebtoken';

const JWT_SECRET = "MY_SUPER_SECRET_KEY_2024"; // نفس المفتاح في ملف auth.js

const verifyToken = (req, res, next) => {
    // جلب التوكن من الهيدر (Bearer Token)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: "غير مسموح، يجب تسجيل الدخول أولاً" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // حفظ بيانات المستخدم (id, role) في الطلب
        next();
    } catch (err) {
        return res.status(401).json({ error: "جلسة الدخول انتهت، يرجى تسجيل الدخول مرة أخرى" });
    }
};

export default verifyToken;