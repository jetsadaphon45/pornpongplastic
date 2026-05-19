import React from 'react';
import { useAuth } from '../../AuthContext';
import { 
  ShoppingBag, 
  Search, 
  User as UserIcon, 
  Phone, 
  MessageSquare, 
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  XCircle,
  Truck
} from 'lucide-react';
import { PreOrder } from '../../types';
import { cn } from '../../lib/utils';

export default function AdminOrders() {
  const { preOrders, updateOrderStatus } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredOrders = preOrders.filter(o => 
    o.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  ).reverse();

  const statusMap = {
    pending: { label: 'รอการติดต่อ', color: 'bg-yellow-50 text-yellow-600', icon: Clock },
    contacting: { label: 'กำลังติดต่อ', color: 'bg-blue-50 text-blue-600', icon: MessageSquare },
    producing: { label: 'กำลังผลิต', color: 'bg-purple-50 text-purple-600', icon: Package },
    shipped: { label: 'จัดส่งแล้ว', color: 'bg-green-50 text-green-600', icon: Truck },
    cancelled: { label: 'ยกเลิก', color: 'bg-red-50 text-red-600', icon: XCircle },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อลูกค้า หรือ รหัสออเดอร์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center text-gray-400">
             ยังไม่มีรายการพรีออเดอร์
          </div>
        ) : (
          filteredOrders.map((order) => {
            const status = statusMap[order.status as keyof typeof statusMap] || statusMap.pending;
            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
                 {/* Order Info */}
                 <div className="lg:w-80 p-8 bg-gray-50/50 border-r border-gray-100 space-y-6">
                    <div>
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">#{order.id}</p>
                       <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="space-y-3">
                       <div className="flex items-center space-x-3 text-sm font-bold text-gray-900">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span>{order.userName}</span>
                       </div>
                       <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{order.userPhone}</span>
                       </div>
                       <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span>{order.userLineId}</span>
                       </div>
                       <div className="flex items-start space-x-3 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                          <span className="leading-snug">{order.shippingAddress}</span>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">สถานะออเดอร์</label>
                       <select 
                         value={order.status}
                         onChange={async (e) => {
                           try {
                             await updateOrderStatus(order.id, e.target.value as any);
                           } catch (error) {
                             alert('ไม่สามารถอัปเดตสถานะได้');
                           }
                         }}
                         className={cn(
                           "w-full p-3 rounded-xl text-xs font-bold border-none focus:ring-2 focus:ring-blue-500/20",
                           status.color
                         )}
                       >
                          {Object.entries(statusMap).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 {/* Items */}
                 <div className="flex-grow p-8 flex flex-col">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center space-x-2">
                       <ShoppingBag className="h-5 w-5 text-blue-600" />
                       <span>สินค้ารอการยืนยันราคา</span>
                    </h3>

                    <div className="flex-grow space-y-4">
                       {order.items.map((item, idx) => (
                         <div key={idx} className="flex items-center space-x-6 p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                            <img src={item.image} className="w-16 h-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                            <div className="flex-grow">
                               <p className="font-bold text-gray-900">{item.name}</p>
                               <p className="text-xs text-gray-400">ขนาด: {item.specs.size}</p>
                               <p className="text-xs font-bold text-blue-600">จำนวน: {item.quantity} ลำ</p>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-black text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                               <p className="text-[10px] text-gray-400 italic">ราคาจองเบื้องต้น</p>
                            </div>
                         </div>
                       ))}
                    </div>

                    {order.notes && (
                      <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 italic text-xs text-yellow-700">
                         <span className="font-black not-italic mr-2">หมายเหตุ:</span> {order.notes}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                       <div className="flex items-center space-x-2 text-xs font-bold text-gray-400">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>มัดจำขั้นต่ำ 30% เมื่อกดยืนยัน</span>
                       </div>
                       <div className="text-right">
                          <p className="text-xs text-gray-400 font-bold uppercase">ยอดเงินรวมประมาณการ</p>
                          <p className="text-2xl font-black text-blue-600">฿{order.totalEstimatedPrice.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
