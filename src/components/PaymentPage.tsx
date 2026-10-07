import React from 'react';
import { 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  Check, 
  User, 
  Phone, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  Anchor,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  ShoppingBag,
  Loader2,
  Search,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { supabaseOrders, isSupabaseConfigured, supabase } from '../lib/supabase';

interface PaymentPageProps {
  order: any;
  onBackToHome: () => void;
  onViewOrderHistory?: () => void;
  triggerToast: (msg: string) => void;
}

export default function PaymentPage({ order, onBackToHome, onViewOrderHistory, triggerToast }: PaymentPageProps) {
  // Navigation Step: 'pay' -> 'verifying'
  const [step, setStep] = React.useState<'pay' | 'verifying'>('pay');
  const [copiedAccount, setCopiedAccount] = React.useState(false);
  const [slipFile, setSlipFile] = React.useState<File | null>(null);
  const [slipPreview, setSlipPreview] = React.useState<string | null>(null);
  const [slipError, setSlipError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Fallback initial order info
  const [activeOrder, setActiveOrder] = React.useState<any>(order || {
    id: 'PP-ORD-' + Math.floor(1000 + Math.random() * 9000),
    customer_name: 'คุณผู้ใช้บริการ',
    customer_email: 'customer@example.com',
    customer_phone: '081-XXX-XXXX',
    total_amount: 15400,
    payment_status: 'pending',
    order_status: 'waiting_payment',
    productName: 'เรือพลาสติก รุ่นยอดนิยม และอุปกรณ์พายเรือคู่',
    color: 'น้ำเงินส้มสีผสม'
  });

  const [currentPaymentStatus, setCurrentPaymentStatus] = React.useState(activeOrder.payment_status || 'pending');
  const [currentOrderStatus, setCurrentOrderStatus] = React.useState(activeOrder.order_status || 'waiting_payment');
  const [uploadedSlipUrl, setUploadedSlipUrl] = React.useState<string>('');

  // Synchronize and lookup order from url params or prop
  React.useEffect(() => {
    if (order) {
      setActiveOrder(order);
      setCurrentPaymentStatus(order.payment_status || 'pending');
      setCurrentOrderStatus(order.order_status || 'waiting_payment');
      if (['pending_verification', 'waiting_approval', 'waiting_verify'].includes(order.payment_status)) {
        if (order.payment_slip_url) {
          setUploadedSlipUrl(order.payment_slip_url);
        }
        setStep('verifying');
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('orderId');
    if (orderIdFromUrl) {
      const fetchOrder = async () => {
        try {
          if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase
              .from('orders')
              .select('*')
              .eq('id', orderIdFromUrl)
              .maybeSingle();
            
            if (data && !error) {
              const formattedOrder = {
                ...data,
                id: data.id,
                customer_name: data.customer_name || data.customerName || 'คุณผู้ใช้บริการ',
                customer_email: data.customer_email || 'guest@example.com',
                customer_phone: data.customer_phone || '081-XXX-XXXX',
                total_amount: Number(data.total_amount || data.amount || 0),
                payment_status: data.payment_status || data.status || 'pending',
                order_status: data.order_status || 'waiting_payment',
                productName: data.productName || data.product_name || 'เรือและชุดพ่วงอุปกรณ์',
                color: data.color || 'คละสี',
                payment_slip_url: data.payment_slip_url || ''
              };
              setActiveOrder(formattedOrder);
              setCurrentPaymentStatus(formattedOrder.payment_status);
              setCurrentOrderStatus(formattedOrder.order_status);
              if (['pending_verification', 'waiting_approval', 'waiting_verify'].includes(formattedOrder.payment_status)) {
                if (formattedOrder.payment_slip_url) {
                  setUploadedSlipUrl(formattedOrder.payment_slip_url);
                }
                setStep('verifying');
              }
            }
          }
        } catch (err) {
          console.error('Error fetching order by URL orderId in PaymentPage:', err);
        }
      };
      fetchOrder();
    }
  }, [order]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('123-4-56789-0');
    setCopiedAccount(true);
    triggerToast('คัดลอกหมายเลขบัญชีธนาคารสำเร็จ!');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const validExtensions = ['jpg', 'jpeg', 'png'];

      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
        setSlipError('กรุณาเลือกเฉพาะไฟล์รูปภาพกลุ่ม .jpg, .jpeg, หรือ .png เท่านั้น');
        triggerToast('กรุณาเลือกเฉพาะไฟล์รูปภาพกลุ่ม .jpg, .jpeg, หรือ .png เท่านั้น');
        return;
      }

      setSlipError(null);
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit via slip attachment path (Mandatory)
  const handleUploadAndSubmitSlip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!slipFile) {
      setSlipError('กรุณาแนบสลิปหลักฐานการโอนเงินก่อนทำการยืนยัน');
      triggerToast('กรุณาแนบสลิปหลักฐานการโอนเงินก่อนทำการยืนยัน');
      return;
    }

    setSlipError(null);
    setIsProcessing(true);
    try {
      let slipUrl = '';
      if (isSupabaseConfigured) {
        try {
          const resUrl = await supabaseOrders.uploadSlip(activeOrder.id, slipFile);
          if (resUrl) {
            slipUrl = resUrl;
            setUploadedSlipUrl(resUrl);
          }
        } catch (uploadErr) {
          console.warn('Storage upload fallback to data URL preview:', uploadErr);
          slipUrl = slipPreview || '';
          setUploadedSlipUrl(slipUrl);
        }
      } else {
        slipUrl = slipPreview || '';
        setUploadedSlipUrl(slipUrl);
      }

      // Update to 'pending_verification' and 'waiting_approval'
      setCurrentPaymentStatus('pending_verification');
      setCurrentOrderStatus('waiting_approval');

      if (isSupabaseConfigured) {
        try {
          await supabaseOrders.updateStatus(activeOrder.id, 'pending_verification');
          if (supabase) {
            await supabase.from('orders').update({
              payment_status: 'pending_verification',
              order_status: 'waiting_approval',
              payment_slip_url: slipUrl
            }).eq('id', activeOrder.id);
          }
        } catch (errStatus) {
          console.warn('Error updating status in Supabase:', errStatus);
        }
      }

      // Sync local storage orders for immediate UI reflection in Admin and Order history
      try {
        const localOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const updatedLocal = localOrders.map((o: any) => 
          o.id === activeOrder.id 
            ? { ...o, payment_slip_url: slipUrl || slipPreview, payment_status: 'pending_verification', order_status: 'waiting_approval' }
            : o
        );
        localStorage.setItem('admin_orders', JSON.stringify(updatedLocal));
      } catch {}

      // Add a notification for the customer
      try {
        const currentNotis = JSON.parse(localStorage.getItem('pornpong_notifications') || '[]');
        const newNoti = {
          id: 'noti-' + Date.now(),
          title: 'ระบบได้รับสลิปการโอนเงินแล้ว',
          message: `คำสั่งซื้อ ${activeOrder.id} กำลังอยู่ในขั้นตอนการตรวจสอบสลิปการโอนเงิน (ใช้เวลาประมาณ 5-15 นาที)`,
          type: 'order',
          date: 'เมื่อครู่',
          isRead: false
        };
        localStorage.setItem('pornpong_notifications', JSON.stringify([newNoti, ...currentNotis]));
      } catch {}

      triggerToast('ระบบได้รับหลักฐานการชำระเงินเรียบร้อยแล้ว กำลังตรวจสอบสลิป...');
      setStep('verifying');
    } catch (err: any) {
      console.error('Failed to submit slip:', err);
      setUploadedSlipUrl(slipPreview || '');
      setCurrentPaymentStatus('pending_verification');
      triggerToast('ระบบได้รับหลักฐานการชำระเงินเรียบร้อยแล้ว');
      setStep('verifying');
    } finally {
      setIsProcessing(false);
    }
  };

  // STEP 2: VERIFICATION PENDING SCREEN (กำลังตรวจสอบการชำระเงิน)
  if (step === 'verifying') {
    return (
      <div className="font-sans min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-sky-100 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-fadeIn">
          
          {/* Animated Spinner & Clock Header Icon */}
          <div className="flex justify-center">
            <div className="relative inline-flex items-center justify-center">
              {/* Soft pulsing glow background */}
              <div className="absolute -inset-3 rounded-full bg-amber-400/25 blur-lg animate-pulse"></div>
              
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                <Clock size={38} className="animate-pulse" />
                {/* Gentle rotating ring around icon */}
                <div className="absolute inset-0 rounded-full border-2 border-white/50 border-t-white animate-spin"></div>
              </div>
            </div>
          </div>
          
          {/* Main Titles */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>กำลังตรวจสอบการชำระเงิน (Payment Verification)</span>
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-850">
              ระบบได้รับหลักฐานการชำระเงินเรียบร้อยแล้ว
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              ทางโรงงานกำลังทำการตรวจสอบสลิปการโอนเงินของท่าน (ใช้เวลาประมาณ 5-15 นาที) เมื่อตรวจสอบสำเร็จ ระบบจะดำเนินการหลอม/จัดเตรียมสินค้าให้อัตโนมัติ
            </p>
          </div>

          {/* Summary Box (กล่องสรุปข้อมูล) */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
            <div className="font-bold text-slate-800 pb-2 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-brand-blue" />
                <span>สรุปรายละเอียดคำสั่งซื้อ</span>
              </span>
              <span className="font-mono text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                {activeOrder.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="text-slate-400 text-[11px] block">เลขที่สั่งซื้อ (Order ID):</span>
                <span className="font-bold text-slate-800 font-mono">{activeOrder.id}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">ยอดเงินที่โอน:</span>
                <span className="font-display font-extrabold text-brand-blue text-sm">
                  ฿{Number(activeOrder.total_amount).toLocaleString('th-TH')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">ชื่อผู้สั่งซื้อ:</span>
                <span className="font-semibold text-slate-700">{activeOrder.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">เบอร์โทรศัพท์:</span>
                <span className="font-semibold text-slate-700">{activeOrder.customer_phone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-400 text-[11px] block mb-0.5">รายการสินค้า:</span>
              <span className="font-bold text-slate-800 block line-clamp-2">
                {activeOrder.productName || 'เรือและชุดพ่วงอุปกรณ์'}
              </span>
              {activeOrder.color && (
                <span className="text-[10.5px] text-brand-blue font-semibold mt-0.5 block">
                  สี: {activeOrder.color}
                </span>
              )}
            </div>

            {/* Slip Photo Preview */}
            {(uploadedSlipUrl || slipPreview) && (
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold block mb-1.5 flex items-center justify-between">
                  <span>ภาพสลิปที่แนบส่งไป:</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    แนบสำเร็จ
                  </span>
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center shadow-xs">
                  <img 
                    src={uploadedSlipUrl || slipPreview || ''} 
                    alt="สลิปหลักฐานการโอนเงิน" 
                    referrerPolicy="no-referrer"
                    className="max-h-52 object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Estimated verification timeframe notice */}
          <div className="border border-amber-200/80 p-3.5 rounded-2xl bg-amber-50/60 text-slate-700 text-xs flex items-center gap-3 text-left">
            <Clock size={20} className="text-amber-600 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-bold text-slate-850">
                ฝ่ายบัญชีกำลังเทียบยอดเงินกับรายการเดินบัญชี
              </p>
              <p className="text-[11px] text-slate-500 leading-snug">
                ท่านจะได้รับข้อความแจ้งเตือนทันทีเมื่อสลิปได้รับการอนุมัติ ท่านสามารถตรวจสอบสถานะได้ตลอดเวลาในหน้าประวัติคำสั่งซื้อ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full rounded-2xl border-2 border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-800 font-display font-bold text-xs py-4 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
              id="btn-return-home-from-verify"
            >
              <ArrowLeft size={16} />
              <span>กลับสู่หน้าแรก</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (onViewOrderHistory) {
                  onViewOrderHistory();
                } else {
                  onBackToHome();
                }
              }}
              className="w-full rounded-2xl bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold text-xs py-4 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99]"
              id="btn-check-order-history-from-verify"
            >
              <ShoppingBag size={16} />
              <span>เช็กสถานะการสั่งซื้อ</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Generate PromptPay string format
  const promptPayData = `00020101021130300016A0000006770101110213123456789012353037645405${activeOrder.total_amount}.005802TH`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(promptPayData)}&color=0d2b45`;

  return (
    <div className="font-sans min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        
        {/* Top Header Row with back controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
            <span>กลับไปเลือกเรือพลาสติก</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-white shadow-xs">
              <Anchor size={18} className="rotate-12" />
            </div>
            <div>
              <h2 className="font-display text-sm font-extrabold text-slate-800 leading-none">
                พรพงศ์พลาสติก
              </h2>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                วิทยฐานะใบชำระ
              </span>
            </div>
          </div>
        </div>

        {/* Page Titles */}
        <div className="text-center sm:text-left py-2 border-b border-slate-200">
          <h1 className="font-display text-2xl font-black text-slate-800">
            ระบบตรวจสอบหนี้และสิทธิ์จัดส่งเรือ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            สแกนด้วยแอปพลิเคชันธนาคารและดำเนินการแนบหลักฐานแบบฟอร์มด้านล่างเพื่ออ้างอิงสิทธ์คิวดำเนินการหลอมด่วนพิเศษ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: BILLSUMMARY / ORDER DETAILS & YOD-CHAMRA */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* INVOICE BILL */}
            <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-display text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText size={15} className="text-slate-500" />
                  <span>สรุปยอดจำลองใบจรรโลงสั่งเรือ</span>
                </h3>
                <span className="rounded-full font-bold text-[10px] px-2 py-0.5 bg-yellow-50 text-yellow-600 border border-yellow-200 uppercase animate-pulse">
                  {currentPaymentStatus}
                </span>
              </div>

              {/* Bill Fields */}
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg font-mono">
                  <span className="text-slate-400 font-sans">เลขที่ใบสั่งซื้อ:</span>
                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-[155px]" title={activeOrder.id}>
                    {activeOrder.id}
                  </span>
                </div>

                <div className="pt-2 flex flex-col gap-2 font-sans text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-400">ผู้สั่งซื้อ:</span>{' '}
                    <span className="font-bold text-slate-800">{activeOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-400">เบอร์ติดต่อกลับ:</span>{' '}
                    <span className="font-bold text-slate-800">{activeOrder.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-400">สเกลอีเมล:</span>{' '}
                    <span className="font-medium text-slate-800 truncate" title={activeOrder.customer_email}>{activeOrder.customer_email}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="font-bold text-slate-800 text-[11px] block mb-1">รายการสินค้าเรือที่สั่งหลอมแม่พิมพ์:</span>
                  <div className="bg-sky-50/40 p-2.5 rounded-xl border border-sky-50 mt-1">
                    <p className="font-bold text-slate-850 leading-relaxed font-sans text-xs">
                      {activeOrder.productName || 'เรือคายัคเกรดพรีเมียมตราพรพงศ์'}
                    </p>
                    {activeOrder.color && (
                      <p className="text-[10px] text-brand-blue font-bold mt-1">
                        สีผลิตภัณฑ์คิวผลิต: {activeOrder.color}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* YOD CHAMRA (YOD CHUMRA) */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">ยอดชำระที่ต้องยืนยัน (Net Total Amount)</span>
                <div className="flex justify-between items-baseline bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">มัดจำพิเศษ</span>
                  <strong className="text-2xl font-display font-extrabold text-brand-blue">
                    ฿{Number(activeOrder.total_amount).toLocaleString('th-TH')}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 justify-center">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>ความรับผิดชอบรักษาความปลอดภัยด้วยเทคโนโลยีเข้ารหัส SSL</span>
              </div>
            </div>

            {/* QUICK BANK SCB CARD */}
            <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3">
              <strong className="text-xs font-bold text-slate-800 block">ข้อมูลสนับสนุนช่องทางโอนทางเลือก</strong>
              <div className="flex items-center justify-between gap-2 p-3 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-[#4e2a84] flex items-center justify-center text-white text-[11px] font-black font-mono">
                    SCB
                  </div>
                  <div>
                    <strong className="text-slate-800 text-[11px] block">ธนาคารไทยพาณิชย์ (SCB)</strong>
                    <code className="text-xs font-mono font-bold text-slate-700">123-4-56789-0</code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1.5 text-slate-400 hover:text-brand-blue bg-white rounded-lg border border-slate-250 cursor-pointer hover:shadow-xs transition-all"
                  title="คัดอกเลขบัญชี"
                >
                  {copiedAccount ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[10px] text-slate-400 block font-semibold">ชื่อบัญชีโรงหลอมแม่แป้น</span>
                <strong className="text-xs text-slate-700 font-sans">บจก. พรพงศ์ พลาสติก ไลท์</strong>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: PAYMENT GATEWAY AREA (QR CODE, UPLOADER & BUTTONS) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* BRANDED PROMPTPAY QR KIOSK */}
              <div className="rounded-2xl overflow-hidden border border-slate-150 shadow-sm">
                
                {/* PromptPay Dark Header Banner */}
                <div className="bg-[#003d5b] text-white p-3 flex justify-between items-center px-4">
                  <div className="flex items-center gap-1">
                    <QrCode size={18} className="text-[#bfdbfe]" />
                    <span className="font-display font-black text-xs uppercase tracking-widest text-[#bfdbfe]">Thai PromptPay</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-300">
                    Scan to Pay
                  </div>
                </div>

                <div className="p-6 bg-white flex flex-col items-center justify-center text-center space-y-4">
                  
                  {/* Real QR Generator Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center max-w-[210px] w-full">
                    <img 
                      src={qrCodeUrl} 
                      alt="PromptPay Payment QR Code" 
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain rounded-lg border border-slate-205"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-sans text-slate-400 font-bold uppercase tracking-wider">
                      โปรดสแกนยอดมัดจำสุทธิ
                    </p>
                    <p className="text-2xl font-black text-[#003d5b]">
                      ฿{Number(activeOrder.total_amount).toLocaleString('th-TH')}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-500 leading-relaxed max-w-xs font-sans">
                    สามารถเปิดแอป SCB, K-Bank, Krungthai แสกนคิวอาร์เพื่อดัดแปลงตาราง orders ของระบบจำลองโรงเรือนพรพงศ์ได้ทันที
                  </div>

                </div>

              </div>

              {/* MANDATORY SLIP UPLOAD & PAYMENT CONFIRMATION */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <UploadCloud size={16} className="text-brand-blue" />
                    <span>แนบสลิปหลักฐานการโอนเงิน (Mandatory Slip Upload)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    * บังคับแนบสลิป
                  </span>
                </div>

                <form onSubmit={handleUploadAndSubmitSlip} className="space-y-4">
                  {/* Drag & drop style input */}
                  <div 
                    onClick={() => setSlipError(null)}
                    className={`border-2 border-dashed rounded-2xl duration-200 cursor-pointer overflow-hidden relative group transition-all ${
                      slipError 
                        ? 'border-rose-400 bg-rose-50/30' 
                        : slipFile 
                          ? 'border-emerald-500 bg-emerald-50/20' 
                          : 'border-slate-200 hover:border-brand-blue bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleSlipChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {slipPreview ? (
                      <div className="p-4 relative flex flex-col items-center justify-center bg-slate-50 min-h-[170px]">
                        <img 
                          src={slipPreview} 
                          alt="Slip File Preview" 
                          className="max-h-[150px] rounded-lg object-contain shadow-xs border border-slate-200"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 text-[9px] px-2.5 font-bold z-20 flex items-center gap-1 shadow-sm">
                          <Check size={11} strokeWidth={3} />
                          <span>แนบสลิปเรียบร้อย (คลิกเพื่อเปลี่ยน)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-1.5">
                        <ImageIcon size={30} className="mx-auto text-slate-400 group-hover:scale-110 duration-200 group-hover:text-brand-blue" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">คลิกที่นี่ เพื่อเลือกรูปภาพสลิปหลักฐานการโอนเงิน</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">รองรับไฟล์ .jpg, .jpeg, .png (ขนาดไม่เกิน 10MB)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Red Warning Banner when user attempts to submit without a slip */}
                  {slipError && (
                    <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                      <AlertCircle size={16} className="shrink-0 text-rose-500" />
                      <span className="font-semibold">{slipError}</span>
                    </div>
                  )}

                  {/* Mandatory Confirm Payment Button */}
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (!slipFile) {
                        e.preventDefault();
                        setSlipError('กรุณาแนบสลิปหลักฐานการโอนเงินก่อนทำการยืนยัน');
                        triggerToast('กรุณาแนบสลิปหลักฐานการโอนเงินก่อนทำการยืนยัน');
                      }
                    }}
                    disabled={isProcessing}
                    className={`w-full flex items-center justify-center gap-2 rounded-2xl font-display font-bold text-xs py-4 transition-all duration-200 shadow-md ${
                      !slipFile
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-brand-blue hover:bg-brand-blue-dark text-white cursor-pointer hover:shadow-lg active:scale-[0.99]'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <span>กำลังอัปโหลดสลิปและยืนยันการชำระเงิน...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>ยืนยันการชำระเงิน</span>
                      </>
                    )}
                  </button>

                  {!slipFile && (
                    <p className="text-[10.5px] text-slate-400 text-center font-sans">
                      * ปุ่มยืนยันจะเปิดใช้งานอัตโนมัติเมื่อท่านเลือกไฟล์สลิปหลักฐานการโอนเงินเรียบร้อย
                    </p>
                  )}
                </form>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
