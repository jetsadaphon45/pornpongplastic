import React from 'react';
import { useAuth } from '../../AuthContext';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const { products, preOrders } = useAuth();
  
  // Mock customer count (would normally be from users collection)
  const customerCount = 124; 

  const stats = [
    { label: 'สินค้าทั้งหมด', value: products.length || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'พรีออเดอร์', value: preOrders.length || 0, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'ลูกค้าสมาชิก', value: customerCount, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'ยอดจองประมาณการ', value: `฿${preOrders.reduce((sum, o) => sum + o.totalEstimatedPrice, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const recentOrders = preOrders.slice(-5).reverse();

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-400 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900">พรีออเดอร์ล่าสุด</h3>
            <button className="text-blue-600 text-xs font-bold hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <tr>
                  <th className="px-6 py-4">ลูกค้า / วันที่</th>
                  <th className="px-6 py-4">รายการ</th>
                  <th className="px-6 py-4">ยอดเงิน</th>
                  <th className="px-6 py-4">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">ยังไม่มีรายการพรีออเดอร์</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{order.userName}</p>
                        <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex -space-x-2">
                           {order.items.slice(0, 3).map((item, idx) => (
                             <img key={idx} src={item.image} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                           ))}
                           {order.items.length > 3 && (
                             <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                               +{order.items.length - 3}
                             </div>
                           )}
                         </div>
                      </td>
                      <td className="px-6 py-4 font-black text-blue-600 text-sm">
                        ฿{order.totalEstimatedPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                           order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 
                           order.status === 'shipped' ? 'bg-green-50 text-green-600' :
                           'bg-blue-50 text-blue-600'
                         }`}>
                           {order.status}
                         </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
           <h3 className="text-lg font-black text-gray-900 mb-8">สถานะการผลิต</h3>
           <div className="space-y-6">
              {[
                { label: 'รอการติดต่อ', count: preOrders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-yellow-500' },
                { label: 'กำลังผลิต', count: preOrders.filter(o => o.status === 'producing').length, icon: AlertCircle, color: 'text-blue-500' },
                { label: 'จัดส่งแล้ว', count: preOrders.filter(o => o.status === 'shipped').length, icon: CheckCircle2, color: 'text-green-500' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                    <span className="text-sm font-bold text-gray-600">{s.label}</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">{s.count} ลำ</span>
                </div>
              ))}
           </div>
           
           <div className="mt-10 p-6 bg-blue-600 rounded-2xl text-white">
              <p className="text-xs font-bold opacity-80 mb-1">ยอดขายที่ยืนยันแล้ว</p>
              <h4 className="text-2xl font-black">฿452,000</h4>
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center space-x-2 text-[10px] font-bold">
                 <TrendingUp className="h-3 w-3" />
                 <span>เพิ่มขึ้น 12% จากเดือนที่แล้ว</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
