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
  Loader2,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Flame,
  Copy,
  ListOrdered,
  PhoneCall
} from 'lucide-react';
import { 
  supabaseOrders, 
  supabasePreOrders, 
  supabaseDeliveries,
  supabase, 
  isSupabaseConfigured,
  formatQueueId,
  parseQueueNumber,
  getActiveProductionQueue,
  QUEUE_STAGES
} from '../lib/supabase';
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
  queueId: string;
  queue_number?: string;
  date: string;
  productName: string;
  color: string;
  amount: string;
  status: string;
  stageNumber: 1 | 2 | 3 | 4;
  stageLabel: string;
  statusMessage: string;
  shipmentNo: string;
  tracking_number?: string;
  estimatedDeliveryDate?: string;
  estimated_delivery_date?: string;
  carrierName?: string;
  shipping_carrier?: string;
  driverPhone?: string;
  driver_phone?: string;
  delivery_status?: string;
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

// Realistic mock orders demonstrating 4-stage delivery flow
const MOCK_ORDERS: OrderItem[] = [
  {
    id: "ORD-2026-9874",
    queueId: "Q-2610-008",
    date: "12 มี.ค. 2026",
    productName: "เรือพายพลาสติก ตราพรพงศ์ รุ่น 2.5 เมตร - ท้องเรือแบนสัญจรง่าย",
    color: "สีน้ำเงินพรีเมียม (Royal Blue)",
    amount: "4,900 บาท",
    status: "จัดส่งสำเร็จ",
    stageNumber: 4,
    stageLabel: "จัดส่งสำเร็จ",
    statusMessage: "จัดส่งสำเร็จเรียบร้อยแล้ว - ขอบคุณที่ไว้วางใจใช้บริการพรพงศ์พลาสติก",
    shipmentNo: "TH-EX-291823",
    carrierName: "รถโรงงานพรพงศ์พลาสติก (สายส่งตรง)",
    driverPhone: "089-456-7890"
  },
  {
    id: "ORD-2026-4512",
    queueId: "Q-2610-011",
    date: "04 ม.ค. 2026",
    productName: "พายพลาสติกเกรดพรีเมียม ใบพายหนาเหนียวพิเศษ",
    color: "สีเหลืองพาสเทล (Pastel Yellow)",
    amount: "350 บาท",
    status: "อยู่ระหว่างจัดส่ง",
    stageNumber: 4,
    stageLabel: "อยู่ระหว่างจัดส่ง",
    statusMessage: "สินค้าอยู่ระหว่างจัดส่ง - ขนส่ง: Flash Express | เบอร์คนขับ/Tracking: 081-234-5678 / TH-EX-104928",
    shipmentNo: "TH-EX-104928",
    carrierName: "Flash Express",
    driverPhone: "081-234-5678"
  },
  {
    id: "ORD-2026-3391",
    queueId: "Q-2610-013",
    date: "07 ต.ค. 2026",
    productName: "เรือไฟเบอร์พลาสติก รุ่น 3 ที่นั่ง สั่งหลอมพิเศษ",
    color: "สีส้มประกายมุก",
    amount: "7,500 บาท",
    status: "รอขนย้าย",
    stageNumber: 3,
    stageLabel: "รอขนย้าย",
    statusMessage: "เรือผลิตเสร็จแล้ว - คาดว่าจะจัดส่งวันที่: พรุ่งนี้ 14:00 น.",
    shipmentNo: "TH-EX-339101",
    estimatedDeliveryDate: "พรุ่งนี้ 14:00 น."
  },
  {
    id: "ORD-2026-1185",
    queueId: "Q-2610-015",
    date: "08 ต.ค. 2026",
    productName: "เรือหัวแหลมกู้ภัยน้ำท่วม ตราพรพงศ์ รุ่น 2.8 เมตร",
    color: "สีเขียวทหาร (Military Green)",
    amount: "5,800 บาท",
    status: "รับคิวผลิต",
    stageNumber: 1,
    stageLabel: "รับคิวผลิต",
    statusMessage: "กำลังหลอมเรือตามสเปกที่คุณออกแบบ ทางโรงงานกำลังดำเนินการผลิตอย่างประณีต",
    shipmentNo: "TH-EX-118520"
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

  // Active Production Queue ID (real-time from factory)
  const [activeFactoryQueue, setActiveFactoryQueue] = React.useState<string>(() => {
    return getActiveProductionQueue();
  });

  // Track primary order for the top Live Queue Card (in-progress orders first)
  const primaryTrackedOrder = React.useMemo(() => {
    return orders.find(o => o.stageNumber !== 4 || o.status !== 'จัดส่งสำเร็จ') || orders[0] || null;
  }, [orders]);

  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = React.useState<ItemToDelete | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Load history from Supabase & Local Cache
  const loadHistory = React.useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const deletedOrdersKey = 'pornpong_deleted_orders';
      const deletedIds: string[] = JSON.parse(localStorage.getItem(deletedOrdersKey) || '[]');

      // 1. Fetch Supabase Orders & Deliveries table (JOIN via order_id)
      let fetchedOrders: any[] = [];
      let deliveriesMap: Record<string, any> = {};
      try {
        const [ordersList, delivs] = await Promise.all([
          supabaseOrders.list(),
          supabaseDeliveries.getAll()
        ]);
        fetchedOrders = ordersList || [];
        deliveriesMap = delivs || {};
      } catch (e) {
        console.warn('Could not list orders and deliveries from Supabase:', e);
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

      const mappedRemoteOrders: OrderItem[] = userOrders.map((o: any, idx: number) => {
        const orderIdStr = String(o.id).trim();
        const delivery = deliveriesMap[orderIdStr] || deliveriesMap[o.id];

        // Read real-time delivery columns joined by order_id
        const queueNum = delivery?.queue_number || o.queue_number || o.queue_id || formatQueueId(o, idx);
        const carrier = delivery?.shipping_carrier || o.shipping_carrier || o.carrier_name || 'รถโรงงานพรพงศ์พลาสติก (สายส่งด่วน)';
        const driver = delivery?.driver_phone || o.driver_phone || '089-456-7890';
        const trackingNo = delivery?.tracking_number || o.tracking_number || o.shipmentNo || o.shipment_no || `TH-EX-${String(o.id).replace(/[^0-9]/g, '').slice(-6) || '291823'}`;
        const estDate = delivery?.estimated_delivery_date || o.estimated_delivery_date || o.est_delivery || '';
        const delivStatus = (delivery?.delivery_status || '').toLowerCase();
        const ordStatus = (o.status || o.order_status || '').toLowerCase();

        let stageNumber: 1 | 2 | 3 | 4 = 1;
        let stageLabel = 'รับคิวผลิต';
        let statusMessage = 'โรงงานลงทะเบียนรับคิวผลิตของคุณเข้าระบบเรียบร้อยแล้ว';

        if (delivStatus === 'delivered' || delivStatus === 'completed' || ordStatus === 'delivered' || ordStatus === 'completed') {
          stageNumber = 4;
          stageLabel = 'จัดส่งสำเร็จ';
          statusMessage = 'จัดส่งสำเร็จเรียบร้อยแล้ว - ขอบคุณที่ไว้วางใจใช้บริการพรพงศ์พลาสติก';
        } else if (delivStatus === 'in_transit' || ordStatus === 'in_transit' || ordStatus === 'shipped' || ordStatus === 'shipping' || o.queue_stage === 4) {
          stageNumber = 4;
          stageLabel = 'อยู่ระหว่างจัดส่ง';
          statusMessage = `สินค้าอยู่ระหว่างจัดส่ง - ขนส่ง: ${carrier} | เบอร์คนขับ: ${driver} | Tracking: ${trackingNo}`;
        } else if (delivStatus === 'ready_for_shipping' || ordStatus === 'ready_for_shipping' || ordStatus === 'ready' || o.queue_stage === 3) {
          stageNumber = 3;
          stageLabel = 'รอขนย้าย';
          statusMessage = `เรือผลิตเสร็จแล้ว - คาดว่าจะจัดส่งวันที่: ${estDate || 'กำลังประสานงานคิวจัดส่ง'}`;
        } else if (delivStatus === 'manufacturing' || ordStatus === 'manufacturing' || ordStatus === 'processing' || ordStatus === 'paid' || o.queue_stage === 2) {
          stageNumber = 2;
          stageLabel = 'กำลังหลอม/ผลิต';
          statusMessage = 'กำลังหลอมเรือตามสเปกที่คุณออกแบบ';
        } else {
          stageNumber = 1;
          stageLabel = 'รับคิวผลิต';
          statusMessage = 'โรงงานลงทะเบียนรับคิวผลิตของคุณเข้าระบบเรียบร้อยแล้ว';
        }

        const rawAmount = typeof o.amount === 'number' ? o.amount : (Number(o.total_amount || 0));
        const formattedAmount = rawAmount > 0 ? `฿${rawAmount.toLocaleString()}` : (o.amount || '฿0');

        return {
          id: o.id,
          queueId: queueNum,
          queue_number: queueNum,
          date: o.date || (o.created_at ? new Date(o.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'เมื่อเร็วๆ นี้'),
          productName: o.productName || 'เรือพลาสติกและอุปกรณ์',
          color: o.color || 'คละสี',
          amount: formattedAmount,
          status: stageLabel,
          stageNumber,
          stageLabel,
          statusMessage,
          shipmentNo: trackingNo,
          tracking_number: trackingNo,
          estimatedDeliveryDate: estDate,
          estimated_delivery_date: estDate,
          carrierName: carrier,
          shipping_carrier: carrier,
          driverPhone: driver,
          driver_phone: driver,
          delivery_status: delivStatus || ordStatus
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

  // Real-time synchronization for order delivery, approvals, and factory queue
  React.useEffect(() => {
    if (!isOpen) return;

    const handleSync = () => {
      loadHistory();
      setActiveFactoryQueue(getActiveProductionQueue());
    };

    const handleQueueSync = (e: any) => {
      if (e?.detail?.activeQueueId) {
        setActiveFactoryQueue(e.detail.activeQueueId);
      } else {
        setActiveFactoryQueue(getActiveProductionQueue());
      }
      loadHistory();
    };

    window.addEventListener('orders-updated', handleSync);
    window.addEventListener('pornpong-order-delivered', handleSync);
    window.addEventListener('pornpong-order-approved', handleSync);
    window.addEventListener('pornpong-queue-updated', handleQueueSync);
    window.addEventListener('pornpong-delivery-updated', handleSync);
    window.addEventListener('storage', handleSync);

    // Supabase Realtime Channel Subscription for both orders and deliveries tables
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('public:orders-deliveries-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => {
              loadHistory();
              setActiveFactoryQueue(getActiveProductionQueue());
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'deliveries' },
            () => {
              loadHistory();
              setActiveFactoryQueue(getActiveProductionQueue());
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription caught error in ProfileModal:', err);
      }
    }

    return () => {
      window.removeEventListener('orders-updated', handleSync);
      window.removeEventListener('pornpong-order-delivered', handleSync);
      window.removeEventListener('pornpong-order-approved', handleSync);
      window.removeEventListener('pornpong-queue-updated', handleQueueSync);
      window.removeEventListener('pornpong-delivery-updated', handleSync);
      window.removeEventListener('storage', handleSync);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [isOpen, loadHistory]);

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

            {/* -------------------------------------------------------------
                LIVE QUEUE TRACKING & PRE-ORDER STATUS CARD (บัตรติดตามคิว)
                ------------------------------------------------------------- */}
            {primaryTrackedOrder && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-sky-950 p-5 sm:p-6 text-white shadow-xl border border-sky-500/30">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 space-y-4">
                  {/* Top Bar: Title & Realtime Badge */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30 shadow-xs">
                        <ListOrdered size={16} />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-sm text-white tracking-wide">
                          บัตรติดตามคิวและสถานะพรีออเดอร์
                        </h3>
                        <span className="text-[10.5px] text-slate-300">
                          {primaryTrackedOrder.productName} ({primaryTrackedOrder.color})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-2xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>⚡ ระบบ Real-time จากโรงงาน</span>
                      </span>
                    </div>
                  </div>

                  {/* Main Queue Status Grid */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Customer's Queue Number */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-sky-300 block">
                        เลขคิวของคุณ (Your Queue ID)
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-3xl sm:text-4xl font-black text-amber-400 tracking-tight drop-shadow-sm">
                          {primaryTrackedOrder.queueId || 'Q-2610-015'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-extrabold border ${
                          primaryTrackedOrder.stageNumber === 4
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : primaryTrackedOrder.stageNumber === 3
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                            : primaryTrackedOrder.stageNumber === 2
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                        }`}>
                          {primaryTrackedOrder.stageLabel}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-slate-400 font-mono block">
                        รหัสคำสั่งซื้อ: #{primaryTrackedOrder.id}
                      </span>
                    </div>

                    {/* Right: Real-time Queue Calculation Box */}
                    <div className="bg-black/30 border border-white/10 rounded-xl p-3 md:max-w-md w-full space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Flame size={12} className="text-amber-400 animate-pulse" />
                          <span>โรงงานกำลังผลิตคิว:</span>
                        </span>
                        <span className="font-mono font-black text-amber-400 text-xs">
                          {activeFactoryQueue}
                        </span>
                      </div>

                      {/* Remaining Calculation */}
                      <div className="text-xs font-bold text-white pt-0.5">
                        {(() => {
                          const myQ = parseQueueNumber(primaryTrackedOrder.queueId || 'Q-2610-015');
                          const activeQ = parseQueueNumber(activeFactoryQueue || 'Q-2610-012');
                          const remaining = myQ - activeQ;

                          if (remaining > 0) {
                            return (
                              <p className="text-amber-300">
                                ขณะนี้โรงงานกำลังผลิตคิว <span className="font-mono underline">{activeFactoryQueue}</span> (อีก <strong className="text-white text-sm bg-amber-500/30 px-1.5 py-0.2 rounded-md">{remaining}</strong> คิวจะถึงเรือของคุณ)
                              </p>
                            );
                          } else if (remaining === 0 || primaryTrackedOrder.stageNumber === 2) {
                            return (
                              <p className="text-amber-300 flex items-center gap-1.5 font-extrabold">
                                <Flame size={14} className="text-orange-400 animate-bounce" />
                                <span>🎉 ขณะนี้โรงงานกำลังหลอมขึ้นรูปเรือของคุณในเตาหลอม (คิวปัจจุบัน)!</span>
                              </p>
                            );
                          } else if (primaryTrackedOrder.stageNumber === 3) {
                            return (
                              <p className="text-sky-300 flex items-center gap-1.5 font-bold">
                                <Clock size={13} className="text-sky-400" />
                                <span>✨ เรือของคุณผลิตเสร็จสมบูรณ์แล้ว - อยู่ระหว่างรอขนย้าย</span>
                              </p>
                            );
                          } else {
                            return (
                              <p className="text-emerald-300 flex items-center gap-1.5 font-bold">
                                <Truck size={13} className="text-emerald-400" />
                                <span>🚚 สินค้าอยู่ระหว่างจัดส่งไปยังที่อยู่ของคุณ</span>
                              </p>
                            );
                          }
                        })()}
                      </div>

                      <p className="text-[10px] text-slate-400 leading-tight">
                        {primaryTrackedOrder.statusMessage}
                      </p>
                    </div>
                  </div>

                  {/* Visual Stepper (4 ขั้นตอน) */}
                  <div className="pt-2 pb-1">
                    <div className="relative flex items-center justify-between px-2 sm:px-6 mb-2">
                      {/* Background Connector Bar */}
                      <div className="absolute left-6 right-6 top-3.5 h-1 bg-white/10 rounded-full">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 via-amber-500 via-sky-500 to-emerald-400 transition-all duration-500 rounded-full"
                          style={{
                            width: (primaryTrackedOrder.stageNumber || 1) === 1 ? '0%' :
                              (primaryTrackedOrder.stageNumber || 1) === 2 ? '33%' :
                              (primaryTrackedOrder.stageNumber || 1) === 3 ? '66%' : '100%'
                          }}
                        />
                      </div>

                      {/* 4 Step Nodes */}
                      {[
                        { step: 1, label: '1. รับคิวผลิต', desc: 'ลงทะเบียนรับคิว' },
                        { step: 2, label: '2. กำลังหลอม/ผลิต', desc: 'หลอมขึ้นรูปเรซิ่น' },
                        { step: 3, label: '3. รอขนย้าย', desc: 'ผลิตเสร็จ-รอรถ' },
                        { step: 4, label: '4. อยู่ระหว่างจัดส่ง', desc: 'ขึ้นรถจัดส่งแล้ว' }
                      ].map((s) => {
                        const cur = primaryTrackedOrder.stageNumber || 1;
                        const isPast = cur > s.step;
                        const isCur = cur === s.step;

                        return (
                          <div key={s.step} className="relative z-10 flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isCur
                                ? s.step === 4 
                                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-110 shadow-lg shadow-emerald-500/40' 
                                  : s.step === 3 
                                  ? 'bg-sky-500 text-white ring-4 ring-sky-500/30 scale-110 shadow-lg shadow-sky-500/40'
                                  : s.step === 2
                                  ? 'bg-amber-500 text-white ring-4 ring-amber-500/30 scale-110 shadow-lg shadow-amber-500/40'
                                  : 'bg-violet-500 text-white ring-4 ring-violet-500/30 scale-110 shadow-lg shadow-violet-500/40'
                                : isPast
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {isPast || (isCur && s.step === 4) ? (
                                <Check size={13} strokeWidth={3} />
                              ) : (
                                <span>{s.step}</span>
                              )}
                            </div>
                            <span className={`text-[10px] mt-1 font-bold ${
                              isCur ? 'text-white font-black' : isPast ? 'text-emerald-300' : 'text-slate-400'
                            }`}>
                              {s.label}
                            </span>
                            <span className="text-[8.5px] text-slate-400 max-w-[85px] text-center truncate hidden sm:block">
                              {s.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ข้อมูลขนส่ง (Driver Info) - แสดงทันทีเมื่อเข้าสู่สถานะอยู่ระหว่างจัดส่ง (Step 4) */}
                  {primaryTrackedOrder.stageNumber === 4 && (
                    <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 text-xs space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                          <Truck size={14} className="text-emerald-400" />
                          <span>ข้อมูลการจัดส่งสินค้า (Driver & Shipping Information)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                          สินค้าขึ้นรถจัดส่งเรียบร้อย
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        {/* Carrier Name */}
                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-medium">🚚 บริษัทขนส่ง / รถโรงงาน:</span>
                          <span className="font-bold text-white text-xs block">
                            {primaryTrackedOrder.carrierName || 'รถโรงงานพรพงศ์พลาสติก (สายส่งด่วน)'}
                          </span>
                        </div>

                        {/* Driver Phone */}
                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-medium">📞 เบอร์โทรคนขับ / ผู้ประสานงาน:</span>
                          <a 
                            href={`tel:${primaryTrackedOrder.driverPhone || '0894567890'}`}
                            className="font-bold text-emerald-300 hover:text-emerald-200 text-xs font-mono flex items-center gap-1 transition-colors"
                          >
                            <Phone size={11} />
                            <span>{primaryTrackedOrder.driverPhone || '089-456-7890'}</span>
                          </a>
                        </div>

                        {/* Tracking No & Copy */}
                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-medium">📦 เลข Tracking / รหัสพัสดุ:</span>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-black text-amber-400 text-xs truncate">
                              {primaryTrackedOrder.shipmentNo || 'TH-EX-291823'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(primaryTrackedOrder.shipmentNo || 'TH-EX-291823');
                                triggerToast('คัดลอกเลข Tracking เรียบร้อยแล้ว!');
                              }}
                              className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] text-white flex items-center gap-1 transition-colors cursor-pointer"
                              title="คัดลอกเลข Tracking"
                            >
                              <Copy size={10} />
                              <span>คัดลอก</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-extrabold text-slate-800 font-mono">#{order.id}</span>
                          {order.queueId && (
                            <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 border border-slate-800 shadow-2xs">
                              {order.queueId}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-slate-400">เมื่อ {order.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            order.stageNumber === 4
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-black shadow-2xs'
                              : order.stageNumber === 3
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 font-bold'
                              : order.stageNumber === 2
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                              : 'bg-violet-50 text-violet-700 border border-violet-200 font-bold'
                          }`}>
                            {order.stageNumber === 4 ? (
                              <>
                                <Truck size={12} className="text-emerald-600" />
                                <span>ขั้นตอนที่ 4: อยู่ระหว่างจัดส่ง</span>
                              </>
                            ) : order.stageNumber === 3 ? (
                              <>
                                <Clock size={12} className="text-sky-600" />
                                <span>ขั้นตอนที่ 3: รอขนย้าย</span>
                              </>
                            ) : order.stageNumber === 2 ? (
                              <>
                                <Flame size={12} className="text-amber-600" />
                                <span>ขั้นตอนที่ 2: กำลังหลอม/ผลิต</span>
                              </>
                            ) : (
                              <>
                                <Package size={12} className="text-violet-600" />
                                <span>ขั้นตอนที่ 1: รับคิวผลิต</span>
                              </>
                            )}
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

                      <p className="text-xs font-bold text-slate-800">{order.productName}</p>

                      {/* 4-STAGE STEPPER & TRACKING PROGRESS BAR */}
                      <div className="my-3 pt-2.5 pb-2.5 px-3 bg-white rounded-xl border border-slate-150 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-3">
                          <span className="flex items-center gap-1.5 text-slate-700 font-extrabold">
                            <ListOrdered size={13} className="text-sky-600" />
                            <span>ขั้นตอนการผลิตและจัดส่ง (4 ขั้นตอน)</span>
                          </span>
                          <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                            (order.stageNumber || 1) === 4 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : (order.stageNumber || 1) === 3
                              ? 'bg-sky-100 text-sky-800'
                              : (order.stageNumber || 1) === 2
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-violet-100 text-violet-800'
                          }`}>
                            ขั้นตอนที่ {order.stageNumber || 1} / 4: {order.stageLabel}
                          </span>
                        </div>

                        {/* Stepper Line and Circles */}
                        <div className="relative flex items-center justify-between px-2 sm:px-6 mb-2">
                          {/* Background Connector Line */}
                          <div className="absolute left-6 right-6 top-3.5 h-1 bg-slate-200">
                            {/* Filled Track */}
                            <div 
                              className="h-full bg-gradient-to-r from-violet-500 via-amber-500 via-sky-500 to-emerald-500 transition-all duration-500 rounded-full"
                              style={{
                                width: (order.stageNumber || 1) === 1 ? '0%' : (order.stageNumber || 1) === 2 ? '33%' : (order.stageNumber || 1) === 3 ? '66%' : '100%'
                              }}
                            />
                          </div>

                          {/* 4 Steps */}
                          {[
                            { step: 1, label: 'รับคิวผลิต', desc: 'ลงทะเบียนคิว' },
                            { step: 2, label: 'กำลังหลอม/ผลิต', desc: 'หลอมตามสเปก' },
                            { step: 3, label: 'รอขนย้าย', desc: 'รอคิวรถขนส่ง' },
                            { step: 4, label: 'อยู่ระหว่างจัดส่ง', desc: 'ขึ้นรถจัดส่งแล้ว' },
                          ].map((s) => {
                            const currentStage = order.stageNumber || 1;
                            const isPast = currentStage > s.step;
                            const isCurrent = currentStage === s.step;

                            return (
                              <div key={s.step} className="relative z-10 flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isCurrent
                                    ? s.step === 4 
                                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 shadow-sm' 
                                      : s.step === 3 
                                      ? 'bg-sky-600 text-white ring-4 ring-sky-100 scale-110 shadow-sm'
                                      : s.step === 2
                                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 scale-110 shadow-sm'
                                      : 'bg-violet-600 text-white ring-4 ring-violet-100 scale-110 shadow-sm'
                                    : isPast
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                  {isPast ? (
                                    <Check size={13} strokeWidth={3} />
                                  ) : isCurrent && s.step === 4 ? (
                                    <Check size={13} strokeWidth={3} />
                                  ) : (
                                    <span>{s.step}</span>
                                  )}
                                </div>
                                <span className={`text-[10px] mt-1 font-bold ${
                                  isCurrent ? 'text-slate-900 font-extrabold' : isPast ? 'text-emerald-700' : 'text-slate-400'
                                }`}>
                                  {s.label}
                                </span>
                                <span className="text-[8.5px] text-slate-400 max-w-[85px] text-center truncate hidden sm:block">
                                  {s.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Current Active Step Highlight Info Box */}
                        <div className={`mt-2.5 p-2.5 rounded-xl text-xs border ${
                          (order.stageNumber || 1) === 4
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                            : (order.stageNumber || 1) === 3
                            ? 'bg-sky-50/80 border-sky-200 text-sky-900'
                            : (order.stageNumber || 1) === 2
                            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                            : 'bg-violet-50/80 border-violet-200 text-violet-900'
                        }`}>
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0">
                              {(order.stageNumber || 1) === 4 ? (
                                <Truck size={16} className="text-emerald-600" />
                              ) : (order.stageNumber || 1) === 3 ? (
                                <Clock size={16} className="text-sky-600" />
                              ) : (order.stageNumber || 1) === 2 ? (
                                <Flame size={16} className="text-amber-600" />
                              ) : (
                                <Package size={16} className="text-violet-600" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="font-bold text-[11.5px] flex items-center justify-between flex-wrap gap-1">
                                <span>{order.statusMessage || `ขั้นตอน: ${order.stageLabel || order.status}`}</span>
                                {(order.stageNumber || 1) === 4 && (
                                  <span className="font-bold text-emerald-800 bg-white/90 px-2 py-0.5 rounded-md text-[10px] border border-emerald-200 shadow-2xs">
                                    ขึ้นรถจัดส่งเรียบร้อย ✓
                                  </span>
                                )}
                              </div>

                              {/* Stage 4: ข้อมูลขนส่ง (Driver Info) */}
                              {(order.stageNumber || 1) === 4 && (
                                <div className="text-[10.5px] text-emerald-900 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-medium bg-white/70 p-2 rounded-lg border border-emerald-200/60 mt-1">
                                  <span className="inline-flex items-center gap-1">
                                    🚚 <b>ขนส่ง:</b> {order.carrierName || 'รถโรงงานพรพงศ์พลาสติก'}
                                  </span>
                                  {order.driverPhone && (
                                    <span className="inline-flex items-center gap-1">
                                      📞 <b>เบอร์คนขับ:</b> <a href={`tel:${order.driverPhone}`} className="underline font-bold text-emerald-700">{order.driverPhone}</a>
                                    </span>
                                  )}
                                  {order.shipmentNo && (
                                    <span className="inline-flex items-center gap-1">
                                      📦 <b>Tracking:</b> <code className="text-emerald-950 font-mono font-bold bg-emerald-100/60 px-1 rounded">{order.shipmentNo}</code>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100/60 text-[11px]">
                        <span className="text-slate-500">สีที่สั่ง: <b className="text-slate-700 font-semibold">{order.color}</b></span>
                        <div className="flex items-center gap-2">
                          {order.shipmentNo && (
                            <span className="text-slate-500 text-[10.5px]">
                              รหัสพัสดุ: <code className="text-slate-800 font-medium font-mono bg-slate-100 px-1.5 py-0.5 rounded">{order.shipmentNo}</code>
                            </span>
                          )}
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
