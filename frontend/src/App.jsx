import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Car, ShieldCheck, Bell, LogOut, PlusCircle, Search, MapPin, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// إصلاح الأيقونات
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// استيراد الصفحات (تأكد من نقل ملفاتها للمجلد الجديد)
import CarCard from './components/CarCard.jsx';
import AddCar from './pages/AddCar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CarDetails from './pages/CarDetails.jsx';
import MyCars from './pages/MyCars.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EditCar from './pages/EditCar.jsx';
import UserNotifications from './pages/UserNotifications.jsx';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HomeContent = ({ cars, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showMap, setShowMap] = useState(false);

  // حل سحري لخطأ #527: تفعيل الخريطة بعد ثانية من التحميل ✅
  useEffect(() => {
    const timer = setTimeout(() => setShowMap(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredCars = cars?.filter(c => 
    c.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.model?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="max-w-2xl mx-auto mb-10 relative">
        <input type="text" placeholder="ابحث عن ماركة أو موديل..." className="w-full p-5 pr-12 rounded-full shadow-lg border-none outline-none focus:ring-2 ring-blue-600" onChange={e => setSearchTerm(e.target.value)} />
        <Search className="absolute right-4 top-5 text-gray-400" />
      </div>

      {showMap && (
        <div className="mb-10 h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl z-0">
          <MapContainer center={[15.5007, 32.5599]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredCars.map(car => (car.lat && car.lng) && (
              <Marker key={car.id} position={[parseFloat(car.lat), parseFloat(car.lng)]}>
                <Popup>
                  <div className="text-right font-sans">
                    <div className="font-bold text-blue-600 text-sm">{car.brand}</div>
                    <Link to={`/car/${car.id}`} className="text-[10px] text-blue-500 underline">التفاصيل</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? <div className="col-span-full text-center p-10"><Loader2 className="animate-spin mx-auto text-blue-600" /></div> : 
         filteredCars.map(car => <CarCard key={car.id} car={car} />)}
      </div>
    </div>
  );
};

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // جلب المستخدم بأمان ✅
    const stored = localStorage.getItem('user');
    if (stored && stored !== "undefined") {
      try { setUser(JSON.parse(stored)); } catch (e) { localStorage.removeItem('user'); }
    }
    // جلب السيارات
    axios.get(`${API_BASE}/api/cars/all`).then(res => setCars(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-[1000] flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-blue-700 italic flex items-center gap-2"><Car /> سوق سياراتي</Link>
        <div className="flex items-center gap-4">
          {token ? (
            <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className="text-red-500 font-bold text-sm">خروج</button>
          ) : (
            <Link to="/login" className="font-bold text-gray-600 text-sm">دخول</Link>
          )}
          <Link to="/add-car" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs">+ بيع سيارتك</Link>
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
      </Routes>
    </div>
  );
}

export default App;