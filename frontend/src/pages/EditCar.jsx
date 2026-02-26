import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowRight, Loader2 } from 'lucide-react';
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const EditCar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        brand: '', model: '', price: '', year: '', mileage: '', description: ''
    });
    const [loading, setLoading] = useState(true);
   // const apiBase = '${apiBase}';
    useEffect(() => {
        // جلب البيانات الحالية للسيارة
        const fetchCar = async () => {
            try {
                // 🚨 تأكد أن هذا الرابط مطابق للباك إند (detail وليس شيئاً آخر)
                const res = await axios.get(`${apiBase}/api/cars/detail/${id}`);
                setFormData(res.data);
            } catch (err) {
                alert("خطأ في جلب بيانات السيارة");
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${apiBase}/api/cars/update/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("تم التحديث بنجاح! ✅");
            navigate('/my-cars'); // العودة لصفحة إعلاناتي
        } catch (err) {
            alert("فشل التحديث");
        }
    };

    if (loading) return <div className="text-center p-20 font-bold">جاري التحميل...</div>;

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-[3rem] my-10 border" dir="rtl">
            <h2 className="text-3xl font-black mb-8 text-gray-800 flex items-center gap-2">
                <Save className="text-blue-600" /> تعديل بيانات السيارة
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={formData.brand} placeholder="الماركة" className="p-4 bg-gray-50 rounded-2xl outline-none border focus:ring-2 ring-blue-500" 
                        onChange={(e) => setFormData({...formData, brand: e.target.value})} required />
                    
                    <input type="text" value={formData.model} placeholder="الموديل" className="p-4 bg-gray-50 rounded-2xl outline-none border focus:ring-2 ring-blue-500" 
                        onChange={(e) => setFormData({...formData, model: e.target.value})} required />
                </div>

                <input type="number" value={formData.price} placeholder="السعر" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border focus:ring-2 ring-blue-500" 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} required />

                <textarea value={formData.description} placeholder="الوصف" rows="4" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border focus:ring-2 ring-blue-500" 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} required></textarea>

                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl hover:bg-blue-700 transition-all">
                    حفظ التعديلات ✨
                </button>
            </form>
        </div>
    );
};


export default EditCar;


