import React from 'react';
import { Shield, Lock, User, ArrowLeft, Anchor, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (adminUser: { username: string; email: string }) => void;
  onBackToHome: () => void;
  triggerToast: (msg: string) => void;
}

export default function AdminLoginPage({ onLoginSuccess, onBackToHome, triggerToast }: AdminLoginPageProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated short network delay for premium visual feedback
    setTimeout(() => {
      const trimmedUser = username.trim().toLowerCase();
      
      // Support both "admin" and the previous "admin@pornpongplastic.com"
      const isValidUser = trimmedUser === 'admin' || trimmedUser === 'admin@pornpongplastic.com';
      const isValidPhrase = password === 'Admin@2026';

      if (isValidUser && isValidPhrase) {
        const mockAdminUser = { 
          username: 'admin', 
          email: 'admin@pornpongplastic.com' 
        };

        // Persist to localStorage
        localStorage.setItem('pornpong_admin_authenticated', 'true');
        localStorage.setItem('pornpong_admin_user', JSON.stringify(mockAdminUser));

        triggerToast('ยินดีต้อนรับผู้ดูแลระบบ! เข้าสู่ระบบคอนโซลสำเร็จ');
        onLoginSuccess(mockAdminUser);
      } else {
        setError('ชื่อผู้ใช้งานหรือรหัสผ่านผู้ดูแลระบบไม่ถูกต้อง!');
        triggerToast('เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
      }
      setIsLoading(false);
    }, 700);
  };

  const handleAutofill = () => {
    setUsername('admin');
    setPassword('Admin@2026');
    setError('');
    triggerToast('กรอกรหัสทดสอบสำหรับแอดมินอัตโนมัติแล้ว');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* Decorative blurred backdrops */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Back button to public store */}
      <button
        onClick={onBackToHome}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-250 cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50 text-xs font-semibold shadow-xs"
        id="admin-login-back-btn"
      >
        <ArrowLeft size={16} />
        <span>กลับไปที่หน้าร้านค้าหลัก</span>
      </button>

      {/* Login frame */}
      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-3xl p-8 sm:p-9 shadow-2xl relative z-10 backdrop-blur-md">
        
        {/* Header styling */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-blue to-cyan-500 text-white shadow-xl mb-4 rotate-6 group hover:rotate-12 transition-transform">
            <Shield size={24} className="text-white animate-pulse" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
            เข้าสู่ระบบผู้ดูแลระบบ
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-xs">
            ระเบียนคุมหลังร้าน หลอมแม่พิมพ์และจัดการคิวจัดส่งพรีออเดอร์ ตราพรพงศ์
          </p>
        </div>

        {/* Error notification prompt */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-fadeIn" id="admin-login-error">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
              ชื่อผู้ดูแลระบบ (Username)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <User size={15} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-blue focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                placeholder="ชื่อผู้ใช้งานแอดมิน..."
                id="admin-login-user-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
              รหัสผ่านผู้ดูแลระบบ (Password)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Lock size={15} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-blue focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                placeholder="ป้อนรหัสผ่านสำนักงานหลัก..."
                id="admin-login-pass-field"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-350 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Action Login button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-brand-blue to-cyan-600 hover:from-cyan-500 hover:to-brand-blue text-white rounded-xl py-3 text-xs font-bold transition-all duration-250 cursor-pointer shadow-lg hover:shadow-cyan-550/20 active:scale-98 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            id="admin-login-submit-btn"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>เข้าสู่ระบบคอนโซล</span>
            )}
          </button>
        </form>

        {/* Demo Help Block with credentials */}
        <div className="mt-6 pt-5 border-t border-slate-900 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-medium">รหัสทดสอบสำหรับผู้ตรวจ:</span>
            <button
              type="button"
              onClick={handleAutofill}
              className="text-brand-blue font-bold px-2 py-1 bg-cyan-950/50 rounded-lg border border-cyan-800/50 hover:bg-cyan-900 transition-all cursor-pointer hover:text-cyan-400 active:scale-95"
              id="admin-autofill-info-btn"
            >
              กรอกอัตโนมัติ (Autofill)
            </button>
          </div>
          <div className="bg-slate-905 bg-slate-900/40 border border-slate-850 p-3 rounded-xl text-[10.5px] text-slate-400 space-y-1 font-mono">
            <div>Username: <span className="text-white font-bold select-all">admin</span></div>
            <div>Password: <span className="text-white font-bold select-all">Admin@2026</span></div>
          </div>
        </div>

      </div>

      <div className="mt-8 text-center text-[10px] text-slate-500 flex items-center gap-1.5">
        <Anchor size={11} className="text-slate-600" />
        <span>ระบบความปลอดภัยสำนักงานกลางกองหลอม &copy; พรพงศ์พลาสติก</span>
      </div>
    </div>
  );
}
