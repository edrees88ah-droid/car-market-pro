const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Clock, Coins, Check, X, Eye, 
  Phone, User, Car, Loader2, AlertCircle, TrendingUp 
} from 'lucide-react';
// في أعلى الملف تحت الـ imports مباشرة
const AdminDashboard = () => {
    // 1. تهيئة البيانات بقيم افتراضية لمنع الشاشة البيضاء
    const [data, setData] = useState({ 
        stats: { total_cars: 0, pending_count: 0, expected_revenue: 0 }, 
        pendingCars: [] 
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiBase = `${apiBase}`;
    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${apiBase}/api/admin/dashboard-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // التأكد من أن البيانات القادمة تحتوي على الهيكل المطلوب
            if (res.data) {
                setData({
                    stats: res.data.stats || { total_cars: 0, pending_count: 0, expected_revenue: 0 },
                    pendingCars: res.data.pendingCars || []
                });
            }
            setError(null);
        } catch (err) {
            console.error("خطأ في جلب بيانات الإدارة:", err);
            setError(err.response?.data?.error || "حدث خطأ أثناء جلب البيانات من السحاب");
        } finally {
            setLoading(false);
        }
    };

    // المصفوفة الفارغة [] تضمن تنفيذ الطلب مرة واحدة فقط عند فتح الصفحة
    useEffect(() => { 
        fetchAdminData(); 
    }, []);

    const getImgUrl = (path) => {
        if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
        return `${apiBase}/${path.replace(/\\/g, '/')}`;
    };

    const handleStatusUpdate = async (id, status) => {
        const action = status === 'active' ? "قبول ونشر" : "رفض";
        if (!window.confirm(`هل أنت متأكد من ${action} هذا الإعلان؟`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${apiBase}/api/admin/update-status/${id}`, 
                { newStatus: status },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert(`تم ${action} الإعلان بنجاح ✅`);
            fetchAdminData(); 
        } catch (err) {
            alert("فشل في تحديث الحالة");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={60} />
            <p className="font-black text-gray-500 text-xl italic">جاري جلب أسرار الإدارة من السحاب... 🛡️</p>
        </div>
    );

    if (error) return (
        <div className="p-20 text-center bg-gray-50 h-screen">
            <div className="bg-white p-10 rounded-[3rem] border shadow-xl inline-block max-w-md">
                <AlertCircle size={60} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-black text-red-700 mb-2">عذراً.. حدث خطأ</h2>
                <p className="text-gray-600 font-bold">{error}</p>
                <button onClick={() => window.location.href='/login'} className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold w-full">تسجيل دخول كمدير</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-12 font-sans" dir="rtl">
            {/* الرأس */}
            <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6 text-right">
                <div className="w-full">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-800 flex items-center gap-4 italic">
                        <ShieldCheck className="text-blue-600" size={50} /> لوحة تحكم الإدارة
                    </h1>
                    <p className="text-gray-500 mt-2 font-bold pr-2 border-r-4 border-blue-600">أهلاً بك يا مدير.. البيانات محدثة الآن 🐘☁️</p>
                </div>
                <button onClick={fetchAdminData} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center gap-2 font-bold text-gray-600 whitespace-nowrap">
                    تحديث البيانات 🔄
                </button>
            </div>

            {/* 📊 قسم الإحصائيات (استخدام الـ Optional Chaining ?. لمنع الانهيار) */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <StatCard 
                    title="إجمالي السيارات" 
                    value={data?.stats?.total_cars ?? 0} 
                    icon={<Car size={30}/>} 
                    color="from-blue-600 to-blue-400" 
                    label="سيارة مسجلة"
                />
                <StatCard 
                    title="إعلانات قيد الانتظار" 
                    value={data?.stats?.pending_count ?? 0} 
                    icon={<Clock size={30}/>} 
                    color="from-yellow-500 to-orange-400" 
                    label="تحتاج مراجعتك"
                    badge={data?.stats?.pending_count > 0}
                />
                <StatCard 
                    title="العمولات المتوقعة (1%)" 
                    value={`${Number(data?.stats?.expected_revenue ?? 0).toLocaleString()} $`} 
                    icon={<TrendingUp size={30}/>} 
                    color="from-green-600 to-emerald-400" 
                    label="بإنتظار إبراء الذمة"
                />
            </div>

            {/* 📋 قائمة مراجعة الإعلانات */}
            <div className="max-w-7xl mx-auto text-right">
                <h2 className="text-3xl font-black text-gray-800 mb-8 pr-4">طلبات النشر الجديدة ⏳</h2>
                
                {(!data?.pendingCars || data.pendingCars.length === 0) ? (
                    <div className="bg-white p-20 rounded-[4rem] text-center shadow-xl border-2 border-dashed border-gray-100">
                        <Check size={80} className="mx-auto text-green-500 mb-4 bg-green-50 p-4 rounded-full" />
                        <p className="text-2xl text-gray-400 font-black italic">لا توجد طلبات معلقة.. كل شيء ممتاز! ✅</p>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {data.pendingCars.map(car => (
                            <div key={car.id} className="bg-white p-6 md:p-8 rounded-[3rem] shadow-2xl shadow-gray-100 flex flex-col lg:flex-row gap-8 items-center border border-gray-50 group hover:border-blue-200 transition-all">
                                {/* صورة السيارة */}
                                <div className="relative w-full lg:w-72 h-48 rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-inner">
 <img 
  src={getImgUrl(car.main_image)} 
  className="w-full h-full object-cover" 
  alt="صورة السيارة" 
  onError={(e) => {
    console.log("فشل تحميل الصورة من المسارError Images Loading:", e.target.src);
    e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
  }}
/>
  </div>

                                {/* تفاصيل السيارة */}
                                <div className="flex-1 text-right space-y-4">
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-black text-gray-800">{car.brand} {car.model}</h3>
                                        <p className="text-blue-600 font-black text-2xl mt-1">{Number(car.price).toLocaleString()} {car.currency}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
                                            <User className="text-gray-400" size={20}/>
                                            <div><p className="text-[10px] text-gray-400 font-bold uppercase">صاحب الإعلان</p><p className="font-bold text-gray-700">{car.owner_name}</p></div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
                                            <Phone className="text-gray-400" size={20}/>
                                            <div><p className="text-[10px] text-gray-400 font-bold uppercase">رقم التواصل</p><p className="font-bold text-gray-700">{car.owner_phone}</p></div>
                                        </div>
                                    </div>
                                </div>

                                {/* أزرار القرار */}
                                <div className="flex flex-col gap-3 w-full lg:w-64">
                                    <button 
                                        onClick={() => handleStatusUpdate(car.id, 'active')}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                                    >
                                        <Check size={24}/> قبول ونشر ✅
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(car.id, 'rejected')}
                                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all"
                                    >
                                        <X size={24}/> رفض الإعلان
                                    </button>
                                    <Link to={`/car/${car.id}`} className="text-center text-blue-500 font-bold text-sm underline">معاينة الإعلان</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// مكون بطاقة الإحصائيات (StatCard)
const StatCard = ({ title, value, icon, color, label, badge }) => (
    <div className={`bg-gradient-to-br ${color} p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group`}>
        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
            {icon}
        </div>
        <div className="relative z-10 text-right">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">{icon}</div>
                {badge && <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg animate-pulse font-black">جديد</span>}
            </div>
            <h2 className="text-4xl font-black mb-1">{value}</h2>
            <p className="text-white/80 font-bold text-sm">{title}</p>
            <p className="text-white/60 text-[10px] mt-2 italic">{label}</p>
        </div>
    </div>
);


export default AdminDashboard;









