import { motion } from 'motion/react';
import { ArrowRight, Anchor, Shield, Truck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1920"
            alt="Hero Background"
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-200 text-sm font-bold rounded-full mb-6">
              ความแกร่งที่คุณวางใจ โดย พรพงศ์พลาสติก
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              ล่องเรืออย่างมั่นใจ <br />
              <span className="text-blue-400">ไปกับสินค้าคุณภาพ</span>
            </h1>
            <p className="text-xl text-blue-100/90 mb-10 leading-relaxed max-w-lg">
              จำหน่ายเรือไฟเบอร์และเรือพลาสติกมาตรฐานสากล แข็งแรง ทนทาน 
              คุ้มค่าราคาโรงงาน พร้อมส่งตรงถึงมือคุณทั่วประเทศ
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/products"
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 group"
              >
                เลือกดูสินค้า
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-white/20 transition-all"
              >
                ปรึกษาเราฟรี
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { icon: Shield, title: "ทนทานเป็นพิเศษ", desc: "ใช้วัสดุเกรดพรีเมียม ทนแดด ทนการกระแทก" },
              { icon: Truck, title: "จัดส่งรวดเร็ว", desc: "บริการส่งทั่วไทย แพ็คห่ออย่างดี ปลอดภัย" },
              { icon: Award, title: "รับประกันคุณภาพ", desc: "สินค้าทุกใบผ่านการตรวจสอบมาตรฐาน QC" },
              { icon: Anchor, title: "ทรงตัวดีเยี่ยม", desc: "ออกแบบตามหลักวิศวกรรมเรือ ปลอดภัยสูง" },
            ].map((f, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories CTA */}
      <section className="py-24 bg-blue-50 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black text-blue-900 mb-8">
            เรามีเรือครบทุกความต้องการ
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            ไม่ว่าจะเป็นเรือประมงขนาดเล็ก เรือใช้ในรีสอร์ท หรือเรือพายสันทนาการ 
            พรพงศ์พลาสติกมีให้คุณเลือกสรร พร้อมโปรโมชั่นราคาพิเศษ
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {['เรือไฟเบอร์', 'เรือพลาสติก', 'เรือพาย', 'อุปกรณ์เสริม'].map((cat, idx) => (
               <Link 
                 key={idx}
                 to="/products" 
                 className="p-6 bg-white rounded-3xl border border-blue-100 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all font-bold text-blue-900"
               >
                 {cat}
               </Link>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
}
