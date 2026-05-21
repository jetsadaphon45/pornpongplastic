import React from 'react';
import { Search, ChevronDown, ChevronUp, Sparkles, HelpCircle } from 'lucide-react';
import { FAQS } from '../data';

export default function FAQSection() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string>('ทั้งหมด');
  const [expandedFAQId, setExpandedFAQId] = React.useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    if (expandedFAQId === id) {
      setExpandedFAQId(null);
    } else {
      setExpandedFAQId(id);
    }
  };

  const categories = ['ทั้งหมด', 'การผลิตและคุณภาพพลาสติก', 'การดูแลรักษาและความทนต่อแสงแดด', 'เครื่องยนต์เรือ', 'การขนส่งและจัดส่งสินค้า', 'การรับประกันความพึงพอใจ'];

  // Filter FAQs based on category and search query
  const filteredFAQs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === 'ทั้งหมด' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="font-sans max-w-4xl mx-auto px-4 py-[72px]">
      
      {/* FAQ Intro Headers */}
      <div className="text-center mb-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-brand-blue mb-4">
          <HelpCircle size={28} />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-800 mb-3.5">
          คำถามที่ถามบ่อย (Frequently Asked Questions)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          เรารวบรวมคำตอบ ข้อสงสัยทางวิศวกรรมเรือ คำเตือนความปลอดภัย วิธีสัญจร และนโยบายดูแลหลังขายของพรพงศ์พลาสติกมาไว้บริการไขข้อข้องใจของท่าน
        </p>
      </div>

      {/* Instant Search Bar */}
      <div className="relative mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="ค้นหาข้อสงสัย เช่น แดด, เครื่องยนต์, จัดส่ง..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm rounded-xl border border-sky-100 bg-white shadow-xs p-3.5 pl-10 text-slate-705 outline-hidden focus:border-brand-blue focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
          id="faq-search-bar"
        />
        <div className="absolute left-3.5 top-4 text-slate-450 text-slate-400">
          <Search size={16} />
        </div>
      </div>

      {/* Category Slider Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setExpandedFAQId(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-brand-blue text-white shadow-xs font-semibold'
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-brand-blue'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List Panel */}
      {filteredFAQs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl">
          <p className="text-sm font-semibold text-slate-600">ไม่พบคำถามที่ตรงกับข้อมูลที่ค้นหา</p>
          <p className="text-xs text-slate-400 mt-1">ท่านสามารถติคต่อเราเพื่อสอบถามข้อมูลโดยตรงได้ผ่านทางไลฟ์แชทหรือหน้ารวมเบอร์ติดต่อ</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredFAQs.map((faq) => {
            const isExpanded = expandedFAQId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-sky-100 bg-white overflow-hidden transition-all duration-200 shadow-xs hover:border-brand-blue/30"
                id={`faq-item-${faq.id}`}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex justify-between items-center text-left p-4 sm:p-5 gap-4 hover:bg-slate-100/50 cursor-pointer transition-colors"
                >
                  <div className="flex gap-3 items-start">
                    <span className="text-xs font-extrabold text-brand-blue uppercase bg-sky-50 px-2 py-0.5 rounded-md mt-0.5 shrink-0 hidden sm:inline-block">
                      {faq.category}
                    </span>
                    <span className="font-display text-sm sm:text-base font-bold text-slate-800 leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Accordion Collapsible Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-50 bg-slate-50 p-4 sm:p-5 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Still need help callout */}
      <div className="mt-12 bg-sky-50/60 border border-sky-100 rounded-2xl p-5 sm:p-6 text-center space-y-3">
        <h3 className="font-display text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5 justify-center">
          <HelpCircle size={18} className="text-brand-blue" />
          ยังมีคำถามข้อสงสัยอื่นๆ เกี่ยวกับเรือพลาสติกใช่ไหม?
        </h3>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          วิศวกรและผู้ชำนาญการสร้างเรือ พรพงศ์ ยินดีต้อนรับสายโทรหรือข้อความของทุกท่านเพื่อตอบรายละเอียดสเปกพิเศษอย่างเป็นกันเองที่สุด 
        </p>
        <div className="pt-1.5">
          <a
            href="tel:+66812345678"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs py-3 px-6 shadow-md shadow-sky-50 transition-colors"
          >
            โทรคุยสายด่วน: 081-234-5678
          </a>
        </div>
      </div>

    </div>
  );
}
