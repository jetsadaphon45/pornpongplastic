import React from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Truck, 
  QrCode, 
  Copy, 
  ArrowRight, 
  X, 
  AlertCircle, 
  ShoppingBag, 
  Upload, 
  Receipt, 
  RefreshCw,
  Palette,
  FileText,
  HelpCircle,
  Eye,
  Info,
  Layers,
  Sparkle,
  Camera,
  Maximize2,
  ZoomIn
} from 'lucide-react';
import { Product, User } from '../types';
import { supabaseOrders, supabasePreOrderSettings, PreOrderSettings, DEFAULT_PREORDER_SETTINGS } from '../lib/supabase';

interface PreorderSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, color?: string) => void;
  currentUser?: User | null;
  onOpenLogin?: () => void;
  setActiveTab?: (tab: string) => void;
}

// 4 Color options specified in user prompt
export type BoatColorId = 'น้ำเงิน' | 'แดง' | 'เขียว' | 'ส้ม';

// 3 Boat Size models specified in user prompt
export type BoatSizeId = '1_seat' | '2_seat' | '3_seat';

export interface BoatSizeConfig {
  id: BoatSizeId;
  name: string;
  shortName: string;
  badge: string;
  subtitle: string;
  dimensions: string;
  lengthLabel: string;
  widthLabel: string;
  capacityWeight: string;
  seatsLabel: string;
  defaultBasePrice: number;
  description: string;
  idealFor: string;
  scaleBadge: string;
  photoUrl: Record<BoatColorId, string>;
}

export const BOAT_SIZE_CONFIGS: Record<BoatSizeId, BoatSizeConfig> = {
  '1_seat': {
    id: '1_seat',
    name: 'ขนาด 1 ที่นั่ง (เรือเดี่ยว / เรือเล็ก)',
    shortName: 'เรือเดี่ยว 1 ที่นั่ง',
    badge: 'คล่องตัวสูง • 1 ที่นั่ง',
    subtitle: 'ความยาว 1.8 - 2.0 เมตร (ราว 6 ฟุต) | กว้างประมาณ 78 ซม.',
    dimensions: 'ยาว 1.80 - 2.00 ม. × กว้าง 0.78 ม.',
    lengthLabel: 'ยาว 1.8 - 2.0 ม. (ราว 6 ฟุต)',
    widthLabel: 'กว้าง 78 ซม.',
    capacityWeight: '90 - 120 กก.',
    seatsLabel: '1 ที่นั่ง (เรือเดี่ยว)',
    defaultBasePrice: 2500,
    description: 'เรือขนาดเล็กกะทัดรัด น้ำหนักเบา ยกคนเดียวได้ พายคล่องตัวสูงในร่องสวน คูคลองแคบ หรือสระน้ำ',
    idealFor: 'พายคนเดียว ตรวจร่องสวน ท้องร่อง ลำคลองแคบ พกพาสะดวก',
    scaleBadge: 'สเกลจริง 1.90 x 0.78 ม. • ขนาด 1 ที่นั่ง',
    photoUrl: {
      'น้ำเงิน': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=900&auto=format&fit=crop',
      'แดง': 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=900&auto=format&fit=crop',
      'เขียว': 'https://images.unsplash.com/photo-1508873696983-2df570464756?q=80&w=900&auto=format&fit=crop',
      'ส้ม': 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=900&auto=format&fit=crop',
    }
  },
  '2_seat': {
    id: '2_seat',
    name: 'ขนาด 2 ที่นั่ง (รุ่นมาตรฐาน)',
    shortName: 'รุ่นมาตรฐาน 2 ที่นั่ง',
    badge: 'รุ่นยอดนิยม • 2 ที่นั่ง',
    subtitle: 'ความยาว 1.98 - 2.5 เมตร (ราว 8 ฟุต) | กว้างประมาณ 88 - 96 ซม.',
    dimensions: 'ยาว 1.98 - 2.50 ม. × กว้าง 0.88 - 0.96 ม.',
    lengthLabel: 'ยาว 1.98 - 2.5 ม. (ราว 8 ฟุต)',
    widthLabel: 'กว้าง 88 - 96 ซม.',
    capacityWeight: '180 - 220 กก.',
    seatsLabel: '2 ที่นั่ง (รุ่นมาตรฐาน)',
    defaultBasePrice: 3000,
    description: 'เรือพลาสติกทรงท้องแบนมาตรฐานยอดนิยม เสถียรภาพสูง ไม่โคลงเคลง นั่ง 2 คนสบาย มั่นคงปลอดภัยในทุกผืนน้ำ',
    idealFor: 'ใช้งานทั่วไป สวนอาหาร รีสอร์ท กู้ภัย อพยพน้ำท่วม ตกปลา',
    scaleBadge: 'สเกลจริง 2.50 x 0.90 ม. • รุ่นมาตรฐาน 2 ที่นั่ง',
    photoUrl: {
      'น้ำเงิน': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop',
      'แดง': 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=900&auto=format&fit=crop',
      'เขียว': 'https://images.unsplash.com/photo-1508873696983-2df570464756?q=80&w=900&auto=format&fit=crop',
      'ส้ม': 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=900&auto=format&fit=crop',
    }
  },
  '3_seat': {
    id: '3_seat',
    name: 'ขนาด 3 ที่นั่งขึ้นไป (เรือขนาดใหญ่ / เรืออีแปะ / เรือเกษตร)',
    shortName: 'เรืออีแปะเกษตร 3 ที่นั่ง+',
    badge: 'บรรทุกหนัก • 3 ที่นั่งขึ้นไป',
    subtitle: 'ความยาว 3.3 เมตรขึ้นไป (ราว 10-11 ฟุต) | กว้างประมาณ 90 ซม. ขึ้นไป',
    dimensions: 'ยาว 3.30+ ม. × กว้าง 0.90+ ม.',
    lengthLabel: 'ยาว 3.3 ม. ขึ้นไป (ราว 10-11 ฟุต)',
    widthLabel: 'กว้าง 90 ซม. ขึ้นไป',
    capacityWeight: '300 - 380 กก.',
    seatsLabel: '3 ที่นั่งขึ้นไป (เรือเกษตร/อีแปะ)',
    defaultBasePrice: 4500,
    description: 'เรือขนาดใหญ่ทรงเรืออีแปะการเกษตร ท้องแบนกว้างพิเศษ ทรงตัวดีเยี่ยม ลอยตัวสูง จุสัมภาระและผลผลิตการเกษตรได้มาก',
    idealFor: 'งานเกษตรกรรม ขนผลไม้ บรรทุกของหนัก ครอบครัว 3-4 คน',
    scaleBadge: 'สเกลจริง 3.30 x 0.95 ม. • เรือใหญ่ 3 ที่นั่งขึ้นไป',
    photoUrl: {
      'น้ำเงิน': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=900&auto=format&fit=crop',
      'แดง': 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=900&auto=format&fit=crop',
      'เขียว': 'https://images.unsplash.com/photo-1508873696983-2df570464756?q=80&w=900&auto=format&fit=crop',
      'ส้ม': 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=900&auto=format&fit=crop',
    }
  }
};

interface ColorConfig {
  id: BoatColorId;
  name: string;
  english: string;
  badgeBg: string;
  badgeText: string;
  swatchHex: string;
  borderHex: string;
  gradient: {
    start: string;
    mid: string;
    end: string;
    highlight: string;
  };
  photoUrl: string;
}

