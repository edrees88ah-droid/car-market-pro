// src/pages/Home.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import CarCard from '../components/CarCard';

const Home = ({ cars, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getCurrencyName = (code) => {
    const currencies = { 'SDG': 'ج.س', 'SAR': 'ريال', 'EGP': 'ج.م', 'USD': '$' };
    return currencies[code] || code;
  };
// داخل ملف Home.jsx - استبدل جزء الـ Marker بهذا ✅
{filteredCars.map(car => (
  (car.lat && car.lng) && (
    <Marker key={car.id} position={[car.lat, car.lng]}>
      <Popup>
        <div className="text-right p-1" dir="rtl">
           <img 
             src={car.main_image?.startsWith('http') ? car.main_image : `${apiBase}/${car.main_image?.replace(/\\/g, '/')}`} 
             className="w-full h-16 object-cover rounded-lg mb-2" 
             onError={(e) => e.target.src = '/placeholder.jpg'}
           />
           <h4 className="font-bold text-blue-700 text-xs">{car.brand}</h4>
           <Link to={`/car/${car.id}`} className="text-[9px] text-white bg-blue-600 py-1 rounded-md block text-center mt-1">التفاصيل</Link>
        </div>
      </Popup>
    </Marker>
  )
))}
  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8" dir="rtl">
      <div className="max-w-2xl mx-auto mb-10 relative">
        <input 
          type="text" placeholder="ابحث عن ماركة أو موديل..." 
          className="w-full p-5 pr-14 rounded-[2rem] border-none bg-white shadow-xl outline-none focus:ring-2 focus:ring-blue-600 text-lg transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute right-5 top-5 text-blue-600" size={28} />
      </div>

      <main>
        <div className="mb-10 text-right">
          <h3 className="text-lg font-black text-gray-700 mb-4 flex items-center gap-2 italic">
            <MapPin size={20} className="text-red-500" /> مواقع السيارات
          </h3>
          <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white z-0">
            <MapContainer center={[15.5007, 32.5599]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredCars.map(car => (
                (car.lat && car.lng) && (
                  <Marker key={car.id} position={[car.lat, car.lng]}>
                    <Popup>
                      <div className="text-right p-1" dir="rtl">
                         <img src={car.main_image?.startsWith('http') ? car.main_image : `${apiBase}/${car.main_image?.replace(/\\/g, '/')}`} className="w-full h-16 object-cover rounded-lg mb-2" />
                         <h4 className="font-bold text-blue-700 text-xs">{car.brand}</h4>
                         <p className="text-[10px] font-black">{Number(car.price).toLocaleString()} {getCurrencyName(car.currency)}</p>
                         <Link to={`/car/${car.id}`} className="text-[9px] text-white bg-blue-600 py-1 rounded-md block text-center mt-1">التفاصيل</Link>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCars.map(car => <CarCard key={car.id} car={car} />)}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
