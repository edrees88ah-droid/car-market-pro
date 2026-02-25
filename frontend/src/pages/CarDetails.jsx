import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MessageCircle, Phone, Calendar, Gauge, 
  ArrowRight, ArrowLeft, User, Eye, MapPin 
} from 'lucide-react';
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const apiBase = '${apiBase}';

  useEffect(() => {
    // جلب تفاصيل السيارة مع كل صورها من المسار الجديد
    axios.get(`${apiBase}/api/cars/detail/${id}`)
      .then(res => {
        setCar(res.data);
      })
      .catch(err => console.error("خطأ في جلب التفاصيل:", err));
  }, [id]);

  if (!car) return (
    <div className="p-20 text-center animate-pulse font-bold text-blue-600">
      جاري تحميل معرض السيارة... ✨
    </div>
  );

  // دالة تصحيح مسار الصورة (تحويل ميول الويندوز)
  const getImgUrl = (path) => {
    return path ? `${apiBase}/${path.replace(/\\/g, '/')}` : '/placeholder.jpg';
  };

  const nextImg = () => setCurrentIndex(prev => (prev === car.images.length - 1 ? 0 : prev + 1));
  const prevImg = () => setCurrentIndex(prev => (prev === 0 ? car.images.length - 1 : prev - 1));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-right font-sans" dir="rtl">
      {/* زر العودة */}
      <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-6 hover:gap-4 transition-all">
        <ArrowRight size={20} /> العودة للمعرض العام
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 md:p-10 rounded-[3.5rem] shadow-2xl border border-gray-50">
        
        {/* 📸 Slider الصور المطور */}
        <div className="space-y-6">
          <div className="relative h-[300px] md:h-[500px] bg-gray-100 rounded-[3rem] overflow-hidden group shadow-inner border-4 border-white">
             
             {car.images && car.images.length > 0 ? (
               <>
                <img 
                  src={getImgUrl(car.images[currentIndex].image_path)} 
                  alt={car.model}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                
                {car.images.length > 1 && (
                  <>
                    <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition hover:bg-blue-600 hover:text-white">
                      <ArrowLeft size={24} />
                    </button>
                    <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition hover:bg-blue-600 hover:text-white">
                      <ArrowRight size={24} />
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-widest">
                      {currentIndex + 1} / {car.images.length}
                    </div>
                  </>
                )}
               </>
             ) : (
               <div className="flex items-center justify-center h-full text-gray-400 font-bold italic">لا توجد صور متوفرة</div>
             )}
          </div>

          {/* الصور المصغرة (Thumbnails) */}
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {car.images && car.images.map((img, i) => (
              <img 
                key={i} 
                src={getImgUrl(img.image_path)} 
                onClick={() => setCurrentIndex(i)} 
                className={`w-24 h-20 object-cover rounded-2xl cursor-pointer border-4 transition-all ${currentIndex === i ? 'border-blue-600 scale-105' : 'border-white opacity-60 hover:opacity-100'}`} 
              />
            ))}
          </div>
        </div>

        {/* 📝 معلومات السيارة */}
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-5xl font-black text-gray-800 leading-tight">{car.brand} <br/> <span className="text-blue-600">{car.model}</span></h1>
              <div className="bg-blue-50 text-blue-600 p-2 rounded-2xl flex items-center gap-1 font-bold text-sm">
                <Eye size={16}/> {car.views || 0}
              </div>
            </div>
            
            <p className="text-3xl font-black text-green-600 mt-4 bg-green-50 inline-block px-6 py-2 rounded-2xl">
              {Number(car.price).toLocaleString()} 
              <span className="text-sm mr-2 font-bold opacity-70">
                {car.currency === 'SDG' ? 'جنيه سوداني' : 
                 car.currency === 'EGP' ? 'جنيه مصري' : 
                 car.currency === 'SAR' ? 'ريال سعودي' : 
                 car.currency === 'USD' ? 'دولار أمريكي' : car.currency}
              </span>
            </p>
          </div>

          {/* المواصفات السريعة */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
               <Calendar className="text-blue-500" size={30}/>
               <div><p className="text-xs text-gray-400">سنة الصنع</p><p className="font-black text-lg text-gray-700">{car.year}</p></div>
             </div>
             <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
               <Gauge className="text-orange-500" size={30}/>
               <div><p className="text-xs text-gray-400">الممشى</p><p className="font-black text-lg text-gray-700">{Number(car.mileage).toLocaleString()} كم</p></div>
             </div>
          </div>

          {/* وصف البائع */}
          <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 relative">
             <h4 className="font-bold mb-3 text-gray-500 flex items-center gap-2 italic">
               <User size={18}/> تفاصيل من المالك:
             </h4>
             <p className="text-gray-700 leading-relaxed font-medium">"{car.description || 'لا يوجد وصف إضافي'}"</p>
          </div>

          {/* أزرار التواصل */}
          <div className="flex flex-col gap-4 pt-4">
            <button 
              onClick={() => window.open(`https://wa.me/${car.phone}?text=مرحباً، أنا مهتم بسيارتك ${car.brand} ${car.model} المعروضة في سوق سياراتي.`, '_blank')} 
              className="w-full bg-green-500 text-white py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-green-600 shadow-2xl shadow-green-200 transition-all active:scale-95"
            >
               <MessageCircle size={28} /> تواصل عبر واتساب
            </button>
            <a 
              href={`tel:${car.phone}`}
              className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all active:scale-95"
            >
               <Phone size={28} /> اتصال هاتفي
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};


export default CarDetails;

