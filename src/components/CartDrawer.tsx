import React from 'react';
import { 
  X, 
  Trash2, 
  ShieldCheck, 
  HeartHandshake, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  MapPin, 
  BookmarkCheck, 
  Loader2,
  Plus,
  Home,
  Anchor,
  Building,
  Check
} from 'lucide-react';
import { CartItem, User, UserAddress } from '../types';
import { supabase, supabaseProfiles, supabaseUserAddresses } from '../lib/supabase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, color: string, qty: number) => void;
  onRemoveItem: (id: string, color: string) => void;
  onClearCart: () => void;
  currentUser: User | null;
  onSubmitOrder: (orderDetails: { fullName: string; phone: string; address: string; notes?: string }) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  onSubmitOrder
}: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = React.useState<'cart' | 'form' | 'success'>('cart');
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(false);
  const [savedAddressSource, setSavedAddressSource] = React.useState<'supabase' | 'local' | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Saved addresses states for user_addresses
  const [savedAddresses, setSavedAddresses] = React.useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>('new');
  const [isLoadingAddresses, setIsLoadingAddresses] = React.useState(false);
  const [newAddressTitle, setNewAddressTitle] = React.useState('บ้าน');
  const [saveNewAddressForFuture, setSaveNewAddressForFuture] = React.useState(true);

  // Auto fill details & fetch saved delivery addresses from Supabase (user_addresses & profiles tables)
  React.useEffect(() => {
    let isMounted = true;

    async function loadSavedDeliveryAddress() {
      if (!isOpen) return;

      // 1. Resolve User ID and Email
      let userId = currentUser?.id;
      let userEmail = currentUser?.email;

      if (supabase) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            userId = authData.user.id || userId;
            userEmail = authData.user.email || userEmail;
          }
        } catch {
          // ignore auth fetch error
        }
      }

      setIsLoadingAddresses(true);
      setIsLoadingProfile(true);

      try {
        // A. Load addresses from Supabase user_addresses table
        const addressesFromDb = await supabaseUserAddresses.listByUser(userId, userEmail);

        // B. Load user profile details from Supabase profiles table
        let profile = null;
        if (userId || userEmail) {
          profile = await supabaseProfiles.getProfile(userId, userEmail);
        }

        if (!isMounted) return;

        // Auto-fill recipient name and phone if empty
        const initialName = profile?.full_name || profile?.name || currentUser?.fullName || currentUser?.name || '';
        const initialPhone = profile?.phone || profile?.phone_number || profile?.telephone || currentUser?.phone || '';
        if (initialName && !fullName) setFullName(initialName);
        if (initialPhone && !phone) setPhone(initialPhone);

        // Prepare combined address list
        const list: UserAddress[] = [...addressesFromDb];

        // Also check if user has an address in profile or local cache that isn't yet in user_addresses
        const profileAddr = profile?.address || profile?.delivery_address || profile?.shipping_address || currentUser?.address;
        if (profileAddr && profileAddr.trim().length > 0) {
          const exists = list.some(
            (a) => a.address.trim().toLowerCase() === profileAddr.trim().toLowerCase()
          );
          if (!exists) {
            list.unshift({
              id: 'profile_default',
              user_id: userId || 'user',
              title: 'ที่อยู่หลัก (จากโปรไฟล์)',
              recipient_name: initialName,
              phone: initialPhone,
              address: profileAddr.trim(),
              is_default: true,
              created_at: new Date().toISOString()
            });
          }
        }

        setSavedAddresses(list);

        if (list.length > 0) {
          // Select default or first address
          const defaultItem = list.find((a) => a.is_default) || list[0];
          setSelectedAddressId(defaultItem.id);
          setAddress(defaultItem.address);
          if (defaultItem.recipient_name && !fullName) setFullName(defaultItem.recipient_name);
          if (defaultItem.phone && !phone) setPhone(defaultItem.phone);
          setSavedAddressSource('supabase');
        } else {
          setSelectedAddressId('new');
          setSavedAddressSource(null);
        }
      } catch (err) {
        console.warn('Could not load addresses from Supabase:', err);
        setSelectedAddressId('new');
      } finally {
        if (isMounted) {
          setIsLoadingAddresses(false);
          setIsLoadingProfile(false);
        }
      }
    }

    loadSavedDeliveryAddress();

    return () => {
      isMounted = false;
    };
  }, [currentUser, isOpen, checkoutStep]);

  const handleSelectAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    setAddress(addr.address);
    if (addr.recipient_name) setFullName(addr.recipient_name);
    if (addr.phone) setPhone(addr.phone);
    setSavedAddressSource('supabase');
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    setAddress('');
    setSavedAddressSource(null);
  };

  const handleDeleteAddress = async (addrId: string) => {
    let userId = currentUser?.id;
    let userEmail = currentUser?.email;
    await supabaseUserAddresses.delete(addrId, userId, userEmail);
    const remaining = savedAddresses.filter((a) => a.id !== addrId);
    setSavedAddresses(remaining);
    if (selectedAddressId === addrId) {
      if (remaining.length > 0) {
        handleSelectAddress(remaining[0]);
      } else {
        handleSelectNewAddress();
      }
    }
  };

  if (!isOpen) return null;

  const totalSum = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const formatPrice = (val: number) => {
    return val.toLocaleString('th-TH') + ' ฿';
  };

  const handeSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Resolve User ID
      let userId = currentUser?.id;
      let userEmail = currentUser?.email;

      if (supabase) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            userId = authData.user.id || userId;
            userEmail = authData.user.email || userEmail;
          }
        } catch {
          // ignore
        }
      }

      const effectiveUserId = userId || (userEmail ? `user_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : (currentUser?.id || 'guest-user'));

      // Check if this is a new address
      const isNew = selectedAddressId === 'new' || !savedAddresses.some((a) => a.id === selectedAddressId);

      // If user typed a new address, save into user_addresses table linked with user_id
      if (effectiveUserId && isNew && saveNewAddressForFuture) {
        try {
          await supabaseUserAddresses.create({
            user_id: effectiveUserId,
            title: newAddressTitle.trim() || 'ที่อยู่จัดส่ง',
            recipient_name: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            is_default: savedAddresses.length === 0,
            email: userEmail
          });
        } catch (addrErr) {
          console.warn('Error saving to user_addresses on Supabase:', addrErr);
        }
      }

      // Upsert profile in Supabase profiles table using User ID
      if (effectiveUserId) {
        try {
          await supabaseProfiles.upsertProfile({
            id: effectiveUserId,
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            email: userEmail
          });
        } catch (profileErr) {
          console.warn('Error saving delivery address to Supabase profiles:', profileErr);
        }

        // Cache locally for instant retrieval
        const localKey = `pornpong_saved_address_${userEmail || userId || effectiveUserId}`;
        localStorage.setItem(localKey, address.trim());

        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            id: effectiveUserId,
            name: fullName.trim(),
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim()
          };
          localStorage.setItem('pornpong_current_user', JSON.stringify(updatedUser));
        }
      }

      // Complete order
      await onSubmitOrder({ fullName, phone, address, notes });
      setCheckoutStep('cart');
      setFullName('');
      setPhone('');
      setAddress('');
      setNotes('');
      setSavedAddressSource(null);
      onClose();
    } catch (err) {
      console.error('Submit order error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDone = () => {
    onClearCart();
    setCheckoutStep('cart');
    setFullName('');
    setPhone('');
    setAddress('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer content body */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-sky-50/50">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-slate-800">
              {checkoutStep === 'cart' && 'ตะกร้าสินค้าของคุณ'}
              {checkoutStep === 'form' && 'รายละเอียดผู้สั่งซื้อ'}
              {checkoutStep === 'success' && 'สั่งซื้อจำลองสำเร็จ!'}
            </h2>
            <span className="rounded-full bg-brand-blue/15 text-brand-blue font-bold text-xs px-2.5 py-0.5">
              {cart.length} รายการ
            </span>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            id="close-cart-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Inner Panel based on Checkout Step */}

        {/* STEP 1: CART LISTING */}
        {checkoutStep === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="rounded-full bg-sky-50 p-6 text-brand-blue mb-4">
                    <HeartHandshake size={36} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-slate-700">ตะกร้าของคุณยังว่างเปล่า</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    คลิกเลือกดูสินค้าเรือพลาสติกพรีเมียมของเรา และเลือกสีที่ถูกใจเพื่อสั่งซื้อจำลองได้ทันที
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 rounded-full bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs px-6 py-2.5 cursor-pointer shadow-md shadow-sky-100"
                  >
                    กลับไปดูสินค้าเรือพลาสติก
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={`${item.product.id}-${item.selectedColor}`}
                    className="flex justify-between gap-4 border-b border-slate-50 pb-4 last:border-0"
                    id={`cart-item-${item.product.id}`}
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-xl object-cover shrink-0 bg-slate-100 shadow-xs"
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.name}</h4>
                      <p className="text-[10px] text-brand-blue font-sans mt-0.5">สีที่เลือก: <span className="font-medium bg-sky-50 px-1.5 py-0.5 rounded-md">{item.selectedColor}</span></p>
                      
                      {/* Quantity Selectors */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedColor, item.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:border-brand-blue hover:text-brand-blue text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedColor, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:border-brand-blue hover:text-brand-blue text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Item cost and delete */}
                    <div className="text-right flex flex-col justify-between items-end shrink-0">
                      <span className="text-xs font-extrabold text-slate-800">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.selectedColor)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-sm hover:bg-red-50 cursor-pointer"
                        title="ลบรายการสินค้า"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Billing Drawer Bottom Bar */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 p-5 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-500 font-sans">ยอดรวมคำสั่งซื้อจำลอง</span>
                  <span className="text-lg font-display font-extrabold text-brand-blue">
                    {formatPrice(totalSum)}
                  </span>
                </div>
                
                {/* Security trust note */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-4 bg-white p-2.5 rounded-lg border border-slate-100">
                  <ShieldCheck size={14} className="text-brand-blue text-sky-500 shrink-0" />
                  <span>นี่คือหน้ากรอกคำสั่งซื้อจำลองเพื่อสาธิตระบบ UI สั่งทำเรือพลาสติก</span>
                </div>

                <button
                  onClick={() => setCheckoutStep('form')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-display font-bold text-sm py-3 cursor-pointer shadow-md shadow-sky-100 uppercase transition-all duration-200"
                  id="go-to-checkout-form"
                >
                  <span>กรอกข้อมูลจองเรือจำลอง</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: BILL FORM */}
        {checkoutStep === 'form' && (
          <form onSubmit={handeSubmitOrder} className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 p-5 space-y-4">
              <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-100 mb-2">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wide block mb-1">ยอดรวมทั้งหมด</span>
                <span className="text-2xl font-display font-extrabold text-slate-800">{formatPrice(totalSum)}</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  จองเพื่อรอเจ้าหน้าที่พรพงศ์พลาสติกติดต่อส่งใบเสนอราคาชาร์ตพิเศษ
                </p>
              </div>

              {/* Input: Full name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">ชื่อ-นามสกุล ของคุณ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายพายเรือ รักคลอง"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-blue outline-none"
                  id="checkout-name-input"
                />
              </div>

              {/* Input: Telephone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">เบอร์โทรศัพท์ติดต่อพิกัด *</label>
                <input
                  type="tel"
                  required
                  placeholder="เช่น 081-XXXX-XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-blue outline-none"
                  id="checkout-phone-input"
                />
              </div>

              {/* SECTION: Delivery Address Selector & Input */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand-blue" />
                    <span>ที่อยู่จัดส่งสินค้าเรือโดยละเอียด *</span>
                  </label>
                  {isLoadingAddresses && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Loader2 size={11} className="animate-spin" />
                      กำลังค้นหาที่อยู่...
                    </span>
                  )}
                </div>

                {/* Case 1: If user has saved addresses from user_addresses / profile */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <BookmarkCheck size={13} className="text-brand-blue" />
                        <span>เลือกจากที่อยู่ที่บันทึกไว้ ({savedAddresses.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleSelectNewAddress}
                        className={`text-[11px] font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          selectedAddressId === 'new'
                            ? 'bg-brand-blue text-white shadow-xs'
                            : 'text-brand-blue bg-sky-50 hover:bg-sky-100'
                        }`}
                        id="btn-use-new-address"
                      >
                        <Plus size={12} />
                        <span>ใช้ที่อยู่ใหม่</span>
                      </button>
                    </div>

                    {/* Radio Cards of saved addresses */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`group relative rounded-xl p-2.5 border transition-all cursor-pointer text-left ${
                              isSelected
                                ? 'border-brand-blue bg-sky-50/80 ring-1 ring-brand-blue/30 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                {/* Radio Indicator */}
                                <div className="mt-0.5 shrink-0">
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? 'border-brand-blue bg-brand-blue'
                                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                                    }`}
                                  >
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-slate-800">
                                      {addr.title || 'ที่อยู่จัดส่ง'}
                                    </span>
                                    {addr.is_default && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-sky-100 text-sky-800">
                                        ค่าเริ่มต้น
                                      </span>
                                    )}
                                    {addr.recipient_name && (
                                      <span className="text-[11px] text-slate-500 font-medium">
                                        • {addr.recipient_name}
                                      </span>
                                    )}
                                    {addr.phone && (
                                      <span className="text-[11px] text-slate-500 font-medium">
                                        ({addr.phone})
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                                    {addr.address}
                                  </p>
                                </div>
                              </div>

                              {/* Delete address button if not profile default */}
                              {addr.id !== 'profile_default' && (
                                <button
                                  type="button"
                                  title="ลบที่อยู่นี้"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAddress(addr.id);
                                  }}
                                  className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition-colors shrink-0"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Explicit "ใช้ที่อยู่ใหม่" Radio Card Option */}
                      <div
                        onClick={handleSelectNewAddress}
                        className={`rounded-xl p-2.5 border border-dashed transition-all cursor-pointer text-left flex items-center gap-2.5 ${
                          selectedAddressId === 'new'
                            ? 'border-brand-blue bg-sky-50/80 ring-1 ring-brand-blue/30'
                            : 'border-slate-300 bg-white/70 hover:border-brand-blue/60 hover:bg-white'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            selectedAddressId === 'new'
                              ? 'border-brand-blue bg-brand-blue'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selectedAddressId === 'new' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Plus size={14} className="text-brand-blue" />
                          <span>ใช้ที่อยู่ใหม่ / กรอกที่อยู่จัดส่งอื่น</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form fields for address when "new" is selected or when no saved addresses exist */}
                {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                  <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-600 block">
                          ป้ายกำกับที่อยู่ใหม่ (Label)
                        </label>
                        <span className="text-[10px] text-slate-400">เลือกด่วนหรือคลิกตั้งชื่อ</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: 'บ้าน', icon: '🏠' },
                          { label: 'ท่าเรือ/จุดจอดเรือ', icon: '⚓' },
                          { label: 'ที่ทำงาน', icon: '🏢' },
                          { label: 'อู่ต่อเรือ', icon: '🛠️' }
                        ].map((preset) => {
                          const isChipSelected = newAddressTitle === preset.label;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setNewAddressTitle(preset.label)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1 ${
                                isChipSelected
                                  ? 'border-brand-blue bg-brand-blue text-white font-bold shadow-2xs'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <span>{preset.icon}</span>
                              <span>{preset.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        รายละเอียดที่อยู่จัดส่งใหม่ *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="กรอกที่อยู่จัดส่งใหม่: หมู่บ้าน ซอย ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์ และจุดสังเกตเรือ..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-blue outline-none resize-none"
                        id="checkout-address-input"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
                      <input
                        type="checkbox"
                        checked={saveNewAddressForFuture}
                        onChange={(e) => setSaveNewAddressForFuture(e.target.checked)}
                        className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue h-4 w-4 cursor-pointer"
                        id="save-new-address-checkbox"
                      />
                      <span className="text-[11px] text-slate-600 font-medium">
                        บันทึกที่อยู่นี้ลงในตาราง <strong className="text-slate-800">user_addresses</strong> บน Supabase
                      </span>
                    </label>
                  </div>
                )}

                {/* If an existing address is selected, display quick verification banner */}
                {selectedAddressId !== 'new' && savedAddresses.length > 0 && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200/90 rounded-xl text-xs flex items-center justify-between text-emerald-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <BookmarkCheck size={16} className="text-emerald-600 shrink-0" />
                      <span className="font-medium truncate">
                        จัดส่งไปยัง: <strong className="text-emerald-950 font-bold">{savedAddresses.find(a => a.id === selectedAddressId)?.title || 'ที่อยู่ที่บันทึกไว้'}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectNewAddress}
                      className="text-[11px] text-emerald-700 underline font-bold hover:text-emerald-900 cursor-pointer shrink-0 ml-2"
                    >
                      เปลี่ยน / กรอกที่อยู่ใหม่
                    </button>
                  </div>
                )}
              </div>

              {/* Input: Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">หมายเหตุพิเศษ / ลายพิมพ์สีเรือเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น ขอจัดส่งวันเสาร์-อาทิตย์ หรือพิมพ์ลายสีพิเศษ..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-blue outline-none"
                  id="checkout-notes-input"
                />
              </div>
            </div>

            {/* Back & Submit buttons */}
            <div className="border-t border-slate-100 p-5 bg-slate-50 flex gap-3">
              <button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-slate-200 hover:bg-white text-slate-500 hover:text-slate-800 text-xs font-bold py-3 cursor-pointer disabled:opacity-50"
              >
                ย้อนกลับ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-display font-bold text-xs py-3 cursor-pointer shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                id="submit-simulated-order"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>กำลังบันทึกที่อยู่และส่งข้อมูล...</span>
                  </>
                ) : (
                  <span>ยืนยันการเพื่อรับข้อเสนอจำลอง</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS BILL */}
        {checkoutStep === 'success' && (
          <div className="flex-1 flex flex-col overflow-y-auto p-6 text-center justify-between">
            <div className="space-y-4 pt-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-2">
                <CheckCircle size={36} className="animate-pulse" />
              </div>
              
              <h3 className="font-display text-lg font-bold text-slate-800">ส่งคำสั่งซื้อจำลองเรียบร้อยแล้ว!</h3>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-left space-y-1.5 text-xs font-sans">
                <div className="font-bold text-slate-700 pb-1 border-b border-slate-100 mb-1 flex justify-between items-center text-[10px] text-brand-blue">
                  <span>ใบจองจดหมายเรือเลขที่ PP-{Math.floor(Math.random()*90000)+10000}</span>
                  <span>สถานะ: รอยืนยัน</span>
                </div>
                <div><span className="text-slate-400">ชื่อผู้จอง:</span> <span className="font-bold text-slate-700">{fullName}</span></div>
                <div><span className="text-slate-400">เบอร์โทรศัพท์:</span> <span className="font-bold text-slate-700">{phone}</span></div>
                <div><span className="text-slate-400">ที่ส่งเรือ:</span> <span className="font-bold text-slate-700 line-clamp-1">{address}</span></div>
                <div className="pt-1.5 border-t border-slate-100 flex justify-between font-bold">
                  <span className="text-slate-500">ยอดจำลองสุทธิ:</span>
                  <span className="text-brand-blue text-sm">{formatPrice(totalSum)}</span>
                </div>
              </div>

              {/* QR Simulation Card */}
              <div className="border border-sky-100 p-4 rounded-xl bg-sky-50/50 text-slate-600 font-sans text-xs">
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5 justify-center">
                  <Sparkles size={14} className="text-amber-500" />
                  ยินดีต้อนรับสู่ "พรพงศ์พลาสติก"
                </p>
                <p className="text-[11px] leading-relaxed">
                  เนื่องจากนี่คือเวอร์ชันตัวอย่าง UI เราได้บันทึกความตั้งใจของท่านแล้ว ท่านสามารถแคปเจอร์หน้าจอนี้เพื่อคลิกติดต่อสั่งซื้อของจริงกับร้านผ่านไลน์ทางการได้
                </p>
                <div className="mt-3 flex justify-center">
                  <a
                    href="https://line.me"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#06C755] hover:opacity-90 text-white font-bold text-[11px] px-4 py-1.5 shadow-xs"
                  >
                    <Phone size={11} />
                    แอดไลน์สอบถามของจริง @pornpongplastic
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="mt-6 w-full rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3.5 cursor-pointer shadow-md transition-all duration-200"
              id="success-checkout-done-btn"
            >
              เสร็จสิ้นและล้างสินค้าในตะกร้า
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
