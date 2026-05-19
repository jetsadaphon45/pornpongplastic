import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LogIn, Lock, Mail, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      // Check auth state from context after login
      navigate('/profile');
    } else {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 p-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
            <LogIn className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">ยินดีต้อนรับกลับมา</h1>
          <p className="text-gray-500">เข้าสู่ระบบพรพงศ์พลาสติกเพื่อจัดการพรีออเดอร์</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm py-1 text-center font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center space-x-2"
          >
            <span>เข้าสู่ระบบ</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-gray-500 text-sm">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline flex items-center justify-center mt-2 space-x-1">
              <UserPlus className="h-4 w-4" />
              <span>สมัครสมาชิกใหม่</span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
