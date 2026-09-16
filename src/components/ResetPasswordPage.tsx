import React from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import { supabase, supabaseProfiles } from '../lib/supabase';
import { handleSupabaseAuthError } from './AuthModals';

interface ResetPasswordPageProps {
  onBackToHome: () => void;
  onOpenLogin: () => void;
  onPasswordResetSuccess: (user: any) => void;
  triggerToast: (msg: string) => void;
}

export function ResetPasswordPage({
  onBackToHome,
  onOpenLogin,
  onPasswordResetSuccess,
  triggerToast,
}: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string>('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // ตรวจสอบข้อมูล Session ของผู้ใช้จากลิงก์รีเซ็ตรหัสผ่าน
  React.useEffect(() => {
    if (!supabase) return;
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            setUserEmail(user.email);
          }
        }
      } catch {
        // ignore
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

      // 1. เรียกใช้งาน supabase.auth.updateUser({ password: newPassword })
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        const errorMsg = handleSupabaseAuthError(error);
        setErrors({ form: errorMsg });
        return;
      }

      // 2. เมื่ออัปเดตสำเร็จ ดึงข้อมูล Session ล่าสุด หรือเรียกใช้ supabase.auth.getSession() เพื่อยืนยันการเข้าสู่ระบบ
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user || data?.user;

      // แสดง Notification แจ้งเตือนภาษาไทยว่า "เปลี่ยนรหัสผ่านสำเร็จ และเข้าสู่ระบบเรียบร้อยแล้ว"
      triggerToast('เปลี่ยนรหัสผ่านสำเร็จ และเข้าสู่ระบบเรียบร้อยแล้ว');

      // 3. เตรียมข้อมูลผู้ใช้สำหรับการล็อกอินอัตโนมัติ (Auto Login)
      let authUser = sessionUser;
      if (!authUser) {
        const { data: userData } = await supabase.auth.getUser();
        authUser = userData?.user;
      }

      let enrichedUser: any = null;
      if (authUser) {
        enrichedUser = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || (authUser.email ? authUser.email.split('@')[0] : 'ผู้ใช้งาน'),
          email: authUser.email || userEmail || '',
          phone: authUser.user_metadata?.phone || '',
          address: ''
        };

        // ดึงข้อมูลโปรไฟล์จาก Supabase profiles
        try {
          if (authUser.id) {
            const profile = await supabaseProfiles.getProfile(authUser.id);
            if (profile) {
              enrichedUser.name = profile.full_name || profile.name || enrichedUser.name;
              enrichedUser.phone = profile.phone || enrichedUser.phone;
              enrichedUser.address = profile.address || profile.delivery_address || enrichedUser.address;
            }
          }
        } catch {
          // ignore
        }
      } else if (userEmail) {
        enrichedUser = {
          id: `user_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: userEmail.split('@')[0],
          email: userEmail,
          phone: '',
          address: ''
        };
      }

      // 4. ทำการ Auto Login และ Redirect พาผู้ใช้ไปยังหน้าหลักของเว็บไซต์ทันที พร้อมอัปเดต State
      onPasswordResetSuccess(enrichedUser);
    } catch (err: any) {
      const errorMsg = handleSupabaseAuthError(err);
      setErrors({ form: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden" id="reset-password-container">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">ตั้งรหัสผ่านใหม่</h1>
              <p className="text-xs text-slate-500">กำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errors.form}</span>
              </div>
            )}

            {userEmail && (
              <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3 flex items-center gap-2.5 text-xs text-slate-700">
                <Mail size={15} className="text-brand-blue shrink-0" />
                <div className="truncate">
                  <span className="text-slate-500">บัญชี: </span>
                  <span className="font-semibold text-slate-800">{userEmail}</span>
                </div>
              </div>
            )}

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
                    if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }));
                  }}
                  className={`w-full rounded-xl border ${
                    errors.newPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                  } bg-slate-55 px-3.5 py-2 pl-9 pr-9 text-xs outline-hidden focus:ring-2`}
                  id="new-password-input"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  id="toggle-show-new-password"
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
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={`w-full rounded-xl border ${
                    errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-brand-blue focus:ring-sky-100'
                  } bg-slate-55 px-3.5 py-2 pl-9 pr-9 text-xs outline-hidden focus:ring-2`}
                  id="confirm-new-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  id="toggle-show-confirm-password"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] font-semibold text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs py-3 shadow-md shadow-sky-50 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              id="save-new-password-button"
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>บันทึกรหัสผ่านใหม่</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onBackToHome}
                className="text-xs font-semibold text-slate-600 hover:text-brand-blue inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                id="reset-back-to-home"
              >
                <ArrowLeft size={14} />
                <span>ย้อนกลับไปหน้าหลัก</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
