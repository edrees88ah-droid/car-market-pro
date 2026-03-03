import React from 'react';
import { Link } from 'react-router-dom';
import { Gauge, Calendar, ArrowLeft, Eye, CheckCircle2 } from 'lucide-react';

const CarCard = ({ car }) => {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const isSold = car?.status === 'sold';

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
    if (path.startsWith('http')) return path;
    return `${apiBase}/${path.replace(/\\/g, '/')}`;
  };

  return (
    <div className={`bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-500 ${isSold ? 'opacity-80' : ''}`} dir="rtl">
      <div className="relative h-52 bg-gray-100">
        <img src={getImageUrl(car?.main_image)} className={`w-full h-full object-cover ${isSold ? 'grayscale' : ''}`} alt={car?.brand} />
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 font-bold">
          <Eye size={12} /> {car?.views || 0}
        </div>
        {isSold && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-red-600 text-white font-black px-6 py-2 rounded-2xl text-sm shadow-2xl transform -rotate-12 border-2 border-white">تـم البيـع</div>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-black text-gray-800 mb-4">{car?.brand} {car?.model}</h3>
        <p className="text-blue-600 font-black text-xl mb-4">{Number(car?.price || 0).toLocaleString()} {car?.currency}</p>
        <Link to={`/car/${car?.id}`} className={`mt-auto w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${isSold ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {isSold ? <><CheckCircle2 size={18} /> إعلان منتهي</> : <>عرض التفاصيل <ArrowLeft size={18} /></>}
        </Link>
      </div>
    </div>
  );
};
export default CarCard;
