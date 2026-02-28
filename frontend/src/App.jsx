import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Car, ShieldCheck, Bell, LogOut, PlusCircle } from 'lucide-react';

// استيراد الصفحات
import Home from './pages/Home.jsx';
import AddCar from './pages/AddCar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CarDetails from './pages/CarDetails.jsx';
import MyCars from './pages/MyCars.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EditCar from './pages/EditCar.jsx';
import UserNotifications from './pages/UserNotifications.jsx';

// تعريف الرابط خارج المكون لضمان الثبات ✅
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [cars, setCars] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || null;

  useEffect(() => {
    // 1. جلب السيارات
    axios.get(`${API_BASE}/api/cars/all`)
      .then(res => { setCars(res.data); setLoading(false); })
      .catch(() => setLoading(false));
    
    // 2. جلب التنبيهات (فقط إذا كان هناك توكن)
    if (token && user) {
      const headers = { Authorization: `Bearer ${token}` };
      
      if (user.role === 'admin') {
        axios.get(`${API_BASE}/api/admin/dashboard-data`, { headers })
          .then(res => {
            setPendingCount(res.data.stats?.pending_count || 0);
            setUnreadNotifs(res.data.stats?.pending_count || 0);
          }).catch(() => {});
      } else {
        axios.get(`${API_BASE}/api/notifications/unread-count`, { headers })
          .then(res => setUnreadNotifs(res.data.count || 0)).catch(() => {});
      }
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-[1000] border-b border-gray-100 px-6 py-4" dir="rtl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-black text-blue-700 italic flex items-center gap-2">
            <Car size={32} /> سوق سياراتي
          </Link>
          <div className="flex items-center gap-4">
            {token ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="relative p-2.5 text-orange-600 bg-orange-50 rounded-2xl">
                    <ShieldCheck size={20} />
                    {pendingCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{pendingCount}</span>}
                  </Link>
                )}
                <Link to="/notifications" className="relative p-2.5 text-blue-600 bg-blue-50 rounded-2xl">
                  <Bell size={20} />
                  {unreadNotifs > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{unreadNotifs}</span>}
                </Link>
                <Link to="/my-cars" className="text-gray-600 font-bold text-sm hidden md:block">إعلاناتي</Link>
                <button onClick={() => {localStorage.clear(); window.location.href='/'}} className="text-red-500 font-bold text-sm">خروج</button>
              </>
            ) : (
              <Link to="/login" className="font-bold text-gray-600 text-sm">دخول</Link>
            )}
            <Link to="/add-car" className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black shadow-xl hover:bg-blue-700 text-xs transition-all">+ بيع سيارتك</Link>
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
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
