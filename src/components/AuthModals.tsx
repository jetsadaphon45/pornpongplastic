import React from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { supabase, supabaseCustomers, supabaseProfiles } from '../lib/supabase';

interface UserData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

// Helper ตรวจสอบรูปแบบอีเมล
const validateEmail = (emailStr: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(emailStr);
};

// ดักจับและแสดงข้อผิดพลาดจาก Supabase ใน Alert:
// - ให้แสดงข้อความ error.message หรือ error.error_description จาก Supabase โดยตรงใน Alert
// - หาก error มีวัตถุซ้อน ให้แปลงเป็น alert(JSON.stringify(error, null, 2)) เพื่อให้เห็นสาเหตุที่แท้จริงจาก Supabase
export const handleSupabaseAuthError = (error: any): string => {
  if (!error) {
    const fallback = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Supabase';
    alert(fallback);
    return fallback;
  }

  const isObject = typeof error === 'object' && error !== null;

  // ตรวจสอบว่า error มีวัตถุซ้อน (Nested Object) หรือไม่
  let hasNestedObject = false;
  if (isObject) {
    const propertyKeys = [...Object.keys(error), ...Object.getOwnPropertyNames(error)];
    hasNestedObject = propertyKeys.some((key) => {
      if (key === 'stack') return false; // ข้าม call stack
      const val = error[key];
      return typeof val === 'object' && val !== null && Object.keys(val).length > 0;
    });
  }

  // 1. หาก error มีวัตถุซ้อน ให้แปลงเป็น alert(JSON.stringify(error, null, 2))
  if (hasNestedObject) {
    let stringified = '';
    try {
      stringified = JSON.stringify(error, null, 2);
    } catch {
      stringified = '';
    }

    // หาก native Error stringify ปกติได้ "{}" ให้ดึงตาม Property Names
    if (!stringified || stringified === '{}') {
      try {
        const props = Object.getOwnPropertyNames(error);
        stringified = JSON.stringify(error, props, 2);
      } catch {
        stringified = '';
      }
    }

    if (stringified && stringified !== '{}') {
      alert(stringified);
      return error.message || error.error_description || stringified;
    }
  }

  // 2. ให้แสดงข้อความ error.message หรือ error.error_description จาก Supabase โดยตรงใน Alert
  if (error?.message && typeof error.message === 'string' && error.message.trim()) {
    alert(error.message);
    return error.message;
  }

  if (error?.error_description && typeof error.error_description === 'string' && error.error_description.trim()) {
    alert(error.error_description);
    return error.error_description;
  }

  // 3. หาก error เป็น object แต่ไม่มี message / error_description ให้ stringify ด้วย indent 2
  if (isObject) {
    try {
      let jsonOutput = JSON.stringify(error, null, 2);
      if (!jsonOutput || jsonOutput === '{}') {
        const props = Object.getOwnPropertyNames(error);
        jsonOutput = JSON.stringify(error, props, 2);
      }
      if (jsonOutput && jsonOutput !== '{}') {
        alert(jsonOutput);
        return jsonOutput;
      }
    } catch {
      // ignore
    }
  }

  // 4. กรณีเป็น string หรือค่าอื่นๆ
  const textOutput = typeof error === 'string' ? error : (error?.toString() || 'เกิดข้อผิดพลาดจาก Supabase');
  alert(textOutput);
  return textOutput;
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onOpenForgotPassword?: (initialEmail?: string) => void;
  onLoginSuccess: (user: UserData) => void;
  triggerToast: (msg: string) => void;
}

