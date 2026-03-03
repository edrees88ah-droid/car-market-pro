import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Clock, Check, X, Loader2, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
    const [data, setData] = useState({ stats: { total_cars: 0, pending_count: 0, expected_revenue: 0 }, pendingCars: [] });
    const [loading, setLoading] = useState(true);
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${apiBase}/api/admin/dashboard-data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData({
                stats: res.data.stats || { total_cars: 0, pending_count: 0, expected_revenue: 0 },
                pendingCars: res.data.pendingCars || []
            });
        } catch (err) { console.error("Admin fetch error"); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAdminData(); }, []);

    const updateStatus = async (id, status) => {
        if(!window.confirm(`متأكد من ${status === 'active' ? 'قبول' : 'رفض'} الإعلان؟`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${apiBase}/api/admin/update-status/${id}`, { newStatus: status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAdminData();
        } catch (err) { alert("خطأ في التحديث"); }
    };

    if (loading) return <div className="flex flex-col items-center justify-center h-screen bg-gray-50"><Loader2 className="animate-spin text-blue-600 mb-4" size={60} /><p className="font-black text-gray-500 italic">جاري جلب أسرار الإدارة... 🛡️</p></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans" dir="rtl">
            <h1 className="text-4xl font-black text-gray-800 mb-10 flex items-center gap-4 italic"><ShieldCheck className="text-blue-600" size={50} /> لوحة الإدارة</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-8 rounded-[3rem] text-white shadow-2xl">
                    <h2 className="text-4xl font-black mb-1">{data.stats.total_cars || 0}</h2>
                    <p className="font-bold">إجمالي السيارات</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-400 p-8 rounded-[3rem] text-white shadow-2xl">
                    <h2 className="text-4xl font-black mb-1">{data.stats.pending_count || 0}</h2>
                    <p className="font-bold">قيد الانتظار ⏳</p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-emerald-400 p-8 rounded-[3rem] text-white shadow-2xl">
                    <h2 className="text-4xl font-black mb-1">{Number(data.stats.expected_revenue || 0).toLocaleString()} $</h2>
                    <p className="font-bold">عمولات متوقعة (1%)</p>
                </div>
            </div>
            <div className="grid gap-8">
                {data.pendingCars.map(car => (
                    <div key={car.id} className="bg-white p-6 rounded-[3rem] shadow-xl flex flex-col md:flex-row gap-6 items-center border border-gray-50">
                        <img src={car.main_image?.startsWith('http') ? car.main_image : `${apiBase}/${car.main_image?.replace(/\\/g, '/')}`} className="w-48 h-32 object-cover rounded-2xl border" />
                        <div className="flex-1 text-right">
                            <h3 className="text-2xl font-black">{car.brand} {car.model}</h3>
                            <p className="text-blue-600 font-bold">المعلن: {car.owner_name}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => updateStatus(car.id, 'active')} className="bg-green-600 text-white px-8 py-4 rounded-[1.5rem] font-black hover:bg-green-700 shadow-xl">قبول ✅</button>
                            <button onClick={() => updateStatus(car.id, 'rejected')} className="bg-red-50 text-red-600 px-8 py-4 rounded-[1.5rem] font-black">رفض ❌</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default AdminDashboard;
