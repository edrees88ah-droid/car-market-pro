import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import pool from '../db.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// --- 1. إعداد ملتر لتخزين الصور مؤقتاً في الذاكرة ---
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// --- 2. دالة إرسال الصورة إلى ImgBB وأخذ الرابط ---
const uploadToImgBB = async (fileBuffer) => {
    try {
        const form = new FormData();
        form.append('image', fileBuffer.toString('base64'));
        const apiKey = process.env.IMGBB_API_KEY; 

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, form, {
            headers: { ...form.getHeaders() }
        });
        return response.data.data.url;
    } catch (error) {
        console.error("خطأ في رفع الصورة لـ ImgBB:", error.message);
        throw new Error("فشل الرفع السحابي");
    }
};

// --- 3. إضافة سيارة جديدة ---
router.post('/add', verifyToken, upload.array('images', 10), async (req, res) => {
    const client = await pool.connect();
    try {
        const { brand, model, year, price, mileage, description, fuel_type, transmission, currency, lat, lng } = req.body;
        const userId = req.user.id;

        await client.query('BEGIN');

        const carRes = await client.query(
            `INSERT INTO cars (brand, model, year, price, mileage, description, fuel_type, transmission, currency, lat, lng, user_id, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending') RETURNING id`,
            [brand, model, year, price, mileage, description, fuel_type, transmission, currency, lat, lng, userId]
        );
        const carId = carRes.rows[0].id;

        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                const remoteUrl = await uploadToImgBB(file.buffer);
                await client.query("INSERT INTO car_images (car_id, image_path) VALUES ($1, $2)", [carId, remoteUrl]);
            }
        }

        // تنبيه المدير
        const adminRes = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        if (adminRes.rows.length > 0) {
            await client.query(
                "INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)",
                [adminRes.rows[0].id, "🆕 إعلان جديد", `سيارة ${brand} ${model} تنتظر المراجعة.`]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "تم نشر الإعلان ورفع الصور بنجاح! ✅", carId });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// --- 4. المعرض العام ---
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

// --- 5. إعلاناتي ---
router.get('/my-cars', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, (SELECT image_path FROM car_images WHERE car_id = c.id LIMIT 1) as main_image
            FROM cars c WHERE c.user_id = $1 ORDER BY c.created_at DESC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 6. تفاصيل السيارة (تم إصلاح القوس الزائد هنا ✅) ---
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE cars SET views = COALESCE(views, 0) + 1 WHERE id = $1", [id]);
        const carRes = await pool.query(
            `SELECT c.*, u.name as seller_name, u.phone FROM cars c 
             JOIN users u ON c.user_id = u.id WHERE c.id = $1`, [id]
        );
        if (carRes.rows.length === 0) return res.status(404).json({ error: "غير موجود" });
        const imagesRes = await pool.query("SELECT image_path FROM car_images WHERE car_id = $1", [id]);
        res.json({ ...carRes.rows[0], images: imagesRes.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 7. حذف الإعلان ---
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        await pool.query("DELETE FROM cars WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
        res.json({ message: "تم حذف الإعلان" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

//--- 8. تعديل بيانات السيارة
router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { brand, model, year, price, mileage, description, fuel_type, transmission, currency } = req.body;
        const result = await pool.query(
            `UPDATE cars SET brand=$1, model=$2, year=$3, price=$4, mileage=$5, description=$6, fuel_type=$7, transmission=$8, currency=$9
             WHERE id=$10 AND user_id=$11`,
            [brand, model, year, price, mileage, description, fuel_type, transmission, currency, id, req.user.id]
        );
        res.json({ message: "تم التحديث بنجاح ✅" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 9. تحديد كمباع ---
router.patch('/sold/:id', verifyToken, async (req, res) => {
    try {
        await pool.query("UPDATE cars SET status = 'sold' WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
        res.json({ message: "تم تحويل الحالة لمباعة" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
