import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Calendar, 
  Users, 
  Star, 
  Bell, 
  Tag, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  ArrowLeft, 
  Search, 
  Plus, 
  Edit, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Truck, 
  UserCheck, 
  Trash2, 
  RefreshCw, 
  PlusCircle, 
  Lock, 
  Store,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  SearchIcon,
  X
} from 'lucide-react';
import { Product } from '../types';
import { 
  supabaseProducts, 
  supabase, 
  supabaseCustomers,
  supabaseOrders,
  supabasePreOrders,
  supabaseCoupons,
  supabaseReviews,
  supabasePromotions
} from '../lib/supabase';
import { AppNotification } from './NotificationDropdown';

interface AdminDashboardProps {
  onClose: () => void; // Exit admin mode and return to shofront
  triggerToast: (msg: string) => void;
  // Let us consume notifications from App.tsx so notifications pushed by admin immediately trigger in storefront!
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

// Initial default administrative credentials
const ADMIN_EMAIL = 'admin@pornpongplastic.com';
const ADMIN_PASS = 'Admin@2026';

export function AdminDashboard({ onClose, triggerToast, notifications, setNotifications }: AdminDashboardProps) {
  // Login auth state
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(() => {
    return localStorage.getItem('pornpong_admin_authenticated') === 'true';
  });
  const [loginEmail, setLoginEmail] = React.useState(ADMIN_EMAIL);
  const [loginPass, setLoginPass] = React.useState('');
  const [loginError, setLoginError] = React.useState('');

  const [adminUser, setAdminUser] = React.useState<{ username: string; email: string } | null>(() => {
    const saved = localStorage.getItem('pornpong_admin_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const authenticated = localStorage.getItem('pornpong_admin_authenticated') === 'true';
    if (authenticated) {
      const defaultAdmin = { username: 'admin', email: 'admin@pornpongplastic.com' };
      localStorage.setItem('pornpong_admin_user', JSON.stringify(defaultAdmin));
      return defaultAdmin;
    }
    return null;
  });

  // Active Menu Tab state
  const [activeMenu, setActiveMenu] = React.useState<string>('dashboard');

  // Interactive Administration Datasets backed by Supabase
  const [adminProducts, setAdminProducts] = React.useState<Product[]>([]);

  const reloadProducts = React.useCallback(async () => {
    try {
      const data = await supabaseProducts.list();
      setAdminProducts(data);
    } catch (err) {
      console.error('Failed to sync admin products with Supabase:', err);
    }
  }, []);

  React.useEffect(() => {
    reloadProducts();

    const handleProductsUpdated = () => {
      reloadProducts();
    };
    window.addEventListener('products-updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('products-updated', handleProductsUpdated);
    };
  }, [reloadProducts]);

  const [adminOrders, setAdminOrders] = React.useState<any[]>([]);
  const [adminPreOrders, setAdminPreOrders] = React.useState<any[]>([]);
  const [adminCoupons, setAdminCoupons] = React.useState<any[]>([]);
  const [adminReviews, setAdminReviews] = React.useState<any[]>([]);

  const [adminMembers, setAdminMembers] = React.useState<any[]>([]);

  // Settings State parameters (expanded)
  const [shopName, setShopName] = React.useState(() => localStorage.getItem('pornpong_cfg_shopName') || "โรงงานพรพงศ์พลาสติก (Pornpong Plastic Co.)");
  const [shopLogo, setShopLogo] = React.useState(() => localStorage.getItem('pornpong_cfg_shopLogo') || "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=400&auto=format&fit=crop");
  const [shopPhone, setShopPhone] = React.useState(() => localStorage.getItem('pornpong_cfg_shopPhone') || "081-234-5678, 034-987654");
  const [shopLineId, setShopLineId] = React.useState(() => localStorage.getItem('pornpong_cfg_shopLineId') || "@pornpongplastic");
  const [shopFacebook, setShopFacebook] = React.useState(() => localStorage.getItem('pornpong_cfg_shopFacebook') || "https://facebook.com/pornpongplastic");
  const [shopEmail, setShopEmail] = React.useState(() => localStorage.getItem('pornpong_cfg_shopEmail') || "info@pornpongplastic.com");
  const [shopAddress, setShopAddress] = React.useState(() => localStorage.getItem('pornpong_cfg_shopAddress') || "123/45 หมู่ 2 ถ.เจษฎาวิถี ต.โคกขาม อ.เมืองสมุทรสาคร จ.สมุทรสาคร 74000");
  const [googleMapPlaceholder, setGoogleMapPlaceholder] = React.useState(() => localStorage.getItem('pornpong_cfg_googleMap') || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15509.303975545564!2d100.2741517757969!3d13.541249887739502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e2b9c7cfabcdef%3A0x1234567890abcdef!2z4LmC4Lij4LiH4LiH4Lia4Liy4LiZ4Lie4Lij4Lie4LiH4Liq4Liy4LiZ4LiE4Liy4LiZ4Lij4Li1!5e0!3m2!1sth!2sth!4v1700000000000!5m2!1sth!2sth");
  const [isPreOrderActive, setIsPreOrderActive] = React.useState(() => {
    const saved = localStorage.getItem('pornpong_cfg_isPreOrderActive');
    return saved === null ? true : saved === 'true';
  });

  // Search filter states across several tabs
  const [productsSearch, setProductsSearch] = React.useState('');
  const [productsCategoryFilter, setProductsCategoryFilter] = React.useState<string>('all');
  const [productsStatusFilter, setProductsStatusFilter] = React.useState<string>('all');
  const [ordersSearch, setOrdersSearch] = React.useState('');
  const [preordersSearch, setPreordersSearch] = React.useState('');
  const [supabaseOrdersSearch, setSupabaseOrdersSearch] = React.useState('');

  // Editing modal / drawer states
  const [isProductAddOpen, setIsProductAddOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Member & Preorder detail states
  const [selectedMember, setSelectedMember] = React.useState<any | null>(null);
  const [isMemberDetailOpen, setIsMemberDetailOpen] = React.useState<boolean>(false);
  
  const [selectedPreorder, setSelectedPreorder] = React.useState<any | null>(null);
  const [isPreorderDetailOpen, setIsPreorderDetailOpen] = React.useState<boolean>(false);

  // Handle Logins
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim() === ADMIN_EMAIL && loginPass === ADMIN_PASS) {
      const mockAdminUser = { username: 'admin', email: ADMIN_EMAIL };
      setIsAuthenticated(true);
      setAdminUser(mockAdminUser);
      localStorage.setItem('pornpong_admin_authenticated', 'true');
      localStorage.setItem('pornpong_admin_user', JSON.stringify(mockAdminUser));
      setLoginError('');
      triggerToast('ยินดีต้อนรับท่านผู้ดูแลระบบ พรพงศ์พลาสติก คอนโซลสด!');
    } else {
      setLoginError('อีเมลหรือรหัสผ่านแอดมินไม่ถูกต้อง (อีเมล: admin@pornpongplastic.com / รหัสผ่าน: Admin@2026)');
    }
  };

  // Handle Logout
  const handleLogoutAdmin = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('pornpong_admin_authenticated');
    localStorage.removeItem('pornpong_admin_user');
    triggerToast('ออกจากระบบผู้ดูแลระบบเรียบร้อยแล้ว');
    onClose();
  };

  // Load dynamic lists directly from Supabase
  const reloadOrders = React.useCallback(async () => {
    try {
      const data = await supabaseOrders.list();
      setAdminOrders(data);
    } catch (err) {
      console.error('Failed to reload orders from Supabase:', err);
    }
  }, []);

  const reloadPreOrders = React.useCallback(async () => {
    try {
      const data = await supabasePreOrders.list();
      setAdminPreOrders(data);
    } catch (err) {
      console.error('Failed to reload pre-orders from Supabase:', err);
    }
  }, []);

  const reloadCoupons = React.useCallback(async () => {
    try {
      const data = await supabaseCoupons.list();
      setAdminCoupons(data);
    } catch (err) {
      console.error('Failed to reload coupons from Supabase:', err);
    }
  }, []);

  const reloadReviews = React.useCallback(async () => {
    try {
      const data = await supabaseReviews.list();
      setAdminReviews(data);
    } catch (err) {
      console.error('Failed to reload reviews from Supabase:', err);
    }
  }, []);

  const reloadPromotions = React.useCallback(async () => {
    try {
      const data = await supabasePromotions.list();
      setAdminPromotionsList(data);
    } catch (err) {
      console.error('Failed to reload promotions from Supabase:', err);
    }
  }, []);

  React.useEffect(() => {
    reloadOrders();
    reloadPreOrders();
    reloadCoupons();
    reloadReviews();
    reloadPromotions();
  }, [reloadOrders, reloadPreOrders, reloadCoupons, reloadReviews, reloadPromotions]);

  // Website settings persistence auto-saver helper
  React.useEffect(() => {
    localStorage.setItem('pornpong_cfg_shopName', shopName);
    localStorage.setItem('pornpong_cfg_shopLogo', shopLogo);
    localStorage.setItem('pornpong_cfg_shopPhone', shopPhone);
    localStorage.setItem('pornpong_cfg_shopLineId', shopLineId);
    localStorage.setItem('pornpong_cfg_shopFacebook', shopFacebook);
    localStorage.setItem('pornpong_cfg_shopEmail', shopEmail);
    localStorage.setItem('pornpong_cfg_shopAddress', shopAddress);
    localStorage.setItem('pornpong_cfg_googleMap', googleMapPlaceholder);
    localStorage.setItem('pornpong_cfg_isPreOrderActive', String(isPreOrderActive));
  }, [shopName, shopLogo, shopPhone, shopLineId, shopFacebook, shopEmail, shopAddress, googleMapPlaceholder, isPreOrderActive]);

  // Storefront Promotion Management States
  const [adminPromotionsList, setAdminPromotionsList] = React.useState<any[]>([]);

  const fetchCustomers = React.useCallback(async () => {
    try {
      const data = await supabaseCustomers.list();
      const mapped = data.map(db => ({
        id: db.id,
        name: db.name,
        email: db.email,
        phone: db.phone || 'ไม่ระบุ',
        rewardPoints: db.points || 0,
        rank: db.membership_level || 'Standard',
        registerDate: db.created_at ? new Date(db.created_at).toISOString().split('T')[0] : '2026-05-01',
        orderHistory: [],
        preorderHistory: [],
        status: "Active"
      }));
      setAdminMembers(mapped);
    } catch (err) {
      console.error('Failed to load customers from Supabase:', err);
    }
  }, []);

  React.useEffect(() => {
    fetchCustomers();

    const handleRegistered = () => {
      fetchCustomers();
    };

    window.addEventListener('customer-registered', handleRegistered);
    window.addEventListener('customers-updated', handleRegistered);
    return () => {
      window.removeEventListener('customer-registered', handleRegistered);
      window.removeEventListener('customers-updated', handleRegistered);
    };
  }, [fetchCustomers]);

  // Promotions Form Modal variables
  const [isPromoFormOpen, setIsPromoFormOpen] = React.useState(false);
  const [promoName, setPromoName] = React.useState('');
  const [promoDiscount, setPromoDiscount] = React.useState('');
  const [promoStartDate, setPromoStartDate] = React.useState('');
  const [promoEndDate, setPromoEndDate] = React.useState('');
  const [promoStatus, setPromoStatus] = React.useState('Active');
  const [editingPromo, setEditingPromo] = React.useState<any | null>(null);

  const handleOpenAddPromo = () => {
    setEditingPromo(null);
    setPromoName('');
    setPromoDiscount('');
    setPromoStartDate('');
    setPromoEndDate('');
    setPromoStatus('Active');
    setIsPromoFormOpen(true);
  };

  const handleOpenEditPromo = (promo: any) => {
    setEditingPromo(promo);
    setPromoName(promo.name);
    setPromoDiscount(promo.discount);
    setPromoStartDate(promo.startDate);
    setPromoEndDate(promo.endDate);
    setPromoStatus(promo.status);
    setIsPromoFormOpen(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoName.trim() || !promoDiscount.trim()) return;

    const promoPayload = {
      name: promoName.trim(),
      discount: promoDiscount.trim(),
      startDate: promoStartDate,
      endDate: promoEndDate,
      status: promoStatus
    };

    if (editingPromo) {
      supabasePromotions.update(editingPromo.id, promoPayload).then(() => {
        reloadPromotions();
      });
      triggerToast('ปรับปรุงรายละเอียดแคมเปญโปรโมชั่นเรียบร้อยแล้ว');
    } else {
      supabasePromotions.insert(promoPayload).then(() => {
        reloadPromotions();
      });
      triggerToast('เพิ่มแคมเปญโปรโมชั่นหน้าร้านสำเร็จแล้ว');
    }
    setIsPromoFormOpen(false);
  };

  const handleDeletePromo = (id: string) => {
    if (confirm('คุณต้องการรื้อถอนแคมเปญโปรโมชั่นนี้ใช่หรือไม่?')) {
      supabasePromotions.delete(id).then(() => {
        reloadPromotions();
      });
      triggerToast('ลบรายการแคมเปญเรียบร้อยแล้ว');
    }
  };

  // Notification History Management
  const [notiHistory, setNotiHistory] = React.useState<any[]>([]);

  // Preorder actions
  const changePreOrderStatus = (preId: string, nextStatus: 'Waiting confirmation' | 'Confirmed' | 'In production' | 'Ready to deliver' | 'Completed' | 'Cancelled' | string) => {
    supabasePreOrders.updateStatus(preId, nextStatus).then(() => {
      reloadPreOrders();
    });
    triggerToast('อัปเดตสถานะพรีออเดอร์ ' + preId + ' เป็น [' + nextStatus + '] สำเร็จ');
  };

    // Navigation Sidebar Lists
  const MENUS = [
    { id: 'dashboard', label: 'หน้าแดชบอร์ด', icon: LayoutDashboard },
    { id: 'products', label: 'จัดการรหัสสินค้า', icon: Package },
    { id: 'orders', label: 'คำสั่งซื้อสำเร็จ', icon: FileText },
    { id: 'preorders', label: 'ประวัติพรีออเดอร์', icon: Calendar },
    { id: 'members', label: 'ระบบฐานลูกค้า', icon: Users },
    { id: 'reviews', label: 'อนุมัติรีวิวสินค้า', icon: Star },
    { id: 'notifications', label: 'ส่งข่าวประกาศดันเข้า', icon: Bell },
    { id: 'promotions', label: 'คูปองและโปรโมชั่น', icon: Tag },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings }
  ];

