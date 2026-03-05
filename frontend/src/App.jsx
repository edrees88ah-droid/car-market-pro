import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
// استيراد الأيقونات
import { 
  Car, ShieldCheck, Bell, LogOut, PlusCircle, 
  Search, MapPin, Loader2, Eye, Calendar, Gauge, ArrowLeft, ArrowRight 
} from 'lucide-react';

// استيراد الخرائط
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// إصلاح أيقونات الخريطة للنشر
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// استيراد الصفحات الأخرى (التي لا تسبب مشاكل)
import CarCard from './components/CarCard.jsx';
import AddCar from './pages/AddCar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CarDetails from './pages/CarDetails.jsx';
import MyCars from './pages/MyCars.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EditCar from './pages/EditCar.jsx';
import UserNotifications from './pages/UserNotifications.jsx';

// 1️⃣ التعريفات الأساسية
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getCurrencyName = (code) => {
  const currencies = { 'SDG': 'ج.س', 'SAR': 'ريال', 'EGP': 'ج.م', 'USD': '$', 'AED': 'درهم' };
  return currencies[code] || code;
};

// 2️⃣ مكون المعرض العام (داخلي لضمان الثبات) ✅
const HomeContent = ({ cars, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => { setMapReady(true); }, []);

  const filteredCars = cars?.filter(c => 
    c.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.model?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getImg = (p) => p?.startsWith('http') ? p : `${API_BASE}/${p?.replace(/\\/g, '/')}`;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8" dir="rtl">
      <div className="max-w-2xl mx-auto mb-10 relative">
        <input type="text" placeholder="ابحث عن سيارة..." className="w-full p-5 pr-14 rounded-[2rem] shadow-xl border-none outline-none focus:ring-2 ring-blue-600" onChange={e => setSearchTerm(e.target.value)} />
        <Search className="absolute right-5 top-5 text-blue-600" size={28} />
      </div>

      {mapReady && (
        <div className="mb-10 h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white z-0">
          <MapContainer center={[15.5007, 32.5599]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredCars.map(car => (car.lat && car.lng) && (
              <Marker key={car.id} position={[parseFloat(car.lat), parseFloat(car.lng)]}>
                <Popup>
                  <div className="text-right font-sans" dir="rtl">
                    <img src={getImg(car.main_image)} className="w-full h-16 object-cover rounded-lg mb-1" />
                    <div className="font-bold text-blue-700 text-xs">{car.brand}</div>
                    <div className="text-[10px] font-black">{Number(car.price).toLocaleString()} {getCurrencyName(car.currency)}</div>
                    <Link to={`/car/${car.id}`} className="text-[9px] text-blue-600 underline block mt-1">التفاصيل</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <h2 className="text-2xl font-black text-gray-800 mb-6 border-r-4 border-blue-600 pr-3">المعروض حالياً</h2>
      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map(car => <CarCard key={car.id} car={car} />)}
        </div>
      )}
    </div>
  );
};

// 3️⃣ المكون الرئيسي (App)
function App() {
  const [cars, setCars] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored && stored !== "undefined") {
      try { setUser(JSON.parse(stored)); } catch (e) { localStorage.clear(); }
    }
    axios.get(`${API_BASE}/api/cars/all`).then(res => { setCars(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const fetchStats = useCallback(async () => {
    if (!token || !user) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const nRes = await axios.get(`${API_BASE}/api/notifications/unread-count`, { headers });
      if (user.role === 'admin') {
        const aRes = await axios.get(`${API_BASE}/api/admin/dashboard-data`, { headers });
        setPendingCount(aRes.data.stats?.pending_count || 0);
        setUnreadNotifs((nRes.data.count || 0) + (aRes.data.stats?.pending_count || 0));
      } else {
        setUnreadNotifs(nRes.data.count || 0);
      }
    } catch (e) {}
  }, [token, user]);

  useEffect(() => { if (token && user) fetchStats(); }, [token, user, fetchStats]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-[1000] border-b px-4 py-4" dir="rtl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-black text-blue-700 italic flex items-center gap-2 transition-transform hover:scale-105">
            <Car size={32} /> سوق سياراتي
          </Link>
          <div className="flex items-center gap-4">
            {token && user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="relative p-2.5 text-orange-600 bg-orange-50 rounded-2xl transition-all">
                    <ShieldCheck size={20} />
                    {pendingCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{pendingCount}</span>}
                  </Link>
                )}
                <Link to="/notifications" className="relative p-2.5 text-blue-600 bg-blue-50 rounded-2xl">
                  <Bell size={20} />
                  {unreadNotifs > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-pulse">{unreadNotifs}</span>}
                </Link>
                <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-500 hover:text-white transition-all">خروج</button>
              </>
            ) : (
              <Link to="/login" className="font-bold text-gray-600 text-sm">دخول</Link>
            )}
            <Link to="/add-car" className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all text-xs">+ بيع سيارتك</Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomeContent cars={cars} loading={loading} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-car" element={<AddCar />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/my-cars" element={<MyCars />} />
        <Route path="/edit-car/:id" element={<EditCar />} />
        <Route path="/notifications" element={<UserNotifications />} /> 
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
