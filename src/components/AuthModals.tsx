import React from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabaseCustomers } from '../lib/supabase';

interface UserData {
  name: string;
  email: string;
  phone: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onLoginSuccess: (user: UserData) => void;
  triggerToast: (msg: string) => void;
}

export function LoginModal({ isOpen, onClose, onOpenRegister, onLoginSuccess, triggerToast }: LoginModalProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: 'กรุณากรอกอีเมลของท่านเพื่อรับลิงก์รีเซ็ตรหัสผ่าน' });
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: 'รูปแบบอีเมลไม่ถูกต้อง' });
      return;
    }
    setErrors({});
    triggerToast(`ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง ${email} แล้ว! (ตัวอย่างเสมือน)`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!validateEmail(email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let matchedUser: any = null;
      if (email.trim().toLowerCase() === 'admin@pornpong.com' && password === 'password123') {
        matchedUser = {
          name: 'สมชาย พรพงศ์',
          email: 'admin@pornpong.com',
          phone: '0812345678'
        };
      } else {
        const dbUser = await supabaseCustomers.validateUser(email, password);
        if (dbUser) {
          matchedUser = {
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone
          };
        }
      }

      if (matchedUser) {
        setErrors({});
        onLoginSuccess({
          name: matchedUser.name,
          email: matchedUser.email,
          phone: matchedUser.phone
        });
        setEmail('');
        setPassword('');
        triggerToast('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับกลับสู่พรพงศ์พลาสติก');
        onClose();
      } else {
        setErrors({
          form: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่ได้สมัครสมาชิก'
        });
      }
    } catch (err: any) {
      setErrors({
        form: err.message || 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลกับระบบฐานข้อมูล'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl transition-all duration-350 animate-fadeIn"
        id="login-modal-container"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-gradient-to-r from-sky-50 to-white">
          <div>
            <h2 className="font-display text-lg font-extrabold text-slate-850">เข้าสู่ระบบสมาชิก</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">เข้าสู่ระบบเพื่อเช็คประวัติหรือสะสมสิทธิแลกเป้าหมาย</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            id="close-login-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">อีเมล (Email)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Mail size={15} />
              </span>
              <input
                type="text"
                placeholder="example@yourmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                } bg-slate-55 px-3.5 py-2 pl-9 text-xs outline-hidden focus:ring-2`}
                id="login-email"
              />
            </div>
            {errors.email && <p className="text-[10px] font-semibold text-red-500">{errors.email}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-600">รหัสผ่าน (Password)</label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-[10px] font-bold text-brand-blue hover:underline"
                id="forgot-password-link"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Lock size={15} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่านของท่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                } bg-slate-55 px-3.5 py-2 pl-9 pr-9 text-xs outline-hidden focus:ring-2`}
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] font-semibold text-red-500">{errors.password}</p>}
          </div>

          {/* Tips block for test environment */}
          <div className="bg-sky-50/55 rounded-xl border border-sky-100/50 p-3 text-[10px] text-slate-500 leading-normal">
            <span className="font-bold text-brand-blue">💡 บัญชีทดลองเข้าใช้ได้ทันที:</span> <br />
            อีเมล: <span className="font-semibold select-all text-slate-700">admin@pornpong.com</span> | รหัสผ่าน: <span className="font-semibold select-all text-slate-700">password123</span>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs py-2.8 shadow-md shadow-sky-50 transition-colors cursor-pointer"
            id="login-submit-button"
          >
            เข้าสู่ระบบ
          </button>

          {/* Switch to Register */}
          <div className="text-center pt-2 text-[11px] text-slate-500">
            ยังไม่มีบัญชีสมาชิก?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="font-bold text-brand-blue hover:underline"
              id="switch-to-register"
            >
              สมัครสมาชิกใหม่ได้ที่นี่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onRegisterSuccess: (user: UserData) => void;
  triggerToast: (msg: string) => void;
}

export function RegisterModal({ isOpen, onClose, onOpenLogin, onRegisterSuccess, triggerToast }: RegisterModalProps) {
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    }

    if (!phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (phone.trim().replace(/-/g, '').length < 9) {
      newErrors.phone = 'เบอร์โทรศัพท์ไม่ถูกต้อง (อย่างน้อย 9-10 หลัก)';
    }

    if (!email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!validateEmail(email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'กรุณากรอกยืนยันรหัสผ่าน';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Check duplicate in Supabase
      const duplicatedUser = await supabaseCustomers.checkEmailExists(email);
      if (duplicatedUser) {
        setErrors({ email: 'อีเมลนี้ถูกใช้งานแล้ว กรุณากรอกอีเมลอื่น' });
        return;
      }

      // Save and register account in Supabase
      const newAccount = {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
        membership_level: 'Standard',
        points: 0
      };

      await supabaseCustomers.create(newAccount);

      // Clear state
      setFullName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});

      triggerToast('สมัครสมาชิกสำเร็จ! ท่านสามารถใช้ข้อมูลดังกล่าวเข้าสู่ระบบได้ทันที');
      onRegisterSuccess({
        name: newAccount.name,
        email: newAccount.email,
        phone: newAccount.phone
      });

      // Requirement 5: dispatch customer-registered and customers-updated event
      window.dispatchEvent(new Event('customer-registered'));
      window.dispatchEvent(new Event('customers-updated'));

      onClose();
    } catch (err: any) {
      // Requirement 6: show error.message on register form
      setErrors({
        form: err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน โปรดลองอีกครั้งในภายหลัง'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
      <div 
         className="relative w-full max-w-md overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl transition-all duration-350 animate-fadeIn"
        id="register-modal-container"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-gradient-to-r from-sky-50 to-white">
          <div>
            <h2 className="font-display text-lg font-extrabold text-slate-850">สมัครสมาชิกใหม่</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">กรอกข้อมูลเบื้องต้นเพื่อเข้าร่วมเป็นครอบครัวพรพงศ์เรือพลาสติก</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            id="close-register-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {errors.form && (
            <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}
          
          {/* Full Name Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">ชื่อ-นามสกุล</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <User size={15} />
              </span>
              <input
                type="text"
                placeholder="กรอกชื่อและนามสกุลจริง"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                } bg-slate-55 px-3.5 py-2 pl-9 text-xs outline-hidden focus:ring-2`}
                id="register-fullname"
              />
            </div>
            {errors.fullName && <p className="text-[10px] font-semibold text-red-500">{errors.fullName}</p>}
          </div>

          {/* Phone Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">เบอร์โทรศัพท์ (Mobile)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Phone size={15} />
              </span>
              <input
                type="tel"
                placeholder="เช่น 0891234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                } bg-slate-55 px-3.5 py-2 pl-9 text-xs outline-hidden focus:ring-2`}
                id="register-phone"
              />
            </div>
            {errors.phone && <p className="text-[10px] font-semibold text-red-500">{errors.phone}</p>}
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">อีเมล (Email)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Mail size={15} />
              </span>
              <input
                type="text"
                placeholder="example@yourmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                } bg-slate-55 px-3.5 py-2 pl-9 text-xs outline-hidden focus:ring-2`}
                id="register-email"
              />
            </div>
            {errors.email && <p className="text-[10px] font-semibold text-red-500">{errors.email}</p>}
          </div>

          {/* Password Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">รหัสผ่าน (6+ ตัวอักษร)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border ${
                    errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                  } bg-slate-55 px-3.5 py-2 pl-9 pr-9 text-xs outline-hidden focus:ring-2`}
                  id="register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-semibold text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="ยืนยันรหัสผ่าน"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-xl border ${
                    errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                  } bg-slate-55 px-3.5 py-2 pl-9 pr-9 text-xs outline-hidden focus:ring-2`}
                  id="register-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] font-semibold text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full mt-2 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs py-2.8 shadow-md shadow-sky-50 transition-colors cursor-pointer"
            id="register-submit-button"
          >
            สมัครสมาชิก
          </button>

          {/* Switch to Login */}
          <div className="text-center pt-1.5 text-[11px] text-slate-500">
            มีบัญชีสมาชิกอยู่แล้วใช่ไหม?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="font-bold text-brand-blue hover:underline"
              id="switch-to-login"
            >
              คลิกเพื่อเข้าสู่ระบบที่นี่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
