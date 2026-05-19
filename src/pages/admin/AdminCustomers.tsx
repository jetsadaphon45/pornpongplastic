import React from 'react';
import { useAdminAuth } from '../../AdminAuthContext';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Calendar,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminCustomers() {
  const { preOrders } = useAdminAuth();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Extract unique users from pre-orders (since I don't have a users list in mock yet)
  // In a real app, this would be a full list of registered users.
  const customers = Array.from(new Set(preOrders.map(o => o.userId))).map(uid => {
    const lastOrder = preOrders.find(o => o.userId === uid);
    const userOrders = preOrders.filter(o => o.userId === uid);
    return {
      uid,
      name: lastOrder?.userName || 'ลูกค้าทั่วไป',
      phone: lastOrder?.userPhone || '-',
      lineId: lastOrder?.userLineId || '-',
      address: lastOrder?.shippingAddress || '-',
      orderCount: userOrders.length,
      totalSpend: userOrders.reduce((sum, o) => sum + o.totalEstimatedPrice, 0),
      lastOrderDate: lastOrder?.createdAt || ''
    };
  }).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อลูกค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center text-gray-400">
             ยังไม่มีข้อมูลลูกค้า
          </div>
        ) : (
          customers.map((c) => (
            <div key={c.uid} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-all flex flex-col group">
               <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-grow">
                     <h3 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase">{c.name}</h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {c.uid}</p>
                  </div>
               </div>

               <div className="space-y-4 flex-grow">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                     <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                     <span>{c.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                     <MessageSquare className="h-4 w-4 text-gray-400 shrink-0" />
                     <span>{c.lineId}</span>
                  </div>
                  <div className="flex items-start space-x-3 text-sm text-gray-600">
                     <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                     <span className="line-clamp-2 leading-snug">{c.address}</span>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">สั่งซื้อทั้งหมด</p>
                     <p className="text-lg font-black text-blue-600">{c.orderCount} ครั้ง</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ยอดจองรวม</p>
                     <p className="text-lg font-black text-gray-900">฿{c.totalSpend.toLocaleString()}</p>
                  </div>
               </div>
               
               <button className="mt-6 w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 text-xs font-bold text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
                  <span>ดูประวัติการสั่งซื้อละเอียด</span>
                  <ChevronRight className="h-4 w-4" />
               </button>
            </div>
          )).reverse()
        )}
      </div>
    </div>
  );
}
