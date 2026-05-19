import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { Anchor, Lock, Mail, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือคุณไม่มีสิทธิ์เข้าถึงพอร์ทัลนี้');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="bg-blue-600 p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldAlert className="w-24 h-24 text-white" />
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-4">
              <Anchor className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">ADMIN PORTAL</h1>
            <p className="text-blue-100 text-sm font-bold opacity-80 uppercase tracking-widest mt-1">พรพงศ์พลาสติก</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3"
              >
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-xs font-bold text-red-600">{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    placeholder="admin@pornpongplastic.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    placeholder="admin123"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 group disabled:opacity-50"
            >
              <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบแอดมิน'}</span>
              {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </button>
            
            <div className="pt-4 text-center">
              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="text-gray-400 text-xs font-bold hover:text-blue-600 transition-colors"
              >
                กลับสู่หน้าหลักของเว็บไซต์
              </button>
            </div>
          </form>
        </div>
        
        <p className="text-center text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-8 opacity-50">
          © 2024 PORNPONG PLASTIC ADMIN SYSTEM
        </p>
      </motion.div>
    </div>
  );
}
