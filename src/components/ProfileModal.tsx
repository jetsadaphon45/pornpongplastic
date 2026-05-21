import React from 'react';
import { X, User, Phone, Mail, Edit, Save, ShoppingBag, Calendar, LogOut, Check, AlertCircle, Sparkles } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  phone: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserData | null;
  onUpdateProfile: (newUserData: UserData) => void;
  onLogout: () => void;
  triggerToast: (msg: string) => void;
}

// Highly realistic mock order and pre-order datasets
const MOCK_ORDERS = [
  {
    id: "ORD-2026-9874",
    date: "12 มี.ค. 2026",
    productName: "เรือพายพลาสติก ตราพรพงศ์ รุ่น 2.5 เมตร - ท้องเรือแบนสัญจรง่าย",
    color: "สีน้ำเงินพรีเมียม (Royal Blue)",
    amount: "4,900 บาท",
    status: "จัดส่งสำเร็จ",
    shipmentNo: "TH-EX-291823"
  },
  {
    id: "ORD-2026-4512",
    date: "04 ม.ค. 2026",
    productName: "พายพลาสติกเกรดพรีเมียม ใบพายหนาเหนียวพิเศษ",
    color: "สีเหลืองพาสเทล (Pastel Yellow)",
    amount: "350 บาท",
    status: "จัดส่งสำเร็จ",
    shipmentNo: "TH-EX-104928"
  }
];

const MOCK_PREORDERS = [
  {
    id: "PRE-2026-0005",
    date: "18 พ.ค. 2026",
    productName: "เปิดจองล่วงหน้า เรือคายัคคู่ใจทัวร์ริ่ง ตราพรพงศ์ 1 บาร์โค้ด",
    color: "สีส้มสลับเหลือง (Sun Hybrid)",
    deposit: "2,500 บาท (มัดจำ)",
    fullPrice: "14,500 บาท",
    estDelivery: "ก.ค. 2026 (คิวรอบจัดส่งล็อตที่ 2)",
    status: "ยืนยันเงินมัดจำ / กำลังเตรียมหลอมขึ้นรูป"
  }
];

