import { useCart } from '../CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8">
              <ShoppingBag className="h-10 w-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">ตะกร้าสินค้าว่างเปล่า</h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              คุณยังไม่มีสินค้าในตะกร้า เริ่มเลือกซื้อเรือคุณภาพสูงของเราได้เลยวันนี้
            </p>
            <Link
              to="/products"
              className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              ไปเลือกชมสินค้า
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-12">
          <Link to="/products" className="p-2 bg-white rounded-xl border border-gray-100 text-gray-600 hover:text-blue-600 hover:border-blue-100 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-4xl font-black text-gray-900">ตะกร้าสินค้าของคุณ</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Item List */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <motion.div
                layout
                key={item.id}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6"
              >
                <div className="w-full sm:w-40 aspect-video sm:aspect-square rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mb-6 font-medium">รหัสสินค้า: {item.id.toUpperCase()}</p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-blue-600 disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-blue-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-blue-600">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">฿{item.price.toLocaleString()} / ชิ้น</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 sticky top-32">
              <h2 className="text-2xl font-black text-gray-900 mb-8">สรุปรายการสั่งซื้อ</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>จำนวนสินค้าทั้งหมด</span>
                  <span className="font-bold text-gray-900">{totalItems} ชิ้น</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>ค่าจัดส่ง</span>
                  <span className="text-green-500 font-bold">ฟรี</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-lg font-bold text-gray-900">ยอดชำระสุทธิ</span>
                  <div className="text-right text-3xl font-black text-blue-600">
                    ฿{totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              <Link
                to="/preorder"
                className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 mb-4 flex items-center justify-center"
              >
                ยืนยันการพรีออเดอร์
              </Link>
              <p className="text-[11px] text-center text-gray-400 leading-relaxed">
                การกดสั่งซื้อในระบบเป็นเพียงการแจ้งความประสงค์ <br /> 
                เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันรายละเอียดการจัดส่งอีกครั้ง
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
