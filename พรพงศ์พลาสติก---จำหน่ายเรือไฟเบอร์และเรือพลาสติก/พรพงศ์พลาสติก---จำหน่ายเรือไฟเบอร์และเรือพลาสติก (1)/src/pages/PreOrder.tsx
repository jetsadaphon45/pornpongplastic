import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { ShoppingBag, ArrowLeft, Send, CheckCircle2, User, Phone, MessageSquare, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';

export default function PreOrder() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, addPreOrder } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    lineId: user?.lineId || '',
    address: user?.address || '',
    notes: '',
  });

  // Items to pre-order
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const singleId = searchParams.get('product');
    if (singleId) {
      const product = PRODUCTS.find(p => p.id === singleId);
      if (product) {
        setItems([{ ...product, quantity: 1 }]);
      }
    } else if (cart.length > 0) {
      setItems(cart);
    } else {
      navigate('/products');
    }
  }, [cart, searchParams, navigate]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !formData.name) return;

    setIsSubmitting(true);
    try {
      await addPreOrder({
        userId: user?.id || 'GUEST',
        userName: formData.name,
        userPhone: formData.phone,
        userLineId: formData.lineId,
        items: items,
        totalEstimatedPrice: subtotal,
        shippingAddress: formData.address,
        notes: formData.notes,
      });

      if (!searchParams.get('product')) {
        clearCart();
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        navigate(user ? '/profile' : '/');
      }, 4000);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-blue-900/10 border border-blue-50"
        >
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">ส่งใบพรีออเดอร์แล้ว!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            ร้านได้รับข้อมูลของท่านแล้ว เจ้าหน้าที่จะติดต่อกลับผ่านทางเบอร์โทรศัพท์หรือ LINE 
            เพื่อยืนยันราคาที่แน่นอนและระยะเวลาผลิตสินค้าอีกครั้ง
          </p>
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 font-bold text-sm">
            ระบบกำลังพาคุณไปยังหน้า{user ? 'ประวัติการสั่งซื้อ' : 'หน้าแรก'}...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center space-x-4 mb-12">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-gray-100 text-gray-600 hover:text-blue-600 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-4xl font-black text-gray-900">แจ้งพรีออเดอร์สินค้า</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Order Summary */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center space-x-3">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
                <span>รายการที่ต้องการจอง</span>
              </h2>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-6">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-grow">
                      <p className="font-bold text-gray-900 leading-tight mb-1">{item.name}</p>
                      <p className="text-xs text-gray-400">จำนวน: {item.quantity} ลำ</p>
                      <p className="text-blue-600 font-black mt-1">฿{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-baseline">
                <span className="text-gray-400 font-bold">ยอดเงินประมาณการ</span>
                <span className="text-3xl font-black text-blue-600">฿{subtotal.toLocaleString()}</span>
              </div>
              <p className="mt-4 text-[11px] text-gray-400 text-center italic bg-gray-50 p-3 rounded-xl">
                 * ราคานี้เป็นราคาเบื้องต้น อาจมีการเปลี่ยนแปลงตามโปรโมชั่นและค่าจัดส่ง
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-xl shadow-blue-900/5">
            <h2 className="text-2xl font-black text-gray-900 mb-8">ข้อมูลการติดต่อ</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">ชื่อ-นามสกุล</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="กรอกชื่อ-นามสกุล"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">เบอร์โทรศัพท์</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="phone"
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="08x-xxx-xxxx"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">LINE ID</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="lineId"
                      required
                      value={formData.lineId}
                      onChange={handleChange}
                      placeholder="@id หรือ ไอดีไลน์"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">ที่อยู่จัดส่ง</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-5 h-5 w-5 text-gray-400" />
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">หมายเหตุเพิ่มเติม</label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="เช่น สีที่ต้องการ, วันที่อยากให้ส่ง..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center space-x-3 mt-4 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งใบพรีออเดอร์'}</span>
                {!isSubmitting && <Send className="h-6 w-6" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