export function LoginModal({ isOpen, onClose, onOpenRegister, onOpenForgotPassword, onLoginSuccess, triggerToast }: LoginModalProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenForgotPassword) {
      onOpenForgotPassword(email.trim());
    } else {
      if (!email.trim()) {
        setErrors({ email: 'กรุณากรอกอีเมลของท่านเพื่อรับลิงก์รีเซ็ตรหัสผ่าน' });
        return;
      }
      if (!validateEmail(email.trim())) {
        setErrors({ email: 'รูปแบบอีเมลไม่ถูกต้อง' });
        return;
      }
      setErrors({});
      triggerToast(`กำลังเปลี่ยนไปหน้าขอรับรหัส OTP สำหรับ ${email}`);
    }
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
          id: 'admin-001',
          name: 'สมชาย พรพงศ์',
          email: 'admin@pornpong.com',
          phone: '0812345678'
        };
      } else {
        const dbUser = await supabaseCustomers.validateUser(email, password);
        if (dbUser) {
          matchedUser = {
            id: dbUser.id || `customer_${dbUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone
          };
        }
      }

      if (matchedUser) {
        setErrors({});
        onLoginSuccess({
          id: matchedUser.id,
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
  const [step, setStep] = React.useState<'form' | 'otp'>('form');
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset step on modal open/close
  React.useEffect(() => {
    if (isOpen) {
      setStep('form');
      setOtpCode('');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper to normalize and validate Thai phone numbers
  const normalizeThaiPhone = (raw: string): string => {
    let cleaned = raw.replace(/[\s\-\(\)\.]/g, '');
    if (cleaned.startsWith('+66')) {
      cleaned = '0' + cleaned.slice(3);
    }
    return cleaned;
  };

  // 1. ฟังก์ชันสั่งส่ง OTP ผ่าน Supabase Auth
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    }

    const cleanedPhone = normalizeThaiPhone(phone);
    if (!phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^[0-9]+$/.test(cleanedPhone)) {
      newErrors.phone = 'เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น';
    } else if (cleanedPhone.length !== 10) {
      newErrors.phone = `เบอร์โทรศัพท์ไทยต้องมี 10 หลัก (ปัจจุบันมี ${cleanedPhone.length} หลัก)`;
    } else if (!cleanedPhone.startsWith('0')) {
      newErrors.phone = 'เบอร์โทรศัพท์ไทยต้องขึ้นต้นด้วยเลข 0 (เช่น 0812345678)';
    }

    if (!email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!validateEmail(email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (password.length < 8) {
      newErrors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
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

    setIsLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase client ยังไม่ได้ถูกกำหนดค่า');
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true, // อนุญาตให้สร้างบัญชีใหม่ถ้ายังไม่มีในระบบ
          data: {
            full_name: fullName.trim(),
            phone: cleanedPhone,
          }
        }
      });

      if (error) {
        const errorMsg = handleSupabaseAuthError(error);
        setErrors({ form: errorMsg });
        return;
      }

      setStep('otp'); // สลับไปหน้ากรอก OTP
      setErrors({});
      triggerToast(`ส่งรหัส OTP ไปยัง ${email.trim()} เรียบร้อยแล้ว`);
    } catch (err: any) {
      const errorMsg = handleSupabaseAuthError(err);
      setErrors({ form: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. ฟังก์ชันขอส่งรหัส OTP ใหม่อีกครั้ง
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client ยังไม่ได้ถูกกำหนดค่า');
      }
      const cleanedPhone = normalizeThaiPhone(phone);
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName.trim(),
            phone: cleanedPhone,
          }
        }
      });

      if (error) {
        const errorMsg = handleSupabaseAuthError(error);
        setErrors({ otp: errorMsg });
        return;
      }

      setErrors({});
      triggerToast(`ส่งรหัส OTP ใหม่ไปยัง ${email.trim()} เรียบร้อยแล้ว`);
    } catch (err: any) {
      const errorMsg = handleSupabaseAuthError(err);
      setErrors({ otp: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. ฟังก์ชันยืนยัน OTP ผ่าน Supabase Auth
  const handleVerifyOtpAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedOtp = otpCode.trim();

    if (!cleanedOtp) {
      setErrors({ otp: 'กรุณากรอกรหัส OTP 6 หลัก' });
      return;
    }

    if (cleanedOtp.length !== 6) {
      setErrors({ otp: 'กรุณากรอกรหัส OTP ให้ครบ 6 หลัก' });
      return;
    }

    try {
      setIsLoading(true);

      if (!supabase) {
        throw new Error('Supabase client ยังไม่ได้ถูกกำหนดค่า');
      }

      // Verify OTP via Supabase Auth (รองรับทั้ง type: 'email' จาก signInWithOtp และ 'signup')
      let verifyResult = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanedOtp,
        type: 'email'
      });

      if (verifyResult.error) {
        const fallbackResult = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: cleanedOtp,
          type: 'signup'
        });
        if (!fallbackResult.error) {
          verifyResult = fallbackResult;
        }
      }

      if (verifyResult.error) {
        const errorMsg = handleSupabaseAuthError(verifyResult.error);
        setErrors({ otp: errorMsg });
        return;
      }

      // Save customer profile in database
      const finalPhone = normalizeThaiPhone(phone) || phone.trim();
      const newAccount = {
        name: fullName.trim(),
        email: email.trim(),
        phone: finalPhone,
        password: password,
        membership_level: 'Standard',
        points: 0
      };

      const createdCustomer = await supabaseCustomers.create(newAccount);
      const registeredUserId = (verifyResult as any)?.data?.user?.id || createdCustomer?.id || `customer_${email.trim().replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Clear state
      setFullName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setErrors({});
      setStep('form');

      triggerToast('ยืนยันรหัส OTP และสมัครสมาชิกสำเร็จ!');
      onRegisterSuccess({
        id: registeredUserId,
        name: newAccount.name,
        email: newAccount.email,
        phone: newAccount.phone
      });

      // Dispatch customer-registered and customers-updated event
      window.dispatchEvent(new Event('customer-registered'));
      window.dispatchEvent(new Event('customers-updated'));

      onClose();
    } catch (err: any) {
      const errorMsg = handleSupabaseAuthError(err);
      setErrors({ otp: errorMsg });
    } finally {
      setIsLoading(false);
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
            <p className="text-[11px] text-slate-500 mt-0.5">
              {step === 'otp' 
                ? `กรอกรหัสยืนยัน 6 หลักที่ส่งไปที่ ${email || 'example@yourmail.com'}`
                : 'กรอกข้อมูลเบื้องต้นเพื่อเข้าร่วมเป็นครอบครัวพรพงศ์เรือพลาสติก'
              }
            </p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            id="close-register-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: STEP 2 - OTP VERIFICATION */}
        {step === 'otp' ? (
          <form onSubmit={handleVerifyOtpAndCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errors.form && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Info Box */}
            <div className="rounded-xl border border-sky-200/80 bg-sky-50/80 p-3.5 flex items-center gap-2.5 text-xs text-slate-700 shadow-xs">
              <div className="h-7 w-7 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0 text-brand-blue">
                <KeyRound size={15} />
              </div>
              <div className="flex-1">
                <span className="font-bold text-brand-blue block text-[11px]">รหัสยืนยัน OTP ถูกส่งไปยังอีเมลของคุณแล้ว</span>
                <span className="text-[10px] text-slate-500">กรุณาตรวจสอบกล่องข้อความหรือโฟลเดอร์ Junk/Spam ในอีเมลของคุณเพื่อนำรหัส 6 หลักมายืนยัน</span>
              </div>
            </div>

            {/* Single Centered OTP Input Field */}
            <div className="space-y-2 py-2">
              <label className="block text-center text-xs font-bold text-slate-700">
                รหัสยืนยันความปลอดภัย (OTP 6 หลัก)
              </label>
              <div className="relative flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="------"
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpCode(val);
                    if (errors.otp) setErrors({});
                  }}
                  className={`w-4/5 max-w-[240px] text-center font-mono text-2xl font-bold tracking-[0.5em] rounded-xl border ${
                    errors.otp ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-50'
                  } bg-slate-50 py-3 px-4 outline-hidden focus:ring-4 transition-all`}
                  id="register-otp-input"
                />
              </div>
              {errors.otp && (
                <p className="text-center text-[10px] font-semibold text-red-500">{errors.otp}</p>
              )}
            </div>

            {/* Main Button: Emerald Green */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 shadow-md shadow-emerald-50 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              id="register-verify-otp-button"
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>ยืนยันรหัส OTP และสร้างบัญชี</span>
              )}
            </button>

            {/* Resend OTP & Back Button Links */}
            <div className="flex flex-col items-center gap-2 pt-1 text-xs">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleResendOtp}
                className="font-semibold text-brand-blue hover:text-sky-700 hover:underline cursor-pointer disabled:opacity-50"
                id="register-resend-otp-button"
              >
                ไม่ได้รับรหัส? คลิกเพื่อส่ง OTP ใหม่อีกครั้ง
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrors({});
                }}
                className="font-medium text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
                id="back-to-register-form"
              >
                <ArrowLeft size={13} />
                <span>ย้อนกลับไปแก้ไขข้อมูล</span>
              </button>
            </div>
          </form>
        ) : (
          /* Modal Body: STEP 1 - REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setFullName(val);
                    if (errors.fullName && val.trim()) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.fullName;
                        return next;
                      });
                    }
                  }}
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
              <label className="block text-xs font-bold text-slate-600">เบอร์โทรศัพท์ (Mobile 10 หลัก)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Phone size={15} />
                </span>
                <input
                  type="tel"
                  placeholder="เช่น 0812345678 หรือ 081-234-5678"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPhone(val);
                    // Clear error immediately when user starts or continues typing
                    if (errors.phone) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        // Remove "กรุณากรอกเบอร์โทรศัพท์" as soon as any character is entered
                        if (val.trim()) {
                          delete next.phone;
                        }
                        return next;
                      });
                    }
                  }}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    if (errors.email && val.trim()) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }
                  }}
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
                <label className="block text-xs font-bold text-slate-600">รหัสผ่าน (8+ ตัวอักษร)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPassword(val);
                      if (errors.password && val) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.password;
                          return next;
                        });
                      }
                    }}
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfirmPassword(val);
                      if (errors.confirmPassword && val) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.confirmPassword;
                          return next;
                        });
                      }
                    }}
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
              disabled={isLoading}
              className="w-full mt-2 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs py-2.8 shadow-md shadow-sky-50 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              id="register-submit-button"
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>สมัครสมาชิก</span>
              )}
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
        )}
      </div>
    </div>
  );
}

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
  initialEmail?: string;
  onResetSuccess?: (user: UserData) => void;
  triggerToast: (msg: string) => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  onBackToLogin,
  initialEmail = '',
  onResetSuccess,
  triggerToast,
}: ForgotPasswordModalProps) {
  const [step, setStep] = React.useState<'email' | 'otp' | 'new_password'>('email');
  const [email, setEmail] = React.useState(initialEmail || '');
  const [otpCode, setOtpCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const requestOtpButtonRef = React.useRef<HTMLButtonElement>(null);

  // Reset state on modal open/close & sync initialEmail
  React.useEffect(() => {
    if (isOpen) {
      setStep('email');
      const cleanInitial = (initialEmail || '').trim();
      setEmail(cleanInitial);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});

      // จัดการ Focus และความพร้อมตามข้อกำหนด:
      // - หากผู้ใช้ยังไม่ได้กรอกอีเมลในหน้าแรก ให้โฟกัสช่องกรอกอีเมลตามปกติ
      // - หากผู้ใช้พิมพ์อีเมลไว้ถูกต้องแล้ว เมื่อเปิดหน้า "ลืมรหัสผ่าน" ให้แสดงอีเมลนั้นค้างไว้ และพร้อมกดปุ่ม "ขอรับรหัส OTP" ได้ทันที
      const timer = setTimeout(() => {
        if (cleanInitial && validateEmail(cleanInitial)) {
          requestOtpButtonRef.current?.focus();
        } else {
          emailInputRef.current?.focus();
        }
      }, 80);

      return () => clearTimeout(timer);
    }
  }, [isOpen, initialEmail]);

  // Countdown timer for resending OTP
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  // ขั้นตอนที่ 1 (กรอกอีเมล): ขอรับรหัส OTP ผ่าน supabase.auth.resetPasswordForEmail(email)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrors({ email: 'กรุณากรอกอีเมลที่ลงทะเบียนไว้' });
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setErrors({ email: 'รูปแบบอีเมลไม่ถูกต้อง' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (!supabase) {
        throw new Error('Supabase client ยังไม่ได้ถูกกำหนดค่า');
      }

      // เรียกใช้งาน supabase.auth.resetPasswordForEmail(email)
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);

      if (error) {
        const errorMsg = handleSupabaseAuthError(error);
        setErrors({ email: errorMsg });
        return;
      }

      triggerToast(`ส่งรหัส OTP 6 หลักไปยัง ${cleanEmail} เรียบร้อยแล้ว`);
      setCountdown(60);
      // สลับหน้า Modal ไปยังหน้า "กรอกรหัส OTP 6 หลัก"
      setStep('otp');
    } catch (err: any) {
      const errorMsg = handleSupabaseAuthError(err);
      setErrors({ email: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // ขอรหัส OTP ใหม่อีกครั้ง
  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setIsLoading(true);
    try {
      if (!supabase) throw new Error('Supabase client ยังไม่ได้ถูกกำหนดค่า');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        triggerToast(handleSupabaseAuthError(error));
        return;
      }
      setCountdown(60);
      triggerToast(`ส่งรหัส OTP ใหม่อีกครั้งไปยัง ${email.trim()} เรียบร้อยแล้ว`);
    } catch (err: any) {
      triggerToast(handleSupabaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ขั้นตอนที่ 2 (ยืนยัน OTP 6 หลัก): เรียกใช้งาน supabase.auth.verifyOtp({ email, token, type: 'recovery' })
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedOtp = otpCode.trim();

    if (!cleanedOtp) {
      setErrors({ otp: 'กรุณากรอกรหัส OTP 6 หลัก' });
      return;
    }
    if (cleanedOtp.length !== 6) {
      setErrors({ otp: 'กรุณากรอกรหัส OTP ให้ครบ 6 หลัก' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (!supabase) {
        throw new Error('Supabase client ยังไม่ได้ถูกกำหนดค่า');
      }

      // เรียกใช้งาน supabase.auth.verifyOtp({ email, token, type: 'recovery' })
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanedOtp,
        type: 'recovery',
      });

      if (error) {
        const errorMsg = handleSupabaseAuthError(error);
        setErrors({ otp: errorMsg });
        return;
      }

      // หากรหัสถูกต้อง ให้เปิดหน้า/สลับไปยังขั้นตอน "ตั้งรหัสผ่านใหม่" ทันที
      setStep('new_password');
      triggerToast('ยืนยันรหัส OTP ถูกต้อง กรุณากำหนดรหัสผ่านใหม่');
    } catch (err: any) {
      const errorMsg = handleSupabaseAuthError(err);
      setErrors({ otp: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // ขั้นตอนที่ 3 (ตั้งรหัสผ่านใหม่ & Auto Login): เรียกใช้งาน supabase.auth.updateUser({ password: newPassword })
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = 'กรุณาระบุรหัสผ่านใหม่';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (!supabase) {
        throw new Error('Supabase client ยังไม่ได้ถูกกำหนดค่า');
      }

      // เรียกใช้งาน supabase.auth.updateUser({ password: newPassword })
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        const errorMsg = handleSupabaseAuthError(error);
        setErrors({ form: errorMsg });
        return;
      }

      // เมื่อบันทึกสำเร็จ ให้แสดงแจ้งเตือน "เปลี่ยนรหัสผ่านสำเร็จ"
      triggerToast('เปลี่ยนรหัสผ่านสำเร็จ');

      // ทำการ Auto Login พาลูกค้าเข้าสู่ระบบหน้าหลักทันที
      let authUser = data?.user;
      if (!authUser) {
        const { data: userData } = await supabase.auth.getUser();
        authUser = userData?.user;
      }

      let enrichedUser: UserData = {
        id: authUser?.id || `user_${email.trim().replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || email.trim().split('@')[0],
        email: email.trim(),
        phone: authUser?.user_metadata?.phone || '',
        address: '',
      };

      if (authUser?.id) {
        try {
          const profile = await supabaseProfiles.getProfile(authUser.id);
          if (profile) {
            enrichedUser.name = profile.full_name || profile.name || enrichedUser.name;
            enrichedUser.phone = profile.phone || enrichedUser.phone;
            enrichedUser.address = profile.address || profile.delivery_address || enrichedUser.address;
          }
        } catch {
          // ignore
        }
      }

      if (onResetSuccess) {
        onResetSuccess(enrichedUser);
      }
      onClose();
    } catch (err: any) {
      const errorMsg = handleSupabaseAuthError(err);
      setErrors({ form: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl transition-all duration-350 animate-fadeIn"
        id="forgot-password-modal-container"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-sky-50 to-white">
          <div>
            <h2 className="font-display text-base font-extrabold text-slate-850">
              {step === 'email' && 'ลืมรหัสผ่าน (ขอรหัส OTP)'}
              {step === 'otp' && 'ยืนยันรหัส OTP 6 หลัก'}
              {step === 'new_password' && 'ตั้งรหัสผ่านใหม่'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {step === 'email' && 'ระบุอีเมลเพื่อรับรหัส OTP 6 หลักสำหรับรีเซ็ตรหัสผ่าน'}
              {step === 'otp' && `กรอกรหัส 6 หลักที่ได้รับทางอีเมล ${email}`}
              {step === 'new_password' && 'กำหนดรหัสผ่านใหม่สำหรับเข้าสู่ระบบ'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            id="close-forgot-password-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator Progress */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold">
          <div className={`flex items-center gap-1.5 ${step === 'email' ? 'text-brand-blue' : 'text-emerald-600'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
              step === 'email' ? 'bg-brand-blue text-white' : 'bg-emerald-100 text-emerald-700'
            }`}>
              1
            </span>
            <span>กรอกอีเมล</span>
          </div>
          <span className="text-slate-300">──</span>
          <div className={`flex items-center gap-1.5 ${
            step === 'otp' ? 'text-brand-blue' : step === 'new_password' ? 'text-emerald-600' : 'text-slate-400'
          }`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
              step === 'otp' ? 'bg-brand-blue text-white' : step === 'new_password' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
            }`}>
              2
            </span>
            <span>ยืนยัน OTP</span>
          </div>
          <span className="text-slate-300">──</span>
          <div className={`flex items-center gap-1.5 ${step === 'new_password' ? 'text-brand-blue' : 'text-slate-400'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
              step === 'new_password' ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              3
            </span>
            <span>รหัสผ่านใหม่</span>
          </div>
        </div>

        {/* Modal Body */}
        {/* ==================== STEP 1: กรอกอีเมล ==================== */}
        {step === 'email' && (
          <form onSubmit={handleRequestOtp} className="p-6 space-y-4">
            {errors.email && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errors.email}</span>
              </div>
            )}

            <div className="rounded-xl border border-sky-200/80 bg-sky-50/80 p-3.5 flex items-center gap-2.5 text-xs text-slate-700">
              <div className="h-7 w-7 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0 text-brand-blue">
                <KeyRound size={15} />
              </div>
              <div className="flex-1 text-[11px] text-slate-600 leading-normal">
                กรอกอีเมลที่ลงทะเบียนไว้ ระบบจะส่งรหัส OTP 6 หลักไปยังอีเมลของคุณเพื่อยืนยันตัวตน
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">อีเมล (Email)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Mail size={15} />
                </span>
                <input
                  ref={emailInputRef}
                  type="text"
                  placeholder="example@yourmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({});
                  }}
                  className={`w-full rounded-xl border ${
                    errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                  } bg-slate-55 px-3.5 py-2 pl-9 text-xs outline-hidden focus:ring-2`}
                  id="forgot-password-email-input"
                />
              </div>
            </div>

            {/* Request OTP Button */}
            <button
              ref={requestOtpButtonRef}
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs py-3 shadow-md shadow-sky-50 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-sky-300 focus:outline-hidden"
              id="request-otp-button"
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>ขอรับรหัส OTP</span>
              )}
            </button>

            {/* Back to Login Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBackToLogin();
                }}
                className="text-xs font-semibold text-slate-600 hover:text-brand-blue inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                id="back-to-login-button"
              >
                <ArrowLeft size={14} />
                <span>ย้อนกลับไปหน้าเข้าสู่ระบบ</span>
              </button>
            </div>
          </form>
        )}

        {/* ==================== STEP 2: ยืนยัน OTP 6 หลัก ==================== */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-4">
            {errors.otp && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errors.otp}</span>
              </div>
            )}

            {/* Info Box */}
            <div className="rounded-xl border border-sky-200/80 bg-sky-50/80 p-3.5 flex items-center gap-2.5 text-xs text-slate-700 shadow-xs">
              <div className="h-7 w-7 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0 text-brand-blue">
                <KeyRound size={15} />
              </div>
              <div className="flex-1">
                <span className="font-bold text-brand-blue block text-[11px]">รหัส OTP 6 หลักถูกส่งไปยังอีเมลแล้ว</span>
                <span className="text-[10px] text-slate-600 truncate block">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-[10px] text-brand-blue font-bold hover:underline shrink-0"
              >
                เปลี่ยนอีเมล
              </button>
            </div>

            {/* Centered OTP Input */}
            <div className="space-y-2 py-2">
              <label className="block text-center text-xs font-bold text-slate-700">
                กรอกรหัสยืนยัน OTP (6 ตัวอักษร/ตัวเลข)
              </label>
              <div className="relative flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="------"
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.trim().slice(0, 6);
                    setOtpCode(val);
                    if (errors.otp) setErrors({});
                  }}
                  className={`w-4/5 max-w-[240px] text-center font-mono text-2xl font-bold tracking-[0.5em] rounded-xl border ${
                    errors.otp ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-50'
                  } bg-slate-50 py-3 px-4 outline-hidden focus:ring-4 transition-all`}
                  id="reset-otp-input"
                />
              </div>
            </div>

            {/* Verify OTP Button */}
            <button
              type="submit"
              disabled={isLoading || otpCode.trim().length !== 6}
              className="w-full rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs py-3 shadow-md shadow-sky-50 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              id="verify-reset-otp-button"
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>ยืนยันรหัส OTP</span>
              )}
            </button>

            {/* Resend OTP */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-blue cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>ย้อนกลับ</span>
              </button>

              <button
                type="button"
                disabled={countdown > 0 || isLoading}
                onClick={handleResendOtp}
                className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline cursor-pointer disabled:text-slate-400 disabled:no-underline"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                {countdown > 0 ? `ขอรหัสใหม่ได้ใน ${countdown} วิ` : 'ขอรหัส OTP ใหม่อีกครั้ง'}
              </button>
            </div>
          </form>
        )}

        {/* ==================== STEP 3: ตั้งรหัสผ่านใหม่ & Auto Login ==================== */}
        {step === 'new_password' && (
          <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
            {errors.form && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3.5 flex items-center gap-2.5 text-xs text-emerald-800">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                <ShieldCheck size={16} />
              </div>
              <div className="flex-1 text-[11px] leading-normal">
                ยืนยันรหัส OTP สำเร็จแล้ว กรุณากำหนดรหัสผ่านใหม่สำหรับ <span className="font-semibold text-emerald-900">{email}</span>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่านใหม่"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword || errors.form) setErrors({});
                  }}
                  className={`w-full rounded-xl border ${
                    errors.newPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                  } bg-slate-55 px-3.5 py-2 pl-9 pr-9 text-xs outline-hidden focus:ring-2`}
                  id="modal-new-password-input"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-[10px] font-semibold text-red-500">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">ยืนยันรหัสผ่านใหม่</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword || errors.form) setErrors({});
                  }}
                  className={`w-full rounded-xl border ${
                    errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                  } bg-slate-55 px-3.5 py-2 pl-9 pr-9 text-xs outline-hidden focus:ring-2`}
                  id="modal-confirm-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] font-semibold text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 shadow-md shadow-emerald-50 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              id="save-new-password-modal-button"
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>บันทึกรหัสผ่านใหม่</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
