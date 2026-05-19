import { Facebook, MessageCircle, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-6">พรพงศ์พลาสติก</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              ศูนย์รวมเรือไฟเบอร์และเรือพลาสติกคุณภาพอันดับหนึ่ง 
              มุ่งมั่นส่งมอบสินค้าที่ทนทานและคุ้มค่าที่สุดให้กับลูกค้าทุกท่าน
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">หมวดหมู่สินค้า</h3>
            <ul className="space-y-4 text-sm text-blue-100">
              <li><a href="/products?cat=fiberglass" className="hover:text-white transition-colors">เรือไฟเบอร์</a></li>
              <li><a href="/products?cat=plastic" className="hover:text-white transition-colors">เรือพลาสติก</a></li>
              <li><a href="/products?cat=rowboat" className="hover:text-white transition-colors">เรือพาย</a></li>
              <li><a href="/products?cat=accessory" className="hover:text-white transition-colors">อุปกรณ์เสริมเรือ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">ติดต่อเรา</h3>
            <ul className="space-y-4 text-sm text-blue-100">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 shrink-0 text-blue-400" />
                <span>123 หมู่ 4 ต.ในเมือง อ.เมือง จ.สมุทรปราการ 10270</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 shrink-0 text-blue-400" />
                <span>081-234-5678, 089-876-5432</span>
              </li>
              <li className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 shrink-0 text-blue-400" />
                <span>LINE ID: @pornpongplastic</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-blue-800 text-center text-sm text-blue-300">
          <p>© {new Date().getFullYear()} พรพงศ์พลาสติก (Pornpong Plastic). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
