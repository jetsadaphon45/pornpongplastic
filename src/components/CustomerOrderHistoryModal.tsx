import React from 'react';
import { 
  X, 
  ShoppingBag, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Eye, 
  Package, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { supabaseOrders, supabasePreOrders } from '../lib/supabase';

interface CustomerOrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    rank?: string;
    rewardPoints?: number;
    registerDate?: string;
  } | null;
  triggerToast: (msg: string) => void;
  onViewSlip?: (slipUrl: string) => void;
}

export function CustomerOrderHistoryModal({
  isOpen,
  onClose,
  customer,
  triggerToast,
  onViewSlip
}: CustomerOrderHistoryModalProps) {
  const [activeTab, setActiveTab] = React.useState<'orders' | 'preorders'>('orders');
  const [orders, setOrders] = React.useState<any[]>([]);
  const [preOrders, setPreOrders] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchCustomerHistory = React.useCallback(async () => {
    if (!customer) return;
    setIsLoading(true);
    try {
      // Direct live query to Supabase orders & pre_orders filtering by user_id
      const [userOrders, userPreOrders] = await Promise.all([
        supabaseOrders.listByUserId(customer.id, customer.email, customer.phone),
        supabasePreOrders.listByUserId(customer.id, customer.phone, customer.name)
      ]);

      setOrders(userOrders || []);
      setPreOrders(userPreOrders || []);
    } catch (err: any) {
      console.error('Failed to load customer order history from Supabase:', err);
      triggerToast('ไม่สามารถโหลดประวัติการสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, [customer, triggerToast]);

  React.useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerHistory();
    }
  }, [isOpen, customer, fetchCustomerHistory]);

  if (!isOpen || !customer) return null;

  const totalSpent = orders.reduce((sum, ord) => sum + (Number(ord.total_amount || ord.amount || 0)), 0);
  const totalDeposit = preOrders.reduce((sum, pre) => sum + (Number(pre.deposit || 0)), 0);
  const grandTotal = totalSpent + totalDeposit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs font-sans animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl transition-all duration-300 flex flex-col max-h-[90vh]"
        id="customer-order-history-modal"
      >
        {/* Modal Header */}
        <div className="p-5 md:px-6 md:py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-slate-800 text-base md:text-lg">
                  ประวัติการสั่งซื้อและจับจอง
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-mono font-bold">
                  {customer.id ? `User ID: ${customer.id.substring(0, 8).toUpperCase()}` : 'User ID: -'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  ⚡ Supabase Live Query
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ลูกค้า: <strong className="text-slate-700 font-semibold">{customer.name}</strong> ({customer.email}) • ดึงข้อมูลกรองตาม user_id ตรงจากตาราง orders / pre_orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                fetchCustomerHistory();
                triggerToast('ส่งคำสั่ง Query ข้อมูลคำสั่งซื้อจาก Supabase แล้ว');
              }}
              className="rounded-full p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
              title="รีเฟรช Query ข้อมูลคำสั่งซื้อจาก Supabase"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-sky-600' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              id="btn-close-customer-order-history"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Customer Stats Summary Banner */}
        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-600">
              <User size={13} className="text-sky-600" />
              <span>ระดับ: <strong className="text-slate-800 font-bold">{customer.rank || 'Standard Family'}</strong></span>
            </div>
            {customer.phone && customer.phone !== 'ไม่ระบุ' && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone size={13} className="text-sky-600" />
                <span className="font-mono">{customer.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-600">
              <Mail size={13} className="text-sky-600" />
              <span>{customer.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-sky-100 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-[10px] text-slate-400 block leading-tight">ยอดสั่งซื้อรวม</span>
              <span className="font-black text-sky-600 text-sm font-mono">฿{grandTotal.toLocaleString()}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-[10px] text-slate-400 block leading-tight">รายการทั้งหมด</span>
              <span className="font-black text-slate-700 text-sm font-mono">{orders.length + preOrders.length} รายการ</span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs: Orders vs Pre-orders */}
        <div className="px-6 pt-3 border-b border-slate-100 flex items-center gap-2 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-1.5 pb-2.5 px-3 border-b-2 font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText size={14} />
            <span>คำสั่งซื้อสำเร็จ / ทั่วไป ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preorders')}
            className={`inline-flex items-center gap-1.5 pb-2.5 px-3 border-b-2 font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'preorders'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar size={14} />
            <span>รายการจองพรีออเดอร์ ({preOrders.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={28} className="animate-spin text-sky-500" />
              <span className="text-xs font-medium">กำลังโหลดข้อมูลออเดอร์จากระบบฐานข้อมูล Supabase...</span>
            </div>
          ) : activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <Package size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-600">ยังไม่มีประวัติคำสั่งซื้อทั่วไป</p>
                <p className="text-xs text-slate-400 mt-1">ลูกค้ารายนี้ยังไม่ได้ทำรายการสั่งซื้อสินค้าพร้อมส่ง</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord, idx) => {
                  const isPaid = ord.payment_status === 'paid' || ord.payment_status === 'approved';
                  const isWaiting = ord.payment_status === 'waiting_verify';
                  return (
                    <div 
                      key={ord.id || idx}
                      className="border border-slate-200 hover:border-sky-200 rounded-2xl p-4 bg-white hover:bg-sky-50/10 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                            #{ord.id}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {ord.created_at ? new Date(ord.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Payment status badge */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isWaiting
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                            {isPaid ? 'ชำระเงินแล้ว' : isWaiting ? 'รอตรวจสอบสลิป' : 'รอชำระเงิน'}
                          </span>

                          {/* Order Status */}
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {ord.order_status === 'confirmed' ? 'ยืนยันออเดอร์' : ord.order_status === 'shipped' ? 'จัดส่งแล้ว' : 'รอดำเนินการ'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-4 pt-2 border-t border-slate-100">
                        <div>
                          <p className="font-bold text-xs text-slate-800">
                            {ord.productName || ord.product_name || 'เรือพลาสติกและอุปกรณ์'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            โทนสี: {ord.color || 'คละสี'} | ผู้สั่ง: {ord.customer_name || customer.name}
                          </p>
                          {ord.shipmentNo && (
                            <p className="text-[11px] text-sky-700 mt-1 font-mono font-bold">
                              🚚 เลขพัสดุ: {ord.shipmentNo}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block">ยอดชำระ</span>
                          <span className="font-black text-sky-600 text-sm font-mono">
                            ฿{Number(ord.total_amount || ord.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Slip preview if available */}
                      {ord.payment_slip_url && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            มีหลักฐานสลิปโอนเงิน
                          </span>
                          <button
                            type="button"
                            onClick={() => onViewSlip ? onViewSlip(ord.payment_slip_url) : window.open(ord.payment_slip_url, '_blank')}
                            className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>ดูรูปสลิป</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            preOrders.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-600">ยังไม่มีประวัติการจองพรีออเดอร์</p>
                <p className="text-xs text-slate-400 mt-1">ลูกค้ารายนี้ยังไม่มีรายการจับจองเรือพลาสติกล็อตล่วงหน้า</p>
              </div>
            ) : (
              <div className="space-y-3">
                {preOrders.map((pre, idx) => (
                  <div 
                    key={pre.id || idx}
                    className="border border-slate-200 hover:border-sky-200 rounded-2xl p-4 bg-white hover:bg-sky-50/10 transition-all shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-mono font-bold border border-sky-100">
                          PRE #{pre.id}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          วันที่จอง: {pre.date || '-'}
                        </span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        {pre.status || 'รอยืนยันการผลิต'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <p className="font-bold text-xs text-slate-800">
                          {pre.productName || 'เรือพลาสติกสั่งผลิตพิเศษ'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          สี: {pre.color || 'ตามระบุ'} | จำนวน: {pre.quantity || 1} ลำ
                        </p>
                        {pre.estDelivery && (
                          <p className="text-[11px] text-slate-600 mt-1">
                            📅 กำหนดส่งมอบโดยประมาณ: <strong>{pre.estDelivery}</strong>
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">มัดจำ / ราคาเต็ม</span>
                        <span className="font-bold text-emerald-600 text-xs font-mono block">
                          มัดจำ ฿{Number(pre.deposit || 0).toLocaleString()}
                        </span>
                        <span className="font-bold text-slate-700 text-xs font-mono block">
                          เต็ม ฿{Number(pre.fullPrice || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:px-6 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            ดึงข้อมูลคำสั่งซื้อแบบ Real-time ตรงจากฐานข้อมูล Supabase
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
