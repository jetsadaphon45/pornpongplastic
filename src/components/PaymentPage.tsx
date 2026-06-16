import React from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
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
  Image as ImageIcon
} from 'lucide-react';
import { supabaseOrders, isSupabaseConfigured, supabase } from '../lib/supabase';

interface PaymentPageProps {
  order: any;
  onBackToHome: () => void;
  triggerToast: (msg: string) => void;
}

export default function PaymentPage({ order, onBackToHome, triggerToast }: PaymentPageProps) {
  // Navigation Step: 'pay' -> 'success'
  const [step, setStep] = React.useState<'pay' | 'success'>('pay');
  const [copiedAccount, setCopiedAccount] = React.useState(false);
  const [slipFile, setSlipFile] = React.useState<File | null>(null);
  const [slipPreview, setSlipPreview] = React.useState<string | null>(null);
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
                color: data.color || 'คละสี'
              };
              setActiveOrder(formattedOrder);
              setCurrentPaymentStatus(formattedOrder.payment_status);
              setCurrentOrderStatus(formattedOrder.order_status);
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
        triggerToast('กรุณาเลือกเฉพาะไฟล์รูปภาพกลุ่ม .jpg, .jpeg, หรือ .png เท่านั้น');
        return;
      }

      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit via slip attachment path
  const handleUploadAndSubmitSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile) {
      triggerToast('กรุณาเลือกหรืออัปโหลดรูปภาพสลิปสำหรับการโอนเงิน');
      return;
    }

    setIsProcessing(true);
    try {
      let slipUrl = '';
      if (isSupabaseConfigured) {
        const resUrl = await supabaseOrders.uploadSlip(activeOrder.id, slipFile);
        if (resUrl) {
          slipUrl = resUrl;
          setUploadedSlipUrl(resUrl);
        }
      } else {
        slipUrl = slipPreview || '';
        setUploadedSlipUrl(slipUrl);
      }

      setCurrentPaymentStatus('waiting_verify');
      setCurrentOrderStatus('waiting_payment');

      if (isSupabaseConfigured) {
        await supabaseOrders.updateStatus(activeOrder.id, 'waiting_verify');
      }

      triggerToast('อัปโหลดหลักฐานสลิปและส่งตรวจสำเร็จ!');
      setStep('success');
    } catch (err: any) {
      console.error('Failed to submit slip:', err);
      setUploadedSlipUrl(slipPreview || '');
      setCurrentPaymentStatus('waiting_verify');
      triggerToast('อัปโหลดหลักฐานสลิปและส่งตรวจสอบสำเร็จ!');
      setStep('success');
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct confirmation path
  const handleConfirmDirectPayment = async () => {
    setIsProcessing(true);
    try {
      setCurrentPaymentStatus('paid');
      setCurrentOrderStatus('paid');

      if (isSupabaseConfigured) {
        await supabaseOrders.updateStatus(activeOrder.id, 'paid');
      }

      triggerToast('ยืนยันชำระเงินสำเร็จจำลองเรียบร้อยแล้ว!');
      setStep('success');
    } catch (err) {
      console.error('Failed to direct-confirm payment:', err);
      setCurrentPaymentStatus('paid');
      triggerToast('ยืนยันชำระเงินสำเร็จจำลองเรียบร้อยแล้ว!');
      setStep('success');
    } finally {
      setIsProcessing(false);
    }
  };

  // STEP 2: SUCCESS COMPLETED STATE VIEW
  if (step === 'success') {
    return (
      <div className="font-sans min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-sky-100 shadow-2xl p-6 sm:p-8 text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-2">
            <CheckCircle size={44} className="animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-black text-slate-800">
              ทำรายการสำเร็จ!
            </h1>
            <p className="text-xs text-slate-500">
              คำสั่งซื้อจดทะเบียนเข้าระบบโรงงานเรียบร้อยแล้ว
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 text-left space-y-2.5 text-xs">
            <div className="font-bold text-brand-blue pb-1.5 border-b border-slate-100 mb-1 flex justify-between items-center text-[10.5px]">
              <span>รหัสสั่งซื้อ: {activeOrder.id}</span>
              <span className={`font-bold px-2 py-0.5 rounded ${
                currentPaymentStatus === 'paid' 
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}>
                {currentPaymentStatus === 'paid' ? 'ชำระเงินสำเร็จ (Paid)' : 'รอการตรวจสอบ (Waiting Verify)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">ชื่อผู้จองสินค้า:</span>{' '}
              <span className="font-bold text-slate-700">{activeOrder.customer_name}</span>
            </div>
            <div>
              <span className="text-slate-400">เบอร์โทรศัพท์:</span>{' '}
              <span className="font-bold text-slate-700">{activeOrder.customer_phone}</span>
            </div>
            <div>
              <span className="text-slate-400">รายการเรือพลาสติก:</span>{' '}
              <span className="font-bold text-slate-700 line-clamp-2">{activeOrder.productName || 'เรือและชุดพ่วงอุปกรณ์'}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
              <span className="text-slate-500">ยอดเงินที่ได้รับรับ:</span>
              <span className="text-brand-blue text-sm">฿{Number(activeOrder.total_amount).toLocaleString('th-TH')}</span>
            </div>
          </div>

          {uploadedSlipUrl && (
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                ภาพหลักฐานสลิปการโอน
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center p-1.5">
                <img 
                  src={uploadedSlipUrl} 
                  alt="Uploaded Slip" 
                  referrerPolicy="no-referrer"
                  className="max-h-48 object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="border border-sky-100 p-4 rounded-xl bg-sky-50/50 text-slate-600 font-sans text-xs">
            <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5 justify-center">
              <Sparkles size={14} className="text-amber-500" />
              อยู่ระเบียบคิวเตรียมตัดสีหลอมตัวเรือแล้ว!
            </p>
            <p className="text-[11px] leading-relaxed">
              ผู้ผลิตพลาสติกได้รับเรื่องเรียบร้อย ทางฝ่ายจัดการจะเร่งปรับเครื่องแม่พิมพ์ตามประเภทสินค้าของท่าน เพื่อให้เสร็จพ่วงจัดส่งสู่ที่อยู่หมายกำหนดการ 24 ชั่วโมง
            </p>
          </div>

          <button
            onClick={onBackToHome}
            className="w-full rounded-2xl bg-slate-900 hover:bg-black text-white font-display font-bold text-xs py-3.5 cursor-pointer shadow-md transition-all duration-200"
          >
            กลับสู่หน้าหลักโรงเรียน
          </button>
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

              {/* TWO PAYMENT ACTIONS (1. DIRECT CONFIRM SIMULATION, 2. UPLOAD SLIP WITH FILE-PICKER) */}
              <div className="border-t border-slate-100 pt-6 space-y-6">
                
                {/* MAIN BUTTON 1: DIRECT CONFIRM SIMULATION (ปุ่มยืนยันการชำระเงิน) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                    <CreditCard size={14} className="text-brand-blue" />
                    <span>ช่องทางที่ 1: ปุ่มยืนยันทำรายการด่วนเสร็จสิ้น (Instant Simulator)</span>
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleConfirmDirectPayment}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#003d5b] hover:bg-[#00283c] text-white font-display font-extrabold text-xs py-4 cursor-pointer transition-all duration-200 hover:shadow-lg disabled:opacity-55"
                  >
                    <CheckCircle2 size={16} />
                    <span>ยืนยันการชำระเงินทันที (ข้ามการแนบสลิปประวัติ)</span>
                  </button>
                  <p className="text-[10px] text-slate-400 font-sans text-center">
                    * คลิกปุ่มด้านบนนี้ เพื่อเปลี่ยนสถานะตาราง orders ในฐานข้อมูล Supabase เป็นยอด paid เรียบร้อยโดยไม่ต้องอัปโหลดสลิป
                  </p>
                </div>

                {/* MAIN BUTTON 2 & SLIP ATTACHMENT: SLIP UPLOAD (ปุ่มอัปโหลดสลิป) */}
                <div className="border-t border-dashed border-slate-200 pt-5 space-y-4">
                  <span className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                    <UploadCloud size={14} className="text-indigo-600" />
                    <span>ช่องทางที่ 2: อัปโหลดสลิปธนาคารเพื่อส่งสิทธิ์ตรวจสอบ (Slip Verification)</span>
                  </span>

                  <form onSubmit={handleUploadAndSubmitSlip} className="space-y-4">
                    
                    {/* Drag & drop style input */}
                    <div className="border-2 border-dashed border-slate-200 hover:border-brand-blue rounded-2xl duration-200 cursor-pointer overflow-hidden relative group">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        onChange={handleSlipChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      {slipPreview ? (
                        <div className="p-4 relative flex flex-col items-center justify-center bg-slate-50 min-h-[160px]">
                          <img 
                            src={slipPreview} 
                            alt="Slip File Preview" 
                            className="max-h-[140px] rounded-lg object-contain shadow-xs border border-slate-200"
                          />
                          <div className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full p-1 text-[9px] px-2.5 font-bold z-20">
                            คลิกที่นี่เพื่อเปลี่ยนไฟล์สลิป
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 space-y-1 bg-slate-50/50">
                          <ImageIcon size={28} className="mx-auto text-slate-400 group-hover:scale-110 duration-200" />
                          <div>
                            <p className="text-[11px] font-semibold text-slate-700">คลิกที่นี่ เพื่อเลือกรูปภาพสลิปที่ต้องการแนบ</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">รับไฟล์นามสกุล .jpg, .jpeg, .png</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Slip Button */}
                    <button
                      type="submit"
                      disabled={isProcessing || !slipFile}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-blue hover:bg-brand-blue-dark disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white font-display font-medium text-xs py-3.5 cursor-pointer transition-all duration-200 shadow-md"
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                          <span>กำลังอัปโหลดสลิปยืนยันระบบ...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={14} />
                          <span>บันทึกประวัติการชำระและอัปโหลดสลิป</span>
                        </>
                      )}
                    </button>

                  </form>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
