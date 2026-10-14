import React from 'react';
import { Anchor, ShoppingCart, Menu, X, Search, PhoneCall, User, LogOut, Bell, ListOrdered, Truck, ClipboardList } from 'lucide-react';
import { CartItem, User as AppUser } from '../types';
import NotificationDropdown, { AppNotification } from './NotificationDropdown';
import { supabase, isSupabaseConfigured, supabaseOrders, supabasePreOrders, supabaseDeliveries, isOrderPreOrder } from '../lib/supabase';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  currentUser: AppUser | { id?: string; name?: string; fullName?: string; email?: string; phone?: string } | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  onOpenProfile: (tab?: 'history' | 'addresses' | 'deliveries') => void;
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const mobileSearchInputRef = React.useRef<HTMLInputElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Strict active orders state & tracking mode: 'producing' | 'shipping' | 'hidden'
  const [activeOrders, setActiveOrders] = React.useState<any[]>([]);
  const [trackingStatus, setTrackingStatus] = React.useState<'producing' | 'shipping' | 'hidden'>('hidden');
  const [isInTransitActive, setIsInTransitActive] = React.useState<boolean>(false);

  // Strict Active Order Check: Queries current user's active orders from Supabase 'orders' table
  const checkUserOrders = React.useCallback(async () => {
    // If user is not logged in or has no identification, strictly hide the button
    if (!currentUser) {
      setActiveOrders([]);
      setTrackingStatus('hidden');
      setIsInTransitActive(false);
      return;
    }

    const cleanUserId = currentUser.id?.trim() || '';
    const cleanEmail = (currentUser.email || '').toLowerCase().trim();
    const cleanPhone = (currentUser.phone || '').replace(/\D/g, '');

    // Deleted orders key from ProfileModal
    const deletedOrdersKey = `pornpong_deleted_orders_${cleanUserId || cleanEmail || 'guest'}`;
    let deletedIds: string[] = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem(deletedOrdersKey) || '[]');
    } catch {}

    // Only query if user has at least one valid identifier
    const conditions: string[] = [];
    if (cleanUserId && cleanUserId !== 'guest') conditions.push(`customer_id.eq.${cleanUserId}`);
    if (cleanEmail && cleanEmail !== 'guest@example.com') conditions.push(`customer_email.eq.${cleanEmail}`);
    if (cleanPhone) conditions.push(`customer_phone.eq.${cleanPhone}`);

    if (conditions.length === 0) {
      setActiveOrders([]);
      setTrackingStatus('hidden');
      setIsInTransitActive(false);
      return;
    }

    let rawOrders: any[] = [];
    let deliveriesMap: Record<string, any> = {};

    if (isSupabaseConfigured && supabase) {
      try {
        const [ordersRes, dMap] = await Promise.all([
          supabase
            .from('orders')
            .select('*')
            .or(conditions.join(','))
            .order('created_at', { ascending: false }),
          supabaseDeliveries.getAll()
        ]);

        if (!ordersRes.error && ordersRes.data) {
          rawOrders = ordersRes.data;
        }
        deliveriesMap = dMap || {};
      } catch (err) {
        console.warn('Strict active orders sync warning from Supabase:', err);
      }
    }

    // Filter strictly for active orders (must be in pending/producing/shipping status and NOT finished)
    const validActiveOrders = rawOrders.filter((ord: any) => {
      const orderIdStr = String(ord.id).trim();
      if (deletedIds.includes(orderIdStr)) return false;

      const delivery = deliveriesMap[orderIdStr] || deliveriesMap[ord.id];
      const delivStatus = String(delivery?.delivery_status || ord.delivery_status || '').toLowerCase().trim();
      const ordStatus = String(ord.status || ord.order_status || ord.payment_status || '').toLowerCase().trim();
      const qStage = Number(ord.queue_stage || delivery?.queue_stage || 0);

      // Condition 1: Check if delivered / completed / cancelled (Finished -> EXCLUDE)
      const isFinished = 
        delivStatus === 'delivered' ||
        delivStatus === 'completed' ||
        ordStatus === 'delivered' ||
        ordStatus === 'completed' ||
        delivStatus === 'cancelled' ||
        ordStatus === 'cancelled' ||
        ordStatus === 'rejected';

      if (isFinished) {
        return false;
      }

      // Condition 2: Check if in active in-progress status
      const activeKeywords = [
        'pending_verification',
        'paid',
        'producing',
        'ready_to_ship',
        'in_transit',
        'shipping',
        'shipped',
        'queue_received',
        'manufacturing',
        'ready_for_shipping',
        'ready',
        'processing',
        'pending_deposit',
        'awaitingdeposit',
        'pending',
        'confirmed'
      ];

      return activeKeywords.includes(delivStatus) || activeKeywords.includes(ordStatus) || (qStage >= 1 && qStage <= 4);
    });

    // Update activeOrders state directly
    setActiveOrders(validActiveOrders);

    // If activeOrders.length === 0 or all orders completed/delivered, strictly hide the button
    if (validActiveOrders.length === 0) {
      setTrackingStatus('hidden');
      setIsInTransitActive(false);
      return;
    }

    // Check if any order is currently in-transit / shipping
    const isAnyInTransit = validActiveOrders.some((ord: any) => {
      const orderIdStr = String(ord.id).trim();
      const delivery = deliveriesMap[orderIdStr] || deliveriesMap[ord.id];
      const delivStatus = String(delivery?.delivery_status || ord.delivery_status || '').toLowerCase().trim();
      const ordStatus = String(ord.status || ord.order_status || '').toLowerCase().trim();
      const qStage = Number(ord.queue_stage || delivery?.queue_stage || 0);

      return (
        delivStatus === 'in_transit' || 
        delivStatus === 'shipping' || 
        ordStatus === 'in_transit' || 
        ordStatus === 'shipping' || 
        ordStatus === 'shipped' || 
        qStage === 4
      );
    });
    setIsInTransitActive(isAnyInTransit);

    // Determine whether to display "🚚 กำลังจัดส่ง" (In-Stock / Shipping) or "📋 ติดตามคิวผลิต" (Pre-Order in production)
    const hasPreOrderProducing = validActiveOrders.some((ord: any) => {
      const isPre = isOrderPreOrder(ord);
      if (!isPre) return false; // In-stock orders never wait in production queue

      const orderIdStr = String(ord.id).trim();
      const delivery = deliveriesMap[orderIdStr] || deliveriesMap[ord.id];
      const delivStatus = String(delivery?.delivery_status || ord.delivery_status || '').toLowerCase().trim();
      const ordStatus = String(ord.status || ord.order_status || '').toLowerCase().trim();
      const qStage = Number(ord.queue_stage || delivery?.queue_stage || 0);

      const isShipping = 
        delivStatus === 'in_transit' || 
        delivStatus === 'shipping' || 
        ordStatus === 'in_transit' || 
        ordStatus === 'shipping' || 
        ordStatus === 'shipped' || 
        qStage === 4;

      return !isShipping;
    });

    setTrackingStatus(hasPreOrderProducing && !isAnyInTransit ? 'producing' : 'shipping');
  }, [currentUser]);

  // Real-time synchronization for Header Tracking Status & Active Orders
  React.useEffect(() => {
    checkUserOrders();

    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('public:header-active-orders-sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => checkUserOrders()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'deliveries' },
            () => checkUserOrders()
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription error in Header:', err);
      }
    }

    const handleSync = () => checkUserOrders();
    window.addEventListener('orders-updated', handleSync);
    window.addEventListener('orders_updated', handleSync);
    window.addEventListener('pornpong-delivery-updated', handleSync);
    window.addEventListener('pornpong-order-delivered', handleSync);
    window.addEventListener('pornpong-order-status-updated', handleSync);
    window.addEventListener('pornpong-shipping-in-transit', handleSync);
    window.addEventListener('pornpong-queue-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      if (channel && supabase) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
      window.removeEventListener('orders-updated', handleSync);
      window.removeEventListener('orders_updated', handleSync);
      window.removeEventListener('pornpong-delivery-updated', handleSync);
      window.removeEventListener('pornpong-order-delivered', handleSync);
      window.removeEventListener('pornpong-order-status-updated', handleSync);
      window.removeEventListener('pornpong-shipping-in-transit', handleSync);
      window.removeEventListener('pornpong-queue-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [checkUserOrders]);

  const displayName =
    currentUser?.name && currentUser.name.length > 14
      ? currentUser.name.substring(0, 14) + '...'
      : (currentUser?.name || '');

  const menuItems = [
    { id: 'home', label: 'หน้าแรก' },
    { id: 'products', label: 'หน้าสินค้า' },
    { id: 'preorder', label: 'พรีออเดอร์' }
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
          <div className="hidden md:flex relative flex-1 max-w-md items-center">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="ค้นหาเรือชูชีพ, พายเรือ, ไซส์เรือ..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full h-10 rounded-full border border-sky-100 bg-slate-50/80 px-4 pl-10 pr-9 text-sm leading-normal outline-hidden transition-all duration-200 placeholder:text-slate-400 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-sky-100"
              id="search-input-desktop"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="ล้างคำค้นหา"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'products') onSearch(''); // clear search on clicking products tab
                  if (item.id === 'preorder') {
                    window.history.pushState(null, '', '/pre-order');
                  } else if (item.id === 'home') {
                    window.history.pushState(null, '', '/');
                  } else {
                    window.history.pushState(null, '', `/${item.id}`);
                  }
                }}
                className={`px-4.5 py-2 text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === item.id || (item.id === 'products' && activeTab === 'product-detail')
                    ? 'bg-sky-50 text-brand-blue font-bold shadow-xs ring-1 ring-sky-200/60'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-blue'
                }`}
                id={`nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
            {activeOrders.length > 0 && trackingStatus !== 'hidden' && (
              trackingStatus === 'shipping' ? (
                <button
                  type="button"
                  onClick={() => onOpenProfile('deliveries')}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 shadow-2xs hover:scale-102 active:scale-97 animate-in fade-in ring-1 ring-emerald-400/30"
                  id="nav-track-queue"
                  title={isInTransitActive ? "พัสดุอยู่ระหว่างจัดส่ง - กำลังเดินทางไปยังที่อยู่ของคุณ" : "ติดตามสถานะจัดส่งสินค้า (In-Stock / Ready to Ship)"}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Truck size={14} className="text-emerald-700 animate-pulse" />
                  <span>{isInTransitActive ? '🚚 กำลังจัดส่ง' : '🚚 ติดตามสถานะจัดส่ง'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenProfile('deliveries')}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-amber-800 bg-amber-50/90 hover:bg-amber-100 border border-amber-200/90 shadow-2xs hover:scale-102 active:scale-97 animate-in fade-in"
                  id="nav-track-queue"
                  title="ติดตามคิวผลิตเรือพรีออเดอร์และเตาหลอมโรงงาน Real-time"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <ClipboardList size={13} className="text-amber-700" />
                  <span>📋 ติดตามคิวผลิต</span>
                </button>
              )
            )}
          </nav>

          {/* Cart Icon & Menu Button */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0 border-r border-slate-100 pr-1.5 mr-1.5">
            
            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 md:gap-2 mr-1 shrink-0">
              {currentUser ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={onOpenProfile}
                    className="flex items-center justify-center w-8 h-8 bg-sky-50 hover:bg-sky-100 text-brand-blue rounded-full border border-sky-100 cursor-pointer transition-all active:scale-97 shrink-0"
                    id="desktop-profile-button"
                    title={`ดูโปรไฟล์และประวัติคำสั่งซื้อ สำหรับ คุณ ${currentUser.name}`}
                  >
                    <User size={14} className="shrink-0 text-brand-blue/80" />
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

            {/* Mobile Search Button (shows on small screens to toggle mobile search input) */}
            <button
              onClick={() => {
                setIsMobileSearchOpen(prev => {
                  const next = !prev;
                  if (next) {
                    setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
                  }
                  return next;
                });
                if (activeTab !== 'products') {
                  setActiveTab('products');
                }
              }}
              className={`md:hidden flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer ${
                isMobileSearchOpen
                  ? 'border-brand-blue bg-sky-50 text-brand-blue ring-2 ring-sky-100'
                  : 'border-slate-100 text-slate-600 hover:text-brand-blue hover:bg-slate-50'
              }`}
              aria-label="ค้นหาผลิตภัณฑ์"
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

      {/* Mobile Expandable Search Bar (Drop down on mobile when search icon is tapped) */}
      {isMobileSearchOpen && (
        <div className="md:hidden border-t border-sky-100 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-sm animate-fadeIn">
          <div className="relative w-full flex items-center">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              ref={mobileSearchInputRef}
              type="text"
              placeholder="ค้นหาเรือชูชีพ, พายเรือ, ไซส์เรือ..."
              value={searchTerm}
              onChange={(e) => {
                onSearch(e.target.value);
                if (activeTab !== 'products' && e.target.value) {
                  setActiveTab('products');
                }
              }}
              className="w-full h-10 rounded-full border border-sky-100 bg-slate-50/80 px-4 pl-10 pr-9 text-sm leading-normal outline-hidden placeholder:text-slate-400 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all"
              id="search-input-mobile-dropdown"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="ล้างคำค้นหา"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden block border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg">
          {/* Mobile Search bar */}
          <div className="relative w-full mb-3 flex items-center">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="ค้นหาเรือชูชีพ, พายเรือ, ไซส์เรือ..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full h-10 rounded-xl border border-sky-100 bg-slate-50 px-4 pl-10 pr-9 text-sm leading-normal outline-hidden focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400"
              id="search-input-mobile"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="ล้างคำค้นหา"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                  if (item.id === 'products') onSearch('');
                  if (item.id === 'preorder') {
                    window.history.pushState(null, '', '/pre-order');
                  } else if (item.id === 'home') {
                    window.history.pushState(null, '', '/');
                  } else {
                    window.history.pushState(null, '', `/${item.id}`);
                  }
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
            {activeOrders.length > 0 && trackingStatus !== 'hidden' && (
              trackingStatus === 'shipping' ? (
                <button
                  type="button"
                  onClick={() => {
                    onOpenProfile('deliveries');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs mt-1 transition-all"
                  id="mobile-nav-track-queue"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Truck size={15} className="text-emerald-700" />
                    <span>{isInTransitActive ? '🚚 กำลังจัดส่ง' : '🚚 ติดตามสถานะจัดส่ง'}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full font-mono font-bold">
                    {isInTransitActive ? 'กำลังจัดส่ง' : 'IN-STOCK / SHIPPING'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onOpenProfile('deliveries');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs mt-1 transition-all"
                  id="mobile-nav-track-queue"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <ClipboardList size={15} className="text-amber-700" />
                    <span>📋 ติดตามคิวผลิต</span>
                  </div>
                  <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-mono font-bold">
                    PRE-ORDER
                  </span>
                </button>
              )
            )}
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
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-sky-50 hover:bg-sky-100 text-brand-blue active:bg-sky-150 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  id="mobile-profile-button"
                  title="ดูโปรไฟล์สมาชิก"
                >
                  <User size={14} className="text-brand-blue/80 shrink-0" />
                  <span>ดูโปรไฟล์สมาชิก</span>
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