  // Calculations for stats summary cards
  const totalProductsCount = adminProducts.length;
  const totalOrdersCount = adminOrders.length;
  const totalPreOrdersCount = adminPreOrders.length;
  const totalMembersCount = adminMembers.length;
  const grossSalesVolume = adminOrders.reduce((sum, ord) => sum + Number(ord.amount || 0), 0) + adminPreOrders.reduce((sum, pre) => sum + Number(pre.deposit || 0), 0);

  // Order actions
  const changeOrderStatus = (orderId: string, nextStatus: 'Pending' | 'Shipping' | 'Delivered') => {
    supabaseOrders.updateStatus(orderId, nextStatus).then(() => {
      reloadOrders();
    });
    triggerToast(`อัปเดตสถานะออเดอร์ ${orderId} เป็น [${nextStatus === 'Shipping' ? 'จัดส่งแล้ว' : nextStatus === 'Delivered' ? 'สำเร็จเรียบร้อย' : 'รอดำเนินการ'}]`);
  };



  // Coupon actions
  const [newCouponCode, setNewCouponCode] = React.useState('');
  const [newCouponDiscount, setNewCouponDiscount] = React.useState(100);
  const [newCouponType, setNewCouponType] = React.useState<'flat' | 'percent'>('flat');
  const [newCouponDesc, setNewCouponDesc] = React.useState('');

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const newCoupon = {
      code: newCouponCode.trim().toUpperCase(),
      discount: Number(newCouponDiscount),
      type: newCouponType,
      description: newCouponDesc || `ส่วนลดแบบ ${newCouponType === 'flat' ? 'ส่วนลดเงินสด' : 'เปอร์เซ็นต์'} ${newCouponDiscount}`,
      active: true
    };

