import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db.js';
import verifyToken from '../middleware/authMiddleware.js';
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const router = express.Router();

// --- 1. إعداد تخزين الصور (Multer) ---
//const storage = multer.diskStorage({
   // destination: 'uploads/',
   // filename: (req, file, cb) => {
        // توليد اسم فريد لكل صورة لمنع التداخل
       // cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
   // }
//});
// backend/routes/cars.js

const storage = multer.diskStorage({
    // التعديل السحري هنا: استخدم المجلد المؤقت الخاص بـ Vercel
    destination: '/tmp', 
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage, 
    limits: { fileSize: 2 * 1024 * 1024 } // حد 2 ميجا لكل صورة
});

// ==========================================
// 🚀 مسار إضافة سيارة جديدة (مع تنبيه آلي للمدير)
// ==========================================
router.post('/add', verifyToken, upload.array('images', 10), async (req, res) => {
    const client = await pool.connect(); // استخدام client للتعامل مع الـ Transaction
    try {
        const { brand, model, year, price, mileage, description, fuel_type, transmission, currency, lat, lng } = req.body;
        const userId = req.user.id; // مأخوذ من توكن المستخدم الذي رفع الإعلان

        await client.query('BEGIN'); // بدء عملية الحفظ المتسلسل

        // أ- حفظ بيانات السيارة في جدول cars
        const carRes = await client.query(
            `INSERT INTO cars (brand, model, year, price, mileage, description, fuel_type, transmission, currency, lat, lng, user_id, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending') RETURNING id`,
            [brand, model, year, price, mileage, description, fuel_type, transmission, currency, lat, lng, userId]
        );
        const carId = carRes.rows[0].id;

        // ب- حفظ مسارات الصور في جدول car_images
        if (req.files && req.files.length > 0) {
            const imageQuery = "INSERT INTO car_images (car_id, image_path) VALUES ($1, $2)";
            for (let file of req.files) {
                await client.query(imageQuery, [carId, file.path]);
            }
        }

        // ج- إرسال تنبيه للمدير (البحث عن معرف المدير تلقائياً لحل مشكلة الخطأ) ✅
        const adminResult = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        const adminId = adminResult.rows.length > 0 ? adminResult.rows[0].id : null;

        if (adminId) {
            await client.query(
                "INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)",
                [adminId, "🆕 إعلان جديد بانتظار المراجعة", `قام مستخدم بإضافة سيارة ${brand} ${model}. يرجى مراجعتها وتفعيلها.`]
            );
        }

        await client.query('COMMIT'); // اعتماد الحفظ النهائي
        res.status(201).json({ message: "تم نشر الإعلان بنجاح! بانتظار مراجعة الإدارة.", carId });

    } catch (err) {
        await client.query('ROLLBACK'); // إلغاء كل شيء في حال حدوث أي خطأ
        console.error("خطأ أثناء الإضافة:", err.message);
        res.status(500).json({ error: "فشل في حفظ البيانات: " + err.message });
    } finally {
        client.release(); // إنهاء الاتصال بالقاعدة لضمان الأداء
    }
});

// ==========================================
// 🌍 المسارات العامة (المعرض والتفاصيل)
// ==========================================

// جلب السيارات النشطة فقط للمعرض العام
router.get('/all', async (req, res) => {
    try {
        const query = `
            SELECT c.*, (SELECT image_path FROM car_images WHERE car_id = c.id LIMIT 1) as main_image
            FROM cars c WHERE c.status = 'active' ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// جلب تفاصيل سيارة واحدة مع صورها وبيانات المالك
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // تحديث المشاهدات
        await pool.query("UPDATE cars SET views = COALESCE(views, 0) + 1 WHERE id = $1", [id]);
        
        const carQuery = `
            SELECT c.*, u.name as seller_name, u.phone as phone
            FROM cars c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = $1
        `;
        const carRes = await pool.query(carQuery, [id]);
        
        if (carRes.rows.length === 0) return res.status(404).json({ error: "السيارة غير موجودة" });
        
        const imagesRes = await pool.query("SELECT image_path FROM car_images WHERE car_id = $1", [id]);
        
        res.json({ ...carRes.rows[0], images: imagesRes.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 🛠️ مسارات التحكم (تعديل، حذف، بيع)
// ==========================================

// جلب إعلانات المستخدم المسجل حالياً
router.get('/my-cars', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT c.*, (SELECT image_path FROM car_images WHERE car_id = c.id LIMIT 1) as main_image
            FROM cars c WHERE c.user_id = $1 ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// تعديل بيانات السيارة
router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { brand, model, year, price, mileage, description, fuel_type, transmission, currency } = req.body;
        const result = await pool.query(
            `UPDATE cars SET brand=$1, model=$2, year=$3, price=$4, mileage=$5, description=$6, fuel_type=$7, transmission=$8, currency=$9
             WHERE id=$10 AND user_id=$11`,
            [brand, model, year, price, mileage, description, fuel_type, transmission, currency, id, req.user.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: "غير مسموح بالتعديل" });
        res.json({ message: "تم التحديث بنجاح ✅" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// تحديد السيارة كمباعة (Sold) لإبراء الذمة
router.patch('/sold/:id', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "UPDATE cars SET status = 'sold' WHERE id = $1 AND user_id = $2", 
            [req.params.id, req.user.id]
        );
        res.json({ message: "تم تحويل الحالة لمباعة بنجاح 🤝" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// حذف الإعلان نهائياً
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM cars WHERE id = $1 AND user_id = $2", 
            [req.params.id, req.user.id]
        );
        res.json({ message: "تم حذف الإعلان بنجاح 🗑️" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


export default router;