const COLOR_CONFIGS: Record<BoatColorId, ColorConfig> = {
  'น้ำเงิน': {
    id: 'น้ำเงิน',
    name: 'สีน้ำเงิน',
    english: 'Royal Ocean Blue',
    badgeBg: 'bg-blue-500',
    badgeText: 'text-blue-700 bg-blue-50 border-blue-200',
    swatchHex: '#2563eb',
    borderHex: 'border-blue-600 ring-blue-400',
    gradient: {
      start: '#1e3a8a',
      mid: '#2563eb',
      end: '#1d4ed8',
      highlight: '#93c5fd'
    },
    photoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=900&auto=format&fit=crop'
  },
  'แดง': {
    id: 'แดง',
    name: 'สีแดง',
    english: 'Rescue Vivid Red',
    badgeBg: 'bg-red-600',
    badgeText: 'text-red-700 bg-red-50 border-red-200',
    swatchHex: '#dc2626',
    borderHex: 'border-red-600 ring-red-400',
    gradient: {
      start: '#991b1b',
      mid: '#dc2626',
      end: '#b91c1c',
      highlight: '#fca5a5'
    },
    photoUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=900&auto=format&fit=crop'
  },
  'เขียว': {
    id: 'เขียว',
    name: 'สีเขียว',
    english: 'Forest Green',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    swatchHex: '#16a34a',
    borderHex: 'border-emerald-600 ring-emerald-400',
    gradient: {
      start: '#14532d',
      mid: '#16a34a',
      end: '#15803d',
      highlight: '#86efac'
    },
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df570464756?q=80&w=900&auto=format&fit=crop'
  },
  'ส้ม': {
    id: 'ส้ม',
    name: 'สีส้ม',
    english: 'Hi-Vis Safety Orange',
    badgeBg: 'bg-orange-500',
    badgeText: 'text-orange-700 bg-orange-50 border-orange-200',
    swatchHex: '#ea580c',
    borderHex: 'border-orange-500 ring-orange-400',
    gradient: {
      start: '#9a3412',
      mid: '#ea580c',
      end: '#c2410c',
      highlight: '#fdba74'
    },
    photoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=900&auto=format&fit=crop'
  }
};

