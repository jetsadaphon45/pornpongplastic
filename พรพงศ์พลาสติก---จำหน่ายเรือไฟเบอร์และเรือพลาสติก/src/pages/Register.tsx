import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { UserPlus, User, Mail, Lock, Phone, MessageSquare, MapPin, ArrowRight, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    lineId: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const success = await register({
      ...formData,
      role: 'user'
    } as any);

    if (success) {
      navigate('/profile');
    } else {
      setError('ไม่สามารถลงทะเบียนได้ (อีเมลอาจจะถูกใช้งานแล้ว หรือรหัสผ่านสั้นเกินไป)');
    }
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 p-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">สมัครสมาชิก</h1>
          <p className="text-gray-500">เพื่อความรวดเร็วในการแจ้งพรีออเดอร์และติดตามสินค้า</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">ชื่อ-นามสกุล</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="ชื่อของคุณ"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">รหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">เบอร์โทรศัพท์</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="08x-xxx-xxxx"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">LINE ID</label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                name="lineId"
                required
                value={formData.lineId}
                onChange={handleChange}
                placeholder="@line_id"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">ที่อยู่จัดส่ง</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-6 h-5 w-5 text-gray-400" />
              <textarea
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          {error && <p className="md:col-span-2 text-red-500 text-sm py-1 text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}</span>
            {!isSubmitting && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-gray-500 text-sm">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline flex items-center justify-center mt-2 space-x-1">
              <LogIn className="h-4 w-4" />
              <span>เข้าสู่ระบบ</span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
