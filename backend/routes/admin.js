import express from 'express';
import pool from '../db.js';
import verifyToken from '../middleware/authMiddleware.js'; 
import sendEmail from '../utils/sendEmail.js';
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const router = express.Router();

// 🛡️ حارس التأكد من الإدارة (المحرك الداخلي)
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        console.log("🚫 محاولة دخول مرفوضة من مستخدم رتبته:", req.user?.role);
        res.status(403).json({ error: "عذراً.. هذه الصفحة للمدراء فقط!" });
    }
};

// 1. المسار الرئيسي: جلب كل بيانات لوحة التحكم
// الرابط النهائي: ${apiBase}/api/admin/dashboard-data
router.get('/dashboard-data', verifyToken, isAdmin, async (req, res) => {
    try {
        console.log("✅  Enter Admin Saveدخول آمن للمدير رقم:", req.user.id);

        // أ- جلب الإحصائيات (حل مشكلة NaN)
        const statsQuery = `
            SELECT 
                COUNT(*)::INT as total_cars,
                COUNT(*) FILTER (WHERE status = 'pending')::INT as pending_count,
                COALESCE(SUM(price * 0.01) FILTER (WHERE status = 'active' OR status = 'sold'), 0)::FLOAT as expected_revenue
            FROM cars
        `;
        const statsResult = await pool.query(statsQuery);

        // ب- جلب السيارات المعلقة (ربط الصور والمالك)
        const carsQuery = `
            SELECT 
                c.*, 
                COALESCE(u.name, 'مستخدم غير معروف') as owner_name, 
                COALESCE(u.phone, 'بدون رقم') as owner_phone,
                (SELECT image_path FROM car_images WHERE car_id = c.id LIMIT 1) as main_image
            FROM cars c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.status = 'pending'
            ORDER BY c.created_at DESC
        `;
        const carsResult = await pool.query(carsQuery);

        res.json({
            stats: statsResult.rows[0] || { total_cars: 0, pending_count: 0, expected_revenue: 0 },
            pendingCars: carsResult.rows || []
        });

    } catch (err) {
        console.error("❌ خطأ الإدارة الحقيقي:", err.message);
        res.status(500).json({ error: "فشل في جلب البيانات من السحاب" });
    }
});

// تحديث حالة السيارة (قبول أو رفض) مع إرسال إيميل
router.patch('/update-status/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { newStatus } = req.body; 

    try {
        await pool.query("UPDATE cars SET status = $1 WHERE id = $2", [newStatus, id]);

        const carInfo = await pool.query(
            `SELECT c.brand, c.model, c.user_id, u.email 
             FROM cars c JOIN users u ON c.user_id = u.id WHERE c.id = $1`, [id]
        );

        if (carInfo.rows.length > 0) {
            const { brand, model, user_id, email } = carInfo.rows[0];
            const carName = `${brand} ${model}`;

            // 1. إرسال الإيميل (الذي برمجناه سابقاً)
            await sendEmail(email, carName, newStatus);

            // 2. إضافة إشعار داخلي في جدول notifications 🔥
            const title = newStatus === 'active' ? "✅ تم قبول إعلانك" : "❌ تم رفض إعلانك";
            const message = newStatus === 'active' 
                ? `مبروك! تم تفعيل إعلان سيارتك (${carName}) وهو الآن متاح للجميع.`
                : `نعتذر، تم رفض إعلان سيارتك (${carName}). يرجى مراجعة شروط النشر.`;

            await pool.query(
                "INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)",
                [user_id, title, message]
            );
        }

        res.json({ message: "تم التحديث وإرسال الإشعارات بنجاح" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});// 3. تأكيد براءة الذمة (تأكيد استلام العمولة)
router.patch('/verify-payment/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("UPDATE cars SET payment_verified = 1 WHERE id = $1", [id]);
        res.json({ message: "تم تأكيد براءة الذمة بنجاح ✅" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    // داخل ملف admin.js في نهاية مسار dashboard-data
//res.json({
    //stats: statsResult.rows[0] || { total_cars: 0, pending_count: 0, expected_revenue: 0 },
   // pendingCars: carsResult.rows || []
//});
});


export default router;
