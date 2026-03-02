import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Car, ShieldCheck, Bell, LogOut, PlusCircle } from 'lucide-react';

import Home from './pages/Home.jsx';
import AddCar from './pages/AddCar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CarDetails from './pages/CarDetails.jsx';
import MyCars from './pages/MyCars.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EditCar from './pages/EditCar.jsx';
import UserNotifications from './pages/UserNotifications.jsx';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [cars, setCars] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  
  // ✅ تعريف المستخدم مرة واحدة فقط وبطريقة آمنة
  const user = (() => {
    try {
      const stored = localStorage.getItem('user');
      return (stored && stored !== "undefined") ? JSON.parse(stored) : null;
    } catch (e) { return null; }
  })();
  // دالة جلب العدادات بشكل موحد ✅
  const fetchCounts = useCallback(async () => {
    if (!token || !user) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. جلب إشعارات المستخدم (للكل)
      const notifRes = await axios.get(`${API_BASE}/api/notifications/unread-count`, { headers });
      const systemNotifs = parseInt(notifRes.data.count || 0);

      if (user.role === 'admin') {
        // 2. جلب بيانات الإدارة (للمدير فقط)
        const adminRes = await axios.get(`${API_BASE}/api/admin/dashboard-data`, { headers });
        const pCount = parseInt(adminRes.data.stats?.pending_count || 0);
        
        setPendingCount(pCount);
        // للمدير: الجرس يظهر إشعارات النظام + عدد السيارات المعلقة 🔥
        setUnreadNotifs(systemNotifs + pCount);
      } else {
        // للمستخدم العادي: الجرس يظهر إشعاراته الشخصية فقط
        setUnreadNotifs(systemNotifs);
      }
    } catch (err) {
      console.error("خطأ في تحديث العدادات:", err.message);
    }
  };
  useEffect(() => {
    // جلب السيارات للمعرض العام
    axios.get(`${API_BASE}/api/cars/all`)
      .then(res => { 
        setCars(res.data); 
        setLoading(false); 
      })
      .catch((err) => {
        console.error("فشل جلب السيارات:", err.message);
        setLoading(false);
      });
    
    // جلب العدادات عند التغيير في التوكن
    if (token) {
      fetchCounts();
    }
  }, [token, fetchCounts]);

  // دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100">
      {/* 🧭 شريط التنقل (Navbar) */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-[1000] border-b border-gray-100 px-6 py-4" dir="rtl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-black text-blue-700 italic flex items-center gap-2 hover:scale-105 transition-transform">
            <Car size={32} /> سوق سياراتي
          </Link>

          <div className="flex items-center gap-4">
            {token && user ? (
              <div className="flex items-center gap-3 md:gap-5">
                {/* 🛡️ أيقونة المدير */}
                {user.role === 'admin' && (
                  <Link to="/admin" className="relative p-2.5 text-orange-600 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-all" title="لوحة الإدارة">
                    <ShieldCheck size={22} />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce border-2 border-white">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* 🔔 جرس الإشعارات (الموحد) */}
                <Link to="/notifications" className="relative p-2.5 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all" title="التنبيهات">
                  <Bell size={22} />
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                      {unreadNotifs}
                    </span>
                  )}
                </Link>

                <Link to="/my-cars" className="text-gray-600 font-bold text-sm hidden sm:block hover:text-blue-600 transition">إعلاناتي</Link>
                
                <button onClick={handleLogout} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-500 hover:text-white transition-all">خروج</button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="font-bold text-gray-600 text-sm hover:text-blue-600 transition">دخول</Link>
                <Link to="/register" className="font-bold text-blue-600 text-sm hover:underline transition">تسجيل</Link>
              </div>
            )}
            
            <Link to="/add-car" className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black shadow-xl hover:bg-blue-700 hover:scale-105 transition-all text-xs">
              + بيع سيارتك
            </Link>
          </div>
        </div>
      </nav>

      {/* 🛣️ مسارات الصفحات */}
      <main className="min-h-[calc(100-80px)]">
        <Routes>
          <Route path="/" element={<Home cars={cars} loading={loading} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-car" element={<AddCar />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/my-cars" element={<MyCars />} />
          <Route path="/edit-car/:id" element={<EditCar />} />
          <Route path="/notifications" element={<UserNotifications />} /> 
          {/* حماية مسار الإدارة ✅ */}
          <Route 
            path="/admin" 
            element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
          />
          {/* تحويل أي مسار خاطئ للرئيسية */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer className="py-12 text-center text-gray-400 text-sm font-medium italic border-t border-gray-100 mt-10">
        © 2024 سوق سياراتي - جميع الحقوق محفوظة لغرض إبراء الذمة ✅
      </footer>
    </div>
  );
}

export default App;
