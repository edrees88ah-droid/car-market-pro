import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Loader2, CarFront } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import CarCard from '../components/CarCard.jsx';

const Home = ({ cars, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // 1️⃣ دالة توحيد العملات
  const getCurrencyName = (code) => {
    const currencies = { 'SDG': 'ج.س', 'SAR': 'ريال', 'EGP': 'ج.م', 'USD': '$', 'AED': 'درهم' };
    return currencies[code] || code;
  };

  // 2️⃣ دالة ذكية لمعالجة مسار الصورة (سحابي أو محلي)
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
    if (path.startsWith('http')) return path; // رابط ImgBB جاهز
    return `${apiBase}/${path.replace(/\\/g, '/')}`; // رابط محلي مع تصحيح الميول
  };

  // 3️⃣ منطق الفلترة والبحث
  const filteredCars = cars?.filter(car => 
    car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 font-sans" dir="rtl">
      
      {/* 🔍 شريط البحث العصري */}
      <div className="max-w-2xl mx-auto mb-12 relative group">
        <input 
          type="text" 
          placeholder="ابحث عن ماركة، موديل، أو مواصفات..." 
          className="w-full p-6 pr-16 rounded-[2.5rem] border-none bg-white shadow-2xl outline-none focus:ring-4 focus:ring-blue-100 text-lg transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute right-6 top-6 text-blue-600 group-hover:scale-110 transition-transform" size={30} />
      </div>

      <main>
        {/* 📍 قسم الخريطة التفاعلية */}
        <div className="mb-12 text-right">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center justify-start gap-2 italic">
            <MapPin size={24} className="text-red-500 animate-bounce" /> مواقع السيارات النشطة على الخريطة
          </h3>
          <div className="h-[450px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white z-0">
            <MapContainer center={[15.5007, 32.5599]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {filteredCars.map(car => (
                (car.lat && car.lng) && (
                  <Marker key={car.id} position={[parseFloat(car.lat), parseFloat(car.lng)]}>
                    <Popup>
                      {/* حل مشكلة الخطأ #527: نستخدم div فقط ولا نستخدم p للتداخل */}
                      <div className="text-right font-sans p-1" dir="rtl" style={{ minWidth: '160px' }}>
                         <div className="rounded-xl overflow-hidden h-24 mb-2 bg-gray-100 shadow-sm">
                            <img 
                              src={getImageUrl(car.main_image)} 
                              className="w-full h-full object-cover" 
                              alt="car"
                              onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
                            />
                         </div>
                         <div className="font-black text-blue-800 text-sm mb-1">{car.brand} {car.model}</div>
                         <div className="text-xs font-bold text-green-600 mb-2">
                           {Number(car.price).toLocaleString()} {getCurrencyName(car.currency)}
                         </div>
                         <Link 
                           to={`/car/${car.id}`} 
                           className="mt-2 text-center block bg-blue-600 text-white text-[10px] py-2 rounded-xl font-black no-underline shadow-lg hover:bg-blue-700 transition-colors"
                         >
                            عرض التفاصيل كاملة
                         </Link>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>

        {/* 🚗 قسم عرض بطاقات السيارات */}
        <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-3xl font-black text-gray-800 border-r-8 border-blue-600 pr-4 italic">
                المعروض حالياً <span className="text-blue-600 text-lg">({filteredCars.length})</span>
            </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={50} />
            <p className="text-gray-400 font-bold italic">جاري جلب السيارات من السحاب... 🐘☁️</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCars.length > 0 ? (
                filteredCars.map(car => (
                    <CarCard key={car.id} car={car} />
                ))
            ) : (
                <div className="col-span-full text-center py-24 bg-white rounded-[4rem] shadow-inner border-2 border-dashed border-gray-100">
                    <CarFront size={80} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-xl text-gray-400 font-black italic">عذراً.. لا توجد سيارات تطابق بحثك حالياً</p>
                </div>
            )}
          </div>
        )}
      </main>

      {/* لمسة تجميلية في أسفل الصفحة */}
      <div className="mt-20 text-center opacity-30 select-none">
          <p className="text-gray-400 font-bold italic">سوق سياراتي السوداني - منصة الأمان والشفافية</p>
      </div>
    </div>
  );
};

export default Home;
