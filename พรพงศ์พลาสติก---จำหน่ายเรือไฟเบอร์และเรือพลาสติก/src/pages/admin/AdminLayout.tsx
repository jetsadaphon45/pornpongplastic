import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Anchor,
  Package,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  const menuItems = [
    { name: 'แดชบอร์ด', icon: LayoutDashboard, path: '/admin' },
    { name: 'จัดการสินค้า', icon: Package, path: '/admin/products' },
    { name: 'จัดการพรีออเดอร์', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'ผู้ใช้งาน', icon: Users, path: '/admin/customers' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
          <Anchor className="h-8 w-8 text-blue-600 shrink-0" />
          {isSidebarOpen && (
            <span className="font-black text-blue-900 truncate">ADMIN PANEL</span>
          )}
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:text-blue-600 font-bold transition-colors"
          >
            <ExternalLink className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>ไปยังหน้าร้าน</span>}
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all mt-2"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-black text-gray-900">
               {menuItems.find(i => i.path === location.pathname)?.name || 'แผงควบคุม'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{user.role}</p>
             </div>
             <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {user.name.charAt(0)}
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
