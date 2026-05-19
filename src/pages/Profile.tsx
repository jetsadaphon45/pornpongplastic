import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, Clock, LogOut, ChevronRight, MapPin, Phone, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user, preOrders, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                <User className="h-12 w-12" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">{user.name}</h1>
              <p className="text-gray-400 text-sm mb-8">{user.email}</p>
              
              <div className="space-y-4 text-left border-t border-gray-50 pt-8">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span>{user.lineId}</span>
                </div>
                <div className="flex items-start space-x-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                  <span className="leading-snug">{user.address}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-10 p-4 rounded-2xl bg-gray-50 text-gray-500 font-bold hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center space-x-4">
                <Package className="h-8 w-8 text-blue-600" />
                <span>ประวัติการพรีออเดอร์</span>
              </h2>

              {preOrders.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-300 p-16 text-center">
                  <Clock className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                  <p className="text-gray-400 font-medium text-lg mb-8">คุณยังไม่มีรายการพรีออเดอร์ในขณะนี้</p>
                  <Link to="/products" className="inline-flex bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                    เลือกดูเรือรุ่นใหม่
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {preOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <div>
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Order ID: {order.id}</p>
                          <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('th-TH', { 
                            year: 'numeric', month: 'long', day: 'numeric' 
                          })}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                          order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {order.status === 'pending' ? 'รอเจ้าหน้าที่ยืนยัน' : order.status}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-4">
                            <img src={item.image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                            <div className="flex-grow">
                              <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                              <p className="text-xs text-gray-400">จำนวน {item.quantity} ลำ</p>
                            </div>
                            <p className="font-black text-blue-600">฿{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center">
                        <div className="text-xs text-gray-400">
                          <p>ยอดโดยประมาณ: <span className="text-lg font-black text-gray-900 ml-2">฿{order.totalEstimatedPrice.toLocaleString()}</span></p>
                        </div>
                        <button className="flex items-center space-x-2 text-blue-600 font-bold text-sm hover:underline">
                          <span>ดูรายละเอียด</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )).reverse()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
