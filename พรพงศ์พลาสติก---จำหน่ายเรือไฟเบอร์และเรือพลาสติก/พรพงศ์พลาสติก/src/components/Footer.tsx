import React from 'react';
import { Anchor, Phone, MapPin, Mail, Clock, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenAdmin: () => void;
}

export default function Footer({ setActiveTab, onOpenAdmin }: FooterProps) {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 font-sans border-t border-slate-800">
      
      {/* Upper Footer newsletter signup */}
      <div className="border-b border-slate-800 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-brand-blue-light text-cyan-400" size={20} />
                รับสิทธิพิเศษ โปรโมชั่น และความรู้เกี่ยวกับเรือเรือพลาสติก
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                สมัครรับจดหมายข่าวของพรพงศ์พลาสติกเพื่ออัพเดทรุ่นใหม่ ราคาหลุด QC โปรโมชั่นพิเศษก่อนใคร
              </p>
            </div>
            <div className="w-full md:w-auto max-w-sm">
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-4 py-2.5 rounded-lg text-sm transition-all duration-300">
                  <CheckCircle2 size={16} />
                  <span>ขอบคุณที่สมัครรับข้อมูลข่าวสาร! ระบบบันทึกอีเมลเรียบร้อย</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="กรอกอีเมลของคุณ..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-white placeholder-slate-500 outline-hidden focus:border-brand-blue-light focus:ring-1 focus:ring-brand-blue-light"
                    id="newsletter-email-input"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-light text-white px-4 py-2 text-sm font-semibold transition-all cursor-pointer active:scale-95 shrink-0"
                    id="newsletter-submit-button"
                  >
                    <span>ติดตาม</span>
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Contents */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Brand Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white shadow-md">
              <Anchor size={20} className="rotate-12" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-white">พรพงศ์พลาสติก</h4>
              <span className="text-[10px] text-brand-blue-light block uppercase tracking-wide">Pornpong Plastic Co., Ltd.</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed text-justify">
            ผู้เชี่ยวชาญการผลิตและจำหน่ายเรือพลาสติก โพลีเอทิลีนหนาพิเศษ ไร้รอยต่อ ทนแดด ทนรอยขูดขีดสูงสุด เกรดส่งออก มั่นใจได้ในมาตรฐานความปลอดภัย ทรงเรือลอยตัวดีเยี่ยม พายง่าย คล่องตัวในทุกน่านน้ำ
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs">
            <Clock size={14} className="text-brand-blue-light" />
            <span className="text-slate-400">เปิดให้บริการทุกวัน: 08.00 - 18.00 น.</span>
          </div>
        </div>

        {/* Quick Links Menu */}
        <div>
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-blue pl-2">
            เมนูหลักด่วน
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors duration-200">
                &raquo; หน้าแรกสุดอินเทรนดฺ์
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('products')} className="hover:text-white transition-colors duration-200">
                &raquo; แคตตาล็อกเรือทั้งหมด
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors duration-200">
                &raquo; ทำไมต้องพรพงศ์พลาสติก
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('faq')} className="hover:text-white transition-colors duration-200">
                &raquo; คำถามพบบ่อย แนะนำการดูแล
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('contact')} className="hover:text-white transition-colors duration-200">
                &raquo; แผนที่และการติดต่อหน้าร้าน
              </button>
            </li>
            <li className="pt-2 border-t border-slate-800/40">
              <button onClick={onOpenAdmin} className="text-amber-500 hover:text-amber-400 font-semibold transition-colors duration-200 text-[11px] flex items-center gap-1">
                &raquo; จัดการหลังร้าน (Admin Console)
              </button>
            </li>
          </ul>
        </div>

        {/* Product categories quick jump */}
        <div>
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-blue pl-2">
            หมวดหมู่เรือยอดรับสั่งทำ
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <button onClick={() => setActiveTab('products')} className="hover:text-white block transition-colors">
                เรือพายพลาสติกอเนกประสงค์
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('products')} className="hover:text-white block transition-colors">
                เรือหัวแหลมกราบสูงลุยเขื่อน
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('products')} className="hover:text-white block transition-colors">
                เรือตกปลานั่งหล่อพลาสติก
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('products')} className="hover:text-white block transition-colors">
                เรือคายัคนั่งบน (Sit On Top)
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('products')} className="hover:text-white block transition-colors">
                ชูชีพมาตรฐานและด้ามพายคุดเกรดสูง
              </button>
            </li>
          </ul>
        </div>

        {/* Real Contact Coordinates */}
        <div>
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-blue pl-2">
            ที่ตั้งและการติดต่อโรงงาน
          </h4>
          <ul className="space-y-3.5 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="text-brand-blue-light shrink-0 mt-0.5" />
              <span>
                124 หมู่ 4 ถนนพระราม 2 ต.ท้ายบ้าน อ.แหลมทุ่นพลาสติก จ.สมุทรสาคร 74000
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-brand-blue-light shrink-0" />
              <span>โทร: 081-234-5678, 034-987654</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-brand-blue-light shrink-0" />
              <span>อีเมล: info@pornpongplastic.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Lower bar copy bar */}
      <div className="bg-slate-950 py-6 text-center text-xs text-slate-500 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} พรพงศ์พลาสติก. สงวนลิขสิทธิ์ทั้งหมด. ออกแบบและพัฒนาเพื่อส่งมอบเรือปลอดภัยสูงสุด
          </p>
          <div className="flex gap-4 text-slate-500 hover:text-slate-400">
            <span>มาตรฐานผลิตภัณฑ์อุตสาหกรรม (มอก.)</span>
            <span>|</span>
            <span>นโยบายความเป็นส่วนตัว</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
