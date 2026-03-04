import React, { useState } from 'react';
import { Search, Loader2, CarFront } from 'lucide-react';
import CarCard from '../components/CarCard.jsx';

const Home = ({ cars, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // فلترة السيارات
  const filteredCars = cars?.filter(car => 
    car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 font-sans text-right" dir="rtl">
      
      {/* 🔍 شريط البحث */}
      <div className="max-w-2xl mx-auto mb-12 relative group">
        <input 
          type="text" 
          placeholder="ابحث عن ماركة أو موديل..." 
          className="w-full p-6 pr-16 rounded-[2.5rem] border-none bg-white shadow-2xl outline-none focus:ring-4 focus:ring-blue-100 text-lg transition-all text-right"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-6 top-6 text-blue-600">
           <Search size={30} />
        </div>
      </div>

      <main>
        <h2 className="text-3xl font-black text-gray-800 mb-8 px-2 border-r-8 border-blue-600 pr-4 italic">
            المعرض العام للسيارات <span className="text-blue-600 text-lg">({filteredCars.length})</span>
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={50} />
            <p className="text-gray-400 font-bold italic">جاري جلب السيارات من السحاب... 🐘☁️</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCars.length > 0 ? (
                filteredCars.map(car => (
                    <div key={car.id}>
                        <CarCard car={car} />
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-24 bg-white rounded-[4rem] shadow-inner border-2 border-dashed border-gray-100">
                    <CarFront size={80} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-xl text-gray-400 font-black italic">عذراً.. لا توجد سيارات حالياً</p>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