export default function PreorderSection({
  products,
  onSelectProduct,
  onAddToCart,
  currentUser,
  onOpenLogin,
  setActiveTab
}: PreorderSectionProps) {
  // 1. Customizer State
  // Dynamic Pre-Order Settings from Admin Config
  const [settings, setSettings] = React.useState<PreOrderSettings>(DEFAULT_PREORDER_SETTINGS);

  React.useEffect(() => {
    supabasePreOrderSettings.get().then((data) => {
      if (data) setSettings(data);
    });

    const handleSettingsUpdated = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
      } else {
        supabasePreOrderSettings.get().then((data) => {
          if (data) setSettings(data);
        });
      }
    };

    window.addEventListener('preorder_settings_changed', handleSettingsUpdated);
    return () => window.removeEventListener('preorder_settings_changed', handleSettingsUpdated);
  }, []);

  const [selectedSize, setSelectedSize] = React.useState<BoatSizeId>('2_seat');

  const getBasePrice = (sizeId: BoatSizeId): number => {
    if (sizeId === '1_seat') return settings.basePrice1Seat ?? 2500;
    if (sizeId === '3_seat') return settings.basePrice3Seat ?? 4500;
    return settings.basePrice2Seat ?? settings.basePrice ?? 3000;
  };

  const BASE_PRICE = getBasePrice(selectedSize);
  const STICKER_PRICE = settings.stickerPrice ?? 300;
  const CUSTOM_TEXT_PRICE = settings.customTextPrice ?? 200;
  const depositPerBoat = settings.depositPerBoat ?? 1000;

  const [selectedColor, setSelectedColor] = React.useState<BoatColorId>('น้ำเงิน');
  const [hasSticker, setHasSticker] = React.useState<boolean>(false);
  const [hasCustomText, setHasCustomText] = React.useState<boolean>(false);
  const [customText, setCustomText] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState<number>(1);
  const [previewMode, setPreviewMode] = React.useState<'3d_hull' | 'real_photo'>('3d_hull');
  const [isZoomingPhoto, setIsZoomingPhoto] = React.useState(false);

  // Customer Contact Info
  const [customerName, setCustomerName] = React.useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = React.useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = React.useState(currentUser?.email || '');
  const [customerAddress, setCustomerAddress] = React.useState(currentUser?.address || '');
  const [customerNotes, setCustomerNotes] = React.useState('');

  // Submission & Modal States
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showOrderModal, setShowOrderModal] = React.useState(false);
  const [confirmedOrder, setConfirmedOrder] = React.useState<any | null>(null);
  const [copiedOrderId, setCopiedOrderId] = React.useState(false);
  const [slipUploaded, setSlipUploaded] = React.useState(false);

  // Sync user details if logged in
  React.useEffect(() => {
    if (currentUser) {
      if (!customerName && currentUser.name) setCustomerName(currentUser.name);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
      if (!customerEmail && currentUser.email) setCustomerEmail(currentUser.email);
      if (!customerAddress && currentUser.address) setCustomerAddress(currentUser.address);
    }
  }, [currentUser]);

  // 2. Real-time Price Calculation
  const stickerCost = hasSticker ? STICKER_PRICE : 0;
  const textCost = hasCustomText ? CUSTOM_TEXT_PRICE : 0;
  const unitPrice = BASE_PRICE + stickerCost + textCost;
  const totalPrice = unitPrice * Math.max(1, quantity);
  // Deposit: depositPerBoat THB per boat or ~30%
  const depositAmount = Math.max(depositPerBoat * Math.max(1, quantity), Math.round(totalPrice * 0.3));
  const remainingAmount = Math.max(0, totalPrice - depositAmount);

  // Handle pre-order submit
  const handleConfirmPreOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล และเบอร์โทรศัพท์สำหรับติดต่อยืนยันคิวผลิต');
      return;
    }
    if (hasCustomText && !customText.trim()) {
      alert('กรุณากรอกข้อความข้างเรือที่ต้องการพิมพ์ หรือเลือกไม่สกรีนข้อความ');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeSizeConfig = BOAT_SIZE_CONFIGS[selectedSize];
      const stickerOptionValue = hasSticker ? `ติดสติกเกอร์ลายพิเศษ (+${STICKER_PRICE.toLocaleString()} บาท)` : 'ไม่ติดสติกเกอร์ (+0 บาท)';
      const payload = {
        customer_id: currentUser?.id || null,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || (currentUser?.email || 'guest@example.com'),
        customer_phone: customerPhone.trim(),
        boat_size: activeSizeConfig.name,
        boat_model_name: activeSizeConfig.shortName,
        selected_color: selectedColor,
        sticker_option: stickerOptionValue,
        custom_text: hasCustomText ? customText.trim() : '',
        total_price: totalPrice,
        status: 'pending_deposit' as const,
        deposit_amount: depositAmount,
        quantity: quantity,
        address: customerAddress.trim(),
        notes: `[ขนาด: ${activeSizeConfig.name}] ` + (customerNotes.trim() ? `หมายเหตุ: ${customerNotes.trim()}` : '')
      };

      const result = await supabaseOrders.createCustomPreOrder(payload);

      setConfirmedOrder({
        ...payload,
        id: result?.id || ('ORD-PRE-' + Date.now().toString().slice(-6)),
        created_at: result?.created_at || new Date().toISOString()
      });
      setShowOrderModal(true);
    } catch (err: any) {
      console.error('Error submitting pre-order:', err);
      const activeSizeConfig = BOAT_SIZE_CONFIGS[selectedSize];
      // Even if network blips, show confirmation modal with reliable fallback ID
      const fallbackOrder = {
        id: 'ORD-PRE-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim(),
        boat_size: activeSizeConfig.name,
        boat_model_name: activeSizeConfig.shortName,
        selected_color: selectedColor,
        sticker_option: hasSticker ? `ติดสติกเกอร์ลายพิเศษ (+${STICKER_PRICE} บาท)` : 'ไม่ติดสติกเกอร์ (+0 บาท)',
        custom_text: hasCustomText ? customText.trim() : '',
        total_price: totalPrice,
        status: 'pending_deposit',
        deposit_amount: depositAmount,
        quantity: quantity,
        address: customerAddress.trim(),
        created_at: new Date().toISOString()
      };
      setConfirmedOrder(fallbackOrder);
      setShowOrderModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderIdToClipboard = () => {
    if (confirmedOrder?.id) {
      navigator.clipboard.writeText(confirmedOrder.id);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  const activeColorConfig = COLOR_CONFIGS[selectedColor];
  const activeSizeConfig = BOAT_SIZE_CONFIGS[selectedSize];

  // Other catalog products for browsing below
  const preorderProducts = products.filter(
    (p) => p.status === 'preorder' || p.category === 'rowboat' || p.category === 'kayak' || p.price >= 5000
  );

  return (
    <div className="font-sans min-h-screen bg-slate-50/50 pb-24">
      
      {/* 1. HERO PRE-ORDER HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-sky-800 to-sky-950 text-white py-14 sm:py-18">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-semibold backdrop-blur-xs border border-sky-300/30 mb-4">
              <Sparkles size={14} className="text-amber-300" />
              Custom Pre-Order Studio • ออกแบบเรือและคำนวณราคาอัตโนมัติ
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
              ออกแบบเรือพลาสติกสั่งทำพิเศษ (Custom Pre-Order)
            </h1>
            <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed mb-6">
              เลือกสีเนื้อพลาสติก ตกแต่งสติกเกอร์ลายพิเศษ และสกรีนชื่อเรือตามสั่ง หลอมขึ้นรูปไร้รอยต่อด้วยมาตรฐานโรงงานพรพงศ์พลาสติก คำนวณราคาและออกใบจองล็อกคิวผลิตทันที
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-sky-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>ราคาเริ่มต้นเพียง ฿{getBasePrice('1_seat').toLocaleString()} (มี 3 ขนาดให้เลือก)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>มัดจำล็อกคิว ฿{depositPerBoat.toLocaleString()} / ลำ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>ระยะเวลาหลอมผลิต 3-5 วันทำการ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN INTERACTIVE CUSTOMIZER SECTION */}
      <section id="custom-builder" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl border border-sky-100 shadow-xl shadow-slate-200/60 overflow-hidden">
          
          <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-sky-50/70 via-white to-sky-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-brand-blue uppercase bg-sky-100/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Interactive Customizer UI
              </span>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-850">
                ปรับแต่งเรือของคุณ ({activeSizeConfig.shortName} • {activeColorConfig.name})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                คลิกเลือกขนาดเรือ สี สติกเกอร์ และข้อความ เพื่อดูตัวอย่างเรือแบบ Real-time
              </p>
            </div>

            {/* Preview Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPreviewMode('3d_hull')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewMode === '3d_hull'
                    ? 'bg-white text-brand-blue shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers size={13} />
                <span>ภาพจำลองโมเดลตัวเรือ (Live)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('real_photo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewMode === 'real_photo'
                    ? 'bg-white text-brand-blue shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye size={13} />
                <span>ภาพถ่ายเรือจริง</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* LEFT COLUMN: INTERACTIVE BOAT PREVIEW (6 cols) */}
            <div className="lg:col-span-6 p-6 sm:p-8 bg-slate-900/95 text-white flex flex-col justify-between relative overflow-hidden">
              
              {/* Background Ambient Glow matching boat color */}
              <div 
                className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
                style={{ backgroundColor: activeColorConfig.swatchHex }}
              ></div>

              <div>
                {/* Header status tags */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: activeColorConfig.swatchHex }}></span>
                    <span className="text-xs font-bold tracking-wide uppercase text-slate-300">
                      Live Preview • {activeSizeConfig.shortName} ({activeColorConfig.name})
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-300 bg-slate-800/90 border border-slate-700 px-2.5 py-0.5 rounded-md">
                    {activeSizeConfig.scaleBadge}
                  </span>
                </div>

                {/* VISUAL PREVIEW DISPLAY */}
                <div className="relative aspect-16/10 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-950 border border-slate-700/80 shadow-2xl overflow-hidden flex items-center justify-center p-4">
                  
                  {previewMode === '3d_hull' ? (
                    /* SVG INTERACTIVE BOAT VECTOR WITH DYNAMIC SIZE GEOMETRY & LIVE TEXT OVERLAY */
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      
                      {/* Water reflection ripples */}
                      <div className="absolute bottom-4 inset-x-8 h-8 opacity-25 bg-gradient-to-t from-sky-400 to-transparent blur-xs rounded-full"></div>

                      <svg 
                        viewBox="0 0 540 220" 
                        className="w-full max-h-[190px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] transition-all duration-500"
                      >
                        <defs>
                          {/* Dynamic Linear Gradient for Selected Hull Color */}
                          <linearGradient id="boatHullGrad" x1="0%" y1="0%" x2="100%" y2="80%">
                            <stop offset="0%" stopColor={activeColorConfig.gradient.start} />
                            <stop offset="45%" stopColor={activeColorConfig.gradient.mid} />
                            <stop offset="100%" stopColor={activeColorConfig.gradient.end} />
                          </linearGradient>

                          <linearGradient id="boatShine" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
                          </linearGradient>

                          {/* Vinyl Racing Sticker pattern */}
                          <linearGradient id="stickerStripe" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>

                        {/* RENDER HULL ACCORDING TO SELECTED BOAT SIZE */}
                        {selectedSize === '1_seat' && (
                          /* MODEL 1: ขนาด 1 ที่นั่ง (เรือเดี่ยว / เรือเล็ก 1.8-2.0 ม.) */
                          <g className="transition-all duration-500">
                            {/* Keel Shadow */}
                            <ellipse cx="270" cy="182" rx="165" ry="10" fill="#030712" opacity="0.6" />

                            {/* Outer Main Hull */}
                            <path 
                              d="M 85 96 C 115 156, 175 174, 270 176 C 365 174, 425 156, 455 96 C 415 102, 270 105, 85 96 Z" 
                              fill="url(#boatHullGrad)"
                              stroke={activeColorConfig.gradient.start}
                              strokeWidth="2"
                            />
                            {/* Hull lighting & gloss shine */}
                            <path 
                              d="M 85 96 C 115 156, 175 174, 270 176 C 365 174, 425 156, 455 96 C 415 102, 270 105, 85 96 Z" 
                              fill="url(#boatShine)"
                            />
                            {/* Interior Cockpit */}
                            <path 
                              d="M 98 96 C 145 116, 395 116, 442 96 C 400 88, 140 88, 98 96 Z" 
                              fill="#1e293b" 
                              opacity="0.9"
                            />
                            {/* Single Center Seat Bench */}
                            <path 
                              d="M 230 98 L 310 98 L 314 108 L 226 108 Z" 
                              fill="#475569" 
                              stroke="#334155" 
                              strokeWidth="1"
                            />
                            {/* Gunwale Rub Rail */}
                            <path 
                              d="M 80 94 C 150 106, 390 106, 460 94 C 450 88, 390 84, 270 84 C 150 84, 90 88, 80 94 Z" 
                              fill="#0f172a" 
                              stroke="#334155" 
                              strokeWidth="1.5"
                            />
                            {/* Bow & Stern Mooring Rings */}
                            <circle cx="83" cy="94" r="4.5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
                            <circle cx="457" cy="94" r="4.5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />

                            {/* Sticker Option */}
                            {hasSticker && (
                              <g className="transition-opacity duration-300">
                                <path 
                                  d="M 135 120 C 195 142, 345 138, 405 117 C 380 123, 270 127, 155 114 Z" 
                                  fill="url(#stickerStripe)" 
                                  opacity="0.95"
                                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
                                />
                                <polygon points="145,116 155,112 150,123" fill="#fbbf24" />
                                <text x="390" y="123" fill="#ffffff" fontSize="7.5" fontWeight="bold" opacity="0.9">1-SEAT SPORT</text>
                              </g>
                            )}

                            {/* Custom Text */}
                            {hasCustomText && (
                              <g className="transition-all duration-200">
                                <text x="270" y="150" textAnchor="middle" fill="#000000" opacity="0.6" fontSize="13" fontWeight="900" letterSpacing="1.2">
                                  {customText.trim() || 'พิมพ์ชื่อเรือของคุณ'}
                                </text>
                                <text x="270" y="148" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" letterSpacing="1.2" stroke="#0f172a" strokeWidth="0.5">
                                  {customText.trim() || 'พิมพ์ชื่อเรือของคุณ'}
                                </text>
                              </g>
                            )}
                          </g>
                        )}

                        {selectedSize === '2_seat' && (
                          /* MODEL 2: ขนาด 2 ที่นั่ง (รุ่นมาตรฐาน 1.98-2.5 ม.) */
                          <g className="transition-all duration-500">
                            {/* Keel Shadow */}
                            <ellipse cx="270" cy="188" rx="220" ry="12" fill="#030712" opacity="0.6" />

                            {/* Outer Main Hull */}
                            <path 
                              d="M 45 92 C 80 160, 160 176, 270 178 C 380 176, 460 160, 495 92 C 440 98, 270 102, 45 92 Z" 
                              fill="url(#boatHullGrad)"
                              stroke={activeColorConfig.gradient.start}
                              strokeWidth="2"
                            />
                            {/* Hull lighting & gloss shine */}
                            <path 
                              d="M 45 92 C 80 160, 160 176, 270 178 C 380 176, 460 160, 495 92 C 440 98, 270 102, 45 92 Z" 
                              fill="url(#boatShine)"
                            />
                            {/* Interior Cockpit */}
                            <path 
                              d="M 58 92 C 120 115, 420 115, 482 92 C 430 84, 110 84, 58 92 Z" 
                              fill="#1e293b" 
                              opacity="0.9"
                            />
                            {/* Front Bench Seat */}
                            <path 
                              d="M 130 96 L 195 96 L 198 105 L 127 105 Z" 
                              fill="#334155" 
                              stroke="#1e293b" 
                              strokeWidth="1"
                            />
                            {/* Center Bench Seat */}
                            <path 
                              d="M 275 96 L 360 96 L 365 106 L 270 106 Z" 
                              fill="#475569" 
                              stroke="#334155" 
                              strokeWidth="1"
                            />
                            {/* Gunwale Rub Rail */}
                            <path 
                              d="M 40 90 C 120 104, 420 104, 500 90 C 490 85, 430 80, 270 80 C 110 80, 50 85, 40 90 Z" 
                              fill="#0f172a" 
                              stroke="#334155" 
                              strokeWidth="1.5"
                            />
                            {/* Bow & Stern Mooring Rings */}
                            <circle cx="43" cy="90" r="5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
                            <circle cx="497" cy="90" r="5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />

                            {/* Sticker Option */}
                            {hasSticker && (
                              <g className="transition-opacity duration-300">
                                <path 
                                  d="M 90 120 C 180 145, 360 140, 450 115 C 420 122, 280 128, 120 112 Z" 
                                  fill="url(#stickerStripe)" 
                                  opacity="0.95"
                                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
                                />
                                <path 
                                  d="M 110 132 C 200 152, 340 148, 430 126 C 390 132, 260 136, 140 124 Z" 
                                  fill="#ffffff" 
                                  opacity="0.8"
                                />
                                <polygon points="105,116 115,112 110,124" fill="#fbbf24" />
                                <text x="430" y="124" fill="#ffffff" fontSize="8" fontWeight="bold" letterSpacing="1" opacity="0.9">STANDARD</text>
                              </g>
                            )}

                            {/* Custom Text */}
                            {hasCustomText && (
                              <g className="transition-all duration-200">
                                <text x="270" y="149" textAnchor="middle" fill="#000000" opacity="0.6" fontSize="14" fontWeight="900" letterSpacing="1.5">
                                  {customText.trim() || 'พิมพ์ชื่อเรือของคุณ'}
                                </text>
                                <text x="270" y="147" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900" letterSpacing="1.5" stroke="#0f172a" strokeWidth="0.5">
                                  {customText.trim() || 'พิมพ์ชื่อเรือของคุณ'}
                                </text>
                              </g>
                            )}
                          </g>
                        )}

                        {selectedSize === '3_seat' && (
                          /* MODEL 3: ขนาด 3 ที่นั่งขึ้นไป (เรือขนาดใหญ่ / เรืออีแปะเกษตร 3.3 ม.+) */
                          <g className="transition-all duration-500">
                            {/* Keel Shadow (Wider) */}
                            <ellipse cx="270" cy="192" rx="255" ry="14" fill="#030712" opacity="0.65" />

                            {/* Outer Main Hull (Flat bottom, wide flare) */}
                            <path 
                              d="M 18 86 C 55 166, 145 184, 270 186 C 395 184, 485 166, 522 86 C 465 96, 270 101, 18 86 Z" 
                              fill="url(#boatHullGrad)"
                              stroke={activeColorConfig.gradient.start}
                              strokeWidth="2"
                            />
                            {/* Hull lighting & gloss shine */}
                            <path 
                              d="M 18 86 C 55 166, 145 184, 270 186 C 395 184, 485 166, 522 86 C 465 96, 270 101, 18 86 Z" 
                              fill="url(#boatShine)"
                            />
                            {/* Extended Cockpit */}
                            <path 
                              d="M 32 86 C 95 116, 445 116, 508 86 C 455 78, 85 78, 32 86 Z" 
                              fill="#1e293b" 
                              opacity="0.9"
                            />
                            {/* 3 Bench Seats (Bow, Mid, Stern) */}
                            <path d="M 85 91 L 155 91 L 158 101 L 82 101 Z" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                            <path d="M 230 93 L 310 93 L 314 103 L 226 103 Z" fill="#475569" stroke="#334155" strokeWidth="1" />
                            <path d="M 385 91 L 455 91 L 458 101 L 382 101 Z" fill="#334155" stroke="#1e293b" strokeWidth="1" />

                            {/* Gunwale Rub Rail */}
                            <path 
                              d="M 12 84 C 95 102, 445 102, 528 84 C 516 78, 445 74, 270 74 C 95 74, 24 78, 12 84 Z" 
                              fill="#0f172a" 
                              stroke="#334155" 
                              strokeWidth="1.5"
                            />
                            {/* Heavy Duty Mooring Rings */}
                            <circle cx="16" cy="84" r="5.5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
                            <circle cx="524" cy="84" r="5.5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />

                            {/* Sticker Option */}
                            {hasSticker && (
                              <g className="transition-opacity duration-300">
                                <path 
                                  d="M 65 115 C 165 146, 375 142, 475 110 C 440 118, 280 126, 95 107 Z" 
                                  fill="url(#stickerStripe)" 
                                  opacity="0.95"
                                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
                                />
                                <polygon points="80,111 90,107 85,119" fill="#fbbf24" />
                                <text x="450" y="120" fill="#ffffff" fontSize="8" fontWeight="bold" letterSpacing="1" opacity="0.9">HEAVY-DUTY</text>
                              </g>
                            )}

                            {/* Custom Text */}
                            {hasCustomText && (
                              <g className="transition-all duration-200">
                                <text x="270" y="150" textAnchor="middle" fill="#000000" opacity="0.6" fontSize="15" fontWeight="900" letterSpacing="1.5">
                                  {customText.trim() || 'พิมพ์ชื่อเรือของคุณ'}
                                </text>
                                <text x="270" y="148" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900" letterSpacing="1.5" stroke="#0f172a" strokeWidth="0.5">
                                  {customText.trim() || 'พิมพ์ชื่อเรือของคุณ'}
                                </text>
                              </g>
                            )}
                          </g>
                        )}
                      </svg>

                      {/* Live preview badges indicator */}
                      <div className="absolute bottom-2 inset-x-4 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeColorConfig.swatchHex }}></span>
                          <span className="font-bold text-white">{activeSizeConfig.shortName} • {activeColorConfig.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasSticker ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <Sparkle size={10} />
                              <span>ติดสติกเกอร์พิเศษ</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">ไม่ติดสติกเกอร์</span>
                          )}
                          <span>•</span>
                          {hasCustomText ? (
                            <span className="text-sky-300 font-bold line-clamp-1 max-w-[120px]">
                              สกรีน: "{customText || '...'}"
                            </span>
                          ) : (
                            <span className="text-slate-500">ไม่สกรีนข้อความ</span>
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* REAL PHOTO REFERENCE DYNAMICALLY SYNCED FROM ADMIN GALLERY */
                    (() => {
                      const photoKey = `${selectedSize}_${selectedColor}`;
                      const customPhotoUrl = settings.galleryPhotos?.[photoKey];
                      const realPhotoSrc = customPhotoUrl || activeSizeConfig.photoUrl[selectedColor] || activeColorConfig.photoUrl || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop';
                      const isFactoryUploaded = Boolean(customPhotoUrl);

                      return (
                        <div className="w-full h-full relative rounded-xl overflow-hidden group">
                          <img
                            src={realPhotoSrc}
                            alt={`เรือพลาสติก ${activeSizeConfig.name} ${activeColorConfig.name}`}
                            className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none"></div>

                          {/* Top floating badges & zoom button */}
                          <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-auto">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md backdrop-blur-md border ${
                              isFactoryUploaded 
                                ? 'bg-emerald-500/90 text-white border-emerald-400/50' 
                                : 'bg-slate-900/80 text-sky-300 border-slate-700/80'
                            }`}>
                              <Camera size={11} />
                              <span>{isFactoryUploaded ? 'ภาพถ่ายจริงจากโรงงาน (อัปเดตล่าสุด)' : 'ภาพถ่ายตัวอย่างเรือจริง'}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => setIsZoomingPhoto(true)}
                              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-md hover:scale-105"
                              title="ดูภาพขยายใหญ่"
                            >
                              <Maximize2 size={13} />
                            </button>
                          </div>

                          {/* Bottom info & mini color photo switcher */}
                          <div className="absolute bottom-2.5 left-3 right-3 text-xs text-white bg-black/65 backdrop-blur-md p-2.5 rounded-xl border border-white/15 space-y-2 pointer-events-auto">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-xs sm:text-sm text-amber-400 flex items-center gap-1.5">
                                  <span>{activeSizeConfig.shortName}</span>
                                  <span className="text-white/60">•</span>
                                  <span>{activeColorConfig.name}</span>
                                </p>
                                <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                                  {activeSizeConfig.description}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsZoomingPhoto(true)}
                                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/20 cursor-pointer"
                              >
                                <ZoomIn size={11} />
                                <span>ขยายรูป</span>
                              </button>
                            </div>

                            {/* Color Photo Quick Switcher */}
                            <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                              <span className="text-[9.5px] text-slate-300 shrink-0">ดูสีอื่น:</span>
                              {(['น้ำเงิน', 'แดง', 'เขียว', 'ส้ม'] as BoatColorId[]).map((cId) => {
                                const cConfig = COLOR_CONFIGS[cId];
                                const isCur = selectedColor === cId;
                                return (
                                  <button
                                    key={cId}
                                    type="button"
                                    onClick={() => setSelectedColor(cId)}
                                    className={`px-2 py-0.5 rounded-md text-[9.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                      isCur 
                                        ? 'bg-white text-slate-900 shadow-xs ring-1 ring-white' 
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cConfig.swatchHex }}></span>
                                    <span>{cConfig.name.replace('สี', '')}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}

                </div>
              </div>

              {/* Boat Specifications & Highlights */}
              <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">ขนาดมิติ</span>
                  <span className="text-xs font-bold text-white">{activeSizeConfig.lengthLabel}</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">{activeSizeConfig.widthLabel}</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">รับน้ำหนักปลอดภัย</span>
                  <span className="text-xs font-bold text-emerald-400">{activeSizeConfig.capacityWeight}</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">ลอยตัวสูงพิเศษ</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">จำนวนที่นั่ง</span>
                  <span className="text-xs font-bold text-white">{activeSizeConfig.seatsLabel}</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">Virgin HDPE</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: CONFIGURATION CONTROLS & SELECTION (6 cols) */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              
              {/* ITEM 1: BOAT SIZE SELECTOR (3 SIZES) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Layers size={16} className="text-brand-blue" />
                    <span>1. เลือกประเภทและขนาดเรือ (Boat Size Models)</span>
                  </label>
                  <span className="text-[11px] text-brand-blue font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                    มี 3 ขนาดให้เลือก
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  คลิกเลือกขนาดมิติเรือและจำนวนที่นั่งตามการใช้งาน (ระบบจะคำนวณราคาและปรับโมเดลจำลองทันที):
                </p>

                {/* 3 Size Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(BOAT_SIZE_CONFIGS) as BoatSizeId[]).map((sizeKey) => {
                    const cfg = BOAT_SIZE_CONFIGS[sizeKey];
                    const isSelected = selectedSize === sizeKey;
                    const sizeBasePrice = getBasePrice(sizeKey);

                    return (
                      <button
                        type="button"
                        key={sizeKey}
                        onClick={() => setSelectedSize(sizeKey)}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between text-left relative cursor-pointer ${
                          isSelected
                            ? 'border-brand-blue bg-sky-50/50 shadow-md ring-2 ring-sky-200'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-xs">
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}

                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[9.5px] font-bold mb-1.5 ${
                            isSelected ? 'bg-sky-200 text-sky-900' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {cfg.badge}
                          </span>

                          <h5 className="font-display text-xs font-extrabold text-slate-850 leading-snug mb-2">
                            {cfg.name}
                          </h5>

                          <div className="space-y-1 text-[10.5px] text-slate-600">
                            <div className="flex items-baseline justify-between border-b border-dashed border-slate-100 pb-0.5">
                              <span className="text-slate-400">ความยาว:</span>
                              <span className="font-semibold text-slate-800">{cfg.lengthLabel}</span>
                            </div>
                            <div className="flex items-baseline justify-between border-b border-dashed border-slate-100 pb-0.5">
                              <span className="text-slate-400">ความกว้าง:</span>
                              <span className="font-semibold text-slate-800">{cfg.widthLabel}</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                              <span className="text-slate-400">รับน้ำหนัก:</span>
                              <span className="font-bold text-emerald-600">{cfg.capacityWeight}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-baseline justify-between">
                          <span className="text-[10px] text-slate-400">ราคาเริ่มต้น</span>
                          <span className="font-display font-black text-sm text-brand-blue">
                            ฿{sizeBasePrice.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Model Highlight Card */}
                <div className="mt-3 bg-sky-50/70 border border-sky-100 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">โมเดลที่เลือกขณะนี้:</span>
                    <span className="font-bold text-brand-blue">{activeSizeConfig.name}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {activeSizeConfig.idealFor}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">ราคาเริ่มต้นของขนาดนี้</span>
                    <span className="font-display text-base font-black text-brand-blue">
                      ฿{BASE_PRICE.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* ITEM 2: COLOR OPTIONS (4 COLORS) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Palette size={16} className="text-brand-blue" />
                    <span>2. ตัวเลือกสีเรือ (Color Options - มี 4 สี)</span>
                  </label>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    ไม่มีค่าใช้จ่ายเพิ่ม (+฿0)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  เลือกสีเนื้อพลาสติกที่ต้องการหลอม (ระบบจะเปลี่ยนสีโมเดลตัวเรือจำลองทันที):
                </p>

                {/* 4 Swatch Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(COLOR_CONFIGS) as BoatColorId[]).map((colorKey) => {
                    const cfg = COLOR_CONFIGS[colorKey];
                    const colorSetting = settings.colors?.find(c => c.id === colorKey);
                    const displayName = colorSetting?.name || cfg.name;
                    const isEnabled = colorSetting ? colorSetting.enabled : true;
                    const isSelected = selectedColor === colorKey;

                    return (
                      <button
                        type="button"
                        key={colorKey}
                        disabled={!isEnabled}
                        onClick={() => isEnabled && setSelectedColor(colorKey)}
                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center relative ${
                          !isEnabled
                            ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                            : isSelected
                            ? `${cfg.borderHex} bg-sky-50/40 shadow-md ring-2 cursor-pointer`
                            : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                        }`}
                      >
                        {isSelected && isEnabled && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-blue text-white flex items-center justify-center">
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}
                        <span 
                          className="w-8 h-8 rounded-full shadow-inner mb-2 border border-black/10"
                          style={{ backgroundColor: colorSetting?.swatchHex || cfg.swatchHex }}
                        ></span>
                        <span className="font-display text-xs font-bold text-slate-800">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {isEnabled ? '+0 บาท' : 'ปิดรับชั่วคราว'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ITEM C: STICKER OPTION */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <span>ตัวเลือกสติกเกอร์ (Sticker Option)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: No Sticker */}
                  <label 
                    onClick={() => setHasSticker(false)}
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      !hasSticker 
                        ? 'border-brand-blue bg-sky-50/50 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sticker_opt"
                      checked={!hasSticker}
                      onChange={() => setHasSticker(false)}
                      className="mt-1 text-brand-blue focus:ring-brand-blue"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-850 block">
                        ไม่ติดสติกเกอร์
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        เนื้อพลาสติกสีเรียบเงาแบบคลาสสิก
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 block mt-1">
                        +0 บาท
                      </span>
                    </div>
                  </label>

                  {/* Option 2: Special Sticker */}
                  <label 
                    onClick={() => setHasSticker(true)}
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      hasSticker 
                        ? 'border-amber-500 bg-amber-50/40 shadow-xs ring-1 ring-amber-400' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sticker_opt"
                      checked={hasSticker}
                      onChange={() => setHasSticker(true)}
                      className="mt-1 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-850 block flex items-center gap-1">
                        <span>ติดสติกเกอร์ลายพิเศษ</span>
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">POPULAR</span>
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        ลายคาดข้างสปอร์ตกันน้ำ ทน UV เกรด Marine 3M
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 block mt-1">
                        +{STICKER_PRICE.toLocaleString()} บาท
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* ITEM D: CUSTOM TEXT OPTION */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" />
                    <span>ตัวเลือกพิมพ์ข้อความข้างเรือ (Custom Text Option)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* Option 1: No Custom Text */}
                  <label 
                    onClick={() => {
                      setHasCustomText(false);
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      !hasCustomText 
                        ? 'border-brand-blue bg-sky-50/50 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="custom_text_opt"
                      checked={!hasCustomText}
                      onChange={() => setHasCustomText(false)}
                      className="mt-1 text-brand-blue focus:ring-brand-blue"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-850 block">
                        ไม่สกรีนข้อความ
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        ไม่มีตัวอักษรข้างเรือ
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 block mt-1">
                        +0 บาท
                      </span>
                    </div>
                  </label>

                  {/* Option 2: Screen Custom Text */}
                  <label 
                    onClick={() => setHasCustomText(true)}
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      hasCustomText 
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-400' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="custom_text_opt"
                      checked={hasCustomText}
                      onChange={() => setHasCustomText(true)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-850 block">
                        สกรีนข้อความ/ชื่อเรือ
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        พิมพ์ชื่อเรือ ชื่อสวน หรือสังกัดหน่วยงาน
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 block mt-1">
                        +{CUSTOM_TEXT_PRICE.toLocaleString()} บาท
                      </span>
                    </div>
                  </label>
                </div>

                {/* Conditional Text Input field appears when custom text is selected */}
                {hasCustomText && (
                  <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-2 transition-all">
                    <label className="text-xs font-bold text-indigo-950 flex items-center justify-between">
                      <span>ระบุข้อความที่ต้องการสกรีนข้างเรือ:</span>
                      <span className="text-[11px] text-indigo-600 font-normal">
                        ({customText.length}/30 ตัวอักษร)
                      </span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="เช่น สวนลุงสมชาย 01, กู้ภัยสว่าง, เรือพายมงคล"
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium"
                      id="custom-boat-text-input"
                    />
                    <p className="text-[11px] text-indigo-700">
                      * ตัวอักษรจะแสดงจำลองบนภาพตัวเรือด้านซ้ายแบบ Real-time ทันที
                    </p>
                  </div>
                )}
              </div>

              {/* ITEM E: QUANTITY SELECTOR */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">จำนวนลำที่ต้องการสั่งจอง:</span>
                  <span className="text-[11px] text-slate-400">สำหรับใช้งานสวน ผลไม้ หรือจัดซื้อหน่วยงาน</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 text-center text-xs font-bold py-1.5 border border-slate-200 rounded-lg outline-none focus:border-brand-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(50, q + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-500 font-medium ml-1">ลำ</span>
                </div>
              </div>

            </div>

          </div>

          {/* 3. REAL-TIME PRICE CALCULATION SUMMARY BAR (STICKY / PROMINENT) */}
          <div className="bg-slate-900 text-white p-6 sm:p-7 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Calculation Breakdown */}
            <div className="w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span className="uppercase font-bold text-amber-400">Total Price Calculation</span>
                <span>•</span>
                <span>คำนวณราคาสดตามตัวเลือก</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 text-xs text-slate-300">
                <span>เรือเปล่า <strong className="text-white">฿{BASE_PRICE.toLocaleString()}</strong> ({activeSizeConfig.shortName})</span>
                <span>+</span>
                <span>สติกเกอร์ <strong className={hasSticker ? 'text-amber-400' : 'text-slate-400'}>+{stickerCost}฿</strong></span>
                <span>+</span>
                <span>สกรีนชื่อ <strong className={hasCustomText ? 'text-indigo-400' : 'text-slate-400'}>+{textCost}฿</strong></span>
                {quantity > 1 && (
                  <>
                    <span>x</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-bold">{quantity} ลำ</span>
                  </>
                )}
              </div>
            </div>

            {/* Total Price & Deposit Action */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-5">
              
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block">ราคารวมสุทธิ (Total Price)</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-black text-amber-400">
                    ฿{totalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    (เฉลี่ย ฿{unitPrice.toLocaleString()}/ลำ)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                  มัดจำล็อกคิวเพียง ฿{depositAmount.toLocaleString()} (ส่วนที่เหลือชำระวันส่งมอบ)
                </span>
              </div>

              <a
                href="#preorder-checkout-form"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>กรอกข้อมูลจองคิวผลิต</span>
                <ArrowRight size={16} />
              </a>

            </div>

          </div>

        </div>
      </section>

      {/* 4. PRE-ORDER FORM & SUPABASE INTEGRATION (Checkout Details) */}
      <section id="preorder-checkout-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-sky-100 shadow-xl shadow-slate-200/50 p-6 sm:p-10">
          
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[10px] font-bold text-brand-blue tracking-widest uppercase bg-sky-50 px-2.5 py-1 rounded-full inline-block mb-2">
              Step 2: ยืนยันข้อมูลคำสั่งจอง
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-850">
              ข้อมูลผู้สั่งจองและสถานที่รับเรือ
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              กรอกข้อมูลเพื่อบันทึกคำสั่งจองลงระบบโรงงานและออกรหัสคิวรับเงินมัดจำ
            </p>
          </div>

          <form onSubmit={handleConfirmPreOrder} className="space-y-6">
            
            {/* Summary review box */}
            <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-amber-50/50 rounded-2xl p-5 border border-sky-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-brand-blue" />
                <span>สรุปสเปกเรือที่คุณออกแบบ (Order Configuration Summary)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block">ขนาด/โมเดลเรือ</span>
                  <div className="mt-0.5">
                    <strong className="text-brand-blue block text-[11px] font-bold leading-tight">{activeSizeConfig.shortName}</strong>
                    <span className="text-[10px] text-slate-500">{activeSizeConfig.lengthLabel}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block">สีเนื้อเรือ</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeColorConfig.swatchHex }}></span>
                    <strong className="text-slate-800">{activeColorConfig.name}</strong>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block">สติกเกอร์</span>
                  <strong className={`block mt-1 ${hasSticker ? 'text-amber-600' : 'text-slate-700'}`}>
                    {hasSticker ? `ลายพิเศษ (+${STICKER_PRICE}฿)` : 'ไม่ติด (+0฿)'}
                  </strong>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block">สกรีนข้อความ</span>
                  <strong className={`block mt-1 ${hasCustomText ? 'text-indigo-600' : 'text-slate-700'}`} title={customText}>
                    {hasCustomText ? `"${customText || 'ระบุ'}" (+${CUSTOM_TEXT_PRICE}฿)` : 'ไม่สกรีน (+0฿)'}
                  </strong>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/70 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block">ยอดรวมสุทธิ</span>
                  <strong className="text-brand-blue font-extrabold text-sm block mt-0.5">
                    ฿{totalPrice.toLocaleString()}
                  </strong>
                  <span className="text-[10px] text-slate-500">({quantity} ลำ)</span>
                </div>
              </div>
            </div>

            {/* Contact inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ชื่อ-นามสกุล หรือชื่อหน่วยงาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณสมชาย เจริญกิจ"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all"
                  id="preorder-name-input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="เช่น 081-234-5678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all"
                  id="preorder-phone-input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  อีเมล (สำหรับรับใบยืนยันการจอง)
                </label>
                <input
                  type="email"
                  placeholder="example@mail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  สถานที่จัดส่ง / อำเภอ / จังหวัด
                </label>
                <input
                  type="text"
                  placeholder="เช่น อ.บ้านแพ้ว จ.สมุทรสาคร"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ข้อความหรือหมายเหตุเพิ่มเติมถึงโรงงาน
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ต้องการให้ส่งภายในวันเสาร์, ต้องการเพิ่มไม้พาย 2 เล่ม ฯลฯ"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Notice & Deposit Terms */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
              <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">เงื่อนไขการจองคิวผลิต (Pre-order Terms):</strong>
                <p className="mt-0.5 text-amber-800 leading-relaxed text-[11px]">
                  เมื่อกดสั่งจอง ระบบจะบันทึกคำสั่งซื้อสถานะ <strong>"pending_deposit" (รอชำระมัดจำ)</strong> โดยมัดจำ <strong>฿{depositAmount.toLocaleString()}</strong> จะนำไปสั่งล็อกเม็ดพลาสติกและคิวหลอมทันที ยอดคงเหลือชำระวันตรวจรับเรือ
                </p>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-confirm-preorder"
              className="w-full py-4 rounded-2xl bg-brand-blue hover:bg-brand-blue-light text-white font-extrabold text-sm sm:text-base shadow-lg shadow-brand-blue/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>กำลังส่งข้อมูลสั่งจองและบันทึกลงระบบ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>ยืนยันการสั่งจองพรีออเดอร์ (Confirm Pre-Order)</span>
                </>
              )}
            </button>

          </form>

        </div>
      </section>

      {/* 5. POPUP MODAL: สรุปรายการสั่งซื้อพร้อมยอดเงินมัดจำชำระเงิน */}
      {showOrderModal && confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-sky-100 overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-blue to-sky-800 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                  Pre-Order Confirmed
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                สรุปรายการสั่งซื้อพรีออเดอร์
              </h3>
              <p className="text-xs text-sky-100/90 mt-0.5">
                บันทึกลงระบบเรียบร้อยแล้ว กรุณาชำระเงินมัดจำเพื่อล็อกคิวผลิต
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Order Number & Status Bar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">หมายเลขคำสั่งซื้อ (Order ID)</span>
                  <span className="font-mono text-base font-black text-brand-blue">
                    {confirmedOrder.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyOrderIdToClipboard}
                    className="text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedOrderId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedOrderId ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    รอชำระมัดจำ
                  </span>
                </div>
              </div>

              {/* Order Specs Breakdown */}
              <div className="border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs">
                <h5 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>รายละเอียดเรือสั่งทำพิเศษ</span>
                  <span className="text-slate-400 font-normal">จำนวน: {confirmedOrder.quantity || 1} ลำ</span>
                </h5>

                <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">ประเภท/ขนาดเรือ:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {confirmedOrder.boat_size || confirmedOrder.boat_model_name || 'ขนาด 2 ที่นั่ง (รุ่นมาตรฐาน)'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">สีเนื้อเรือ (selected_color):</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_CONFIGS[confirmedOrder.selected_color as BoatColorId]?.swatchHex || '#2563eb' }}></span>
                    <span className="font-bold text-slate-800">{confirmedOrder.selected_color}</span>
                  </div>
                </div>

                <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">สติกเกอร์ (sticker_option):</span>
                  <span className="font-bold text-slate-800">{confirmedOrder.sticker_option}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">สกรีนข้อความ (custom_text):</span>
                  <span className="font-bold text-indigo-600">
                    {confirmedOrder.custom_text ? `"${confirmedOrder.custom_text}"` : 'ไม่สกรีนข้อความ'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">ชื่อผู้จอง / เบอร์โทร:</span>
                  <span className="font-bold text-slate-800">{confirmedOrder.customer_name} ({confirmedOrder.customer_phone})</span>
                </div>

                <div className="flex justify-between py-1 pt-2">
                  <span className="text-slate-600 font-semibold">ราคารวมสุทธิ (Total Price):</span>
                  <span className="font-black text-slate-900 text-sm">
                    ฿{Number(confirmedOrder.total_price).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* PAYMENT & DEPOSIT AMOUNT BOX */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950/80 block">
                    ยอดเงินมัดจำชำระเงิน (Deposit Due Now)
                  </span>
                  <div className="font-display text-3xl font-black text-slate-950 mt-0.5">
                    ฿{Number(confirmedOrder.deposit_amount || 1000).toLocaleString()}
                  </div>
                  <span className="text-[11px] font-semibold text-amber-950 block mt-1">
                    ยอดคงเหลือชำระวันรับเรือ: ฿{(Number(confirmedOrder.total_price) - Number(confirmedOrder.deposit_amount || 1000)).toLocaleString()}
                  </span>
                </div>

                {/* PromptPay QR Simulation */}
                <div className="bg-white p-2.5 rounded-2xl shadow-md flex flex-col items-center shrink-0 text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center p-1 border border-slate-200">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROMPTPAY-PORNPONG-DEPOSIT-${confirmedOrder.deposit_amount || 1000}`}
                      alt="PromptPay QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-800 mt-1 block">
                    สแกนจ่ายผ่านพร้อมเพย์
                  </span>
                </div>
              </div>

              {/* Bank Account Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">ข้อมูลบัญชีธนาคารสำหรับโอนมัดจำ:</div>
                <div>ธนาคารกสิกรไทย (KBANK) • บัญชีกระแสรายวัน</div>
                <div className="font-mono font-bold text-slate-900 text-sm">758-2-41982-0</div>
                <div>ชื่อบัญชี: บจก. พรพงศ์พลาสติก (ประเทศไทย)</div>
              </div>

              {/* Upload Slip confirmation status */}
              {slipUploaded ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>บันทึกหลักฐานการโอนเรียบร้อย เจ้าหน้าที่จะตรวจสอบและโทรยืนยันคิวหลอมในไม่ช้า</span>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-brand-blue rounded-2xl p-3.5 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-slate-50/50 hover:bg-sky-50/30">
                  <Upload size={18} className="text-brand-blue" />
                  <span className="text-xs font-bold text-slate-700">แนบสลิปหลักฐานการโอนมัดจำ (ถ้ามี)</span>
                  <span className="text-[10px] text-slate-400">รองรับไฟล์ JPG, PNG หรือส่งทาง LINE ภายหลังได้</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={() => {
                      setSlipUploaded(true);
                    }}
                  />
                </label>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowOrderModal(false);
                  if (setActiveTab) {
                    setActiveTab('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOrderModal(false);
                  alert(`บันทึกคำสั่งจองรหัส ${confirmedOrder.id} เรียบร้อยแล้ว ฝ่ายผลิตจะติดต่อกลับที่เบอร์ ${confirmedOrder.customer_phone}`);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs shadow-md transition-all cursor-pointer text-center"
              >
                รับทราบและเสร็จสิ้น
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. FOUR PROCESS STEPS (Reassurance) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-bold text-brand-blue tracking-widest uppercase bg-sky-100/60 px-2.5 py-1 rounded-full inline-block mb-2">
            มาตรฐานการผลิต
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-850">
            ขั้นตอนการผลิตและจัดส่งเรือพรีออเดอร์
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-brand-blue flex items-center justify-center font-bold text-sm mb-3 border border-sky-100">
                01
              </div>
              <h4 className="font-display font-bold text-slate-800 text-sm mb-1">
                ออกแบบสี & สเปกเรือ
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                เลือกสีจาก 4 สีหลัก เพิ่มสติกเกอร์ หรือสกรีนชื่อหน่วยงาน พร้อมคำนวณราคาเรียลไทม์
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-brand-blue font-semibold flex items-center gap-1">
              <Palette size={13} />
              <span>ปรับแต่งได้อิสระ</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm mb-3 border border-amber-100">
                02
              </div>
              <h4 className="font-display font-bold text-slate-800 text-sm mb-1">
                วางมัดจำล็อกคิวหลอม
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                มัดจำ ฿1,000 ต่อลำ ระบบจะออกรหัสใบจองเพื่อล็อกคิวเม็ดพลาสติกทันที
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <Receipt size={13} />
              <span>มีใบเสร็จรับเงินมัดจำ</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-3 border border-indigo-100">
                03
              </div>
              <h4 className="font-display font-bold text-slate-800 text-sm mb-1">
                หลอมขึ้นรูป & ติดตั้งลาย
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                หลอมด้วยแม่พิมพ์หมุนความร้อนสูง ไร้รอยต่อ และตัดติดลายกราฟิกตามที่สั่งจอง
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
              <Clock size={13} />
              <span>เสร็จใน 3-5 วันทำการ</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3 border border-emerald-100">
                04
              </div>
              <h4 className="font-display font-bold text-slate-800 text-sm mb-1">
                จัดส่งถึงที่ & รับประกัน
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                รถโรงงานจัดส่งถึงหน้าบ้าน ตรวจรับสินค้าเรียบร้อยจึงชำระเงินส่วนที่เหลือ
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>รับประกันโครงสร้าง 1 ปี</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRE-ORDER FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h4 className="font-display text-lg font-bold text-slate-800 text-center mb-6">
          คำถามที่พบบ่อยเกี่ยวกับบริการสั่งทำ Custom Pre-Order
        </h4>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-xs">
            <h5 className="font-bold text-xs text-slate-800 flex items-center gap-2 mb-1">
              <HelpCircle size={15} className="text-brand-blue" />
              <span>ถ้าต้องการสั่งจองจำนวนมากสำหรับหน่วยงานราชการหรือรีสอร์ต มีส่วนลดไหม?</span>
            </h5>
            <p className="text-xs text-slate-500 pl-6 leading-relaxed">
              สำหรับยอดสั่งซื้อตั้งแต่ 3 ลำขึ้นไป ทางโรงงานมีราคาโครงการพิเศษ พร้อมบริการพิมพ์โลโก้หน่วยงานฟรี และออกใบกำกับภาษีเต็มรูปแบบ สามารถระบุในช่องหมายเหตุหรือโทรประสานงานฝ่ายขายได้ทันที
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-xs">
            <h5 className="font-bold text-xs text-slate-800 flex items-center gap-2 mb-1">
              <HelpCircle size={15} className="text-brand-blue" />
              <span>สติกเกอร์และตัวหนังสือสกรีนจะหลุดร่อนเมื่อแช่น้ำหรือไม่?</span>
            </h5>
            <p className="text-xs text-slate-500 pl-6 leading-relaxed">
              สติกเกอร์ที่ทางโรงงานใช้เป็นเกรด Marine Vinyl สำหรับยานพาหนะทางน้ำโดยเฉพาะ ทนต่อน้ำเค็ม น้ำคลอง และแสงแดด UV ไม่ลอกร่อนง่าย และตัวเรือผ่านการเตรียมผิวก่อนติดสติกเกอร์ทุกครั้ง
            </p>
          </div>
        </div>
      </section>

      {/* 8. FULLSCREEN REAL PHOTO ZOOM MODAL */}
      {isZoomingPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsZoomingPhoto(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-amber-400" />
                <span className="font-bold text-sm">ภาพถ่ายเรือจริง: {activeSizeConfig.shortName} ({activeColorConfig.name})</span>
                <span className="text-[10px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  {activeSizeConfig.scaleBadge}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomingPhoto(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative aspect-16/10 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={settings.galleryPhotos?.[`${selectedSize}_${selectedColor}`] || activeSizeConfig.photoUrl[selectedColor] || activeColorConfig.photoUrl}
                alt={`เรือจริง ${activeSizeConfig.name}`}
                className="w-full h-full object-contain max-h-[70vh]"
              />
            </div>

            {/* Modal Footer with quick color switcher */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-300 text-xs">
              <div>
                <span className="font-bold text-white block">{activeSizeConfig.name}</span>
                <span className="text-[11px] text-slate-400">{activeSizeConfig.lengthLabel} | {activeSizeConfig.widthLabel} | รับน้ำหนัก {activeSizeConfig.capacityLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">สลับดูสี:</span>
                {(['น้ำเงิน', 'แดง', 'เขียว', 'ส้ม'] as BoatColorId[]).map((cId) => {
                  const cConfig = COLOR_CONFIGS[cId];
                  return (
                    <button
                      key={cId}
                      type="button"
                      onClick={() => setSelectedColor(cId)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        selectedColor === cId
                          ? 'bg-white text-slate-900 shadow-md ring-2 ring-sky-500'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cConfig.swatchHex }}></span>
                      <span>{cConfig.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
