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
  const user = (() => {
    try {
      const stored = localStorage.getItem('user');
      return (stored && stored !== "undefined") ? JSON.parse(stored) : null;
    } catch (e) { return null; }
  })();

  const fetchCounts = useCallback(async () => {
    if (!token || !user) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const notifRes = await axios.get(`${API_BASE}/api/notifications/unread-count`, { headers });
      const systemNotifs = parseInt(notifRes.data.count || 0);

      if (user?.role === 'admin') {
        const adminRes = await axios.get(`${API_BASE}/api/admin/dashboard-data`, { headers });
        const pCount = parseInt(adminRes.data.stats?.pending_count || 0);
        setPendingCount(pCount);
        setUnreadNotifs(systemNotifs + pCount);
      } else {
        setUnreadNotifs(systemNotifs);
      }
    } catch (err) { console.log("Error counters"); }
  }, [token, user?.role]);

  useEffect(() => {
    axios.get(`${API_BASE}/api/cars/all`).then(res => { setCars(res.data); setLoading(false); }).catch(() => setLoading(false));
    if (token) fetchCounts();
  }, [token, fetchCounts]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-[1000] border-b px-6 py-4 flex justify-between items-center" dir="rtl">
          <Link to="/" className="text-2xl font-black text-blue-700 italic flex items-center gap-2"><Car size={32} /> سوق سياراتي</Link>
          <div className="flex items-center gap-4">
            {token && user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link to="/admin" className="relative p-2.5 text-orange-600 bg-orange-50 rounded-2xl">
                    <ShieldCheck size={22} />
                    {pendingCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{pendingCount}</span>}
                  </Link>
                )}
                <Link to="/notifications" className="relative p-2.5 text-blue-600 bg-blue-50 rounded-2xl">
                  <Bell size={22} />
                  {unreadNotifs > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{unreadNotifs}</span>}
                </Link>
                <button onClick={() => {localStorage.clear(); window.location.href='/'}} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-xl">خروج</button>
              </div>
            ) : (
              <Link to="/login" className="font-bold text-gray-600 text-sm">دخول</Link>
            )}
            <Link to="/add-car" className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black shadow-xl text-xs">+ بيع سيارتك</Link>
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
