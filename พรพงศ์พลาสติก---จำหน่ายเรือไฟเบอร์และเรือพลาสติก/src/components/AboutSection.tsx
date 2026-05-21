import React from 'react';
import { Target, Sparkles, Verified, Users2, ShieldCheck, Milestone } from 'lucide-react';

export default function AboutSection() {
  const coreValues = [
    {
      icon: <Target className="text-brand-blue" size={20} />,
      title: 'ความปลอดภัยเป็นอานันต์ (Ultimate Safety)',
      desc: 'เรือทุกลำต้องผ่านมาตรวัดทุ่นระเบิดห้องลมสองชั้นพยุงตัว เพื่อให้มั่นใจได้ว่าแม้หัวเรือจะเกี่ยวชนหินคมก็สามารถเกาะฝั่งลอยตัวได้'
    },
    {
      icon: <ShieldCheck className="text-brand-blue" size={20} />,
      title: 'ความหนามาตรฐานอุตสาหกรรม (Industrial Gauge)',
      desc: 'เนื้อพลาสติกที่ใช้มีความหนาปานกลางไม่น้อยกว่า 5-7 มิลลิเมตร ผลิตด้วยโพลีเอทิลีนปั่นอุณหภูมิสม่ำเสมอ ผิวเรียบเนียนกันคลื่น'
    },
    {
      icon: <Sparkles className="text-brand-blue" size={20} />,
      title: 'นวัตกรรมดีไซน์เพื่อคนไทย (Localization)',
      desc: 'วิเคราะห์ทรงท่อนตัวเรือให้ตอบโจทย์ตามท้องน้ำ ลำคลอง และร่องสวนผลไม้ของไทยอย่างลึกซึ้ง พายเบา บัลลาร์ดแน่น ไม่ลู่น้ำ'
    }
  ];

  return (
    <div className="font-sans">
      
      {/* 1. BRAND STORY INTRO SECTION */}
      <section className="py-[72px] bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-bold text-brand-blue tracking-widest block uppercase bg-sky-100/50 px-2.5 py-1 rounded-full w-max mx-auto mb-4">
              เปิดตำนาน "พรพงศ์พลาสติก" 
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight mb-3.5">
              ผู้บุกเบิกผลิตเรือพลาสติก 2 ชั้นไร้ตะเข็บตัวจริง
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              จากโรงงานหล่อโครงแม่พิมพ์พลาสติกในจังหวัดสมุทรสาคร สู่แบรนด์เรือยอดนิยมที่คนพายเรือไทยแนะนำบอกต่อ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-4">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                เริ่มต้นขยับปรับตัวเพื่อแก้ไขปัญหาเรือรั่วซึมให้กับคนไทย
              </h2>
              <div className="text-xs sm:text-sm text-slate-500 leading-relaxed space-y-4 text-justify">
                <p>
                  ย้อนไปเมื่อกว่า 20 ปีก่อน ในชุมชนการเลี้ยงปลาและทำสวนตามปริมณฑล มักจะพบเจอปัญหากับเรือขุดเนื้อไม้โบราณที่เมื่อแช่น้ำนานๆ ก็จะเริ่มผุพังบวมน้ำ หรือเรือไฟเบอร์กลาสที่เมื่อโดนกิ่งไม้แห้งใต้น้ำเกี่ยวชนหนักๆ ก็มักเกิดรอยแตกร้าวแหลมคมเป็นอันตราย และยากต่อการซ่อมแซมบ่อยหน
                </p>
                <p>
                  <strong>“พรพงศ์พลาสติก”</strong> จึงถูกริเริ่มขึ้นโดยวิศวกรผู้เชี่ยวชาญเครื่องกลหลอมสารโพลิเมอร์ เราออกแบบและขึ้นรูปเรือพลาสติกแบบหมุนเหวี่ยงอุณหภูมิความร้อนสูง (Rotational Molding Machine) ชนิดไร้รอยต่อรอยเย็บร่องรอยควัน 
                </p>
                <p>
                  ทำให้ได้โครงสร้างเรือที่มีความเหนียวแน่นตึง ทนแดด ทนกรด ทนสัมผัสน้ำด่างส้ม และรองรับแรงกระแทกจากหินใต้น้ำเรือได้อย่างยอดเยี่ยมจนได้รับการไว้วางใจในการใช้ในงานช่วยน้ำท่วม บ่อแก้มลิง โบเก้ และกิจกรรมท่องเที่ยวทางเรือคายัคทั่วประเทศมาจนถึงปัจจุบัน
                </p>
              </div>
            </div>

            {/* Quality badge imagery illustration */}
            <div className="relative">
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-slate-100 border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=700&auto=format&fit=crop"
                  alt="วิถีพายเรือท่องเที่ยว"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 bg-brand-blue text-white rounded-2xl p-4 shadow-xl max-w-xs border border-sky-100">
                <p className="font-display font-bold text-sm">การันตีลอยตัวถาวร 100%</p>
                <p className="text-[10px] text-sky-200 mt-1 leading-relaxed">
                  เราคัดโฟมรับน้ำหนักอย่างดีหนาพิเศษ อัดประจุเข้าห้องลมใต้หัวเบาะนั่ง ป้องกันเรือคว่ำเรือจมดีเลิศ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUES */}
      <section className="py-[72px] bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-display text-xl font-bold text-slate-800 mb-3.5">ปรัชญาความน่าเกรงขาม แบรนด์พรพงศ์</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              สามคำมั่นสัญญาที่เรายึดถือในการหล่อหัวเรือทุกลำเพื่อดูแลลูกค้าผู้พายเรือทุกคน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {coreValues.map((v, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                <div className="inline-block p-2 rounded-lg bg-sky-50 text-brand-blue">
                  {v.icon}
                </div>
                <h4 className="font-display text-sm font-bold text-slate-800">{v.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed text-slate-400">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. EXPERIENCE STATS MILESTONE BANNER */}
      <section className="py-[72px] bg-brand-blue-dark text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-brand-blue-light block">20+ ปี</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">ประสบการณ์หล่อพลาสติก</span>
            </div>
            <div className="space-y-1">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-brand-blue-light block">15,000+ ลำ</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">ประกอบลอยน้ำทั่วประเทศ</span>
            </div>
            <div className="space-y-1">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-brand-blue-light block">100% HDPE</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">เกรดพลาสติกทนเหนียวหนาพิเศษ</span>
            </div>
            <div className="space-y-1">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-brand-blue-light block">3 ปีเต็ม</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">รับประกันรอยรั่วสเปกโรงงาน</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ENVIRONMENT-FRIENDLY COMMITMENT */}
      <section className="py-[72px] bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="inline-block p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <Verified size={24} />
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-slate-800">
            พลาสติกโพลีเอทิลีนรักษ์โลก รีไซเคิลได้ 100%
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed text-justify sm:text-center">
            พรพงศ์พลาสติก ตระหนักถึงความยั่งยืนของแหล่งธรรมชาติตามลำคลองและชายหาด พลาสติกโพลีเอทิลีนที่เราใช้หลอมหล่อตัวเรือทุกลำเป็น พลาสติกโพลีเอทิลีนที่สามารถสับย่อยหลอมใหม่ใช้งานทางวิศวกรรมอุตสาหกรรมในอนาคตได้ 100% ปราศรสารเคมีตกค้างและสารตะกั่วหนักสะสมเมื่อสัมผัสผิวน้ำเป็นเวลาหลายสิบปี เป็นมิตรต่อพืชน้ำ ชิงช้าปลา และฟาร์มหอย
          </p>
        </div>
      </section>

    </div>
  );
}