    supabaseCoupons.insert(newCoupon).then(() => {
      reloadCoupons();
    });
    setNewCouponCode('');
    setNewCouponDesc('');
    triggerToast(`คูปองโค้ด "${newCoupon.code}" บันทึกเปิดใช้งานแล้ว!`);
  };

  const toggleCoupon = (code: string) => {
    const couponObj = adminCoupons.find(c => c.code === code);
    if (!couponObj) return;
    supabaseCoupons.updateActive(code, !couponObj.active).then(() => {
      reloadCoupons();
    });
    triggerToast('สลับสถานะคูปองจัดส่งพรีเซ้นต์');
  };

  const deleteCoupon = (code: string) => {
    supabaseCoupons.delete(code).then(() => {
      reloadCoupons();
    });
    triggerToast('ลบส่วนลดเรียบร้อย');
  };

  // Product CRUD states & actions
  const [pId, setPId] = React.useState('');
  const [pName, setPName] = React.useState('');
  const [pPrice, setPPrice] = React.useState(4900);
  const [pCategory, setPCategory] = React.useState('rowboat');
  const [pInStock, setPInStock] = React.useState(true);
  const [pLength, setPLength] = React.useState('2.50 เมตร');
  const [pCapacity, setPCapacity] = React.useState('180 กก.');
  const [pStockQty, setPStockQty] = React.useState<number>(10);
  const [pStatus, setPStatus] = React.useState<'instock' | 'outofstock' | 'preorder'>('instock');
  const [pDescription, setPDescription] = React.useState<string>('');
  const [pSpecs, setPSpecs] = React.useState<string>('');
  const [pImage, setPImage] = React.useState<string>('');
  const [pFormError, setPFormError] = React.useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setPFormError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.');
      }

      const path = `products/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);

      if (!data?.publicUrl) {
        throw new Error('Failed to retrieve the uploaded public URL.');
      }

      setPImage(data.publicUrl);
      triggerToast('อัปโหลดไฟล์ภาพสินค้าไปยัง Supabase Storage สำเร็จแล้ว!');
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      const errMsg = err?.message || String(err);
      setPFormError(`ล้มเหลวในการอัปโหลดรูปภาพ: ${errMsg}`);
      triggerToast(`อัปโหลดล้มเหลว: ${errMsg}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName) return;

    setPFormError(null);

    let finalModelId = pId ? pId.trim() : '';
    if (!finalModelId) {
      const catPrefix = pCategory ? pCategory.toLowerCase().replace(/[^a-z0-9]/g, '') : 'boat';
      const randSuffix = Math.floor(1000 + Math.random() * 9000);
      finalModelId = `boat-${catPrefix}-${Date.now().toString().slice(-6)}-${randSuffix}`;
    }

    const itemPayload = {
      sku: finalModelId,
      model_id: finalModelId,
      name: pName,
      price: Number(pPrice),
      category: pCategory,
      status: pStatus,
      description: pDescription || 'เรือพกพา คุณภาพเกรดบอดี้หลอมหนาพิเศษ ตราพรพงศ์',
      images: pImage ? [pImage] : ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800'],
      stockQuantity: Number(pStockQty)
    };

    try {
      if (editingProduct) {
        // Edit mode (UPDATE statement in Supabase)
        await supabaseProducts.update(editingProduct.id, itemPayload);
        triggerToast('แก้ไขข้อมูลสินค้าในระบบระบบ Supabase เรียบร้อยแล้ว');
      } else {
        // Add mode (INSERT statement in Supabase without sending id property)
        await supabaseProducts.insert(itemPayload);
        triggerToast('เพิ่มผลิตภัณฑ์ใหม่เข้าระบบ Supabase สำเร็จ');
      }

      // Reload products list directly from database (ensuring the new UUID product is matched)
      await reloadProducts();

      // Notify App.tsx immediately of database updates
      window.dispatchEvent(new Event('products-updated'));

      setIsProductAddOpen(false);
      setEditingProduct(null);
      clearProductForm();
    } catch (err: any) {
      console.error('Failed to submit product through Supabase:', err);
      setPFormError(err?.message || String(err));
      triggerToast('เกิดข้อผิดพลาดในการเขียนข้อมูลไปยัง database');
    }
  };

  const clearProductForm = () => {
    setPId('');
    setPName('');
    setPPrice(5000);
    setPCategory('rowboat');
    setPInStock(true);
    setPLength('2.5 เมตร');
    setPCapacity('200 กก.');
    setPStockQty(10);
    setPStatus('instock');
    setPDescription('');
    setPSpecs('');
    setPImage('');
    setPFormError(null);
  };

  const openEditProduct = (prod: Product) => {
    setPFormError(null);
    setEditingProduct(prod);
    setPId(prod.sku || prod.model_id || prod.id);
    setPName(prod.name);
    setPPrice(prod.price);
    setPCategory(prod.category);
    setPInStock(prod.inStock);
    setPLength(prod.length || '');
    setPCapacity(prod.capacity || '');
    setPStockQty(prod.stockQuantity !== undefined ? prod.stockQuantity : (prod.inStock ? 12 : 0));
    setPStatus(prod.status || (prod.inStock ? 'instock' : 'outofstock'));
    setPDescription(prod.description || '');
    setPSpecs(prod.specs || `กว้าง: ${prod.width || '1.0 ม.'}, น้ำหนัก: ${prod.weight || '25 กก.'}`);
    setPImage(prod.images?.[0] || '');
    setIsProductAddOpen(true);
  };

  const deleteProduct = async (id: string) => {
    if (confirm('คุณต้องการลบรื้อถอนสินค้า ID: ' + id + ' หรือไม่? ข้อมูลรูปภาพและสถิติจะถูกล้าง')) {
      try {
        await supabaseProducts.delete(id);
        await reloadProducts();
        window.dispatchEvent(new Event('products-updated'));
        triggerToast('ถอนรหัสถอนลายพลาสติกเรือออกจาก Supabase แล้ว');
      } catch (err) {
        console.error('Failed to delete product:', err);
        triggerToast('ไม่สามารถลบสินค้าได้');
      }
    }
  };

  // Review status
  const toggleReviewApprove = (id: string) => {
    const revObj = adminReviews.find(r => r.id === id);
    if (!revObj) return;
    supabaseReviews.updateApproval(id, !revObj.approved).then(() => {
      reloadReviews();
    });
    triggerToast('ปรับปรุงสถานะอนุมัติรีวิวสำหรับหน้าเว็บบอร์ด');
  };

  const deleteReview = (id: string) => {
    supabaseReviews.delete(id).then(() => {
      reloadReviews();
    });
    triggerToast('ลบข้อความรีวิวนั้นแล้ว');
  };

  // Notification announcement creation form
  const [notiTitle, setNotiTitle] = React.useState('');
  const [notiMsg, setNotiMsg] = React.useState('');
  const [notiType, setNotiType] = React.useState<'order' | 'preorder' | 'promotion' | 'new_product'>('promotion');

  const handlePostNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notiTitle.trim() || !notiMsg.trim()) return;

    const newNoti: AppNotification = {
      id: 'noti-' + Date.now(),
      title: notiTitle.trim(),
      message: notiMsg.trim(),
      type: notiType,
      date: 'ด่วนนี้',
      isRead: false
    };

    // Push directly to the state received from parent applet
    setNotifications(prev => [newNoti, ...prev]);
    setNotiTitle('');
    setNotiMsg('');
    triggerToast('ดันข่าวสารและไอคอนแจ้งเตือนเข้าช่องระเบียงฝั่งลูกค้าสำเร็จแล้ว!');
  };

  if (!isAuthenticated) {
    // -----------------------------------------------------------------
    // ADMIN LOGIN FORM INTERFACE
    // -----------------------------------------------------------------
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
        
        {/* Abstract background graphics */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-slate-805 bg-slate-950/70 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-md">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-blue to-cyan-500 text-white shadow-xl mb-3.5 rotate-6">
              <Lock size={22} className="text-white" />
            </div>
            <h1 className="font-display text-xl font-extrabold text-white">คอนโซลผู้ดูแลระบบ</h1>
            <p className="text-slate-400 text-xs mt-1">
              โรงงานหลอมขึ้นรูปเรือพลาสติกและคลังพรีออเดอร์ ตราพรพงศ์ 
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-[11px] font-semibold flex items-start gap-2 animate-fadeIn">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">อีเมลแอดมินสแกนเนอร์</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl px-4 py-2.8 text-xs text-white outline-hidden focus:border-brand-blue focus:ring-1 focus:ring-sky-100/20"
                placeholder="admin@pornpongplastic.com"
                id="admin-login-email-input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">รหัสผ่านลับกองกลาง</label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl px-4 py-2.8 text-xs text-white outline-hidden focus:border-brand-blue focus:ring-1 focus:ring-sky-100/20"
                placeholder="กรอกรหัสผ่าน..."
                id="admin-login-password-input"
              />
            </div>

            {/* Quick Helper Auto-fill */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">เดโมล็อกอินแบบด่วน:</span>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@pornpongplastic.com');
                  setLoginPass('Admin@2026');
                }}
                className="text-brand-blue font-bold px-2 py-1 bg-cyan-950/60 rounded-md border border-cyan-800/80 hover:bg-cyan-900 transition-all cursor-pointer hover:text-cyan-400 active:scale-95"
                id="admin-autofill-btn"
              >
                กรอกอัตโนมัติ (Auto-fill)
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-brand-blue to-sky-500 hover:from-brand-blue-light hover:to-sky-400 text-white font-bold text-xs transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-950/20"
              id="admin-submit-login-btn"
            >
              <ShieldCheck size={15} />
              <span>เข้าสู่โหมดผู้ดูแลระบบ</span>
            </button>
          </form>

          {/* Return button */}
          <div className="mt-8 border-t border-slate-800/85 pt-4 text-center">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-all text-xs font-bold cursor-pointer"
              id="exit-to-storefront-login-btn"
            >
              <ArrowLeft size={13} />
              <span>กลับสู่หน้าแคตตาล็อกร้านหลัก</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Define filtered databases based on sidebar searches
  const filteredAdminProducts = adminProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productsSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productsSearch.toLowerCase()) ||
      (p.categoryThai && p.categoryThai.toLowerCase().includes(productsSearch.toLowerCase()));

    const matchesCategory = productsCategoryFilter === 'all' || p.category === productsCategoryFilter;

    const computedStatus = p.status || (p.inStock ? 'instock' : 'outofstock');
    const matchesStatus = productsStatusFilter === 'all' || computedStatus === productsStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredAdminOrders = adminOrders.filter(o => 
    o.customerName.toLowerCase().includes(ordersSearch.toLowerCase()) ||
    o.id.toLowerCase().includes(ordersSearch.toLowerCase()) ||
    o.productName.toLowerCase().includes(ordersSearch.toLowerCase())
  );

  const filteredAdminPreorders = adminPreOrders.filter(p => 
    p.customerName.toLowerCase().includes(preordersSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(preordersSearch.toLowerCase()) ||
    p.productName.toLowerCase().includes(preordersSearch.toLowerCase())
  );

  const filteredSupabaseOrders = adminOrders.filter(o => {
    const term = supabaseOrdersSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      (o.id && String(o.id).toLowerCase().includes(term)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(term)) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(term)) ||
      (o.customerName && o.customerName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row text-slate-100 font-sans">
      
      {/* ---------------------------------------------------------------
          SIDEBAR NAVIGATION AREA
          --------------------------------------------------------------- */}
      <aside className="w-full md:w-[260px] bg-slate-950 shrink-0 border-b md:border-b-0 md:border-r border-slate-850 flex flex-col justify-between">
        <div className="p-5">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-850">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-550 bg-gradient-to-br from-brand-blue to-purple-650 text-white shadow-md">
              <Lock size={16} />
            </div>
            <div>
              <h2 className="font-display font-black text-xs text-white leading-tight">PORNPONG PANEL</h2>
              <span className="text-[9px] text-brand-blue-light font-extrabold uppercase tracking-widest block">ADMIN SANDBOX v5.0</span>
            </div>
          </div>

          {/* Active Admin Profile Tag */}
          <div className="flex items-center gap-2.5 p-2 bg-slate-900/50 rounded-xl border border-slate-850/70 mb-5">
            <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-xs uppercase shadow-inner">
              {adminUser?.username ? adminUser.username.slice(0, 1) : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.2">
                <span className="text-[10px] font-bold text-white block truncate">{adminUser?.username || 'admin'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
              </div>
              <span className="text-[9px] text-slate-400 block truncate">{adminUser?.email || 'admin@pornpongplastic.com'}</span>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav className="space-y-1">
            {MENUS.map((menu) => {
              const IconComp = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveMenu(menu.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold cursor-pointer transition-all ${
                    activeMenu === menu.id
                      ? 'bg-brand-blue text-white shadow-xs font-bold scale-[1.01]'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-100'
                  }`}
                  id={`admin-menu-link-${menu.id}`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp size={15} className={activeMenu === menu.id ? 'text-white' : 'text-slate-400'} />
                    <span>{menu.label}</span>
                  </div>
                  <ChevronRight size={10} className="text-slate-500" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Exit Dashboard and logouts buttons */}
        <div className="p-4 border-t border-slate-850 space-y-2 bg-slate-950/40">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-800 rounded-xl bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 font-bold text-[11px] cursor-pointer transition-colors"
            id="admin-exit-mode"
          >
            <Store size={12} className="text-slate-400" />
            <span>กลับหน้าบ้านแคตตาล็อก</span>
          </button>

          <button
            onClick={handleLogoutAdmin}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/30 hover:bg-red-950/50 text-red-400 rounded-xl font-bold text-[11px] cursor-pointer border border-red-950/60 transition-colors"
            id="admin-logout-sidebar"
          >
            <Lock size={12} />
            <span>ออกจากระบบแอดมิน</span>
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------------------
          MAIN ADMIN CONSOLE PORT VIEW
          --------------------------------------------------------------- */}
      <main className="flex-1 bg-slate-900 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="bg-slate-950 border-b border-slate-850 px-6 py-4.5 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-sm font-black text-white uppercase tracking-wide">
              {MENUS.find(m => m.id === activeMenu)?.label}
            </h1>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-brand-blue font-semibold bg-sky-950/60 border border-sky-900 px-2.5 py-0.5 rounded-full">
              ระบบแบบจำลองเครื่องมือ
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Direct Shop Stats Indicator */}
            <div className="hidden sm:flex items-center gap-1.8 text-slate-400 border-r border-slate-850 pr-4">
              <span>สถานะจองคิวเรือ:</span>
              <span className={`inline-flex items-center gap-1 text-[11px] py-0.5 px-2 rounded-full font-bold ${
                isPreOrderActive ? 'bg-emerald-950/40 border border-emerald-900 text-emerald-400' : 'bg-red-955/40 text-red-400'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                เปิดตามปกติ
              </span>
            </div>

            <div className="text-slate-400">
              ชื่อผู้ดูแลระบบ: <strong className="text-white">{adminUser?.username || 'admin'}</strong> (<span className="text-slate-300 font-mono text-[11px]">{adminUser?.email || 'admin@pornpongplastic.com'}</span>)
            </div>
          </div>
        </header>

        {/* CONTENT ENVELOPE SCROLLER */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-62px)]">

          {/* -----------------------------------------------------------
              1. DASHBOARD WINDOW TAB
              ----------------------------------------------------------- */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SUMMARY STATS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-summary-cards-grid">
                {/* 1. TOTAL PRODUCTS */}
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">สินค้าในสารบบ</span>
                    <strong className="text-xl font-display font-black text-white block mt-1">{totalProductsCount} ชนิด</strong>
                  </div>
                  <div className="p-3 bg-brand-blue/15 text-brand-blue rounded-xl border border-brand-blue/10">
                    <Package size={20} />
                  </div>
                </div>

                {/* 2. TOTAL ORDERS */}
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">รายการจำหน่ายตรง</span>
                    <strong className="text-xl font-display font-black text-white block mt-1">{totalOrdersCount} รหัส</strong>
                  </div>
                  <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/10">
                    <FileText size={20} />
                  </div>
                </div>

                {/* 3. TOTAL PRE-ORDERS */}
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">เรือสั่งหลอมพรีออเดอร์</span>
                    <strong className="text-xl font-display font-black text-white block mt-1">{totalPreOrdersCount} ลำ</strong>
                  </div>
                  <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/10">
                    <Calendar size={20} />
                  </div>
                </div>

                {/* 4. TOTAL MEMBERS */}
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">สมาชิกครอบครัวพรพงศ์</span>
                    <strong className="text-xl font-display font-black text-white block mt-1">{totalMembersCount} ท่าน</strong>
                  </div>
                  <div className="p-3 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/10">
                    <Users size={20} />
                  </div>
                </div>
              </div>

              {/* SALES CHART SUMMARY */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5.5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-cyan-400" />
                      วิเคราะห์ยอดพรีออเดอร์และยอดขายโรงงานสัมบูรณ์
                    </h2>
                    <p className="text-[10.5px] text-slate-400">เปรียบเทียบยอดขายรวมโควตาจัดส่งเรือพลาสติก 4 หมวดของปีนี้</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">ประมาณยอดรวม Sandbox</span>
                    <span className="font-display font-black text-[13.5px] text-emerald-400">฿{grossSalesVolume.toLocaleString()} บ.</span>
                  </div>
                </div>

                {/* Custom Elegant Interactive Bar Chart (satisfying recharts prompt with ultra-clean client-side responsive graphics) */}
                <div className="h-44 flex items-end justify-between border-b border-l border-slate-800 pb-2 pt-4 px-4 font-mono text-[10px] text-slate-400">
                  {/* Row Boat Month */}
                  <div className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex justify-center">
                      <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-950 border border-slate-800 text-[9px] py-0.5 px-2 rounded-md text-white font-bold leading-none pointer-events-none whitespace-nowrap">
                        14,800 บาท (โควตา 1)
                      </div>
                    </div>
                    <div className="w-10 sm:w-16 bg-gradient-to-t from-brand-blue to-sky-400 rounded-t-md hover:opacity-85 transition-opacity h-24"></div>
                    <span className="mt-2 text-slate-350 text-[9px] text-center font-bold">เรือพายทั่วไป</span>
                  </div>

                  {/* Fishing boat Month */}
                  <div className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex justify-center">
                      <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-950 border border-slate-800 text-[9px] py-0.5 px-2 rounded-md text-white font-bold leading-none pointer-events-none whitespace-nowrap">
                        13,200 บาท (โควตา 2)
                      </div>
                    </div>
                    <div className="w-10 sm:w-16 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-t-md h-20 hover:opacity-85 transition-opacity"></div>
                    <span className="mt-2 text-slate-350 text-[9px] text-center font-bold">เรืออเนกประสงค์</span>
                  </div>

                  {/* Kayaks Month */}
                  <div className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex justify-center">
                      <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-950 border border-slate-800 text-[9px] py-0.5 px-2 rounded-md text-white font-bold leading-none pointer-events-none whitespace-nowrap">
                        26,800 บาท (ยอดพุ่ง)
                      </div>
                    </div>
                    <div className="w-10 sm:w-16 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-md h-32 hover:opacity-85 transition-opacity"></div>
                    <span className="mt-2 text-slate-350 text-[9px] text-center font-bold">เรือคายัคลุยคลื่น</span>
                  </div>

                  {/* Accessories Month */}
                  <div className="flex flex-col items-center flex-1 group text-center">
                    <div className="relative w-full flex justify-center">
                      <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-950 border border-slate-800 text-[9px] py-0.5 px-2 rounded-md text-white font-bold leading-none pointer-events-none whitespace-nowrap">
                        2,940 บาท
                      </div>
                    </div>
                    <div className="w-10 sm:w-16 bg-gradient-to-t from-yellow-500 to-orange-400 rounded-t-md h-12 hover:opacity-85 transition-opacity"></div>
                    <span className="mt-2 text-slate-350 text-[9px] text-center font-bold">อุปกรณ์ / ชูชีพ</span>
                  </div>
                </div>
              </div>

              {/* RECENT ORDERS & PRE-ORDERS TABLE DIRECTLY SIDE-BY-SIDE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Quick table 1: Recent Orders */}
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-white flex items-center gap-1 px-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        คำสั่งซื้อสำเร็จล่าสุด (Recent Orders)
                      </span>
                      <button 
                        onClick={() => setActiveMenu('orders')} 
                        className="text-[10px] text-brand-blue hover:underline cursor-pointer"
                      >
                        ดูทั้งหมด &raquo;
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/30">
                            <th className="py-2 px-3">รหัสสั่งซื้อ</th>
                            <th className="py-2 px-2">ลูกค้า</th>
                            <th className="py-2 px-2 text-right">ยอดเงิน</th>
                            <th className="py-2 px-3 text-center">สถานะจัดส่ง</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/50">
                          {adminOrders.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-500 font-medium">ยังไม่มีข้อมูล</td>
                            </tr>
                          ) : (
                            adminOrders.slice(0, 3).map((order) => (
                              <tr key={order.id} className="hover:bg-slate-900/40">
                                <td className="py-2 px-3 font-semibold text-white">{order.id}</td>
                                <td className="py-2 px-2 text-slate-300 font-medium">{order.customerName}</td>
                                <td className="py-2 px-2 text-right font-bold text-emerald-400">฿{order.amount.toLocaleString()}</td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    order.status === 'Delivered' 
                                      ? 'bg-emerald-950/40 border border-emerald-900 text-emerald-400'
                                      : order.status === 'Shipping'
                                        ? 'bg-sky-955/40 border border-sky-900 text-sky-400'
                                        : 'bg-amber-955/40 border border-amber-900 text-amber-400'
                                  }`}>
                                    {order.status === 'Delivered' ? 'ส่งมอบเสร็จ' : order.status === 'Shipping' ? 'กำลังขนส่ง' : 'รอชำระ'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Quick table 2: Recent Pre-Orders */}
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-white flex items-center gap-1 px-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        คำสั่งซื้อแบบพรีออเดอร์ยอดฮิต (Recent Pre-Orders)
                      </span>
                      <button 
                        onClick={() => setActiveMenu('preorders')} 
                        className="text-[10px] text-brand-blue hover:underline cursor-pointer"
                      >
                        ดูทั้งหมด &raquo;
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/30">
                            <th className="py-2 px-3">รหัสจองคิว</th>
                            <th className="py-2 px-2">ลูกค้า</th>
                            <th className="py-2 px-2 text-right">เงินมัดจำ</th>
                            <th className="py-2 px-3 text-center">คิวเตรียมหลอมคาร์บอน</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/50">
                          {adminPreOrders.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-500 font-medium">ยังไม่มีข้อมูล</td>
                            </tr>
                          ) : (
                            adminPreOrders.slice(0, 3).map((pre) => (
                              <tr key={pre.id} className="hover:bg-slate-900/40">
                                <td className="py-2 px-3 font-semibold text-white">{pre.id}</td>
                                <td className="py-2 px-2 text-slate-300 font-medium">{pre.customerName}</td>
                                <td className="py-2 px-2 text-right font-bold text-amber-400">฿{pre.deposit.toLocaleString()}</td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    pre.status === 'DepositConfirmed' 
                                      ? 'bg-emerald-950/40 border border-emerald-900 text-emerald-400'
                                      : 'bg-amber-955/40 border border-amber-900 text-amber-400'
                                  }`}>
                                    {pre.status === 'DepositConfirmed' ? 'อนุมัติมัดจำ' : 'รอตรวจสอบเงิน'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* -----------------------------------------------------------
              2. PRODUCTS CONTROL WINDOW TAB
              ----------------------------------------------------------- */}
          {activeMenu === 'products' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Header section with buttons */}
              <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3 text-slate-500">
                      <Search size={13} />
                    </span>
                    <input
                      type="text"
                      placeholder="พิมพ์รหัส ค้นหาหมวดเรือพลาสติก ตราพรพงศ์..."
                      value={productsSearch}
                      onChange={(e) => setProductsSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-blue"
                      id="admin-products-search-input"
                    />
                  </div>

                  {/* Filter by Category */}
                  <div className="w-full sm:w-48">
                    <select
                      value={productsCategoryFilter}
                      onChange={(e) => setProductsCategoryFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-brand-blue"
                      id="admin-products-category-filter"
                    >
                      <option value="all">ทุกหมวดหมู่สินค้า (All)</option>
                      <option value="rowboat">เรือพายทั่วไป (Rowboat)</option>
                      <option value="fishing">เรือตกปลา (Fishing)</option>
                      <option value="kayak">เรือคายัค (Kayak)</option>
                      <option value="accessory">อุปกรณ์เสริม (Accessory)</option>
                    </select>
                  </div>

                  {/* Filter by Status */}
                  <div className="w-full sm:w-48">
                    <select
                      value={productsStatusFilter}
                      onChange={(e) => setProductsStatusFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-brand-blue"
                      id="admin-products-status-filter"
                    >
                      <option value="all">ทุกสถานะสินค้า (All Status)</option>
                      <option value="instock">พร้อมจัดส่ง (In Stock)</option>
                      <option value="outofstock">สินค้าหมด (Out of Stock)</option>
                      <option value="preorder">สั่งจองล่วงหน้า (Pre-Order)</option>
                    </select>
                  </div>

                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    clearProductForm();
                    setIsProductAddOpen(true);
                  }}
                  className="bg-brand-blue hover:bg-brand-blue-light font-bold text-xs py-2.5 px-5 rounded-xl text-white flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-97 hover:shadow-lg hover:shadow-blue-950/20"
                  id="admin-add-product-btn"
                >
                  <PlusCircle size={14} />
                  <span>เพิ่มรหัสสินค้าหลอมใหม่</span>
                </button>
              </div>

              {/* PRODUCTS LIST TABLE */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 font-bold bg-slate-950/80">
                        <th className="py-3 px-4">รหัสสินค้า (ID)</th>
                        <th className="py-3 px-3">รูปภาพ</th>
                        <th className="py-3 px-3">ชื่อผลิตภัณฑ์</th>
                        <th className="py-3 px-3">ประเภท</th>
                        <th className="py-3 px-3 text-right">ราคาจำหน่าย</th>
                        <th className="py-3 px-3 text-center">คงเหลือในคลัง</th>
                        <th className="py-3 px-3 text-center">สถานะสินค้า</th>
                        <th className="py-3 px-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60">
                      {filteredAdminProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">ยังไม่มีข้อมูล</td>
                        </tr>
                      ) : (
                        filteredAdminProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-900/40 text-[11px]">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-350">{prod.sku || prod.model_id || prod.id}</td>
                            <td className="py-3.5 px-3">
                              <img 
                                src={prod.images?.[0]} 
                                alt="product" 
                                className="w-12 h-12 object-cover rounded-xl border border-slate-800" 
                                referrerPolicy="no-referrer"
                              />
                            </td>
                            <td className="py-3.5 px-3">
                              <strong className="text-white block font-sans font-bold">{prod.name}</strong>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                                {prod.categoryThai}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right font-black text-brand-blue">
                              ฿{prod.price.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-center text-slate-300 font-bold">
                              {prod.stockQuantity !== undefined ? prod.stockQuantity : (prod.inStock ? 12 : 0)} ชิ้น
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {(() => {
                                const computedStatus = prod.status || (prod.inStock ? 'instock' : 'outofstock');
                                return (
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    computedStatus === 'instock' 
                                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' 
                                      : computedStatus === 'preorder'
                                        ? 'bg-sky-950/40 text-sky-400 border border-sky-900'
                                        : 'bg-red-950/40 text-red-400 border border-red-900'
                                  }`}>
                                    {computedStatus === 'instock' ? 'พร้อมส่ง (Instock)' : computedStatus === 'preorder' ? 'พรีออเดอร์ (Pre-order)' : 'หมด (Out of Stock)'}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEditProduct(prod)}
                                  className="p-1 px-2.5 rounded-lg bg-sky-950 text-brand-blue hover:bg-sky-900/60 font-semibold cursor-pointer text-[10px] border border-sky-900/30 flex items-center gap-1"
                                >
                                  <Edit size={11} />
                                  <span>แก้ไข</span>
                                </button>
                                <button
                                  onClick={() => deleteProduct(prod.id)}
                                  className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-950 text-red-400 font-semibold cursor-pointer border border-red-950/50"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CRITICAL MOCK PRODUCT DIALOG FORM */}
              {isProductAddOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
                  <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                    <button 
                      onClick={() => setIsProductAddOpen(false)}
                      className="absolute right-4 top-4 text-slate-400 hover:text-slate-100 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                    <h3 className="font-display font-black text-slate-100 text-sm mb-4">
                      {editingProduct ? 'แก้ไขข้อมูลรหัสเรือพลาสติก' : 'เพิ่มรหัสขึ้นรูปเรือใหม่ในสารบบคร่าคร่ำ'}
                    </h3>

                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      {pFormError && (
                        <div className="bg-rose-950/60 border border-rose-850 rounded-xl p-3 text-rose-200">
                          <p className="font-bold mb-1 font-sans text-xs text-rose-400">
                            เกิดข้อผิดพลาดในการบันทึกข้อมูลไปยัง Supabase
                          </p>
                          <p className="font-mono text-[10px] bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-900 mt-1.5 break-words leading-tight max-h-24 overflow-y-auto whitespace-pre-wrap">{pFormError}</p>
                        </div>
                      )}
                      
                      {/* Image Upload UI */}
                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">ภาพประกอบสินค้า (Product Image Upload or URL)*</label>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                          {/* Preview Thumbnail */}
                          <div className="h-16 w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                            {pImage ? (
                              <img src={pImage} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-[9px] text-slate-600">ไม่มีรูป</span>
                            )}
                          </div>
                          {/* Base64 Upload & Fallback URL Text Field */}
                          <div className="sm:col-span-3 space-y-2">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setPImage(reader.result as string);
                                    triggerToast('จำลองอัปโหลดภาพสำเร็จเรียบร้อย!');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="block w-full text-xs text-slate-400
                                file:mr-3 file:py-1 file:px-2.5
                                file:rounded-lg file:border-0
                                file:text-[10px] file:font-semibold
                                file:bg-brand-blue/15 file:text-brand-blue
                                hover:file:bg-brand-blue/20 file:cursor-pointer text-[10px]" 
                            />
                            <input
                              type="text"
                              value={pImage}
                              onChange={(e) => setPImage(e.target.value)}
                              placeholder="หรือระบุลิงก์ภาพพรีเซ้นต์ภายนอก..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-white outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">รหัสโมเดล (เว้นว่างเพื่อสร้างอัตโนมัติ)</label>
                          <input
                            type="text"
                            disabled={!!editingProduct}
                            value={pId}
                            onChange={(e) => setPId(e.target.value)}
                            placeholder="ระบบจะสร้างให้อัตโนมัติ..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-650"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">หมวดหมู่เรือพลาสติก*</label>
                          <select
                            value={pCategory}
                            onChange={(e) => setPCategory(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                          >
                            <option value="rowboat">เรือพายทั่วไป</option>
                            <option value="fishing">เรือตกปลา / พิมพ์รหัสเกาะเครื่อง</option>
                            <option value="kayak">เรือคายัคนั่งปน</option>
                            <option value="accessory">อุปกรณ์เสริมความปลอดภัย</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">ชื่อเรียกของผลิตภัณฑ์เรือกวักน้ำ*</label>
                        <input
                          type="text"
                          required
                          value={pName}
                          onChange={(e) => setPName(e.target.value)}
                          placeholder="เรือพายพลาสติก ตราพรพงศ์ รุ่น 2.8 เมตร โกโปรเดสก์"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">ราคาหลอมแคมเปญ (บาท)*</label>
                          <input
                            type="number"
                            required
                            value={pPrice}
                            onChange={(e) => setPPrice(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">ระบุมิติความกว้างยาว (ม.)</label>
                          <input
                            type="text"
                            value={pLength}
                            onChange={(e) => setPLength(e.target.value)}
                            placeholder="2.80 เมตร"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">จำนวนคงคลัง (Stock Quantity)*</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={pStockQty}
                            onChange={(e) => setPStockQty(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">สถานะวางจำหน่าย (Product Status)*</label>
                          <select
                            value={pStatus}
                            onChange={(e) => setPStatus(e.target.value as any)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                          >
                            <option value="instock">พร้อมส่งทันที (In Stock)</option>
                            <option value="outofstock">สินค้าหมดคลังชั่วคราว (Out of Stock)</option>
                            <option value="preorder">เปิดรับพรีออเดอร์ (Pre-order)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">คำอธิบายและจุดเด่นสินค้า (Description)</label>
                          <textarea
                            value={pDescription}
                            onChange={(e) => setPDescription(e.target.value)}
                            placeholder="ระบุคำอธิบายสั้นๆ เกี่ยวกับผลิตภัณฑ์เพื่อดึงดูดลูกค้า..."
                            rows={2}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">สเปกเรือและข้อมูลเทคนิค (Specifications)</label>
                          <input
                            type="text"
                            value={pSpecs}
                            onChange={(e) => setPSpecs(e.target.value)}
                            placeholder="เช่น ความหนา: 5 มม., น้ำหนักเรือ: 32 กิโลกรัม, รองรับผู้โดยสาร: 2 ที่นั่ง"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-4 py-3 bg-brand-blue hover:bg-brand-blue-light transition-colors text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                      >
                        บันทึกข้อมูลพลาสติกโมเดล
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* -----------------------------------------------------------
              3. SUCCESS DIRECT ORDERS WINDOW TAB
              ----------------------------------------------------------- */}
          {activeMenu === 'orders' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="relative max-w-sm">
                <span className="absolute left-3 top-2 text-slate-500">
                  <Search size={13} />
                </span>
                <input
                  type="text"
                  placeholder="พิมพ์หาชื่อคู่ค้าง ค้นหาเลขที่เช็คบิล..."
                  value={ordersSearch}
                  onChange={(e) => setOrdersSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8.5 pr-4 py-2 text-xs text-white placeholder-slate-550 outline-none"
                  id="admin-orders-search-input"
                />
              </div>

              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-810 bg-slate-950 text-slate-400 font-bold">
                        <th className="py-3 px-4">เลขที่ใบชำระ</th>
                        <th className="py-3 px-3">ชื่อคู่ค้าจัดส่ง</th>
                        <th className="py-3 px-3">รายละเอียดเรือพลาสติก</th>
                        <th className="py-3 px-3">สีเรือที่สั่ง</th>
                        <th className="py-3 px-3 text-right">ยอดเรียกเก็บ</th>
                        <th className="py-3 px-3 text-center">รหัสสิ่งส่งของขนส่ง</th>
                        <th className="py-3 px-3 text-center">อัปเดตสถานะขนย้าย</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50">
                      {filteredAdminOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">ยังไม่มีข้อมูล</td>
                        </tr>
                      ) : (
                        filteredAdminOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-900/30 text-[11px]">
                            <td className="py-3.5 px-4 font-mono font-bold text-white">{ord.id}</td>
                            <td className="py-3.5 px-3">
                              <span className="font-bold block text-slate-200">{ord.customerName}</span>
                              <span className="text-[9px] text-slate-400">จดทะเบียน {ord.date}</span>
                            </td>
                            <td className="py-3.5 px-3 max-w-[200px] truncate" title={ord.productName}>
                              {ord.productName}
                            </td>
                            <td className="py-3.5 px-3 text-slate-300 font-medium">{ord.color}</td>
                            <td className="py-3.5 px-3 text-right font-black text-emerald-400">
                              ฿{ord.amount.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {ord.shipmentNo ? (
                                <code className="bg-sky-950/40 border border-sky-900/60 rounded-md px-1.8 py-0.5 text-sky-400 font-mono text-[10px]">
                                  {ord.shipmentNo}
                                </code>
                              ) : (
                                <span className="text-slate-500 italic">รอรันลำเลียงรหัสคิว</span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => changeOrderStatus(ord.id, 'Pending')}
                                  className={`px-2 py-1 rounded text-[9px] font-extrabold cursor-pointer transition-all ${
                                    ord.status === 'Pending' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-500'
                                  }`}
                                >
                                  รอขนย้าย
                                </button>
                                <button
                                  onClick={() => changeOrderStatus(ord.id, 'Shipping')}
                                  className={`px-2 py-1 rounded text-[9px] font-extrabold cursor-pointer transition-all ${
                                    ord.status === 'Shipping' ? 'bg-brand-blue text-white font-black' : 'bg-slate-900 text-slate-500'
                                  }`}
                                >
                                  ส่งของ
                                </button>
                                <button
                                  onClick={() => changeOrderStatus(ord.id, 'Delivered')}
                                  className={`px-2 py-1 rounded text-[9px] font-extrabold cursor-pointer transition-all ${
                                    ord.status === 'Delivered' ? 'bg-emerald-555 bg-emerald-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-500'
                                  }`}
                                >
                                  ส่งสำเร็จ
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------
              4. PRE-ORDERS CAMPAIGN LIST TAB
              ----------------------------------------------------------- */}
          {activeMenu === 'preorders' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="relative max-w-sm">
                <span className="absolute left-3 top-2 text-slate-500">
                  <Search size={13} />
                </span>
                <input
                  type="text"
                  placeholder="พิมพ์หาใบจอง สเปกโมเดลคิว..."
                  value={preordersSearch}
                  onChange={(e) => setPreordersSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8.5 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  id="admin-preorders-search-input"
                />
              </div>

              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold">
                        <th className="py-3 px-4">รหัสคิวหลอมพลาสติก</th>
                        <th className="py-3 px-3">ลูกค้าเป้าหมาย</th>
                        <th className="py-3 px-3">เรือและโมเดลที่ต้องการ</th>
                        <th className="py-3 px-3 text-right">เงินมัดจำล่วงหน้า</th>
                        <th className="py-3 px-3 text-right">ราคาสุทธิ</th>
                        <th className="py-3 px-3">กำหนดขนส่ง</th>
                        <th className="py-3 px-4 text-center">ปรับจูนสถานะในโรงงาน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50">
                      {filteredAdminPreorders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">ยังไม่มีข้อมูล</td>
                        </tr>
                      ) : (
                        filteredAdminPreorders.map((pre) => (
                          <tr key={pre.id} className="hover:bg-slate-900/30 text-[11px]">
                            <td className="py-3.5 px-4 font-mono font-bold text-white">{pre.id}</td>
                            <td className="py-3.5 px-3">
                              <span className="font-bold block text-slate-205 text-slate-200">{pre.customerName}</span>
                              <span className="text-[9.5px] text-slate-400 font-mono">ลงทะเบียน {pre.date}</span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="block font-semibold text-slate-300">{pre.productName}</span>
                              <span className="text-[10px] text-slate-450">{pre.color}</span>
                            </td>
                            <td className="py-3.5 px-3 text-right font-bold text-amber-500">
                              ฿{pre.deposit.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-right font-black text-brand-blue">
                              ฿{pre.fullPrice.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-slate-300 font-semibold">{pre.estDelivery}</td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <select
                                  value={pre.status}
                                  onChange={(e) => changePreOrderStatus(pre.id, e.target.value as any)}
                                  className="bg-slate-900 border border-slate-700 rounded-md py-1 px-2.5 text-[10.5px] text-slate-200 cursor-pointer text-center font-bold"
                                >
                                  <option value="AwaitingDeposit">รอตรวจค่ามัดจำ</option>
                                  <option value="DepositConfirmed">ยืนยันเงินเรียบร้อย</option>
                                  <option value="InProduction">กำลังหลอมขึ้นรูป</option>
                                  <option value="Ready">ประกอบพร้อมจัดส่ง</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------
              5. MEMBERS SYSTEM DATABASE WINDOW TAB
              ----------------------------------------------------------- */}
          {activeMenu === 'members' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-slate-100 text-xs">ระเบียนครอบครัวผู้จองซื้อสะสมสิทธิ์พรพงศ์พลาสติก</h3>
                  <span className="text-[11px] font-semibold text-slate-400">ระบบอัปเดตสมาชิกอัตโนมัติเมื่อมีการสมัครตรง</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 font-bold">
                        <th className="py-2.5 px-3.5">ชื่อลูกค้า</th>
                        <th className="py-2.5 px-3">ช่องทางอีเมลติดต่อ</th>
                        <th className="py-2.5 px-3 text-center">เบอร์สายด่วน</th>
                        <th className="py-2.5 px-3 text-center">แร้งกิ้งรางวัล</th>
                        <th className="py-2.5 px-3 text-right">แต้มสะสมเกียรติยศ</th>
                        <th className="py-2.5 px-4 text-center">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60">
                      {adminMembers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">ยังไม่มีข้อมูล</td>
                        </tr>
                      ) : (
                        adminMembers.map((member, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/30 text-[11px]">
                            <td className="py-3 px-3.5">
                              <strong className="text-white block font-bold">คุณ {member.name}</strong>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-430 text-slate-400">{member.email}</td>
                            <td className="py-3 px-3 text-center text-slate-300 font-mono">{member.phone}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2.5 py-0.5 rounded-full bg-sky-950/50 text-brand-blue text-[9px] font-bold border border-sky-900/40">
                                {member.rank || 'Standard Family'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-black text-cyan-400 font-mono">{member.rewardPoints || 0} pt</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center items-center gap-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      const newPoints = (member.rewardPoints || 0) + 10;
                                      if (member.id) {
                                        await supabaseCustomers.updatePoints(member.id, newPoints);
                                      }
                                      setAdminMembers(prev => prev.map((m, i) => i === idx ? { ...m, rewardPoints: newPoints } : m));
                                      triggerToast(`มอบแต้มสมาชิกพิเศษ 10 คะแนน แก่คุณ ${member.name} สำเร็จ!`);
                                    } catch (err: any) {
                                      triggerToast(`ข้อผิดพลาด: ${err.message || 'ไม่สามารถอัปเดตแต้มรางวัลได้'}`);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-cyan-950 border border-cyan-900 text-cyan-400 font-bold text-[9.5px] rounded-lg cursor-pointer hover:bg-cyan-900 transition-colors"
                                >
                                  + 10 แต้มพิเศษ
                                </button>
                                
                                <button
                                  onClick={async () => {
                                    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูลผู้ใช้งานของ คุณ ${member.name}?`)) {
                                      try {
                                        if (member.id) {
                                          await supabaseCustomers.delete(member.id);
                                          window.dispatchEvent(new Event('customers-updated'));
                                          triggerToast(`ลบข้อมูลสมาชิกคุณ ${member.name} สำเร็จ!`);
                                        } else {
                                          triggerToast(`ไม่พบรหัสสมาชิกที่ต้องการลบ`);
                                        }
                                      } catch (err: any) {
                                        triggerToast(`ข้อผิดพลาด: ${err.message || 'ไม่สามารถลบข้อมูลได้'}`);
                                      }
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 text-red-400 font-bold text-[9.5px] rounded-lg cursor-pointer transition-colors"
                                >
                                  ลบระเบียน
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------
              6. REVIEWS MODERATION WINDOW TAB
              ----------------------------------------------------------- */}
          {activeMenu === 'reviews' && (
            <div className="space-y-4 animate-fadeIn">
              
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5.5 space-y-4">
                <div>
                  <h3 className="font-display font-bold text-xs text-white">รายชื่อความคิดเห็นรีวิวผลตอบรับชุมชน</h3>
                  <p className="text-[10.5px] text-slate-400">อนุมัติปิดกั้น สแกนคำรีวิวหยาบคาย หรืออนุญาตให้โชว์เป็นรีวิวเด่นเลื่อนผ่านหน้าหลักลูกค้ากวักศรัทธา</p>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {adminReviews.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 font-medium bg-slate-900 border border-slate-850 rounded-xl">
                      ยังไม่มีข้อมูล
                    </div>
                  ) : (
                    adminReviews.map((rev) => (
                      <div key={rev.id} className="p-4 border border-slate-850 bg-slate-900/60 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <strong className="text-white font-bold">{rev.author}</strong>
                            <span className="text-slate-450 text-[10px] bg-slate-950 px-2 py-0.5 rounded-full border border-slate-850 text-slate-400">{rev.date}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5 text-amber-500 font-bold">
                              {"★".repeat(rev.rating)}
                              {"☆".repeat(5 - rev.rating)}
                            </div>
                            
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              rev.approved 
                                ? 'bg-emerald-950/40 border border-emerald-900 text-emerald-400' 
                                : 'bg-red-953/40 border border-red-900 text-amber-500'
                            }`}>
                              {rev.approved ? 'โชว์หน้าเวที' : 'ซ่อนระงับบริการเพื่อเซ็นเซอร์'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-normal bg-slate-950/30 p-2 rounded-lg border border-slate-850/40">
                          {rev.comment}
                        </p>

                        <div className="flex gap-2 pt-1 justify-end">
                          <button
                            onClick={() => toggleReviewApprove(rev.id)}
                            className="px-3 py-1 bg-slate-955 hover:bg-slate-800 border border-slate-810 text-slate-300 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            {rev.approved ? 'ปิดกั้นระงับบอร์ด' : 'อนุมัติผ่านโชว์'}
                          </button>
                          <button
                            onClick={() => deleteReview(rev.id)}
                            className="px-2.5 py-1 bg-red-950/40 border border-red-950 text-red-400 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-red-950 transition-colors"
                          >
                            ลบถาวร
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* -----------------------------------------------------------
              7. NOTIFICATIONS BUILDER WINDOW TAB (Pushes live storefront notis!)
              ----------------------------------------------------------- */}
          {activeMenu === 'notifications' && (
            <div className="space-y-4 animate-fadeIn">
              
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5.5 flex flex-col md:flex-row gap-6">
                
                {/* Form layout */}
                <form onSubmit={handlePostNotification} className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-display font-black text-slate-100 text-xs mb-1 flex items-center gap-1.5 text-cyan-400">
                      <Sparkles size={14} className="text-cyan-400" />
                      สร้างแคมเปญแจ้งเตือนดันข่าวสารสด (Announcement Push)
                    </h3>
                    <p className="text-[10px] text-slate-400 mb-4">
                      เมื่อยิงกด "ประกาศสดตอนนี้" ข้อความชูเปอร์ฮีโร่จะถูกส่งเข้าตรงระฆังสีแดงขอบบนฝั่งเพจแคตตาล็อกหน้าบ้านแบบวิต่อวิทันทีเป็นเรียลไทม์!
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">หัวข้อประกาศแจ้งข่าวเด่นเด่น*</label>
                    <input
                      type="text"
                      required
                      value={notiTitle}
                      onChange={(e) => setNotiTitle(e.target.value)}
                      placeholder="เช่น: ประกาศเรือสีชมพูฟอสฟอรัสเปิดจองจำนวนจำกัด 20 ตัว!"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">รายละเอียดข้อความสารพัดประโยชน์*</label>
                    <textarea
                      required
                      value={notiMsg}
                      onChange={(e) => setNotiMsg(e.target.value)}
                      rows={3}
                      placeholder="แจ้งรายละเอียด กำหนดการ คิวโบนัสจัดส่ง หรือของกำนัล..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 outline-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ประเภทสัญญลักษร์แจ้งเตือน (Category Icon)</label>
                      <select
                        value={notiType}
                        onChange={(e) => setNotiType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                      >
                        <option value="promotion">โปรโมชั่นและของกำนัล (Tag)</option>
                        <option value="new_product">การเปิดตัวเรือลำรุ่นใหม่ (Sparkles)</option>
                        <option value="order">สัญญานยอดจำหน่ายออร์เดอร์ (Shopping Bag)</option>
                        <option value="preorder">ปฏิทินจองพรีออเดอร์ล็อต (Calendar)</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.8 bg-brand-blue hover:bg-brand-blue-light transition-colors text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/20 cursor-pointer"
                        id="send-noti-alert-btn"
                      >
                        <Bell size={13} className="animate-bounce" />
                        <span>ประกาศสดรันขอบแอร์หน้าบ้านตอนนี้!</span>
                      </button>
                    </div>
                  </div>

                </form>

                {/* Live notifications preview card list */}
                <div className="w-full md:w-[350px] bg-slate-900/60 p-4 border border-slate-850 rounded-2xl flex flex-col justify-between shrink-0">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-850 pb-2 mb-3">
                    สารบบลิสต์แจ้งเตือนหน้าและเบลเลอร์ ({notifications.length} รายการ)
                  </span>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] max-w-full">
                    {notifications.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex gap-2 text-[10px] items-start">
                        <div className="shrink-0 text-brand-blue p-1 rounded-sm bg-brand-blue/10">
                          <Bell size={12} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <strong className="text-white block font-sans truncate">{item.title}</strong>
                          <p className="text-slate-400 line-clamp-2 leading-relaxed mt-0.5">{item.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-850 text-center text-[10px] text-slate-500">
                    *ข้อมูลอัปเดตแบบเรียลไทม์จำลอง
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* -----------------------------------------------------------
              8. PROMOTIONS & VALIDATION COUPONS TAB
              ----------------------------------------------------------- */}
          {activeMenu === 'promotions' && (
            <div className="space-y-4 animate-fadeIn">
              
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5.5 space-y-5">
                
                <form onSubmit={handleAddCoupon} className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase border-b border-slate-850 pb-1.5 flex items-center justify-between">
                    <span>สร้างบัตรรหัสลดคุ้ม (Coupon Builder Block)</span>
                    <span className="text-[10px] text-slate-400 lowercase font-medium">บันทึกอัตโนมัติเข้า local cache</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-1.2">ชื่อรหัสคูปองตึง*</label>
                      <input
                        type="text"
                        required
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        placeholder="เช่น SAVE500"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-1.8 text-xs text-white uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-1.2">ประเภทของรหัสลด</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-1.8 text-xs text-white"
                      >
                        <option value="flat">หักลดเงินบาทคงที่ (฿ Flat Discount)</option>
                        <option value="percent">ส่วนลดด้วยค่าเปอร์เซ็นต์ (% Rate)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-1.2">มูลค่าการลด*</label>
                      <input
                        type="number"
                        required
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-1.8 text-xs text-white"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-1.8 bg-brand-blue hover:bg-brand-blue-light transition-colors text-white font-bold text-xs rounded-lg cursor-pointer"
                        id="add-coupon-now-btn"
                      >
                        อนุมัติบัตรรหัสใหม่
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">คำโฆษณาประกอบคูปอง</label>
                    <input
                      type="text"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      placeholder="เช่น คูปองโปรโมชั่นเทศกาลเรือลดโลกร้อนสะท้านทรวงอก"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-1.8 text-xs text-white outline-none"
                    />
                  </div>
                </form>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white">คูปองที่เปิดใช้งานในระบบปัจจุบัน ({adminCoupons.length} คูปอง)</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {adminCoupons.length === 0 ? (
                      <div className="col-span-full p-8 text-center text-slate-500 font-medium bg-slate-900 border border-slate-850 rounded-xl">
                        ยังไม่มีข้อมูล
                      </div>
                    ) : (
                      adminCoupons.map((coupon) => (
                        <div key={coupon.code} className="p-3.5 border border-slate-850 bg-slate-900 rounded-xl relative overflow-hidden flex flex-col justify-between">
                          
                          {/* Tag details */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-sm font-black text-brand-blue bg-sky-950/40 px-2.5 py-0.5 rounded-lg border border-sky-900">
                                {coupon.code}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                coupon.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60' : 'bg-slate-950 text-slate-400'
                              }`}>
                                {coupon.active ? 'เปิดอยู่' : 'ปิดโค้ด'}
                              </span>
                            </div>
                            
                            <p className="text-[11px] text-slate-300 font-bold mt-1.5 leading-snug">
                              {coupon.description}
                            </p>
                            <span className="block text-[10.5px] font-semibold text-emerald-400 font-mono">
                              ลดพิเศษ: +{coupon.type === 'flat' ? `${coupon.discount} บาท` : `${coupon.discount}%`}
                            </span>
                          </div>

                          {/* Actions buttons */}
                          <div className="flex gap-2 pt-3.5 mt-3.5 border-t border-slate-850/60 justify-end">
                            <button
                              onClick={() => toggleCoupon(coupon.code)}
                              className="px-2 py-1 bg-slate-950 text-[10px] text-slate-350 cursor-pointer text-slate-350 hover:bg-slate-900 rounded border border-slate-800 transition-all font-bold"
                            >
                              สลับเปิด/ปิด
                            </button>
                            <button
                              onClick={() => deleteCoupon(coupon.code)}
                              className="p-1 px-2.5 rounded bg-red-950 text-red-400 border border-red-950 hover:bg-red-900 transition-all text-[10px] font-bold cursor-pointer"
                            >
                              ถอนสิทธิ์คูปอง
                            </button>
                          </div>
                          
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* -----------------------------------------------------------
              9. SETTINGS & OPERATIONS CONFIG WINDOW TAB
              ----------------------------------------------------------- */}
          {activeMenu === 'settings' && (
            <div className="space-y-4 animate-fadeIn">
              
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-6.5 space-y-6">
                
                <div className="border-b border-slate-850 pb-3">
                  <h3 className="font-display font-black text-slate-100 text-xs">ตั้งค่าทางเทคนิคและการดำเนินงาน</h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    ปรับเซตตัวแปรสำหรับการแสดงข้อมูลหน้าแคตตาล็อกร้านหลัก
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10.5px] font-bold text-slate-400">ชื่อสถานแสดงประกอบเว็บบล็อก</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.8 text-xs text-white"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10.5px] font-bold text-slate-400">เบอร์โทรศัพท์สายตรงประจำโรงงาน</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.8 text-xs text-white"
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10.5px] font-bold text-slate-400">อีเมลติดต่อระบบประสานส่งเรือ</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.8 text-xs text-white"
                      value={shopEmail}
                      onChange={(e) => setShopEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.2 flex flex-col justify-end">
                    <label className="block text-[10.5px] font-bold text-slate-400 mb-1.5">
                      ระบบจองคิวเรือล่วงหน้าแบบเรียลไทม์
                    </label>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPreOrderActive(!isPreOrderActive);
                          triggerToast('ปรับสวิตซ์ตัวเลือกระบบคิวรับหลอมเรือพรีเซนตฺ์สำเร็จ');
                        }}
                        className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer duration-200 border ${
                          isPreOrderActive 
                            ? 'bg-emerald-950 border-emerald-900 text-emerald-400 shadow-emerald-950/20 shadow-lg' 
                            : 'bg-red-950 border-red-900 text-red-400'
                        }`}
                      >
                        {isPreOrderActive ? '● เปิดโหมดรับจองเรือตามปกติ' : '○ ปิดการรับพรีออเดอร์เก้าอี้กวาย'}
                      </button>
                    </div>
                  </div>

                </div>

                <div className="border-t border-slate-850 pt-5 flex justify-between items-center bg-slate-900/35 p-3 rounded-xl">
                  <div>
                    <span className="block text-[10.5px] font-bold text-slate-300">ล้างฐานข้อมูลชั่วคราวจัดเก็บจำลอง (Reset Cache)</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">ลบทิ้งข้อมูลสินค้าจัดแต่ง คอนฟิกแอดมิน เพื่อดึงระเบียนดั้งเดิม</p>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('คุณต้องการคืนค่าโรงงานข้อมูลแอดมินทั้งหมดและล้างแคชจำลองหรือไม่? ข้อมูลพรีออเดอร์/การตั้งค่าจะรีเซ็ต')) {
                        localStorage.removeItem('pornpong_admin_products');
                        localStorage.removeItem('pornpong_supabase_fallback_products');
                        localStorage.removeItem('pornpong_admin_orders');
                        localStorage.removeItem('pornpong_admin_pre_orders');
                        localStorage.removeItem('pornpong_admin_coupons');
                        localStorage.removeItem('pornpong_reviews_list');
                        triggerToast('ทำความสะอากล้างระเบียนจำลองและคืนค่าเรียบร้อย กรุณารีเฟรชเบราว์เซอร์!');
                        setTimeout(() => {
                          window.location.reload();
                        }, 1200);
                      }
                    }}
                    className="px-4 py-2.5 bg-red-950/70 border border-red-900/50 hover:bg-red-950 text-red-400 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    ล้างประวัติ Sandbox & คืนค่า
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}
