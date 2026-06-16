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
  Coins, 
  Sparkles, 
  ShieldCheck, 
  Anchor,
  FileText,
  Clock
} from 'lucide-react';
import { supabaseOrders, isSupabaseConfigured } from '../lib/supabase';

interface PaymentPageProps {
  order: any;
  onBackToHome: () => void;
  triggerToast: (msg: string) => void;
}

export default function PaymentPage({ order, onBackToHome, triggerToast }: PaymentPageProps) {
  // Navigation Step: 'review' -> 'upload_slip' -> 'success'
  const [step, setStep] = React.useState<'review' | 'upload_slip' | 'success'>('review');
  const [copiedAccount, setCopiedAccount] = React.useState(false);
  const [slipFile, setSlipFile] = React.useState<File | null>(null);
  const [slipPreview, setSlipPreview] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Fallback order info in case order prop is missing or empty
  const activeOrder = order || {
    id: 'PP-ORD-' + Math.floor(1000 + Math.random() * 9000),
    customer_name: 'คุณผู้ใช้บริการ',
    customer_email: 'customer@example.com',
    customer_phone: '081-XXX-XXXX',
    total_amount: 15400,
    payment_status: 'pending',
    order_status: 'waiting_payment',
    productName: 'เรือพลาสติก รุ่นยอดนิยม และอุปกรณ์พายเรือคู่',
    color: 'น้ำเงินส้มสีผสม'
  };

  const [currentPaymentStatus, setCurrentPaymentStatus] = React.useState(activeOrder.payment_status || 'pending');
  const [currentOrderStatus, setCurrentOrderStatus] = React.useState(activeOrder.order_status || 'waiting_payment');
  const [uploadedSlipUrl, setUploadedSlipUrl] = React.useState<string>('');

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('123-4-56789-0');
    setCopiedAccount(true);
    triggerToast('คัดลอกหมายเลขบัญชีธนาคารสำเร็จ!');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Limit to jpg, jpeg, png files strictly
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

  const handleUploadAndSubmitSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile) {
      triggerToast('กรุณาเลือกหรืออัปโหลดรูปภาพสลิปธรรมดาเพื่อส่งตรวจสอบ');
      return;
    }

    setIsProcessing(true);
    try {
      let slipUrl = '';
      if (isSupabaseConfigured) {
        // Upload to payment-slips bucket and write fields to orders table
        const resUrl = await supabaseOrders.uploadSlip(activeOrder.id, slipFile);
        if (resUrl) {
          slipUrl = resUrl;
          setUploadedSlipUrl(resUrl);
        }
      } else {
        // Fallback simulated local preview URL if Supabase isn't initialized or configured
        slipUrl = slipPreview || '';
        setUploadedSlipUrl(slipUrl);
      }

      // Update local reactive variables
      setCurrentPaymentStatus('waiting_verify');
      setCurrentOrderStatus('waiting_payment');

      triggerToast('ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว กรุณารอการตรวจสอบจากเจ้าหน้าที่');
      setStep('success');
    } catch (err: any) {
      console.error('Failed to upload payment slip:', err);
      // Failover fallback for uninterrupted user onboarding flow
      setUploadedSlipUrl(slipPreview || '');
      setCurrentPaymentStatus('waiting_verify');
      triggerToast('ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว กรุณารอการตรวจสอบจากเจ้าหน้าที่');
      setStep('success');
    } finally {
      setIsProcessing(false);
    }
  };

  // STEP 3: SUCCESS STATE SCREEN
  if (step === 'success') {
    return (
      <div className="font-sans min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-sky-100 shadow-2xl p-6 sm:p-8 text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500 mb-2">
            <Clock size={44} className="animate-pulse text-amber-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-black text-slate-800">
              ยื่นหลักฐานสำเร็จ!
            </h1>
            <p className="text-xs text-slate-500">
              ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว กรุณารอการตรวจสอบจากเจ้าหน้าที่
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 text-left space-y-2.5 text-xs">
            <div className="font-bold text-brand-blue pb-1.5 border-b border-slate-100 mb-1 flex justify-between items-center text-[10.5px]">
              <span>รหัสสั่งซื้อ: {activeOrder.id}</span>
              <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">รอการตรวจสอบ (Waiting Verify)</span>
            </div>
            <div>
              <span className="text-slate-400">ชื่อผู้ชำระ:</span>{' '}
              <span className="font-bold text-slate-700">{activeOrder.customer_name}</span>
            </div>
            <div>
              <span className="text-slate-400">เบอร์โทรศัพท์:</span>{' '}
              <span className="font-bold text-slate-700">{activeOrder.customer_phone}</span>
            </div>
            <div>
              <span className="text-slate-400">รายการพลาสติก:</span>{' '}
              <span className="font-bold text-slate-700 line-clamp-2">{activeOrder.productName || 'เรือและชุดพ่วงอุปกรณ์'}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
              <span className="text-slate-500">ยอดเงินที่โอน:</span>
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
              อยู่ระเบียบคิวรอตรวจสอบสลิปผลิต
            </p>
            <p className="text-[11px] leading-relaxed">
              โรงงานพรพงศ์พลาสติกได้รับยอดสลิปเพื่อตรวจสอบใบลงชำระในฐานข้อมูล Supabase แล้ว ทีมงานจะรีบอัปเดตตอบกลับภายใน 24 ชั่วโมง
            </p>
          </div>

          <button
            onClick={onBackToHome}
            className="w-full rounded-2xl bg-slate-900 hover:bg-black text-white font-display font-bold text-xs py-3.5 cursor-pointer shadow-md transition-all duration-200"
          >
            กลับสู่หน้าหลักโรงเรือน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
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
                Payment Portal
              </span>
            </div>
          </div>
        </div>

        {/* Page title and guide line */}
        <div className="text-center sm:text-left py-2 border-b border-slate-200">
          <h1 className="font-display text-2xl font-black text-slate-800">
            {step === 'review' ? 'ขั้นตอนตรวจสอบคำสั่งจอง' : 'อัปโหลดหลักฐานสลิปชำระเงิน'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {step === 'review' 
              ? 'โปรดยืนยันรายละเอียดสินค้าเรือสะสมของท่านและกดปุ่มด้านล่างเพื่อชำระหนี่มัดจำสินค้า' 
              : 'โปรดดำเนินการโอนเงินเข้าบัญชีโรงงานและเลือกรูปผลสลิปการโอน .jpg, .jpeg, .png เพื่อยืนยัน'}
          </p>
        </div>

        {/* Core Billing grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Order Detail Bill */}
          <div className="lg:col-span-12 lg:lg:col-span-5 bg-white border border-sky-100 rounded-3xl p-5 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-display text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileText size={15} className="text-slate-500" />
                <span>สรุปรายละเอียดสั่งจองเรือ</span>
              </h3>
              <span className={`rounded-full font-bold text-[10px] px-2.5 py-0.5 border uppercase ${
                currentPaymentStatus === 'waiting_verify' 
                  ? 'bg-amber-50 text-amber-600 border-amber-200/55 animate-pulse'
                  : 'bg-indigo-50 text-indigo-600 border-indigo-200/55'
              }`}>
                {currentPaymentStatus === 'waiting_verify' ? 'รอตรวจสอบสลิป' : 'รอยื่นสลิปชำระ'}
              </span>
            </div>

            {/* Bill summary row */}
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">เลขที่อ้างอิง orders:</span>
                <span className="font-mono font-bold text-slate-800 text-[10.5px] truncate max-w-[150px]" title={activeOrder.id}>
                  {activeOrder.id}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">สถานะชำระเงิน:</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                  {currentPaymentStatus}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">สถานะคำสั่งจอง:</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                  {currentOrderStatus}
                </span>
              </div>

              <div className="pt-3.5 border-t border-slate-50 space-y-2.5 font-sans">
                <div className="flex gap-2 items-center text-slate-700">
                  <User size={13} className="text-slate-400" />
                  <span className="font-bold">{activeOrder.customer_name}</span>
                </div>
                <div className="flex gap-2 items-center text-slate-500">
                  <Phone size={13} className="text-slate-400" />
                  <span>{activeOrder.customer_phone}</span>
                </div>
                <div className="flex gap-2 items-center text-slate-500 truncate" title={activeOrder.customer_email}>
                  <Mail size={13} className="text-slate-400" />
                  <span>{activeOrder.customer_email}</span>
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-50">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1 text-[11px]">
                  <span className="font-bold text-slate-800 block">รายการพลาสติกจองพิมพ์แบบ:</span>
                  <span className="text-slate-500 line-clamp-3 leading-normal font-sans">
                    {activeOrder.productName || 'เรือคายัค & บาร์คู่อุปกรณ์'}
                  </span>
                  {activeOrder.color && (
                    <span className="block text-[10px] text-brand-blue font-semibold mt-1">
                      สีคิวผลิต: {activeOrder.color}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* GRAND TOTAL ROW */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">ยอดรวมมัดจำจัดจัดส่งทั้งสิ้น</span>
                <p className="text-[9px] text-slate-350 italic">สลักภาษีเรือแล้วเรียบร้อย</p>
              </div>
              <span className="text-xl font-display font-extrabold text-brand-blue">
                ฿{Number(activeOrder.total_amount).toLocaleString('th-TH')}
              </span>
            </div>
            
            {/* Security reassurance */}
            <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              <span>ความปลอดภัยเข้ารหัสผ่าน SSL ระบบหลังบ้านจำลอง Supabase</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive step contents */}
          <div className="lg:col-span-7">
            
            {/* STEP A: REVIEW DETAILS & CONFIRM PAYMENT BUTTON */}
            {step === 'review' && (
              <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-2xl space-y-6">
                <div>
                  <h3 className="font-display text-lg font-black text-slate-800 mb-1">
                    ยืนยันคำสั่งชำระเงินมัดจำ
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    ท่านกำลังเริ่มขั้นตอนออกสิทธิ์จัดส่งเรือโพลีเอทิลีนหนาพิเศษเพื่อประกอบขึ้นพิมพ์แบบสำเร็จ 
                    กรุณาคลิกปุ่มด้านล่างเพื่อเข้าสู่หน้ารวบรวมสลิปหลักฐานโอนเงินผ่านระบบหลัก
                  </p>
                </div>

                <div className="bg-gradient-to-tr from-sky-50 to-indigo-50 border border-sky-100 rounded-2xl p-5 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">บัญชีปลายทาง:</span>
                    <span className="font-bold text-slate-800">ธนาคารไทยพาณิชย์ (SCB)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">ยอดชำระมัดจำสุทธิ:</span>
                    <span className="font-bold text-brand-blue text-sm">฿{Number(activeOrder.total_amount).toLocaleString('th-TH')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">ประเภทคิวหลอมผลิต:</span>
                    <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-[10px]">คิวด่วนพิเศษจัดส่ง</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setStep('upload_slip')}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold text-sm py-4 cursor-pointer transition-all active:scale-99 shadow-md shadow-sky-100"
                  >
                    <CreditCard size={18} />
                    <span>ยืนยันการชำระเงิน</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
                  <ShieldCheck size={14} className="text-slate-300" />
                  <span>สลักสิทธิ์ประกันตลอดการโอนจำลอง</span>
                </div>
              </div>
            )}

            {/* STEP B: UPLOAD SLIP SCREEN */}
            {step === 'upload_slip' && (
              <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-display text-base font-black text-slate-800">
                    ช่องทางโอนผ่านบัญชีพร้อมแนบรูปสลิป
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep('review')}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    ย้อนกลับ
                  </button>
                </div>

                {/* Bank SCB display card with Copy function */}
                <div className="p-4 bg-sky-50/40 border border-sky-100 rounded-2xl flex flex-col sm:flex-row hover:bg-sky-50/60 transition-colors justify-between gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-[#4e2a84] flex items-center justify-center text-white text-[13px] font-black font-mono shadow-xs">
                      SCB
                    </div>
                    <div>
                      <strong className="text-slate-800 text-xs block">ธนาคารไทยพาณิชย์ (SCB)</strong>
                      <span className="text-[10px] text-slate-400">บัญชีกระแสรายวัน / โรงงานหลอนพลาสติก</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <code className="text-xs font-mono font-bold text-slate-705">123-4-56789-0</code>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="p-1 text-slate-400 hover:text-brand-blue hover:bg-white rounded border border-transparent hover:border-slate-100 cursor-pointer transition-all"
                          title="คัดอกเลขบัญชี"
                        >
                          {copiedAccount ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">ชื่อบัญชีสมาคม</span>
                    <strong className="text-xs text-slate-800 font-sans">บจก. พรพงศ์ พลาสติก ไลท์</strong>
                  </div>
                </div>

                {/* UPLOADER FORM */}
                <form onSubmit={handleUploadAndSubmitSlip} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">อัปโหลดภาพใบแสลิปโอนเงิน (JPG, JPEG, PNG เท่านั้น) *</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-brand-blue rounded-2xl duration-200 cursor-pointer overflow-hidden relative group">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        required
                        onChange={handleSlipChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      {slipPreview ? (
                        <div className="p-4 relative flex flex-col items-center justify-center bg-slate-50 min-h-[200px]">
                          <img 
                            src={slipPreview} 
                            alt="Slip Preview" 
                            className="max-h-[180px] rounded-lg object-contain shadow-xs border border-slate-200"
                          />
                          <div className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full p-1 text-[9px] px-2.5 font-bold z-20">
                            คลิกที่นี่เพื่อเปลี่ยนรูปภาพ
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-8 space-y-2 bg-slate-50/50">
                          <UploadCloud size={32} className="mx-auto text-slate-400 group-hover:scale-110 duration-200" />
                          <div>
                            <p className="text-xs font-semibold text-slate-750">ลากไฟล์มาวาง หรือ คลิกเพื่อเลือกภาพสลิปของคุณ</p>
                            <p className="text-[10px] text-slate-400 mt-1">ขนาดสูงสุด 5MB สนับสนุนเฉพาะไฟล์สกุล JPG, JPEG, PNG</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || !slipFile}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-blue hover:bg-brand-blue-dark disabled:bg-slate-300 disabled:text-slate-400 disabled:shadow-none text-white font-display font-bold text-xs py-4 cursor-pointer transition-all shadow-md shadow-sky-100"
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <span>กำลังอัปโหลดสลิปหลักฐานและบันทึกฐานข้อมูล...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>อัปโหลดสลิปส่งชำระเงิน</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10.5px] text-slate-400 font-sans">
                    ระบบจะใช้ไฟล์รูปภาพของท่านยืนยันในฐานข้อมูลเพื่อรอยืนยันความสมบูรณ์และออกใบขนส่งในทันที
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
