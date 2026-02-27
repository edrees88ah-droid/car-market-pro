const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, XCircle, Clock, Trash2, Info, Loader2 } from 'lucide-react';
const UserNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiBase = "http://localhost:5000";
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${apiBase}/api/notifications/my-all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            
            // بمجرد فتح الصفحة، نرسل طلب للسيرفر لتعليم الكل كـ "مقروء"
            await axios.patch(`${apiBase}/api/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("خطأ في جلب الإشعارات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={50} />
            <p className="font-bold text-gray-500 italic">جاري جلب تنبيهاتك... ✨</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-12 font-sans" dir="rtl">
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3 italic">
                    <Bell className="text-blue-600" size={32} /> مركز التنبيهات
                </h1>
                <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold">
                    {notifications.length} تنبيه
                </span>
            </div>

            <div className="space-y-6">
                {notifications.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm border-2 border-dashed border-gray-100">
                        <Clock size={60} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-xl text-gray-400 font-bold italic">صندوق الوارد فارغ حالياً</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div 
                            key={notif.id} 
                            className={`relative bg-white p-6 rounded-[2rem] shadow-xl transition-all border-r-8 ${
                                notif.is_read ? 'border-gray-200 opacity-80' : 'border-blue-600 scale-[1.02]'
                            }`}
                        >
                            {!notif.is_read && (
                                <span className="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full border-2 border-white animate-ping"></span>
                            )}
                            
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${notif.title.includes('قبول') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {notif.title.includes('قبول') ? <CheckCircle size={28} /> : <XCircle size={28} />}
                                </div>
                                
                                <div className="flex-1 text-right">
                                    <h4 className="text-xl font-black text-gray-800">{notif.title}</h4>
                                    <p className="text-gray-600 mt-2 leading-relaxed font-medium">{notif.message}</p>
                                    <div className="flex items-center gap-2 mt-4 text-[10px] text-gray-400 font-bold italic">
                                        <Clock size={12} />
                                        {new Date(notif.created_at).toLocaleString('ar-EG', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <footer className="mt-20 text-center text-gray-300 text-xs font-bold">
                سيتم الاحتفاظ بآخر 50 تنبيه فقط لضمان سرعة حسابك ⚡
            </footer>
        </div>
    );
};


export default UserNotifications;



