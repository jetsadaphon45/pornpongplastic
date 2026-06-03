import React from 'react';
import { Anchor, ShoppingCart, Menu, X, Search, PhoneCall, User, LogOut, Bell } from 'lucide-react';
import { CartItem } from '../types';
import NotificationDropdown, { AppNotification } from './NotificationDropdown';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  currentUser: { name: string; email: string; phone: string } | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  cart,
  setIsCartOpen,
  onSearch,
  searchTerm,
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onOpenProfile,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDeleteNotification
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const menuItems = [
    { id: 'home', label: 'หน้าแรก' },
    { id: 'products', label: 'หน้าสินค้า' },
    { id: 'about', label: 'เกี่ยวกับเรา' },
    { id: 'faq', label: 'คำถามที่พบบ่อย (FAQ)' },
    { id: 'contact', label: 'ติดต่อเรา' }
  ];


  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-100 bg-white shadow-xs">
      {/* Top Banner Contact Bar */}
      <div className="bg-brand-blue text-white py-[9px] px-4 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4 md:px-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>โรงงานผลิตและจัดส่งตรงถึงหน้าสวน-หน้าบ้านตัวจริง โดยช่างชำนาญการกว่า 20 ปี</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+66812345678" className="flex items-center gap-1 hover:underline">
              <PhoneCall size={12} />
              <span>ด่วน: 081-234-5678</span>
            </a>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Line ID: @pornpongplastic</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex py-[18px] items-center justify-between gap-7 md:gap-8">
          
          {/* Logo Branding */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer shrink-0" 
            onClick={() => { setActiveTab('home'); }}
            id="header-logo-brand"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white shadow-md shadow-sky-200">
              <Anchor size={22} className="rotate-12 transition-transform duration-300 hover:rotate-45" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-brand-blue-dark leading-none">
                พรพงศ์พลาสติก
              </h1>
              <span className="text-[10px] font-sans font-medium text-brand-blue uppercase tracking-widest block mt-0.5">
                Premium Plastic Boats
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="ค้นหาเรือชูชีพ, พายเรือ, ไซส์เรือ..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-full border border-sky-100 bg-slate-55 px-4 py-1.8 pl-10 text-sm outline-hidden transition-all duration-200 placeholder:text-slate-400 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-sky-100"
              id="search-input-desktop"
            />
            <div className="absolute left-3.5 top-2.5 text-slate-400">
              <Search size={16} />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'products') onSearch(''); // clear search on clicking products tab
                }}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeTab === item.id || (item.id === 'products' && activeTab === 'product-detail')
                    ? 'bg-sky-50 text-brand-blue font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-blue'
                }`}
                id={`nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Cart Icon & Menu Button */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            
            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 md:gap-2 mr-1 shrink-0">
              {currentUser ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={onOpenProfile}
                    className="flex items-center gap-1 px-2 md:px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-brand-blue rounded-full border border-sky-100 cursor-pointer transition-all active:scale-97 min-w-0"
                    id="desktop-profile-button"
                    title={`ดูโปรไฟล์และประวัติคำสั่งซื้อ สำหรับ คุณ ${currentUser.name}`}
                  >
                    <User size={13} className="shrink-0 text-brand-blue/80" />
                    <span className="text-[11px] font-bold max-w-[180px] truncate whitespace-nowrap overflow-hidden hidden md:inline-block">
                      คุณ {currentUser.name}
                    </span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 px-2 py-1 hover:text-red-500 hover:bg-red-50 text-slate-500 font-bold text-[11px] rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer shrink-0"
                    id="desktop-logout-button"
                    title="ออกจากระบบ"
                  >
                    <LogOut size={13} className="shrink-0" />
                    <span className="hidden md:inline">ออกจากระบบ</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onOpenLogin}
                    className="hover:text-brand-blue font-bold text-[11px] text-slate-600 px-2.5 py-1.8 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    id="desktop-login-button"
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button
                    onClick={onOpenRegister}
                    className="bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-[11px] px-3.5 py-1.8 rounded-lg transition-colors cursor-pointer shadow-xs shadow-sky-100"
                    id="desktop-register-button"
                  >
                    สมัครสมาชิก
                  </button>
                </div>
              )}
            </div>
            
            {/* Notification Bell Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-650 hover:border-brand-blue hover:text-brand-blue transition-all duration-250 cursor-pointer shadow-xs active:scale-95"
                aria-label="การแจ้งเตือน"
                id="notification-bell-trigger"
              >
                <Bell size={20} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onClearAll={onClearAll}
                onDeleteNotification={onDeleteNotification}
              />
            </div>

            {/* Quick Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-650 hover:border-brand-blue hover:text-brand-blue transition-all duration-250 cursor-pointer shadow-xs active:scale-95 animate-duration-1000"
              aria-label="ตะกร้าสินค้า"
              id="cart-trigger-button"
            >
              <ShoppingCart size={20} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-bounce animate-duration-1000">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Mobile Search Button (shows on small screens to trigger modal search or tab) */}
            <button
              onClick={() => {
                setActiveTab('products');
              }}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 text-slate-600 hover:text-brand-blue focus:outline-none"
              id="search-trigger-mobile"
            >
              <Search size={18} />
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 text-slate-600 hover:text-brand-blue focus:outline-none cursor-pointer"
              aria-label="เมนูหลัก"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden block border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg">
          {/* Mobile Search bar */}
          <div className="relative w-full mb-3">
            <input
              type="text"
              placeholder="พายเรือ, ไซส์เรือ..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-lg border border-sky-100 bg-slate-50 px-4 py-2 pl-9 text-sm outline-hidden focus:border-brand-blue"
              id="search-input-mobile"
            />
            <div className="absolute left-3 top-2.5 text-slate-400">
              <Search size={15} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                  if (item.id === 'products') onSearch('');
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id || (item.id === 'products' && activeTab === 'product-detail')
                    ? 'bg-brand-blue text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:bg-sky-50 hover:text-brand-blue'
                }`}
                id={`mobile-nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Auth Buttons */}
          <div className="pt-3.5 mt-2.5 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onOpenProfile();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-sky-50 hover:bg-sky-100 text-brand-blue active:bg-sky-150 rounded-lg text-xs font-bold transition-all text-left cursor-pointer"
                  id="mobile-profile-button"
                >
                  <User size={14} className="text-brand-blue/80 shrink-0" />
                  <span className="truncate">คุณ {currentUser.name} (ดูโปรไฟล์สมาชิก)</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-650 text-red-600 bg-red-50 hover:bg-red-100 transition-all rounded-lg cursor-pointer"
                  id="mobile-logout-button"
                >
                  <LogOut size={13} />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center font-bold text-xs text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg py-2.5 cursor-pointer"
                  id="mobile-login-button"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => {
                    onOpenRegister();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center font-bold text-xs text-white bg-brand-blue hover:bg-brand-blue-light rounded-lg py-2.5 shadow-xs cursor-pointer"
                  id="mobile-register-button"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
