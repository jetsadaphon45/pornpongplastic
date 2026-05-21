import React from 'react';
import { X, Star, Ruler, Weight, UserCheck, ShieldOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color: string, quantity: number) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = React.useState<string>('');
  const [selectedColor, setSelectedColor] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState<number>(1);
  const [successMsg, setSuccessMsg] = React.useState<boolean>(false);

  // Sync state with selected product
  React.useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0]);
      setSelectedColor(product.colors[0]?.name || 'สีปกติ');
      setQuantity(1);
      setSuccessMsg(false);
    }
  }, [product]);

  if (!product) return null;

  const formatPrice = (val: number) => {
    return val.toLocaleString('th-TH') + ' ฿';
  };

  const handleAdd = () => {
    onAddToCart(product, selectedColor, quantity);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
    }, 2500);
  };

  const colorsToRender = product.colors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 font-sans overflow-y-auto">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Main Container Body */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh] overflow-y-auto z-10 animate-scaleUp">
        
        {/* Close Button top-right */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 focus:outline-none cursor-pointer transition-colors"
          id="close-product-modal"
        >
          <X size={18} />
        </button>

        {/* Column 1: Media Preview Container */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-between bg-slate-50 border-r border-slate-100">
          <div>
            {/* Big active Image with safety ratio */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 shadow-inner">
              <img
                src={selectedImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-300"
              />
              <div className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur-xs text-[10px] text-white py-0.5 px-2 rounded-md">
                รูปถ่ายจากสินค้างานติดตั้งจริง
              </div>
            </div>

            {/* Thumbnails row */}
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-slate-100 transition-all cursor-pointer ${
                      selectedImage === img ? 'border-brand-blue shadow-xs' : 'border-transparent opacity-80'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      referrerPolicy="no-referrer" 
                      className="h-full w-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Technical properties snippet grid */}
          <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue shrink-0">
                <Ruler size={14} />
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">สัดส่วนเรือ</span>
                <span className="font-semibold">{product.length ? `ยาว ${product.length} x กว้าง ${product.width || '-'}` : 'ตามระบุ'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue shrink-0">
                <Weight size={14} />
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">น้ำหนักตัวเรือ</span>
                <span className="font-semibold">{product.weight || 'ตามระบุ'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue shrink-0">
                <UserCheck size={14} />
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">รับน้ำหนักได้สูงสุด</span>
                <span className="font-semibold text-emerald-600">{product.capacity || 'ไม่ระบุ'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue shrink-0">
                <Sparkles size={14} className="text-amber-500" />
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">วัสดุพรีเมียม</span>
                <span className="font-semibold">HDPE ลุยแรงกระแทก</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Information Purchase Console */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header section name & badge */}
            <div>
              <span className="text-[10px] font-sans font-bold tracking-wider text-brand-blue uppercase bg-sky-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                {product.categoryThai}
              </span>
              <h1 className="font-display text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                {product.name}
              </h1>
              
              {/* Star Rating snippet */}
              <div className="flex items-center gap-2 mt-1 px-0.5">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-sans">
                  {product.rating.toFixed(1)} คะแนนรีวิว ({product.reviewCount} คนซื้อจริง)
                </span>
              </div>
            </div>

            {/* Description & specs story block */}
            <div className="text-xs sm:text-sm text-slate-500 space-y-2 leading-relaxed text-justify">
              <p className="font-semibold text-slate-700">{product.description}</p>
              <p className="text-xs text-slate-400">{product.longDescription}</p>
            </div>

            {/* Hard bullet benefits list inside scroll container */}
            <div className="bg-sky-50/40 p-3.5 rounded-xl border border-sky-100 flex flex-col gap-1.5">
              <h4 className="text-[11px] font-extrabold text-brand-blue uppercase tracking-wider mb-1">จุดเด่นสำคัญ</h4>
              {product.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 size={13} className="text-brand-blue shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Color selection circles with text state */}
            {colorsToRender.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">เลือกโทนสีเกียร์เดคคอร์: <span className="text-brand-blue font-bold text-xs bg-sky-50 px-2 py-0.5 rounded-md">{selectedColor}</span></span>
                <div className="flex gap-2.5">
                  {colorsToRender.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                        selectedColor === c.name 
                          ? 'border-brand-blue scale-110 ring-2 ring-sky-100' 
                          : 'border-slate-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Cart Action Trigger */}
          <div className="mt-8 pt-5 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 font-sans">ราคาวางสั่งซื้อพรีเซลส์</span>
              <div className="text-right">
                {product.originalPrice > product.price && (
                  <span className="text-xs text-slate-400 line-through mr-2">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="font-display text-xl sm:text-2xl font-extrabold text-red-500">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Quantity Changer */}
              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-55 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-bold transition-all cursor-pointer text-xs"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-slate-850 w-8 text-center bg-white h-full flex items-center justify-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-bold transition-all cursor-pointer text-xs"
                >
                  +
                </button>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-display font-medium text-xs sm:text-sm py-2 px-4 shadow-md transition-all duration-200 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 active:scale-98 relative overflow-hidden"
                id="modal-add-to-cart-btn"
              >
                {successMsg ? (
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 size={16} />
                    <span>เพิ่มลงรถเข็นเรียบร้อย!</span>
                  </div>
                ) : (
                  <>
                    <span>เพิ่มลงตะกร้า {quantity} ลำ</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
