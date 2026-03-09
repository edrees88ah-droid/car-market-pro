import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. إرسال طلب تسجيل الدخول للسيرفر
      const res = await axios.post('http://127.0.0.1:5000/api/auth/login', { email, password });
      
      // 2. حفظ التوكن وبيانات المستخدم في ذاكرة المتصفح
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert(`أهلاً بك يا ${res.data.user.name} 👋`);

      // 3. التوجيه الذكي بناءً على الرتبة (الميزة المطلوبة 🔥)
      if (res.data.user.role === 'admin') {
        // إذا كان مدير، يذهب للوحة تحكم المشرف
        navigate('/admin');
      } else {
        // إذا كان مستخدم عادي، يذهب لصفحة إعلاناته الخاصة
        navigate('/my-cars');
      }

      // 4. تحديث الصفحة لضمان ظهور الأزرار الجديدة في Navbar
      window.location.reload();

    } catch (err) {
      alert(err.response?.data?.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans" dir="rtl">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-10">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-blue-600" size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-800">سجل دخولك</h2>
          <p className="text-gray-400 mt-2">مرحباً بك مجدداً في سوق سياراتي</p>
        </div>

        <div className="space-y-5">
          <div className="relative">
            <Mail className="absolute right-4 top-4 text-gray-400" size={20} />
            <input 
              type="email" 
              placeholder="البريد الإلكتروني" 
              className="w-full pr-12 pl-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-4 top-4 text-gray-400" size={20} />
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              className="w-full pr-12 pl-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xl mt-10 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin" /> : "دخول"}
        </button>

        <div className="mt-8 text-center">
           <p className="text-gray-500">ليس لديك حساب؟</p>
           <Link to="/register" className="text-blue-600 font-black underline hover:text-blue-800 transition-all">
             أنشئ حساباً جديداً الآن
           </Link>
        </div>
      </form>
    </div>
  );
};
export default Login;