import React from 'react';
import { X, Trash2, ShieldCheck, HeartHandshake, Phone, ArrowRight, Sparkles, CheckCircle, MapPin, BookmarkCheck, Loader2 } from 'lucide-react';
import { CartItem, User } from '../types';
import { supabase, supabaseProfiles } from '../lib/supabase';

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

  // Auto fill details & fetch saved delivery address from Supabase (profiles table)
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

      // If user is logged in (has userId, userEmail, or currentUser)
      if (userId || userEmail || currentUser) {
        setIsLoadingProfile(true);
        try {
          // Query Supabase profiles table
          const profile = await supabaseProfiles.getProfile(userId, userEmail);

          if (!isMounted) return;

          if (profile) {
            const fetchedName = profile.full_name || profile.name || currentUser?.fullName || currentUser?.name || '';
            const fetchedPhone = profile.phone || profile.phone_number || profile.telephone || currentUser?.phone || '';
            const fetchedAddress = profile.address || profile.delivery_address || profile.shipping_address || currentUser?.address || '';

            if (fetchedName) setFullName(fetchedName);
            if (fetchedPhone) setPhone(fetchedPhone);
            if (fetchedAddress) {
              setAddress(fetchedAddress);
              setSavedAddressSource('supabase');
            }
          } else {
            // Fallback to local profile/cache if not yet in Supabase
            const name = currentUser?.fullName || currentUser?.name || '';
            const ph = currentUser?.phone || '';
            const localKey = `pornpong_saved_address_${userEmail || userId || 'default'}`;
            const addr = currentUser?.address || localStorage.getItem(localKey) || '';

            if (name) setFullName(name);
            if (ph) setPhone(ph);
            if (addr) {
              setAddress(addr);
              setSavedAddressSource('local');
            }
          }
        } catch (err) {
          console.warn('Could not load profile from Supabase profiles table:', err);
          if (currentUser) {
            setFullName(currentUser.fullName || currentUser.name || '');
            setPhone(currentUser.phone || '');
            if (currentUser.address) {
              setAddress(currentUser.address);
              setSavedAddressSource('local');
            }
          }
        } finally {
          if (isMounted) setIsLoadingProfile(false);
        }
      } else if (isOpen) {
        setFullName('');
        setPhone('');
        setAddress('');
        setSavedAddressSource(null);
      }
    }

    loadSavedDeliveryAddress();

    return () => {
      isMounted = false;
    };
  }, [currentUser, isOpen, checkoutStep]);

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

      // Upsert profile in Supabase profiles table using User ID
      const effectiveUserId = userId || (userEmail ? `user_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : (currentUser?.id || 'guest-user'));

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

              {/* Input: Address with saved delivery address indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">ที่อยู่จัดส่งสินค้าเรือโดยละเอียด *</label>
                  {savedAddressSource && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-2 py-0.5">
                      <BookmarkCheck size={12} className="text-emerald-500" />
                      {savedAddressSource === 'supabase' ? 'ดึงจากตาราง Profiles บน Supabase' : 'ดึงที่อยู่จัดส่งเดิม'}
                    </span>
                  )}
                  {isLoadingProfile && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Loader2 size={11} className="animate-spin" />
                      กำลังค้นหาที่อยู่...
                    </span>
                  )}
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="หมู่บ้าน ซอย ถนน แขวง อำเภอ จังหวัด รหัสไปรษณีย์ และจุดสังเกต"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (savedAddressSource) setSavedAddressSource(null);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-blue outline-none resize-none"
                  id="checkout-address-input"
                />
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin size={11} className="text-sky-500 shrink-0" />
                  <span>ระบบจะบันทึกและอัปเดตที่อยู่นี้ลงในโปรไฟล์ของคุณ (ตาราง profiles บน Supabase) ให้อัตโนมัติ</span>
                </p>
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
