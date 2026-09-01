import React from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, Anchor, HelpCircle, Sparkles } from 'lucide-react';

export default function ContactSection() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setIsLoading(true);
      // Simulating network request call
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
        // Clear forms
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        // Hide success alert after 4s
        setTimeout(() => setIsSuccess(false), 4000);
      }, 1500);
    }
  };

  return (
    <div className="font-sans max-w-7xl mx-auto px-4 py-[72px] sm:px-6 lg:px-8">
      
      {/* Page Headers */}
      <div className="text-center mb-10">
        <span className="text-[10px] font-bold text-brand-blue tracking-widest block uppercase bg-sky-100/50 px-2.5 py-1 rounded-full w-max mx-auto mb-4">
          ยินดีต้อนรับสู่ศูนย์บริการพรพงศ์
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3.5">
          ติดต่อเรา / พิกัดที่ตั้งหน้าร้าน
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          แวะชมสินค้าตัวจริง เปรียบเทียบสัดส่วน หรือพิจารณาลายพิมพ์สีเนื้อเรือแบรนด์พรพงศ์ที่คลังโรงงานใหญ่ สมุทรสาคร
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Coordinates & Visual MAP */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Contacts metadata */}
          <div className="bg-white border border-sky-100 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-display text-base font-bold text-slate-800">สำนักงานใหญ่และจุดกระจายสินค้า</h3>
            <p className="text-xs text-slate-500 text-justify">
              ตั้งอยู่ย่านพระราม 2 ขนส่งยกเทียบสลิงรวดเร็ว มีที่สำหรับกลับรถขนส่งขนาดใหญ่ (รถสิบล้อ, รถพ่วง) สะดวก ทัศนวิสัยกว้างขวาง
            </p>

            <div className="space-y-3.5 pt-2 border-t border-slate-50 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="text-brand-blue shrink-0 mt-0.5" size={16} />
                <div className="text-slate-650 text-slate-600">
                  <span className="font-bold text-slate-800 block">พรพงศ์พลาสติก (สำนักงานใหญ่)</span>
                  124 หมู่ 4 ถนนพระราม 2 ต.ท้ายบ้าน อ.แหลมทุ่นพลาสติก จ.สมุทรสาคร 74000
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="text-brand-blue shrink-0" size={15} />
                <div className="text-slate-600">
                  <span className="font-bold text-slate-800 block">เบอร์โทรศัพท์ติดต่อด่วน</span>
                  081-234-5678, 034-987654
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="text-brand-blue shrink-0" size={15} />
                <div className="text-slate-650 text-slate-600">
                  <span className="font-bold text-slate-800 block">อีเมลติดต่อฝ่ายประสานงาน</span>
                  info@pornpongplastic.com
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="text-brand-blue shrink-0" size={15} />
                <div className="text-slate-650 text-slate-600">
                  <span className="font-bold text-slate-800 block">วันและเวลาเปิดให้บริการ</span>
                  วันจันทร์ - วันอาทิตย์ (08.00 น. - 18.00 น.)
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATED MAP UI CARD */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-hidden relative shadow-inner">
            <div className="aspect-video w-full rounded-xl bg-sky-100 overflow-hidden relative flex flex-col items-center justify-center border border-slate-200">
              
              {/* Custom Blueprint Drawing simulating Google map layout */}
              <div className="absolute inset-0 bg-sky-100 opacity-60 grid grid-cols-6 grid-rows-6 border border-slate-100 pointer-events-none">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-sky-200" />
                ))}
              </div>

              {/* Road names & markers */}
              <div className="absolute w-2.5 h-full bg-white rotate-12 left-1/3 transform -translate-x-1/2 border-x border-slate-300" />
              <div className="absolute h-3 w-full bg-white -rotate-12 top-1/2 transform -translate-y-1/2 border-y border-slate-300" />
              <span className="absolute top-2.5 left-6 bg-slate-900/60 font-sans text-[8px] tracking-wide text-white py-0.5 px-1.5 rounded-sm">พระราม 2 (Rama 2 Rd.)</span>
              <span className="absolute bottom-6 right-8 bg-slate-900/60 font-sans text-[8px] tracking-wide text-white py-0.5 px-1.5 rounded-sm flex items-center gap-1">
                <Anchor size={10} className="text-cyan-400" />
                แม่น้ำท่าจีน (Tha Chin River)
              </span>

              {/* Ping Marker */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="animate-bounce">
                  <MapPin size={34} className="text-red-650 fill-red-200 text-red-650 text-red-500 stroke-red-650 filter drop-shadow-md" />
                </div>
                <div className="bg-white border border-sky-200 shadow-xl rounded-lg px-2.5 py-1.5 mt-1 text-[9px] text-slate-800 text-center max-w-[130px]">
                  <p className="font-extrabold text-brand-blue">พรพงศ์พลาสติก</p>
                  <p className="text-slate-400 font-medium">คลังใหญ่สมุทรสาคร</p>
                </div>
              </div>

              {/* Zoom indicators representation */}
              <div className="absolute bottom-2.5 right-2.5 bg-white/95 rounded-md p-1 border border-slate-200 shadow-sm flex flex-col gap-1 items-center font-bold text-slate-500 text-[10px] w-5 h-11 justify-center z-10 pointer-events-none">
                <span>+</span>
                <span className="w-2 border-b border-slate-200" />
                <span>-</span>
              </div>
            </div>

            {/* Simulated Live Directions button */}
            <div className="mt-3 flex justify-between items-center text-xs">
              <span className="text-slate-400">ละติจูด 13.5484, ลองจิจูด 100.2743</span>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-brand-blue hover:bg-brand-blue-light text-white font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>เปิดแอป Google Maps ของจริง</span>
              </a>
            </div>
          </div>

        </div>

        {/* Right Column: Contact Forms */}
        <div className="lg:col-span-7 bg-white border border-sky-100 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="font-display text-base font-bold text-slate-800 mb-1.5">ส่งคำถาม หรือขอใบเสนอราคาเกียร์สัญจร</h3>
          <p className="text-xs text-slate-500 mb-6 font-sans">
            ทีมงานฝ่ายขายพร้อมจัดทำใบเสนอราคารุ่นยอดนิยมและบริการแจ้งพิกัดส่งภายใน 24 ชม.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Input: Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">ชื่อ-นามสกุล ของคุณ *</label>
                <input
                  type="text"
                  required
                  placeholder="กรอกชื่อ-นามสกุล..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-brand-blue outline-none"
                  id="contact-form-name"
                />
              </div>

              {/* Input: Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">อีเมลติดต่อกลับ *</label>
                <input
                  type="email"
                  required
                  placeholder="เช่น email@yourdomain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-brand-blue outline-none"
                  id="contact-form-email"
                />
              </div>
            </div>

            {/* Input: Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">เรื่องที่ต้องการติดต่อสอบถาม</label>
              <input
                type="text"
                placeholder="เช่น ขอสเปกเรือพาย 3 เมตร หรือสั่งพิมพ์สีเหลืองพิเศษ..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-brand-blue outline-none"
                id="contact-form-subject"
              />
            </div>

            {/* Input: Message Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">กรอกข้อความของท่านที่นี่ *</label>
              <textarea
                required
                rows={4}
                placeholder="ระบุรุ่นเรือ สัดส่วน ขนาด หรือคำถามที่ต้องการข้อเสนอจากโรงงานอย่างละเอียด..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-brand-blue outline-none resize-none"
                id="contact-form-message"
              />
            </div>

            {/* Response statuses */}
            {isSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg text-xs leading-relaxed animate-pulse">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>คำถามจำลองของท่านจัดส่งเรียบร้อยแล้ว! ฝ่ายประสานงานพรพงศ์จะติดต่อกลับหาท่านเร็วที่สุด</span>
              </div>
            )}

            {/* Submit Button with Loading Indicator */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue hover:bg-brand-blue-light disabled:bg-slate-100 text-white font-display font-bold text-xs py-3 cursor-pointer shadow-md transition-all duration-200"
              id="contact-submit-button"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>กำลังส่งข้อมูลข้อเสนอจำลอง...</span>
                </div>
              ) : (
                <>
                  <span>ส่งข้อความขอใบเสนอราคาจำลอง</span>
                  <Send size={13} />
                </>
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
