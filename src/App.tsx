import React from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  X, 
  CheckCircle2, 
  ShoppingBag, 
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Menu,
  ChevronRight
} from 'lucide-react';

import { Product, CartItem } from './types';
import { supabaseProducts, supabaseCustomers, supabaseOrders } from './lib/supabase';

import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import { LoginModal, RegisterModal } from './components/AuthModals';
import { ProfileModal } from './components/ProfileModal';
import { AppNotification } from './components/NotificationDropdown';
import { AdminDashboard } from './components/AdminDashboard';
import AdminLoginPage from './components/AdminLoginPage';
import PaymentPage from './components/PaymentPage';

import HomeSection from './components/HomeSection';
import AboutSection from './components/AboutSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';

export default function App() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState<boolean>(true);

  const fetchSupabaseProducts = React.useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const data = await supabaseProducts.list();
      setProducts(data);
    } catch (e) {
      console.error('Failed to load products from Supabase:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSupabaseProducts();
  }, [fetchSupabaseProducts]);

  React.useEffect(() => {
    const handleProductsUpdated = () => {
      fetchSupabaseProducts();
    };
    window.addEventListener('products-updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('products-updated', handleProductsUpdated);
    };
  }, [fetchSupabaseProducts]);

  // Navigation & View States
  const [activeTab, setActiveTab ] = React.useState<string>('home');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isAdminMode, setIsAdminMode] = React.useState<boolean>(() => {
    // If initially landed on admin dashboard, activate admin mode
    return window.location.pathname === '/admin-dashboard';
  });

  // Simple Client-Side Router state
  const [currentPath, setCurrentPath] = React.useState<string>(() => window.location.pathname);

  React.useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      if (window.location.pathname === '/admin-dashboard') {
        setIsAdminMode(true);
      } else if (window.location.pathname === '/admin-login') {
        setIsAdminMode(false);
      } else {
        setIsAdminMode(false);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate-changed', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate-changed', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('pushstate-changed'));
  };

  // Order state for payment page redirections
  const [currentOrder, setCurrentOrder] = React.useState<any>(null);

  // User Authentication state
  const [currentUser, setCurrentUser] = React.useState<{ name: string; email: string; phone: string } | null>(() => {
    try {
      const savedUser = localStorage.getItem('pornpong_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isLoginOpen, setIsLoginOpen] = React.useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = React.useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState<boolean>(false);

  // Notifications State (with dynamic default data to avoid database dependency)
  const [notifications, setNotifications] = React.useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('pornpong_notifications');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'noti-1',
          title: 'คำสั่งซื้อจัดส่งสำเร็จแล้ว',
          message: 'ยินดีด้วย! คำสั่งซื้อของคุณหมายเลข ORD-2026-9874 "เรือพายพลาสติก ตราพรพงศ์ รุ่น 2.5 เมตร - ท้องเรือแบนสัญจรง่าย" ได้รับการขนส่งสำเร็จแล้ว ตรวจสอบสถานะการขนส่ง: TH-EX-291823',
          type: 'order',
          date: '12 มี.ค.',
          isRead: false
        },
        {
          id: 'noti-2',
          title: 'สถานะมัดจำพรีออเดอร์ได้รับการอนุมัติ',
          message: 'พรีออเดอร์ PRE-2026-0005 ได้รับการตรวจสอบและยืนยันเงินมัดจำล่วงหน้าแล้ว! ทางโรงงานกำลังจัดแผนสั่งเตรียมคิวขึ้นรูปเรือคายัคคู่ใจทัวร์ริ่งของคุณอย่างพิถีพิถัน',
          type: 'preorder',
          date: '18 พ.ค.',
          isRead: false
        },
        {
          id: 'noti-3',
          title: 'โปรโมชั่นของแถมสุดเอ็กซ์คลูซีฟ',
          message: 'ต้อนรับครอบครัวพรพงศ์คนใหม่! วันนี้เมื่อจองเรือพายพลาสติกหนาพิเศษสองชั้นสีสันใดก็ได้ รับฟรีใบคู่พายเนื้อพรีเมียม มูลค่า 350 บาททันทีไม่มีขั้นต่ำ',
          type: 'promotion',
          date: 'วันนี้',
          isRead: false
        },
        {
          id: 'noti-4',
          title: 'เปิดตัวเรือหลอมซีรีส์ใหม่ล่าสุด!',
          message: 'เปิดสเปกเรือคายัคประเภทท่องเที่ยวสันทนาการ เกรดเสริมสารกันแดด UV-8 ยืดอายุเรือสีไม่ซีดจางนานกระแทกลิฟท์สิบปียกกำลังสอง',
          type: 'new_product',
          date: 'เมื่อวาน',
          isRead: false
        }
      ];
    } catch {
      return [];
    }
  });
  
  // Cart management (backed by LocalStorage for premium usability!)
  const [cart, setCart] = React.useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('pornpong_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  
  const [isCartOpen, setIsCartOpen] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  
  // Products filter options
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('default');

  // Multi Alert Toast (Top screen brief alerts)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync cart adjustments with localStorage
  React.useEffect(() => {
    localStorage.setItem('pornpong_cart', JSON.stringify(cart));
  }, [cart]);

  // Display helpful alert message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Sync notifications with Cache
  React.useEffect(() => {
    try {
      localStorage.setItem('pornpong_notifications', JSON.stringify(notifications));
    } catch (err) {
      console.error("Storage error for notifications", err);
    }
  }, [notifications]);

  // Notifications handler actions
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(noti => noti.id === id ? { ...noti, isRead: true } : noti));
    triggerToast('ทำเครื่องหมายว่าอ่านแล้ว');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(noti => ({ ...noti, isRead: true })));
    triggerToast('ทำเครื่องหมายอ่านแล้วทั้งหมดเรียบร้อย!');
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    triggerToast('ล้างการแจ้งเตือนทั้งหมดแล้ว!');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(noti => noti.id !== id));
    triggerToast('ลบการแจ้งเตือนสำเร็จ');
  };

  // Add Item to Cart
  const handleAddToCart = (product: Product, color: string, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedColor: color }];
      }
    });

    triggerToast(`เพิ่ม "${product.name}" (${color}) จำนวน ${quantity} ลำ ลงตะกร้าแล้ว`);
  };

  // Update Item Quantity inside Cart
  const handleUpdateCartQuantity = (productId: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId, color);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Remove Item from Cart
  const handleRemoveCartItem = (productId: string, color: string) => {
    const targetItem = cart.find(item => item.product.id === productId && item.selectedColor === color);
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.selectedColor === color))
    );
    if (targetItem) {
      triggerToast(`นำเอา "${targetItem.product.name}" ออกจากตัวกรองระเบียนแล้ว`);
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSubmitOrder = async (orderDetails: { fullName: string; phone: string; address: string; notes?: string }) => {
    try {
      const totalSum = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      
      // Save order to Supabase orders table
      const customerId = currentUser?.id || null;
      const customerEmail = currentUser?.email || 'guest@example.com';
      const productNameSummary = cart.map(item => `${item.product.name} x${item.quantity}`).join(', ');
      const colorsSummary = cart.map(item => item.selectedColor).join(', ');

      const createdOrder = await supabaseOrders.create({
        customer_id: customerId,
        customer_name: orderDetails.fullName,
        customer_email: customerEmail,
        customer_phone: orderDetails.phone,
        total_amount: totalSum,
        payment_status: 'pending',
        order_status: 'waiting_payment',
        productName: productNameSummary,
        color: colorsSummary
      });

      const fallbackOrder = {
        id: 'ORD-2026-' + Math.floor(1000 + Math.random() * 9000),
        customer_id: customerId,
        customer_name: orderDetails.fullName,
        customer_email: customerEmail,
        customer_phone: orderDetails.phone,
        total_amount: totalSum,
        payment_status: 'pending',
        order_status: 'waiting_payment',
        productName: productNameSummary,
        color: colorsSummary
      };

      const finalOrder = createdOrder || fallbackOrder;
      setCurrentOrder(finalOrder);

      // Keep local notifications for UI reactivity
      const randomId = 'noti-' + Math.floor(Math.random() * 1000000);
      const newNoti = {
        id: randomId,
        title: 'คุณได้รับใบเสนอราคายืนยันการสั่งซื้อสำเร็จ',
        message: `ใบสั่งซื้อของ คุณ ${orderDetails.fullName} ยอดรวม ฿${totalSum.toLocaleString()} ได้รับการบันทึกเข้าระบบเรือจริงเรียบร้อยเรียบร้อยแล้ว`,
        type: 'order',
        date: 'เมื่อครู่',
        isRead: false
      };
      setNotifications(prev => [newNoti, ...prev]);

      // Clear the cart on successful checkout
      setCart([]);
      localStorage.removeItem('pornpong_cart');

      triggerToast('บันทึกคำสั่งซื้อลงในระบบฐานข้อมูล Supabase สำเร็จ!');
      
      // Close the cart drawer immediately
      setIsCartOpen(false);

      // Redirect to Payment Page with orderId
      navigateTo(`/payment?orderId=${finalOrder.id}`);
    } catch (e: any) {
      console.error(e);
      triggerToast('ข้อผิดพลาดเชื่อมข้อมูลระบบ Supabase: ' + (e.message || 'โปรดตรวจสอบสิทธิ์เชื่อมต่อ'));
    }
  };

  const categories = [
    { value: 'all', label: 'สินค้าทั้งหมด' },
    { value: 'rowboat', label: 'เรือพายอเนกประสงค์' },
    { value: 'fishing', label: 'เรือตกปลา / พ่วงเครื่องยนต์' },
    { value: 'kayak', label: 'เรือคายัคสุดแรง' },
    { value: 'accessory', label: 'อุปกรณ์พรมัดระนาบ' }
  ];

  // Filtering + Sorting Products data logic
  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.categoryThai.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // default order index
  });

  if (currentPath === '/admin-login') {
    return (
      <AdminLoginPage
        onLoginSuccess={(adminUser) => {
          setIsAdminMode(true);
          navigateTo('/admin-dashboard');
        }}
        onBackToHome={() => {
          navigateTo('/');
        }}
        triggerToast={triggerToast}
      />
    );
  }

  if (currentPath === '/admin-dashboard' || isAdminMode) {
    return (
      <AdminDashboard
        onClose={() => {
          setIsAdminMode(false);
          navigateTo('/');
        }}
        triggerToast={triggerToast}
        notifications={notifications}
        setNotifications={setNotifications}
      />
    );
  }

  if (currentPath === '/payment') {
    return (
      <PaymentPage
        order={currentOrder}
        onBackToHome={() => {
          setCurrentOrder(null);
          navigateTo('/');
        }}
        triggerToast={triggerToast}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      
      {/* 1. STICKY BRAND HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Auto-scroll screen back to top upon switching tabs
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        searchTerm={searchTerm}
        onSearch={(term) => {
          setSearchTerm(term);
          // If searching, redirect user immediately to Products Catalog Tab
          if (activeTab !== 'products') {
            setActiveTab('products');
          }
        }}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('pornpong_current_user');
          triggerToast('ออกจากระบบเสร็จสมบูรณ์แล้ว!');
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAllNotifications}
        onDeleteNotification={handleDeleteNotification}
      />

      {/* 2. TOP FLOATING NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-xl bg-slate-900/95 backdrop-blur-xs text-white text-xs font-sans py-3.5 px-5 shadow-2xl flex items-center gap-3 border border-slate-800 animate-slideLeft">
          <CheckCircle2 size={16} className="text-sky-400" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 3. CORE DISPLAY WINDOW ROUTER */}
      <main className="flex-1">

        {/* Home Window */}
        {activeTab === 'home' && (
          <HomeSection 
            products={products}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
            }}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onQuickSearch={(term) => {
              setSearchTerm(term);
              setActiveTab('products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddToCart={(prod, col) => handleAddToCart(prod, col, 1)}
          />
        )}

        {/* Products Catalog Window */}
        {activeTab === 'products' && (
          <section className="py-[72px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
            
            {/* Page Header text */}
            <div className="mb-10 text-center sm:text-left">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-850 mb-3.5">
                แคตตาล็อกสินค้าเรือพลาสติก ตราพรพงศ์
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                เปรียบเทียบขนาด คุณสมบัติ ทนแดด UV และจองเพื่อจัดขนส่งตรงถึงพื้นที่ของท่าน
              </p>
            </div>

            {/* Filter and sorting control grid */}
            <div className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs">
              
              {/* Category selector row */}
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full duration-250 cursor-pointer ${
                      categoryFilter === cat.value
                        ? 'bg-brand-blue text-white shadow-xs'
                        : 'bg-slate-55 border border-slate-100 text-slate-600 hover:bg-slate-100/50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Filter by Status & Sort selector dropdowns */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
                {/* Status Dropdown */}
                <div className="relative flex items-center bg-slate-55 border border-slate-150 rounded-lg px-3 py-1.5 text-xs text-slate-600 gap-1.5 focus-within:border-brand-blue">
                  <span className="text-slate-400 font-bold shrink-0 text-[11px]">สถานะ:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent outline-none pr-3 font-semibold text-slate-700 cursor-pointer appearance-none text-[11px]"
                    id="status-filter-dropdown"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="instock">มีสินค้า</option>
                    <option value="preorder">พรีออเดอร์</option>
                    <option value="outofstock">หมด</option>
                  </select>
                </div>

                {/* Sort selector dropdown */}
                <div className="relative flex items-center bg-slate-55 border border-slate-150 rounded-lg px-3 py-1.5 text-xs text-slate-600 gap-1.5 focus-within:border-brand-blue">
                  <ArrowUpDown size={13} className="text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent outline-none pr-4 font-semibold text-slate-705 text-slate-700 cursor-pointer appearance-none text-[11px]"
                    id="sort-select-dropdown"
                  >
                    <option value="default">เรียงตามยอดนิยม</option>
                    <option value="price-low">ราคา: น้อยไปมาก</option>
                    <option value="price-high">ราคา: มากไปน้อย</option>
                    <option value="rating">จัดอันดับตามคะแนนรีวิว</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Catalog Grid Renderer */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl">
                <AlertCircle size={36} className="text-slate-400 mx-auto mb-3" />
                <h3 className="font-display font-bold text-slate-700">ไม่พบผลิตภัณฑ์ตามที่ระบุ</h3>
                <p className="text-xs text-slate-400 mt-1">ลองลบข้อความค้นหา หรือสลับหมวดหมู่สินค้าชนิดอื่น</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                  className="mt-6 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs px-5 py-2.5 cursor-pointer"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(prod) => setSelectedProduct(prod)}
                    onAddToCart={(prod, col) => handleAddToCart(prod, col, 1)}
                  />
                ))}
              </div>
            )}
            
          </section>
        )}

        {/* About Section Window */}
        {activeTab === 'about' && (
          <AboutSection />
        )}

        {/* FAQ Section Window */}
        {activeTab === 'faq' && (
          <FAQSection />
        )}

        {/* Contact Section Window */}
        {activeTab === 'contact' && (
          <ContactSection />
        )}

      </main>

      {/* 4. SEAMLESS DETAILED POPUP MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod, col, qty) => {
          handleAddToCart(prod, col, qty);
          setSelectedProduct(null); // Close modal on adding to cart
        }}
      />

      {/* 5. SEAMLESS SLIDING CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* 6. STATIC TRUSTFOOTER */}
      <Footer 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        onOpenAdmin={() => {
          const authenticated = localStorage.getItem('pornpong_admin_authenticated') === 'true';
          if (authenticated) {
            setIsAdminMode(true);
            navigateTo('/admin-dashboard');
          } else {
            navigateTo('/admin-login');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 7. SECURE MOCK AUTHENTICATION MODALS */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('pornpong_current_user', JSON.stringify(user));
        }}
        triggerToast={triggerToast}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        onRegisterSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('pornpong_current_user', JSON.stringify(user));
        }}
        triggerToast={triggerToast}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={async (updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem('pornpong_current_user', JSON.stringify(updatedUser));
          
          try {
            await supabaseCustomers.updateProfile(updatedUser.email, updatedUser.name, updatedUser.phone);
            window.dispatchEvent(new Event('customer-registered'));
          } catch (err) {
            console.error("Error keeping Supabase customers in sync", err);
          }
        }}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('pornpong_current_user');
          setIsProfileOpen(false);
          triggerToast('ออกจากระบบเสร็จสมบูรณ์แล้ว!');
        }}
        triggerToast={triggerToast}
      />

    </div>
  );
}
