import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, Phone, Calendar, Gauge, ArrowRight, User, Eye } from 'lucide-react';

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    axios.get(`${apiBase}/api/cars/detail/${id}`).then(res => setCar(res.data)).catch(() => {});
  }, [id, apiBase]);

  if (!car) return <div className="p-20 text-center font-black animate-pulse">جاري جلب تفاصيل السيارة... ✨</div>;

  const getImgUrl = (path) => path?.startsWith('http') ? path : `${apiBase}/${path?.replace(/\\/g, '/')}`;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 text-right" dir="rtl">
      <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-6"><ArrowRight size={20} /> العودة</Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 md:p-10 rounded-[3.5rem] shadow-2xl border">
        <div className="space-y-4">
          <div className="h-[400px] rounded-[3rem] overflow-hidden shadow-inner">
            <img src={getImgUrl(car.images?.[0]?.image_path || car.main_image)} className="w-full h-full object-cover" alt="Car" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {car.images?.map((img, i) => (
              <img key={i} src={getImgUrl(img.image_path)} className="w-24 h-16 object-cover rounded-xl border-2 border-white shadow-sm" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
             <h1 className="text-4xl font-black text-gray-800">{car.brand} {car.model}</h1>
             <div className="bg-blue-50 text-blue-600 p-2 rounded-xl flex items-center gap-1 font-bold text-xs"><Eye size={14}/> {car.views}</div>
          </div>
          <p className="text-3xl font-black text-green-600">{Number(car.price).toLocaleString()} {car.currency}</p>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-[2rem]">
            <div className="text-center"><Calendar className="mx-auto text-blue-500 mb-1"/><p className="text-xs text-gray-400">السنة</p><p className="font-bold">{car.year}</p></div>
            <div className="text-center"><Gauge className="mx-auto text-orange-500 mb-1"/><p className="text-xs text-gray-400">الممشى</p><p className="font-bold">{car.mileage} كم</p></div>
          </div>
          <div className="bg-blue-50 p-6 rounded-[2rem] border italic">"{car.description}"</div>
          <button onClick={() => window.open(`https://wa.me/${car.phone}?text=مهتم بـ ${car.brand} ${car.model}`, '_blank')} className="w-full bg-green-500 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
             <MessageCircle size={28} /> تواصل واتساب
          </button>
        </div>
      </div>
    </div>
  );
};
export default CarDetails;
