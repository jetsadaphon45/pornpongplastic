import React from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Edit, 
  Save, 
  ShoppingBag, 
  Calendar, 
  LogOut, 
  Check, 
  AlertCircle, 
  Sparkles, 
  MapPin,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { supabaseOrders, supabasePreOrders } from '../lib/supabase';
import AddressManagementView from './AddressManagementView';

interface UserData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserData | null;
  onUpdateProfile: (newUserData: UserData) => void;
  onLogout: () => void;
  triggerToast: (msg: string) => void;
}

interface OrderItem {
  id: string;
  date: string;
  productName: string;
  color: string;
  amount: string;
  status: string;
  shipmentNo: string;
}

interface PreOrderItem {
  id: string;
  date: string;
  productName: string;
  color: string;
  deposit: string;
  fullPrice: string;
  estDelivery: string;
  status: string;
}

interface ItemToDelete {
  id: string;
  type: 'order' | 'pre_order';
  productName: string;
}

// Highly realistic mock order and pre-order datasets
const MOCK_ORDERS: OrderItem[] = [
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

const MOCK_PREORDERS: PreOrderItem[] = [
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
  const [activeSection, setActiveSection] = React.useState<'history' | 'addresses'>('history');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editAddress, setEditAddress] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Orders and Pre-orders state
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [preOrders, setPreOrders] = React.useState<PreOrderItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);

  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = React.useState<ItemToDelete | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Load history from Supabase & Local Cache
  const loadHistory = React.useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const deletedOrdersKey = 'pornpong_deleted_orders';
      const deletedIds: string[] = JSON.parse(localStorage.getItem(deletedOrdersKey) || '[]');

      // 1. Fetch Supabase Orders
      let fetchedOrders: any[] = [];
      try {
        fetchedOrders = await supabaseOrders.list();
      } catch (e) {
        console.warn('Could not list orders from Supabase:', e);
      }

      // Filter orders for current user
      const userOrders = fetchedOrders.filter((o: any) => {
        if (!currentUser) return false;
        if (currentUser.id && o.customer_id === currentUser.id) return true;
        if (currentUser.email && o.customer_email && o.customer_email.toLowerCase() === currentUser.email.toLowerCase()) return true;
        if (currentUser.phone && o.customer_phone === currentUser.phone) return true;
        if (currentUser.name && o.customerName && o.customerName.toLowerCase() === currentUser.name.toLowerCase()) return true;
        return false;
      });

      const mappedRemoteOrders: OrderItem[] = userOrders.map((o: any) => {
        let statusDisplay = 'จัดส่งสำเร็จ';
        const pStatus = (o.payment_status || o.status || '').toLowerCase();
        if (pStatus === 'paid') statusDisplay = 'ชำระเงินแล้ว';
        else if (pStatus === 'approved') statusDisplay = 'อนุมัติเรียบร้อย';
        else if (pStatus === 'waiting_verify') statusDisplay = 'รอตรวจสอบสลิป';
        else if (pStatus === 'pending') statusDisplay = 'รอชำระเงิน';
        else if (pStatus === 'rejected') statusDisplay = 'สลิปไม่ถูกต้อง';

        const rawAmount = typeof o.amount === 'number' ? o.amount : (Number(o.total_amount || 0));
        const formattedAmount = rawAmount > 0 ? `฿${rawAmount.toLocaleString()}` : (o.amount || '฿0');

        return {
          id: o.id,
          date: o.date || (o.created_at ? new Date(o.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'เมื่อเร็วๆ นี้'),
          productName: o.productName || 'เรือพลาสติกและอุปกรณ์',
          color: o.color || 'คละสี',
          amount: formattedAmount,
          status: statusDisplay,
          shipmentNo: o.shipmentNo || `TH-EX-${String(o.id).replace(/[^0-9]/g, '').slice(-6) || '291823'}`
        };
      });

      // Combine remote orders with MOCK_ORDERS so user always has samples to preview
      const combinedOrders: OrderItem[] = [...mappedRemoteOrders];
      MOCK_ORDERS.forEach(mock => {
        if (!combinedOrders.some(o => o.id === mock.id)) {
          combinedOrders.push(mock);
        }
      });
      // Filter out deleted items
      const activeOrders = combinedOrders.filter(o => !deletedIds.includes(o.id));
      setOrders(activeOrders);

      // 2. Fetch Supabase Pre-Orders
      let fetchedPreOrders: any[] = [];
      try {
        fetchedPreOrders = await supabasePreOrders.list();
      } catch (e) {
        console.warn('Could not list pre-orders from Supabase:', e);
      }

      const userPreOrders = fetchedPreOrders.filter((p: any) => {
        if (!currentUser) return false;
        if (currentUser.phone && p.phone === currentUser.phone) return true;
        if (currentUser.name && p.customerName && p.customerName.toLowerCase() === currentUser.name.toLowerCase()) return true;
        return false;
      });

      const mappedRemotePreOrders: PreOrderItem[] = userPreOrders.map((p: any) => ({
        id: p.id,
        date: p.date || 'เมื่อเร็วๆ นี้',
        productName: p.productName || 'เรือคายัคสั่งจองล่วงหน้า',
        color: p.color || 'สีมาตรฐาน',
        deposit: typeof p.deposit === 'number' ? `${p.deposit.toLocaleString()} บาท (มัดจำ)` : (p.deposit || 'มัดจำ'),
        fullPrice: typeof p.fullPrice === 'number' ? `${p.fullPrice.toLocaleString()} บาท` : (p.fullPrice || ''),
        estDelivery: p.estDelivery || 'ตามกำหนดรอบจัดส่ง',
        status: p.status || 'ยืนยันเงินมัดจำ'
      }));

      const combinedPreOrders: PreOrderItem[] = [...mappedRemotePreOrders];
      MOCK_PREORDERS.forEach(mock => {
        if (!combinedPreOrders.some(p => p.id === mock.id)) {
          combinedPreOrders.push(mock);
        }
      });
      const activePreOrders = combinedPreOrders.filter(p => !deletedIds.includes(p.id));
      setPreOrders(activePreOrders);

    } catch (err) {
      console.error('Failed to load user history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [currentUser]);

  // Sync state with current user profile details when modal is triggered or user details change
  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditPhone(currentUser.phone);
      setEditEmail(currentUser.email);
      setEditAddress(currentUser.address || '');
    }
    setErrors({});
    setIsEditing(false);
    if (isOpen) {
      loadHistory();
    }
  }, [currentUser, isOpen, loadHistory]);

  if (!isOpen || !currentUser) return null;

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const { id, type } = itemToDelete;

      // 1. Delete from Supabase orders or pre_orders table according to id
      if (type === 'order') {
        await supabaseOrders.delete(id);
      } else {
        await supabasePreOrders.delete(id);
      }

      // 2. Persist deleted id in localStorage so deleted mock/cached items do not re-appear
      const deletedOrdersKey = 'pornpong_deleted_orders';
      const existingDeleted: string[] = JSON.parse(localStorage.getItem(deletedOrdersKey) || '[]');
      if (!existingDeleted.includes(id)) {
        existingDeleted.push(id);
        localStorage.setItem(deletedOrdersKey, JSON.stringify(existingDeleted));
      }

      // 3. Refresh list on screen immediately
      if (type === 'order') {
        setOrders(prev => prev.filter(item => item.id !== id));
      } else {
        setPreOrders(prev => prev.filter(item => item.id !== id));
      }

      // Notify other parts of the application
      window.dispatchEvent(new Event('order-deleted'));

      triggerToast('ลบรายการสั่งซื้อเรียบร้อยแล้ว');
      setItemToDelete(null);
    } catch (err) {
      console.error('Failed to delete order:', err);
      triggerToast('เกิดข้อผิดพลาดในการลบรายการ');
    } finally {
      setIsDeleting(false);
    }
  };

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
      id: currentUser.id,
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(), // Keep email as-is or let them edit as-is
      address: editAddress.trim(),
    });

    setIsEditing(false);
    setErrors({});
    triggerToast('บันทึกการเปลี่ยนแปลงรหัสข้อมูลสมาชิกสำเร็จ!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/40 backdrop-blur-xs font-sans">
      <div 
        className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl transition-all duration-300 animate-fadeIn flex flex-col md:flex-row max-h-[92vh]"
        id="profile-modal-container"
      >
        {/* Left Bar: Profile Details Area */}
        <div className="w-full md:w-[320px] bg-gradient-to-b from-sky-50/70 to-white p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between shrink-0 overflow-y-auto">
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

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">ที่อยู่จัดส่งสินค้า (บันทึกอัตโนมัติ)</label>
                  <textarea
                    rows={2}
                    placeholder="ที่อยู่จัดส่งสินค้าสำหรับการสั่งซื้อ..."
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.8 text-xs outline-hidden focus:border-brand-blue focus:ring-1 focus:ring-sky-100 resize-none"
                    id="edit-profile-address"
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
                        setEditAddress(currentUser.address || '');
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

                <div className="flex items-start gap-2.5">
                  <div className="text-sky-500 mt-0.5 shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">ที่อยู่จัดส่งที่บันทึกไว้</span>
                    <span className="text-xs text-slate-700 font-medium line-clamp-2">
                      {currentUser.address || 'ยังไม่ได้ระบุ (ระบบจะบันทึกให้อัตโนมัติเมื่อสั่งซื้อ)'}
                    </span>
                  </div>
                </div>

                {/* Switch to Address Management Button */}
                <button
                  type="button"
                  onClick={() => setActiveSection('addresses')}
                  className={`w-full mt-2.5 flex items-center justify-center gap-1.5 border rounded-xl font-bold text-xs py-2 transition-all cursor-pointer ${
                    activeSection === 'addresses'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200/80'
                  }`}
                  id="btn-sidebar-manage-address"
                >
                  <MapPin size={13} />
                  <span>จัดการที่อยู่จัดส่ง (ที่อยู่ของฉัน)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 border border-slate-205 rounded-xl text-slate-650 hover:bg-slate-50 font-bold text-xs py-2 transition-all cursor-pointer"
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

        {/* Right Area: Address Management OR Historial Tables */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto min-h-0 bg-white">
          <div className="space-y-6">
            {/* Top Navigation Tabs & Desktop close */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {/* TAB 1: ประวัติการสั่งซื้อและจับจอง (First on left) */}
                <button
                  type="button"
                  onClick={() => setActiveSection('history')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSection === 'history'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                  id="tab-profile-history"
                >
                  <ShoppingBag size={13} />
                  <span>ประวัติการสั่งซื้อและจับจอง</span>
                </button>

                {/* TAB 2: ที่อยู่ของฉัน (Address Management) (Second on right) */}
                <button
                  type="button"
                  onClick={() => setActiveSection('addresses')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSection === 'addresses'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                  id="tab-profile-addresses"
                >
                  <MapPin size={13} />
                  <span>ที่อยู่ของฉัน (Address Management)</span>
                </button>
              </div>

              <button 
                onClick={onClose}
                className="hidden md:flex rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                id="close-profile-modal-desktop"
              >
                <X size={18} />
              </button>
            </div>

            {/* TAB 1: Order & Pre-order History (First) */}
            {activeSection === 'history' && (
              <div className="space-y-6 animate-fadeIn">

            {/* 1. ORDER HISTORY SECTION */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-brand-blue" />
                  <span className="font-display font-bold text-xs text-slate-700">ประวัติคำสั่งซื้อสำเร็จ (Order History)</span>
                </div>
                {isLoadingHistory && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Loader2 size={11} className="animate-spin" />
                    กำลังโหลด...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {orders.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40">
                    <ShoppingBag size={24} className="mx-auto text-slate-300 mb-1.5" />
                    <p className="text-xs font-bold text-slate-500">ยังไม่มีประวัติคำสั่งซื้อ</p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">เมื่อท่านสั่งซื้อเรือพลาสติก รายการจะแสดงที่นี่</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="p-3.5 border border-slate-100 rounded-xl hover:border-sky-100 hover:shadow-xs transition-colors bg-slate-50/40 relative group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold text-slate-800 font-mono">{order.id}</span>
                          <span className="text-[10px] font-semibold text-slate-400">เมื่อ {order.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {order.status}
                          </span>
                          {/* Trash Icon Button for Deletion */}
                          <button
                            type="button"
                            onClick={() => setItemToDelete({ id: order.id, type: 'order', productName: order.productName })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title="ลบประวัติคำสั่งซื้อนี้"
                            id={`btn-delete-order-${order.id}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
                  ))
                )}
              </div>
            </div>

            {/* 2. PRE-ORDER HISTORY SECTION */}
            <div className="space-y-2.5 pb-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-brand-blue" />
                  <span className="font-display font-bold text-xs text-slate-700">ประวัติแคมเปญเรือพรีออเดอร์ (Pre-order History)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {preOrders.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 bg-orange-50/20">
                    <Calendar size={24} className="mx-auto text-amber-300 mb-1.5" />
                    <p className="text-xs font-bold text-slate-500">ยังไม่มีประวัติการจองเรือล่วงหน้า</p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">เปิดจองแคมเปญเรือรุ่นพิเศษพร้อมรับสิทธิประโยชน์ก่อนใคร</p>
                  </div>
                ) : (
                  preOrders.map((pre) => (
                    <div key={pre.id} className="p-3.5 border border-amber-100/60 rounded-xl bg-orange-50/15 relative group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold text-slate-800 font-mono">{pre.id}</span>
                          <span className="text-[10px] font-semibold text-slate-400">จองเมื่อ {pre.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            {pre.status}
                          </span>
                          {/* Trash Icon Button for Deletion */}
                          <button
                            type="button"
                            onClick={() => setItemToDelete({ id: pre.id, type: 'pre_order', productName: pre.productName })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title="ลบประวัติการสั่งจองนี้"
                            id={`btn-delete-preorder-${pre.id}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ที่อยู่ของฉัน (Address Management) (Second) */}
        {activeSection === 'addresses' && (
          <div className="animate-fadeIn">
            <AddressManagementView
              currentUser={currentUser}
              triggerToast={triggerToast}
              onAddressUpdated={loadHistory}
            />
          </div>
        )}
      </div>

          {/* Bottom helper notification banner */}
          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[10.5px] text-slate-500">
            <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <span>หากท่านมีรหัสสะสมสิทธิ์ หรือต้องการเปลี่ยนนโยบายการจัดส่ง พิกัดที่อยู่จัดส่งเรือพลาสติก กรุณาแนบใบจองเดิมหรือโทรสายด่วนบริการกลุ่มโรงงานสมุทรสาครโดยตรง</span>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Deleting Order / Pre-order */}
      {itemToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div 
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-150"
            id="delete-order-confirmation-dialog"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-sm text-slate-800">
                  {itemToDelete.type === 'order' ? 'ลบประวัติคำสั่งซื้อ' : 'ลบประวัติการสั่งจอง'}
                </h4>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">{itemToDelete.id}</span>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-800 mb-2 leading-relaxed">
              คุณต้องการลบรายการสั่งซื้อนี้ใช่หรือไม่?
            </p>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4">
              <span className="text-slate-400 font-medium">รายการ: </span>
              <span className="font-semibold text-slate-700 line-clamp-2">{itemToDelete.productName}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                id="btn-cancel-delete-order"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                id="btn-confirm-delete-order"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>ยืนยันการลบ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
