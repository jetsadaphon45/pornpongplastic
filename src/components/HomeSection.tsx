import React from 'react';
import { Anchor, ShieldAlert, Award, Compass, ArrowRight, Star, Quote, ChevronRight, Check } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface HomeSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  setActiveTab: (tab: string) => void;
  onQuickSearch: (term: string) => void;
  onAddToCart: (product: Product, color: string) => void;
}

export default function HomeSection({
  products,
  onSelectProduct,
  setActiveTab,
  onQuickSearch,
  onAddToCart
}: HomeSectionProps) {
  const bestSellers = products.slice(0, 3);

  const keyStrengths = [
    {
      icon: <Award className="text-brand-blue" size={24} />,
      title: 'เม็ดพลาสติก LLDPE นำเข้า',
      desc: 'คัดสรรวัสดุโพลีเอทิลีนความเหนียวสูงพิเศษ เหนียว แน่นหนา ยืดหยุ่นทนทานต่อการขูดขีดขอบหินแม่น้ำ'
    },
    {
      icon: <Compass className="text-brand-blue" size={24} />,
      title: 'ทนแดดจัดผสมสารกัน UV',
      desc: 'ผสมสาร UV-8 Stabilizer ป้องกันแสงแดดเมืองไทย 100% ตัวเรือไม่สุก ไม่กรอบแดง ไม่คัน บวม หรือเบี้ยวรูป'
    },
    {
      icon: <ShieldAlert className="text-brand-blue" size={24} />,
      title: 'ระบบห้องลมในตัวเรือ',
      desc: 'หล่อขึ้นรูป 2 ชั้นไร้รอยต่อ มีโพรงอัดทุ่นห้องลม คอยรับน้ำหนักพยุงตัวเรือเหนือระดับน้ำ แม้น้ำจะเข้าก็ไม่จม'
    }
  ];

  const testimonials = [
    {
      text: "เรือพาย 2.5 เมตรของพรพงศ์พลาสติกเบาและพายง่ายจริงๆ ตักขยะเศษกิ่งไม้ในสวนมะพร้าวลากไปมาสะดวก ไม่ติดตอไม้ ดีกว่าเรือไฟเบอร์เดิมเยอะมากครับ",
      author: "ลุงประวิทย์ ช่วยเกษตร (สวนผลไม้อัมพวา)",
      rating: 5
    },
    {
      text: "สั่งเรือคายัครุ่นแอดเวนเจอร์ไปให้ลูกค้าฝรั่งพาย ทนน้ำเค็มทะเลดีมาก สีไม่ซีดเร็ว บริการจัดส่งทันเวลา แนะนำแบรนด์นี้เลยค่ะ มีประกันตัวเรือด้วยอุ่นใจ",
      author: "คุณสลิลา วัฒนกิจ (เจ้าของรีสอร์ตริมหาดกระบี่)",
      rating: 5
    }
  ];

  return (
    <div className="font-sans">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-[84px] lg:pb-[96px]">
        {/* Abstract background decorative shapes */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <div className="absolute top-10 right-1/4 w-72 h-72 bg-sky-200/40 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-100/50 rounded-full filter blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Hero Left Info */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-brand-blue shadow-xs mb-4">
              <Anchor size={12} />
              <span>เรือพลาสติกอันดับ 1 เกรดงานอุตสาหกรรมไทย</span>
            </span>
            
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-850 tracking-tight leading-tight mb-3.5">
              เรือพลาสติกคุณภาพ <span className="text-brand-blue">ตราพรพงศ์ </span><br className="hidden sm:inline" />
              เหนียวแน่น ทนแดด ท้องเรือมีทุ่นไม่จม
            </h1>
            
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
              ผลิตจากพอลิเอทิลีนหนาพิเศษ (Linear Low-Density Polyethylene) หล่อไร้รอยต่อ ทนทานแรงต้านน่านน้ำ แกร่งกว่าวัสดุทั่วไปเป็นสองเท่า พร้อมสารเพิ่มทนต่อรังสี UV-8 ไม่เบี้ยวหักกรอบ ราคาตรงจากกลุ่มโรงงาน
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-1">
              <button
                onClick={() => setActiveTab('products')}
                className="rounded-xl bg-brand-blue hover:bg-brand-blue-light transition-all text-white font-display font-bold text-sm px-7 py-[13px] shadow-md shadow-sky-200 cursor-pointer flex items-center justify-center gap-2 group"
                id="hero-products-cta"
              >
                <span>เลือกแคมเปญเรือพรีเซลส์</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => setActiveTab('about')}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-slate-600 font-display font-semibold text-sm px-7 py-[13px] cursor-pointer shadow-xs"
              >
                ดูความคุ้มค่าและรีวิวโรงงาน
              </button>
            </div>

            {/* Micro Feature Bullet list */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-6 border-t border-slate-100 max-w-lg mx-auto lg:mx-0">
              {['ไร้รอยต่อทั้งลำตัว', 'ผสมสารกันรังสียูวี', 'รับประกันตรง 3 ปีเต็ม'].map((feat, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="rounded-full bg-emerald-100 p-0.5 text-emerald-600 shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Right Media Preview Grid decoration */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main premium illustration with overlay shadow card element */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl shadow-sky-100 border border-white">
                <img
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=700&auto=format&fit=crop"
                  alt="เรือคายัคพลาสติกพรพงศ์"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Smaller overlay card depicting row boats */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 lg:-bottom-6 lg:-left-6 hidden sm:flex items-center gap-3.5 rounded-xl border border-sky-100 bg-white p-3.5 shadow-xl w-60 animate-bounce animate-duration-[4000ms]">
                <img
                  src="https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=200&auto=format&fit=crop"
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-12 w-16 object-cover rounded-lg shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">เรือพัดพลาสติก 2.5 ม.</h4>
                  <p className="text-[10px] text-amber-500 font-extrabold mt-0.5">ราคา 5,900.- เท่านั้น</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold shrink-0">
                  HOT
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REPUTATION KEY STRENGTHS GRID */}
      <section className="py-[52px] bg-white border-y border-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-display text-2xl font-bold text-slate-800 mb-3.5">ทำไมเรือพลาสติก "พรพงศ์" ถึงแกร่งที่สุด?</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              ทุกรายละเอียดผ่านการเจียระไนจากประสบการณ์ความชำนาญการสร้างสรรค์เครื่องหลอมพลาสติก มั่นใจในชีวิตเมื่อแตะสัมผัสน่านน้ำ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {keyStrengths.map((str, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-50 hover:border-sky-100 hover:bg-sky-50/20 shadow-xs transition-colors duration-200 space-y-4"
              >
                <div className="inline-block p-3 rounded-xl bg-sky-50 text-brand-blue">
                  {str.icon}
                </div>
                <h3 className="font-display text-base font-bold text-slate-800">{str.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed text-slate-400">
                  {str.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HIGHLIGHT PRODUCTS PRESERVED GRID */}
      <section className="py-[72px] sm:py-[76px] bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-800 mb-3.5">รุ่นเรือยอดนิยมขายดีตลอดกาล</h2>
              <p className="text-xs text-slate-500 leading-relaxed">เรือพายทั่วไป ตกปลา คายัค ผลิตขึ้นรูปพิเศษส่งตรงล็อตล่าสุดของสัปดาห์</p>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="group flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-light transition-colors"
            >
              <span>ดูแคตตาล็อกเรือทั้งหมด</span>
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestSellers.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. REAL TESTIMONIAL QUOTE PANEL */}
      <section className="py-[72px] bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="font-display text-2xl font-bold text-slate-850 mb-3.5">ถ้อยคำรีวิวของคนไทย ผู้ไว้วางใจพรพงศ์</h2>
            <p className="text-xs text-slate-400 leading-relaxed">เสียงสะท้อนยืนยันถึงพลาสติกเรือหนาจริง ไม่กรอบแตก และเป็นมิตรกับการเดินทางยาวนาน</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((test, index) => (
              <div 
                key={index} 
                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 font-sans shadow-xs relative"
              >
                <div className="absolute top-4 right-4 text-sky-100">
                  <Quote size={40} className="fill-sky-100/50" />
                </div>
                <div className="flex text-amber-400 mb-3">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 italic leading-relaxed text-justify mb-4 relative z-10 font-medium">
                  "{test.text}"
                </p>
                <p className="text-xs font-bold text-slate-800">
                  - {test.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BIG TRUST CTA BANNER */}
      <section className="bg-brand-blue-dark text-white py-[68px] sm:py-[72px] text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            ต้องการเรือขนาดพิเศษ สำหรับสัญจร โรงงาน รีสอร์ต หรือหน่วยกู้ภัย?
          </h2>
          <p className="text-xs sm:text-sm text-sky-200/80 max-w-xl mx-auto leading-relaxed">
            เรามีรุ่นเรือที่ผ่านการคำนวณสัดส่วนตามหลักพลศาสตร์รองรับน้ำหนักสูงและติดเกาะเครื่องพ่วงข้างแบบพิเศษ พร้อมตอบสนองสายสัญจรด่วน
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <button
              onClick={() => setActiveTab('contact')}
              className="rounded-xl bg-white hover:bg-slate-150 text-slate-900 font-display font-bold text-xs py-3.5 px-6 shadow-md transition-all cursor-pointer"
            >
              คุยสายวิศวกรโรงงานด่วน
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className="rounded-xl border border-slate-700 hover:border-slate-500 text-sky-200 hover:text-white font-display font-medium text-xs py-3.5 px-6 transition-all cursor-pointer"
            >
              ศึกษาเงื่อนไขการรับประกันและขนส่ง
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
