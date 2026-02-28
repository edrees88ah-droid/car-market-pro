const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Gauge, Calendar, ArrowLeft, CheckCircle2, Eye } from 'lucide-react';
// في أعلى الملف تحت الـ imports مباشرة
const CarCard = ({ car }) => {
  // 1. توحيد القاعدة الأساسية للرابط (بدون ميلة في الآخر لتجنب التكرار)
 const apiBase = `${apiBase}`; 
  const isSold = car.status === 'sold';
  // 2. معالجة المسار بشكل احترافي
  const getImageUrl = () => {
    if (!car.main_image) return 'https://via.placeholder.com/400x300?text=No+Image';
    // تحويل \ الخاصة بالويندوز إلى / وتجنب تكرار الميول
   const cleanPath = car.main_image.replace(/\\/g, '/');
    return `${apiBase}/${cleanPath}`;
 };
//const getFullImagePath = (path) => {
 // if (!path) return "/placeholder.jpg";
  // إذا كان الرابط يبدأ بـ http (يعني قادم من Cloudinary) استعمله كما هو ✅
 // if (path.startsWith('http')) return path;
//};
  const getFullImagePath = (path) => {
    if (!path) return "/placeholder.jpg";
    // إذا كان الرابط يبدأ بـ http، نعرضه كما هو فوراً ✅
    if (path.startsWith('https')) return path;
    // للحالات القديمة (إذا كان لسه في صور localhost)
    return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
};
  const getCurrencyName = (code) => {
    const currencies = { 'SDG': 'ج.س', 'SAR': 'ريال', 'EGP': 'ج.م', 'USD': '$', 'AED': 'درهم' };
    return currencies[code] || code;
  };

  return (
    <div className={`group bg-white rounded-[2.5rem] shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col ${isSold ? 'opacity-80' : ''}`} dir="rtl">
      
      {/* 📸 قسم الصورة */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        <img 
          src={getImageUrl()} 
          alt={`${car.brand} ${car.model}`}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSold ? 'grayscale' : ''}`}
          onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Error+Loading"; }}
        />

        {/* شارة المشاهدات 👁️ */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 font-bold">
          <Eye size={12} /> {car.views || 0}
        </div>

        {isSold ? (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-red-600 text-white font-black px-6 py-2 rounded-2xl text-sm shadow-2xl transform -rotate-12 border-2 border-white tracking-widest">تـم البيـع 🤝</div>
          </div>
        ) : (
          <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-1.5 rounded-xl shadow-xl font-black text-sm">
            {Number(car.price).toLocaleString()} <small className="mr-1">{getCurrencyName(car.currency)}</small>
          </div>
        )}
      </div>

      {/* 📝 التفاصيل */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-black text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
          {car.brand} {car.model}
        </h3>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl text-gray-600 font-bold text-xs">
            <Calendar size={14} className="text-blue-500" /> موديل {car.year}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl text-gray-600 font-bold text-xs">
            <Gauge size={14} className="text-green-500" /> {Number(car.mileage).toLocaleString()} كم
          </div>
        </div>

        <Link 
          to={`/car/${car.id}`} 
          className={`mt-auto w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            isSold 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
          }`}
        >
          {isSold ? (
            <><CheckCircle2 size={18} /> إعلان منتهي</>
          ) : (
            <>عرض التفاصيل <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /></>
          )}
        </Link>
      </div>
    </div>
  );
};


export default CarCard;











