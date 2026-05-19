import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Facebook, MessageCircle, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
             className="text-4xl md:text-6xl font-black text-gray-900 mb-6"
          >
            คุยกับเราได้ทุกช่องทาง
          </motion.h1>
          <p className="text-gray-500 text-lg">
            ไม่ว่าคุณกําลังมองหาเรือสำหรับใช้งานด้านไหน พรพงศ์พลาสติกยินดีให้คำแนะนำ 
            พร้อมบริการดูแลหลังการขายอย่างเต็มที่
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Info Side */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: Phone, label: "เบอร์โทรศัพท์", value: "081-234-5678", sub: "สายด่วนฝ่ายขาย" },
                { icon: MessageCircle, label: "Line Official", value: "@pornpong", sub: "แชทปรึกษา 24 ชม." },
                { icon: Facebook, label: "Facebook Page", value: "พรพงศ์พลาสติก เรือไฟเบอร์", sub: "ติดตามข่าวสาร" },
                { icon: Clock, label: "เวลาทำการ", value: "08:00 - 18:00", sub: "จันทร์ - นเสาร์" },
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</h3>
                  <p className="text-lg font-black text-gray-900 mb-1">{item.value}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-start space-x-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ที่ตั้งสำนักงานใหญ่</h3>
                <p className="text-lg font-black text-gray-900 leading-snug">
                  123 หมู่ 4 ต.ในเมือง อ.เมือง <br />
                  จ.สมุทรปราการ 10270
                </p>
                <button className="mt-4 text-blue-600 font-bold text-sm hover:underline">ดูแผนที่บน Google Maps</button>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5">
            <h2 className="text-3xl font-black text-gray-900 mb-8 text-center sm:text-left">ส่งข้อความหาเรา</h2>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('ข้อความถูกส่งแล้ว ทางเราจะติดต่อกลับโดยเร็วที่สุด'); }}>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase pl-1">ชื่อ-นามสกุล</label>
                    <input type="text" required placeholder="สมชาย ใจดี" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase pl-1">เบอร์โทรศัพท์</label>
                    <input type="tel" required placeholder="08x-xxx-xxxx" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase pl-1">เรื่องที่ต้องการสอบถาม</label>
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none">
                     <option>สนใจสั่งซื้อเรือไฟเบอร์</option>
                     <option>สนใจสั่งซื้อเรือพลาสติก</option>
                     <option>สอบถามเรื่องการจัดส่ง</option>
                     <option>อื่นๆ</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase pl-1">รายละเอียด</label>
                  <textarea rows={4} placeholder="ระบุรายละเอียดเพิ่มเติม..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none"></textarea>
               </div>
               <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                  ส่งข้อความ
               </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
