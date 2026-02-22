import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Phone, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/api/auth/register', formData);
      alert("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || "فشل التسجيل");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4" dir="rtl">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-blue-600" size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-800">إنشاء حساب جديد</h2>
          <p className="text-gray-400 mt-2 text-sm">انضم إلينا لتبدأ ببيع وشراء السيارات</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute right-3 top-3.5 text-gray-400" size={20} />
            <input type="text" placeholder="الاسم الكامل" className="w-full pr-10 pl-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="relative">
            <Mail className="absolute right-3 top-3.5 text-gray-400" size={20} />
            <input type="email" placeholder="البريد الإلكتروني" className="w-full pr-10 pl-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="relative">
            <Phone className="absolute right-3 top-3.5 text-gray-400" size={20} />
            <input type="text" placeholder="رقم الهاتف" className="w-full pr-10 pl-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
          </div>
          <div className="relative">
            <Lock className="absolute right-3 top-3.5 text-gray-400" size={20} />
            <input type="password" placeholder="كلمة المرور" className="w-full pr-10 pl-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-8 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
          إنشاء الحساب
        </button>

        <p className="text-center mt-6 text-gray-500 text-sm">
          لديك حساب بالفعل؟ <Link to="/login" className="text-blue-600 font-bold underline">سجل دخولك</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;