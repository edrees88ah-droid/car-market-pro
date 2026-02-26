import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Trash2, Edit3, CheckCircle, Eye, MessageCircle, 
  ExternalLink, Plus, Loader2, AlertTriangle, Clock, CheckCheck 
} from 'lucide-react';
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const MyCars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
   // const apiBase = '${apiBase}';

    // 1. جلب البيانات من السيرفر
    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${apiBase}/api/cars/my-cars`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(res.data);
        } catch (err) {
            console.error("خطأ في جلب البيانات:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // 2. دالة تصحيح مسار الصورة
    const getFullImagePath = (path) => {
        if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
        const cleanPath = path.replace(/\\/g, '/');
        return `${apiBase}/${cleanPath}`;
    };

    // 3. دالة حذف السيارة
    const handleDelete = async (id) => {
        if (!window.confirm("⚠️ هل أنت متأكد من حذف هذا الإعلان نهائياً؟")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${apiBase}/api/cars/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(cars.filter(car => car.id !== id)); // تحديث القائمة فوراً
            alert("تم حذف الإعلان بنجاح");
        } catch (err) {
            alert("فشل في حذف الإعلان");
        }
    };

    // 4. دالة تحديد كمباع (إبراء ذمة)
    const handleMarkAsSold = async (id) => {
        if (!window.confirm("🤝 هل تم بيع السيارة فعلاً؟ سيتم إغلاق الإعلان ومطالبتك بالعمولة لإبراء ذمتك.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${apiBase}/api/cars/sold/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadData(); // إعادة تحميل البيانات لتحديث الحالة
        } catch (err) {
            alert("حدث خطأ أثناء تحديث الحالة");
        }
    };

    // 5. دالة التواصل لإرسال الإيصال
    const sendCommissionReceipt = (car) => {
        const adminPhone = "249121016152"; // رقم الإدارة
        const commission = (car.price * 0.01).toLocaleString();
        const message = `مرحباً إدارة سوق سياراتي، قمت ببيع سيارتي (${car.brand} ${car.model}) وأرغب في إرسال إيصال تحويل العمولة (${commission} ${car.currency}) لإبراء ذمتي من الإعلان رقم #${car.id}`;
        window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={50} />
            <p className="font-bold text-gray-500 italic">جاري جلب إعلاناتك من السحاب...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 font-sans" dir="rtl">
            {/* رأس الصفحة */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 italic">إعلاناتي</h1>
                    <p className="text-gray-500 mt-1 font-medium">تحكم في إعلاناتك وتابع حالة المبيعات</p>
                </div>
                <Link to="/add-car" className="bg-blue-600 text-white px-8 py-4 rounded-[2rem] font-bold flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
                    <Plus size={24}/> إضافة سيارة جديدة
                </Link>
            </div>

            {/* قائمة السيارات */}
            <div className="grid gap-8">
                {cars.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 shadow-inner">
                        <p className="text-gray-400 text-xl font-bold italic">لا توجد لديك إعلانات حالياً</p>
                    </div>
                ) : (
                    cars.map(car => (
                        <div key={car.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col gap-6 relative transition-all hover:border-blue-100 group">
                            
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                {/* الصورة */}
                                <div className="w-full md:w-64 h-44 rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-inner relative">
                                    <img 
                                        src={getFullImagePath(car.main_image)} 
                                        alt="Car" 
                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${car.status === 'sold' ? 'grayscale' : ''}`}
                                    />
                                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 font-bold shadow-lg">
                                        <Eye size={14}/> {car.views || 0}
                                    </div>
                                </div>

                                {/* التفاصيل */}
                                <div className="flex-1 text-right space-y-2">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-2xl font-black text-gray-800">{car.brand} {car.model}</h3>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm ${
                                            car.status === 'active' ? 'bg-green-100 text-green-700' : 
                                            car.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {car.status === 'active' ? <CheckCheck size={14}/> : <Clock size={14}/>}
                                            {car.status === 'active' ? 'منشور ✅' : car.status === 'pending' ? 'قيد المراجعة ⏳' : 'مباع 🤝'}
                                        </span>
                                    </div>
                                    <p className="text-blue-600 font-black text-2xl">{Number(car.price).toLocaleString()} {car.currency}</p>
                                    <div className="flex gap-4 text-xs text-gray-400 font-bold italic">
                                        <span>📅 موديل {car.year}</span>
                                        <span>🛣️ {Number(car.mileage).toLocaleString()} كم</span>
                                    </div>
                                </div>

                                {/* الأزرار السريعة */}
                                <div className="flex flex-wrap gap-3 justify-center">
                                    <Link to={`/car/${car.id}`} className="p-4 bg-gray-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition shadow-sm" title="عرض المعاينة"><ExternalLink size={24}/></Link>
                                    <Link to={`/edit-car/${car.id}`} className="p-4 bg-gray-50 text-orange-600 rounded-2xl hover:bg-orange-600 hover:text-white transition shadow-sm" title="تعديل"><Edit3 size={24}/></Link>
                                    <button onClick={() => handleDelete(car.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition shadow-sm" title="حذف نهائي"><Trash2 size={24}/></button>
                                    
                                    {car.status === 'active' && (
                                        <button 
                                            onClick={() => handleMarkAsSold(car.id)}
                                            className="bg-green-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95"
                                        >
                                            <CheckCircle size={20}/> تم البيع؟
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ⚖️ قسم إبراء الذمة (يظهر فقط عند البيع) */}
                            {car.status === 'sold' && (
                                <div className={`mt-4 p-6 rounded-[2rem] border-2 flex flex-col md:flex-row justify-between items-center gap-6 ${car.payment_verified ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100 animate-pulse-slow'}`}>
                                    <div className="flex items-center gap-4 text-right">
                                        <div className={`p-4 rounded-full ${car.payment_verified ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <AlertTriangle className={car.payment_verified ? 'text-green-600' : 'text-red-600'} size={32}/>
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-gray-800">العمولة المستحقة: {((car.price * 0.01).toLocaleString())} {car.currency}</p>
                                            <p className={`font-bold text-sm ${car.payment_verified ? 'text-green-600' : 'text-red-600'}`}>
                                                {car.payment_verified ? "✅ تم تأكيد براءة الذمة بنجاح. شكراً لأمانتك." : "⚠️ ذمتك معلقة.. يرجى دفع العمولة 1% وإرسال الإيصال للإدارة."}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {!car.payment_verified && (
                                        <button 
                                            onClick={() => sendCommissionReceipt(car)}
                                            className="bg-green-500 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-2 shadow-xl hover:bg-green-600 transition-all active:scale-95"
                                        >
                                            <MessageCircle size={24}/> إرسال الإيصال (واتساب)
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


export default MyCars;


