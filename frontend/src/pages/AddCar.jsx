const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ImagePlus, MapPin, Loader2, CheckCircle2, 
  Coins, Car, Calendar, Gauge, Info, Settings, Fuel, AlertCircle, ShieldCheck 
} from 'lucide-react';
// استيراد مكونات الخريطة
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// إصلاح أيقونة الخريطة لضمان ظهور الدبوس
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const AddCar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // حالة إبراء الذمة
  
  // الحالة الشاملة للبيانات
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    description: '',
    fuel_type: 'بنزين',
    transmission: 'أوتوماتيك',
    currency: 'SAR' 
  });

  // حالة الخريطة
  const [position, setPosition] = useState({ lat: 15.5007, lng: 32.5599 });

  // مكون التقاط الموقع من الخريطة
  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return <Marker position={position} />;
  };

  // معالجة اختيار الصور مع فحص الحجم (2MB لكل صورة)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 2 * 1024 * 1024; // 2 ميجابايت
    let validFiles = [];

    for (let file of files) {
      if (file.size > maxSize) {
        alert(`⚠️ الصورة "${file.name}" حجمها كبير جداً! الحد الأقصى 2 ميجابايت.`);
      } else {
        validFiles.push(file);
      }
    }
    setImageFiles(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("يرجى الموافقة على ميثاق إبراء الذمة أولاً");
      return;
    }
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('lat', position.lat);
    data.append('lng', position.lng);
    for (let i = 0; i < imageFiles.length; i++) {
      data.append('images', imageFiles[i]);
    }

    try {
      await axios.post(`${apiBase}/api/cars/add`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("تمت إضافة سيارتك بنجاح! بانتظار مراجعة الإدارة وتأكيد العمولة ✅");
      navigate('/my-cars');
    } catch (err) {
      alert(err.response?.data?.error || "حدث خطأ أثناء الإضافة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center font-sans" dir="rtl">
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-3xl border border-gray-100 mb-10">
        
        <header className="text-center mb-10">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car size={40} className="text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-blue-900">بيع سيارتك الآن</h2>
          <p className="text-gray-400 mt-2">أدخل تفاصيل السيارة بدقة لتجذب المشترين وتضمن أمان البيع</p>
        </header>

        {/* 1. قسم الصور */}
        <div className="mb-8">
          <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${imageFiles.length > 0 ? 'border-green-300 bg-green-50' : 'border-blue-200 hover:bg-blue-50'}`}>
            <ImagePlus className={imageFiles.length > 0 ? "text-green-500 mb-2" : "text-blue-500 mb-2"} size={48} />
            <span className="text-sm font-bold text-gray-700">
              {imageFiles.length > 0 ? `تم اختيار ${imageFiles.length} صور بنجاح ✅` : "اضغط هنا لرفع صور السيارة"}
            </span>
            <p className="text-xs text-gray-400 mt-2 italic">الحد الأقصى لكل صورة: 2 ميجابايت</p>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {/* 2. المعلومات الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Car size={16} className="text-blue-500"/> الماركة</label>
            <input type="text" placeholder="تويوتا، مرسيدس..." className="w-full bg-gray-50 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Info size={16} className="text-blue-500"/> الموديل</label>
            <input type="text" placeholder="كامري، S-Class..." className="w-full bg-gray-50 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
          </div>
        </div>

        {/* 3. السعر والعملة */}
        <div className="mb-6 bg-blue-50 p-5 rounded-[2rem] border border-blue-100">
          <label className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Coins size={18}/> السعر المطلوب</label>
          <div className="flex gap-3">
            <input 
              type="number" placeholder="0.00" className="flex-1 bg-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-xl text-blue-600"
              onChange={(e) => setFormData({...formData, price: e.target.value})} required 
            />
            <select 
              className="w-40 bg-white text-gray-700 p-4 rounded-xl outline-none font-bold border border-blue-200"
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
            >
              <option value="SAR">ريال سعودي</option>
              <option value="SDG">جنيه سوداني</option>
              <option value="USD">دولار أمريكي</option>
              <option value="AED">درهم إماراتي</option>
            </select>
          </div>
        </div>

        {/* 4. المواصفات الفنية */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Calendar size={16}/> سنة الصنع</label>
            <input type="number" placeholder="2024" className="w-full bg-gray-50 p-4 rounded-2xl outline-none"
              onChange={(e) => setFormData({ ...formData, year: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Gauge size={16}/> الممشى (كم)</label>
            <input type="number" placeholder="0" className="w-full bg-gray-50 p-4 rounded-2xl outline-none"
              onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} required />
          </div>
        </div>

        {/* 5. الوقود والقير */}
        <div className="grid grid-cols-2 gap-5 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Fuel size={16}/> الوقود</label>
            <select className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold"
              onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}>
              <option value="بنزين">بنزين</option>
              <option value="ديزل">ديزل</option>
              <option value="كهرباء">كهرباء</option>
              <option value="هجين">هجين (Hybrid)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Settings size={16}/> القير</label>
            <select className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold"
              onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}>
              <option value="أوتوماتيك">أوتوماتيك</option>
              <option value="عادي">عادي (Manual)</option>
            </select>
          </div>
        </div>

        {/* 6. الموقع (الخريطة) */}
        <div className="mb-8">
          <label className="text-md font-black text-gray-700 mb-3 flex items-center gap-2">
            <MapPin size={20} className="text-red-500" /> موقع تواجد السيارة (حدد بدقة)
          </label>
          <div className="h-72 w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl z-0">
            <MapContainer center={[position.lat, position.lng]} zoom={10} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker />
            </MapContainer>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center italic">اضغط على الخريطة لتغيير مكان تواجد السيارة</p>
        </div>

        {/* 7. الوصف */}
        <div className="mb-8">
           <label className="text-sm font-bold text-gray-600 mr-2 flex items-center gap-2 mb-2"><AlertCircle size={16}/> تفاصيل إضافية</label>
           <textarea placeholder="حالة البودي، الصيانة، الحوادث إن وجدت..." className="w-full bg-gray-50 p-5 rounded-[2rem] h-32 outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium"
             onChange={(e) => setFormData({ ...formData, description: e.target.value })} required></textarea>
        </div>

        {/* ⚖️ ميثاق إبراء الذمة (العمولة) */}
        <div className="mb-8 bg-red-50 p-6 rounded-[2rem] border-2 border-red-100 shadow-inner">
           <div className="flex items-start gap-4">
              <input 
                type="checkbox" 
                id="agreement"
                className="w-6 h-6 mt-1 cursor-pointer accent-red-600"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <label htmlFor="agreement" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                <span className="font-black text-red-600 block mb-1 flex items-center gap-2">
                   <ShieldCheck size={18}/> تعهد وإبراء ذمة
                </span>
                أتعهد أمام الله تعالى بدفع عمولة الموقع وقدرها <span className="font-black text-red-700">(1%)</span> من قيمة البيع في حال تم البيع عن طريق الموقع، وهذا ميثاق غليظ ألتزم به لإبراء ذمتي.
              </label>
           </div>
        </div>

        {/* 🔘 زر النشر */}
        <button 
          type="submit" 
          disabled={loading || !acceptedTerms} 
          className={`w-full py-5 rounded-[2.5rem] font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
            acceptedTerms && !loading 
            ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
          }`}
        >
          {loading ? (
            <> <Loader2 className="animate-spin" /> جاري معالجة البيانات... </>
          ) : (
            <> <CheckCircle2 size={24} /> نشر الإعلان الآن 🚀 </>
          )}
        </button>
      </form>
    </div>
  );
};


export default AddCar;

