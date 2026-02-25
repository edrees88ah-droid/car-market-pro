import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Car, Bell, ShieldCheck, LogOut, 
  User, PlusCircle, LayoutGrid, Menu, X 
} from 'lucide-react';
// في أعلى الملف تحت الـ imports مباشرة
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Navbar = () => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const apiBase = "${apiBase}:";

    // 1. جلب عدد الإشعارات غير المقروءة
    const fetchUnreadCount = async () => {
        if (token) {
            try {
                const res = await axios.get(`${apiBase}/api/notifications/unread-count`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUnreadCount(res.data.count);
            } catch (err) {
                console.error("خطأ في جلب التنبيهات");
            }
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // تحديث التنبيهات كل دقيقتين تلقائياً
        const interval = setInterval(fetchUnreadCount, 120000);
        return () => clearInterval(interval);
    }, [token]);

    // 2. دالة تسجيل الخروج
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-[1000] border-b border-gray-100" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex justify-between items-center h-20">
                    
                    {/* 🏠 الشعار - Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                            <Car className="text-white" size={28} />
                        </div>
                        <span className="text-2xl font-black text-gray-800 italic tracking-tighter">سوق سياراتي</span>
                    </Link>

                    {/* 📱 زر الموبايل */}
                    <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
                    </button>

                    {/* 💻 القائمة لنسخة الكمبيوتر */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-gray-600 font-bold hover:text-blue-600 transition">الرئيسية</Link>
                        
                        {token ? (
                            <>
                                {/* 🛡️ لوحة الإدارة (تظهر للمدير فقط) */}
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="flex items-center gap-1 bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-black text-sm hover:bg-orange-100 transition-all border border-orange-100">
                                        <ShieldCheck size={18} /> لوحة الإدارة
                                    </Link>
                                )}

                                <Link to="/my-cars" className="text-gray-600 font-bold hover:text-blue-600 transition flex items-center gap-1">
                                    <LayoutGrid size={18}/> إعلاناتي
                                </Link>

                                {/* 🔔 جرس الإشعارات الذكي */}
                                <Link to="/notifications" className="relative p-2.5 bg-gray-50 rounded-2xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all group">
                                    <Bell size={22} className="group-hover:animate-swing" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-white font-black shadow-sm">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* 👤 الملف الشخصي وخروج */}
                                <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-700 hidden lg:inline">{user?.name}</span>
                                    <button onClick={handleLogout} className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition flex items-center gap-1 font-bold text-xs">
                                        <LogOut size={18} /> خروج
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-gray-600 font-bold hover:text-blue-600 transition">دخول</Link>
                                <Link to="/register" className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-2xl font-black text-sm hover:bg-blue-100 transition">إنشاء حساب</Link>
                            </div>
                        )}

                        {/* ➕ زر بيع السيارة الثابت */}
                        <Link to="/add-car" className="bg-blue-600 text-white px-6 py-3 rounded-[1.5rem] font-black text-sm flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 transition-all">
                            <PlusCircle size={20}/> بيع سيارتك
                        </Link>
                    </div>
                </div>

                {/* 📱 القائمة المنسدلة للموبايل */}
                {isMenuOpen && (
                    <div className="md:hidden pb-6 space-y-4 border-t border-gray-50 pt-4 animate-in fade-in slide-in-from-top-4">
                        <Link to="/" className="block py-2 text-gray-600 font-bold" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
                        {token ? (
                            <>
                                {user?.role === 'admin' && <Link to="/admin" className="block py-2 text-orange-600 font-black" onClick={() => setIsMenuOpen(false)}>لوحة الإدارة 🛡️</Link>}
                                <Link to="/my-cars" className="block py-2 text-gray-600 font-bold" onClick={() => setIsMenuOpen(false)}>إعلاناتي</Link>
                                <Link to="/notifications" className="block py-2 text-gray-600 font-bold" onClick={() => setIsMenuOpen(false)}>التنبيهات ({unreadCount})</Link>
                                <button onClick={handleLogout} className="block w-full text-right py-2 text-red-500 font-bold">خروج</button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link to="/login" className="block py-2 text-gray-600 font-bold" onClick={() => setIsMenuOpen(false)}>دخول</Link>
                                <Link to="/register" className="block py-2 text-blue-600 font-black" onClick={() => setIsMenuOpen(false)}>إنشاء حساب</Link>
                            </div>
                        )}
                        <Link to="/add-car" className="block bg-blue-600 text-white text-center py-4 rounded-2xl font-black shadow-lg" onClick={() => setIsMenuOpen(false)}>+ بيع سيارتك</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
