import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Key, 
  ShieldCheck, 
  MapPin, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Save, 
  Sparkles, 
  RefreshCw, 
  ShoppingBag, 
  Calendar, 
  Award,
  Loader2
} from 'lucide-react';
import { supabaseCustomers, supabaseUserAddresses } from '../lib/supabase';
import { UserAddress } from '../types';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    password?: string;
    rank?: string;
    rewardPoints?: number;
    registerDate?: string;
    createdAtFull?: string;
  } | null;
  onCustomerUpdated: (updatedCustomer: any) => void;
  onOpenOrderHistory: (customer: any) => void;
  triggerToast: (msg: string) => void;
}

export function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  onCustomerUpdated,
  onOpenOrderHistory,
  triggerToast
}: CustomerDetailModalProps) {
  // Form edit states
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [rank, setRank] = React.useState('Standard');
  const [points, setPoints] = React.useState(0);
  const [currentPassword, setCurrentPassword] = React.useState('');
  
  // Password UI
  const [showPassword, setShowPassword] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Address list state
  const [addresses, setAddresses] = React.useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = React.useState<'info' | 'addresses'>('info');

  // Load initial customer details and addresses
  React.useEffect(() => {
    if (isOpen && customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone === 'ไม่ระบุ' ? '' : (customer.phone || ''));
      setRank(customer.rank || 'Standard');
      setPoints(customer.rewardPoints || 0);
      setCurrentPassword(customer.password || '');
      setNewPassword('');
      setShowPassword(false);

      // Fetch saved addresses from Supabase user_addresses
      const loadAddresses = async () => {
        setIsLoadingAddresses(true);
        try {
          const list = await supabaseUserAddresses.listByUser(customer.id, customer.email);
          setAddresses(list);
        } catch (err) {
          console.warn('Could not load user addresses in detail modal:', err);
          setAddresses([]);
        } finally {
          setIsLoadingAddresses(false);
        }
      };

      loadAddresses();
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    triggerToast(`คัดลอก ${fieldName} แล้ว!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    triggerToast('สร้างรหัสผ่านสุ่มความปลอดภัยสูงแล้ว');
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      triggerToast('กรุณากรอกรหัสผ่านใหม่ที่ต้องการตั้งค่า');
      return;
    }
    if (newPassword.trim().length < 6) {
      triggerToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsResettingPassword(true);
    try {
      if (customer.id) {
        await supabaseCustomers.resetPassword(customer.id, newPassword.trim());
      }
      setCurrentPassword(newPassword.trim());
      setNewPassword('');
      triggerToast(`รีเซ็ตรหัสผ่านของลูกค้า "${customer.name}" สำเร็จแล้ว!`);
      onCustomerUpdated({
        ...customer,
        password: newPassword.trim()
      });
    } catch (err: any) {
      console.error('Reset password failed:', err);
      triggerToast(`ข้อผิดพลาด: ${err.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้'}`);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      triggerToast('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
      return;
    }

    setIsSaving(true);
    try {
      const updates = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || 'ไม่ระบุ',
        membership_level: rank,
        points: Number(points)
      };

      if (customer.id) {
        await supabaseCustomers.updateCustomer(customer.id, updates);
      }

      const updatedCustomer = {
        ...customer,
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        rank: updates.membership_level,
        rewardPoints: updates.points
      };

      onCustomerUpdated(updatedCustomer);
      triggerToast(`บันทึกการแก้ไขข้อมูลลูกค้า "${updates.name}" สำเร็จ!`);
      onClose();
    } catch (err: any) {
      console.error('Failed to update customer:', err);
      triggerToast(`ข้อผิดพลาด: ${err.message || 'ไม่สามารถบันทึกข้อมูลได้'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const customerCode = customer.id ? `CUST-${customer.id.substring(0, 8).toUpperCase()}` : 'CUST-NEW';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs font-sans animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl transition-all duration-300 flex flex-col max-h-[92vh]"
        id="customer-detail-modal"
      >
        {/* Modal Header */}
        <div className="p-5 md:px-6 md:py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <User size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-display font-black text-slate-800 text-base md:text-lg">
                  รายละเอียดและแก้ไขข้อมูลลูกค้า
                </h2>
                <button
                  type="button"
                  onClick={() => handleCopy(customer.id || '', 'รหัสลูกค้า')}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 hover:bg-sky-200 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                  title="คลิกเพื่อคัดลอกรหัสลูกค้า"
                >
                  <span>{customerCode}</span>
                  {copiedField === 'รหัสลูกค้า' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                สมัครสมาชิกเมื่อ: <strong className="text-slate-700 font-semibold">{customer.registerDate || '2026-05-01'}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            id="btn-close-customer-detail"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`inline-flex items-center gap-1.5 pb-2.5 px-3 border-b-2 font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'info'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <User size={14} />
              <span>ข้อมูลส่วนตัว & รหัสผ่าน</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              className={`inline-flex items-center gap-1.5 pb-2.5 px-3 border-b-2 font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'addresses'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <MapPin size={14} />
              <span>รายการที่อยู่จัดส่ง ({addresses.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenOrderHistory(customer);
            }}
            className="mb-2 text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1.5 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 transition-colors cursor-pointer"
          >
            <ShoppingBag size={13} />
            <span>ดูประวัติการสั่งซื้อ</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'info' ? (
            <form onSubmit={handleSaveCustomer} id="form-edit-customer" className="space-y-6">
              {/* Section 1: Personal & Membership Info */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <ShieldCheck size={16} className="text-sky-600" />
                  <h3 className="font-bold text-xs text-slate-800">ข้อมูลพื้นฐานและสถานะสมาชิก</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อ-นามสกุลลูกค้า *
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
                        placeholder="ชื่อ-นามสกุล"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ช่องทางอีเมลติดต่อ *
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เบอร์โทรศัพท์ติดต่อ
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
                        placeholder="08X-XXX-XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ระดับสมาชิก (Membership Rank)
                    </label>
                    <div className="relative">
                      <Award size={14} className="absolute left-3 top-3 text-slate-400" />
                      <select
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white cursor-pointer"
                      >
                        <option value="Standard">Standard Family (ทั่วไป)</option>
                        <option value="Silver Family">Silver Family (ซื้อสะสม)</option>
                        <option value="Gold Family">Gold Family (ลูกค้าประจำ)</option>
                        <option value="VIP Elite">VIP Elite (ตัวแทน/โครงการ)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      แต้มสะสมเกียรติยศ (Reward Points)
                    </label>
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold font-mono text-sky-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      รหัสลูกค้าสากล (UUID)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={customer.id || '-'}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-500 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(customer.id || '', 'UUID')}
                        className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors cursor-pointer shrink-0"
                        title="คัดลอก UUID"
                      >
                        {copiedField === 'UUID' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Password Management & Reset */}
              <div className="bg-sky-50/40 border border-sky-200/80 rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-sky-600" />
                    <h3 className="font-bold text-xs text-slate-800">จัดการรหัสผ่านผู้ใช้งาน (Password Management)</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">ความปลอดภัยระดับผู้ดูแล</span>
                </div>

                {/* Current password preview */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสผ่านปัจจุบัน (Current Password)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        readOnly
                        value={currentPassword || '••••••••'}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(currentPassword, 'รหัสผ่านปัจจุบัน')}
                      disabled={!currentPassword}
                      className="px-3 py-2 border border-slate-200 hover:bg-white bg-white/80 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0 disabled:opacity-50"
                    >
                      {copiedField === 'รหัสผ่านปัจจุบัน' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>คัดลอก</span>
                    </button>
                  </div>
                </div>

                {/* Reset Password Form */}
                <div className="pt-3 border-t border-sky-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ตั้งรหัสผ่านใหม่ (Reset Password ให้ลูกค้า)
                  </label>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
                    />

                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="px-3 py-2 bg-white hover:bg-sky-50 border border-sky-200 text-sky-700 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                      title="สุ่มรหัสผ่านอัตโนมัติ"
                    >
                      <Sparkles size={13} />
                      <span>สุ่มรหัส</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isResettingPassword || !newPassword.trim()}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                    >
                      {isResettingPassword ? <Loader2 size={13} className="animate-spin" /> : <Key size={13} />}
                      <span>บันทึกรหัสใหม่</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    เมื่อกด "บันทึกรหัสใหม่" ระบบจะอัปเดตตรงไปยังตาราง customers บน Supabase ทันที
                  </p>
                </div>
              </div>
            </form>
          ) : (
            /* Section 3: Delivery Addresses View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-800">รายการที่อยู่จัดส่งของลูกค้า</h3>
                  <p className="text-[11px] text-slate-400">
                    ดึงข้อมูลจากตาราง user_addresses และข้อมูลโปรไฟล์ที่บันทึกไว้
                  </p>
                </div>
              </div>

              {isLoadingAddresses ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 size={24} className="animate-spin text-sky-500" />
                  <span className="text-xs font-medium">กำลังโหลดข้อมูลที่อยู่จัดส่ง...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                  <MapPin size={28} className="mx-auto text-slate-300 mb-2" />
                  <h4 className="font-bold text-xs text-slate-700">ยังไม่มีข้อมูลที่อยู่จัดส่งที่บันทึกไว้</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ลูกค้ายังไม่ได้เพิ่มที่อยู่จัดส่งในระบบ หรือยังไม่เคยสั่งซื้อสินค้า
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isDef = !!addr.is_default;
                    return (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-2xl border transition-all relative ${
                          isDef
                            ? 'bg-sky-50/40 border-sky-300 shadow-2xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-bold text-xs text-slate-800">
                            คุณ {addr.recipient_name || customer.name}
                          </span>
                          {isDef && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-600 text-white text-[9.5px] font-bold inline-flex items-center gap-1">
                              <Check size={10} />
                              <span>ที่อยู่เริ่มต้น</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          <p className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                            <Phone size={11} className="text-sky-600" />
                            <span>{addr.phone || customer.phone || 'ไม่ระบุ'}</span>
                          </p>
                          <p className="text-slate-700 leading-relaxed text-[11.5px] pt-1 border-t border-slate-100">
                            {addr.address_line}
                          </p>
                          {(addr.subdistrict || addr.district || addr.province || addr.postal_code) && (
                            <p className="text-slate-500 text-[11px]">
                              {[addr.subdistrict, addr.district, addr.province, addr.postal_code].filter(Boolean).join(' ')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:px-6 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>

          {activeTab === 'info' && (
            <button
              type="submit"
              form="form-edit-customer"
              disabled={isSaving}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>บันทึกการแก้ไขข้อมูล</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
