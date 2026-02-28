import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Routes, Route, Link } from 'react-router-dom';
// استيراد الأيقونات
import { 
  Car, LogIn, PlusCircle, LogOut, LayoutGrid, 
  Search, ShieldCheck, MapPin, Loader2, Bell 
} from 'lucide-react';

// استيراد مكونات الخريطة
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// استيراد الصفحات (تأكد من وجودها في مجلد pages)
import CarCard from './components/CarCard.jsx';
import AddCar from './pages/AddCar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CarDetails from './pages/CarDetails.jsx';
import MyCars from './pages/MyCars.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EditCar from './pages/EditCar.jsx';
import UserNotifications from './pages/UserNotifications.jsx';

// 1️⃣ التعريفات العالمية (Global Constants) - يجب أن تكون في الأعلى تماماً ✅
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

// إصلاح أيقونة الخريطة
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const getCurrencyName = (code) => {
  const currencies = { 'SDG': 'ج.س', 'SAR': 'ريال', 'EGP': 'ج.م', 'USD': '$', 'AED': 'درهم' };
  return currencies[code] || code;
};

// 2️⃣ المكونات الفرعية (Sub-Components) ✅
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.role === 'admin' ? children : <div className="p-20 text-center text-red-500 font-bold bg-white m-10 rounded-3xl shadow-lg">🚫 مخصص للمسؤولين فقط!</div>;
};

const Home = ({ cars, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCars = cars?.filter(car => 
    car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

      <div className="flex flex-col lg:flex-row gap-10">
        <main className="flex-1">
          <div className="mb-10 text-right">
            <h3 className="text-lg font-black text-gray-700 mb-4 flex items-center justify-start gap-2 italic">
              <MapPin size={20} className="text-red-500" /> مواقع السيارات النشطة
            </h3>
            <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white z-0">
              <MapContainer center={[15.5007, 32.5599]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredCars.map(car => (
                  (car.lat && car.lng) && (
                    <Marker key={car.id} position={[car.lat, car.lng]}>
                      <Popup>
                        <div className="text-right p-1 font-sans" dir="rtl">
                           <img src={car.main_image?.startsWith('http') ? car.main_image : `${apiBase}/${car.main_image?.replace(/\\/g, '/')}`} className="w-full h-16 object-cover rounded-lg mb-2" alt="car" />
                           <h4 className="font-bold text-blue-700 text-xs">{car.brand} {car.model}</h4>
                           <p className="text-[10px] text-gray-600 font-black mb-2">
                             {Number(car.price).toLocaleString()} {getCurrencyName(car.currency)}
                           </p>
                           <Link to={`/car/${car.id}`} className="text-[9px] text-white bg-blue-600 py-1.5 rounded-md block text-center font-bold">عرض التفاصيل</Link>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-6 px-2 text-right">المعروض حالياً ({filteredCars.length})</h2>
          {loading ? (
             <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredCars.map(car => <CarCard key={car.id} car={car} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// 3️⃣ المكون الرئيسي (App) ✅
function App() {
  const [cars, setCars] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // جلب السيارات
    axios.get(`${apiBase}/api/cars/all`)
      .then(res => { setCars(res.data); setLoading(false); })
      .catch(() => setLoading(false));
    
    // جلب العدادات
    if (token) {
      if (user?.role === 'admin') {
        axios.get(`${apiBase}/api/admin/dashboard-data`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
           setPendingCount(res.data.stats?.pending_count || 0);
           setUnreadNotifs(res.data.stats?.pending_count || 0);
        }).catch(err => console.log(err));
      } else {
        axios.get(`${apiBase}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => setUnreadNotifs(res.data.count)).catch(err => console.log(err));
      }
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-[1000] border-b border-gray-100 px-6 py-4" dir="rtl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-black text-blue-700 flex items-center gap-2 italic"><Car size={32} /> سوق سياراتي</Link>
          <div className="flex items-center gap-4">
            {token ? (
              <div className="flex items-center gap-4">
                {user?.role === 'admin' && (
                  <Link to="/admin" className="relative p-2.5 text-orange-600 font-black flex items-center gap-2 bg-orange-50 rounded-2xl transition-all">
                    <ShieldCheck size={20} />
                    {pendingCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-white">{pendingCount}</span>}
                  </Link>
                )}
                <Link to="/notifications" className="relative p-2.5 text-blue-600 bg-blue-50 rounded-2xl transition-all">
                  <Bell size={20} />
                  {unreadNotifs > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-white">{unreadNotifs}</span>}
                </Link>
                <Link to="/my-cars" className="text-gray-600 font-bold text-sm hover:text-blue-600 transition">إعلاناتي</Link>
                <button onClick={() => {localStorage.clear(); window.location.href='/'}} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-500 hover:text-white transition-all">خروج</button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <Link to="/login" className="font-bold text-gray-600 text-sm">دخول</Link>
                 <Link to="/register" className="font-bold text-blue-600 text-sm">إنشاء حساب</Link>
              </div>
            )}
            <Link to="/add-car" className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all text-xs">+ بيع سيارتك</Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home cars={cars} loading={loading} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-car" element={<AddCar />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/my-cars" element={<MyCars />} />
        <Route path="/edit-car/:id" element={<EditCar />} />
        <Route path="/notifications" element={<UserNotifications />} /> 
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </div>
  );
}

export default App;
