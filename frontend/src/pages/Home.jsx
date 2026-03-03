import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Loader2, CarFront } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import CarCard from '../components/CarCard.jsx';

const Home = ({ cars, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [canRenderMap, setCanRenderMap] = useState(false); // حارس الخريطة ✅
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // تفعيل الخريطة فقط بعد تحميل الصفحة لضمان عدم الانهيار
  useEffect(() => {
    setCanRenderMap(true);
  }, []);

  const getCurrencyName = (code) => {
    const currencies = { 'SDG': 'ج.س', 'SAR': 'ريال', 'EGP': 'ج.م', 'USD': '$' };
    return currencies[code] || code;
  };

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
    if (path.startsWith('http')) return path;
    return `${apiBase}/${path.replace(/\\/g, '/')}`;
  };

  const filteredCars = cars?.filter(car => 
    car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 font-sans" dir="rtl text-right">
      
      {/* 🔍 شريط البحث */}
      <div className="max-w-2xl mx-auto mb-10 relative">
        <input 
          type="text" placeholder="ابحث عن ماركة أو موديل..." 
          className="w-full p-5 pr-14 rounded-[2rem] border-none bg-white shadow-xl outline-none focus:ring-2 focus:ring-blue-600 text-lg transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute right-5 top-5 text-blue-600" size={28} />
      </div>

      <main>
        {/* 📍 قسم الخريطة (محمي بالحارس) */}
        <div className="mb-10 text-right">
          <h3 className="text-lg font-black text-gray-700 mb-4 flex items-center justify-start gap-2 italic">
            <MapPin size={20} className="text-red-500" /> مواقع السيارات
          </h3>
          <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white z-0 bg-gray-100">
            {canRenderMap && (
              <MapContainer center={[15.5007, 32.5599]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredCars.map(car => (
                  (car.lat && car.lng) && (
                    <Marker key={car.id} position={[parseFloat(car.lat), parseFloat(car.lng)]}>
                      <Popup>
                        <div className="text-right font-sans" dir="rtl">
                           <div className="font-bold text-blue-700 text-xs mb-1">{car.brand}</div>
                           <div className="text-[10px] font-black">{Number(car.price).toLocaleString()} {getCurrencyName(car.currency)}</div>
                           <Link to={`/car/${car.id}`} className="text-[9px] text-blue-600 underline block mt-1">عرض التفاصيل</Link>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* 🚗 قسم البطاقات */}
        <h2 className="text-2xl font-black mb-8 px-2 border-r-8 border-blue-600 pr-4 italic">المعروض حالياً</h2>
        
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.length > 0 ? (
                filteredCars.map(car => <CarCard key={car.id} car={car} />)
            ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-[3rem] shadow-inner border-2 border-dashed">
                    <p className="text-gray-400 font-bold italic">لا توجد سيارات مطابقة لبحثك</p>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
