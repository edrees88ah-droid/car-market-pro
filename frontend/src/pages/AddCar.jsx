import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Car, ImagePlus, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

const AddCar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [accepted, setAccepted] = useState(false);
  const [formData, setFormData] = useState({ brand: '', model: '', year: '', price: '', mileage: '', description: '', fuel_type: 'بنزين', transmission: 'أوتوماتيك', currency: 'SDG' });
  
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accepted) return alert("يرجى الموافقة على التعهد");
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    Array.from(images).forEach(img => data.append('images', img));

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiBase}/api/cars/add`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert("تم النشر بنجاح! الإعلان قيد المراجعة ✅");
      navigate('/my-cars');
    } catch (err) {
      alert(err.response?.data?.error || "فشل الرفع");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:my-10 bg-white shadow-2xl rounded-[3rem] border" dir="rtl">
      <h2 className="text-3xl font-black text-center mb-8 flex items-center justify-center gap-3"><Car className="text-blue-600"/> بيع سيارتك</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="الماركة" required className="p-4 bg-gray-50 rounded-2xl outline-none border focus:ring-2 ring-blue-500" onChange={e => setFormData({...formData, brand: e.target.value})} />
          <input type="text" placeholder="الموديل" required className="p-4 bg-gray-50 rounded-2xl outline-none border focus:ring-2 ring-blue-500" onChange={e => setFormData({...formData, model: e.target.value})} />
          <input type="number" placeholder="السعر" required className="p-4 bg-gray-50 rounded-2xl outline-none border focus:ring-2 ring-blue-500" onChange={e => setFormData({...formData, price: e.target.value})} />
          <select className="p-4 bg-gray-50 rounded-2xl outline-none border" onChange={e => setFormData({...formData, currency: e.target.value})}>
             <option value="SDG">جنيه سوداني</option>
             <option value="USD">دولار</option>
          </select>
        </div>
        <textarea placeholder="وصف السيارة..." rows="4" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
        <div className="border-2 border-dashed p-10 rounded-[2rem] text-center bg-blue-50/50">
          <input type="file" multiple accept="image/*" required className="hidden" id="imgs" onChange={e => setImages(e.target.files)} />
          <label htmlFor="imgs" className="cursor-pointer flex flex-col items-center gap-2 font-bold text-blue-600">
            <ImagePlus size={40}/> {images.length > 0 ? `تم اختيار ${images.length} صور` : 'اضغط لرفع الصور'}
          </label>
        </div>
        <div className="bg-red-50 p-6 rounded-[2rem] border-2 border-red-100 flex items-start gap-3">
          <input type="checkbox" className="mt-1 w-5 h-5" onChange={e => setAccepted(e.target.checked)} />
          <p className="text-xs text-red-800 font-bold leading-relaxed">أتعهد أمام الله تعالى بدفع عمولة الموقع (1%) من قيمة البيع إبراءً لذمتي ✅</p>
        </div>
        <button disabled={loading || !accepted} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl disabled:bg-gray-300">
          {loading ? <Loader2 className="animate-spin mx-auto"/> : 'نشر الإعلان الآن 🚀'}
        </button>
      </form>
    </div>
  );
};
export default AddCar;