export function ProfileModal({ isOpen, onClose, currentUser, onUpdateProfile, onLogout, triggerToast }: ProfileModalProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Sync state with current user profile details when modal is triggered or user details change
  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditPhone(currentUser.phone);
      setEditEmail(currentUser.email);
    }
    setErrors({});
    setIsEditing(false);
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!editName.trim()) {
      newErrors.editName = 'ชื่อ-นามสกุล ห้ามเว้นว่าง';
    }
    if (!editPhone.trim()) {
      newErrors.editPhone = 'เบอร์โทรศัพท์ ห้ามเว้นว่าง';
    } else if (editPhone.trim().replace(/-/g, '').length < 9) {
      newErrors.editPhone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (9-10 หลัก)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdateProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(), // Keep email as-is or let them edit as-is
    });

    setIsEditing(false);
    setErrors({});
    triggerToast('บันทึกการเปลี่ยนแปลงรหัสข้อมูลสมาชิกสำเร็จ!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
      <div 
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl transition-all duration-300 animate-fadeIn flex flex-col md:flex-row max-h-[90vh]"
        id="profile-modal-container"
      >
        {/* Left Bar: Profile Details Area */}
        <div className="w-full md:w-[350px] bg-gradient-to-b from-sky-50/70 to-white p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-blue/10 rounded-lg text-brand-blue">
                  <User size={18} />
                </div>
                <h2 className="font-display text-base font-extrabold text-slate-850">โปรไฟล์สมาชิก</h2>
              </div>
              {/* Close Button on Mobile layout */}
              <button 
                onClick={onClose}
                className="md:hidden rounded-full p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-dashed border-slate-205">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center text-white font-display text-2xl font-extrabold shadow-md mb-2.5">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="absolute bottom-1 right-0 rounded-full bg-emerald-500 p-1 text-white border-2 border-white">
                  <Check size={10} strokeWidth={4} />
                </div>
              </div>
              <p className="font-display font-black text-slate-800 text-sm">คุณ {currentUser.name}</p>
              <span className="inline-flex items-center gap-1.2 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-blue mt-1">
                <Sparkles size={10} />
                <span>สิทธิพิเศษ: ครอบครัวพรพงศ์</span>
              </span>
            </div>

            {/* Profile Info Form / Display */}
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.8 text-xs outline-hidden focus:border-brand-blue focus:ring-1 focus:ring-sky-100"
                    id="edit-profile-name"
                  />
                  {errors.editName && <p className="text-[10px] font-semibold text-red-500">{errors.editName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.8 text-xs outline-hidden focus:border-brand-blue focus:ring-1 focus:ring-sky-100"
                    id="edit-profile-phone"
                  />
                  {errors.editPhone && <p className="text-[10px] font-semibold text-red-500">{errors.editPhone}</p>}
                </div>

                <div className="space-y-1 opacity-60">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">อีเมล (จำกัดสิทธิ์แก้ไข)</label>
                  <input
                    type="text"
                    value={editEmail}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.8 text-xs cursor-not-allowed outline-hidden"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    id="save-profile-btn"
                  >
                    <Save size={13} />
                    <span>บันทึก</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                      if (currentUser) {
                        setEditName(currentUser.name);
                        setEditPhone(currentUser.phone);
                      }
                    }}
                    className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold py-2 rounded-lg cursor-pointer"
                    id="cancel-profile-btn"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="text-slate-400 mt-0.5 shrink-0">
                    <User size={14} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">ชื่อ-นามสกุล</span>
                    <span className="text-xs text-slate-700 font-medium">{currentUser.name}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="text-slate-400 mt-0.5 shrink-0">
                    <Phone size={14} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">เบอร์โทรศัพท์</span>
                    <span className="text-xs text-slate-700 font-medium">{currentUser.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="text-slate-400 mt-0.5 shrink-0">
                    <Mail size={14} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">อีเมลล็อกอิน</span>
                    <span className="text-xs text-slate-700 font-medium">{currentUser.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 border border-slate-205 rounded-xl text-slate-650 hover:bg-slate-50 font-bold text-xs py-2 transition-all cursor-pointer"
                  id="edit-profile-trigger"
                >
                  <Edit size={13} />
                  <span>แก้ไขข้อมูลโปรไฟล์</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full mt-8 flex items-center justify-center gap-1.5 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer border border-red-100"
            id="profile-logout-button"
          >
            <LogOut size={13} />
            <span>ออกจากระบบสมาชิก</span>
          </button>
        </div>

        {/* Right Area: Historial Tables & Logs Grid */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto min-h-0">
          <div className="space-y-6">
            {/* Header Title with Desktop close */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-black text-slate-800">ประวัติการสั่งซื้อและจับจอง</h3>
                <p className="text-[11px] text-slate-400">ตรวจสอบจัดส่งเรือพลาสติกและคิวพรีออเดอร์ล็อตปัจจุบัน</p>
              </div>
              <button 
                onClick={onClose}
                className="hidden md:flex rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                id="close-profile-modal-desktop"
              >
                <X size={18} />
              </button>
            </div>

            {/* 1. ORDER HISTORY SECTION */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <ShoppingBag size={14} className="text-brand-blue" />
                <span className="font-display font-bold text-xs text-slate-700">ประวัติคำสั่งซื้อสำเร็จ (Order History)</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {MOCK_ORDERS.map((order) => (
                  <div key={order.id} className="p-3.5 border border-slate-100 rounded-xl hover:border-sky-100 hover:shadow-xs transition-colors bg-slate-50/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-slate-800">{order.id}</span>
                        <span className="text-[10px] font-semibold text-slate-400">เมื่อ {order.date}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700">{order.productName}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100/60 text-[11px]">
                      <span className="text-slate-500">สีที่สั่ง: <b className="text-slate-700 font-semibold">{order.color}</b></span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">รหัสสิ่งส่งของ: <code className="text-slate-700 font-medium font-mono">{order.shipmentNo}</code></span>
                        <span className="font-black text-brand-blue">{order.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. PRE-ORDER HISTORY SECTION */}
            <div className="space-y-2.5 pb-4">
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <Calendar size={14} className="text-brand-blue" />
                <span className="font-display font-bold text-xs text-slate-700">ประวัติแคมเปญเรือพรีออเดอร์ (Pre-order History)</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {MOCK_PREORDERS.map((pre) => (
                  <div key={pre.id} className="p-3.5 border border-amber-100/60 rounded-xl bg-orange-50/15">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-slate-800">{pre.id}</span>
                        <span className="text-[10px] font-semibold text-slate-400">จองเมื่อ {pre.date}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        {pre.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700">{pre.productName}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-amber-100/30 text-[11px]">
                      <span className="text-slate-500">สีเดมอนสเตรเตอร์: <b className="text-slate-700 font-semibold">{pre.color}</b></span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">ประมาณการส่งมอบ: <strong className="text-slate-600 font-bold">{pre.estDelivery}</strong></span>
                        <span className="text-slate-400">|</span>
                        <span className="font-semibold text-amber-800">{pre.deposit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom helper notification banner */}
          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[10.5px] text-slate-500">
            <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <span>หากท่านมีรหัสสะสมสิทธิ์ หรือต้องการเปลี่ยนนโยบายการจัดส่ง พิกัดที่อยู่จัดส่งเรือพลาสติก กรุณาแนบใบจองเดิมหรือโทรสายด่วนบริการกลุ่มโรงงานสมุทรสาครโดยตรง</span>
          </div>
        </div>
      </div>
    </div>
  );
}
