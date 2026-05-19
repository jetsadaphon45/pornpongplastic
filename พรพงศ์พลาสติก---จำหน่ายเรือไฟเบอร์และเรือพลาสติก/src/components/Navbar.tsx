import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Anchor, User, Lock } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'หน้าแรก', path: '/' },
    { name: 'สินค้า', path: '/products' },
    { name: 'ติดต่อเรา', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <Anchor className="h-8 w-8 text-blue-600 group-hover:rotate-12 transition-transform" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              พรพงศ์พลาสติก
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600",
                  location.pathname === link.path ? "text-blue-600" : "text-gray-600"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="flex items-center space-x-4 border-l border-gray-100 pl-8">
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-2">
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all uppercase tracking-wider"
                    >
                      Admin
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    className={cn(
                      "flex items-center space-x-2 p-2 px-4 rounded-xl border border-blue-50 transition-all",
                      location.pathname === '/profile' ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm font-bold truncate max-w-[100px]">{user.name}</span>
                  </Link>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart" className="relative p-2 text-gray-600">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-blue-50 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-4 text-base font-medium rounded-lg",
                    location.pathname === link.path
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-50 flex flex-col space-y-2 px-3">
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 py-3 font-bold text-orange-600 border-b border-gray-50"
                      >
                         <Lock className="h-5 w-5" />
                         <span>จัดการระบบ (Admin)</span>
                      </Link>
                    )}
                    <Link 
                      to="/profile" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 py-3 font-bold text-blue-600"
                    >
                      <User className="h-5 w-5" />
                      <span>โปรไฟล์: {user.name}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="bg-blue-600 text-white text-center py-4 rounded-xl font-bold"
                    >
                      เข้าสู่ระบบ
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setIsOpen(false)}
                      className="text-center py-3 font-bold text-gray-500"
                    >
                      สมัครสมาชิก
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
