import React from 'react';
import { Star, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, color: string) => void;
}

export default function ProductCard({ product, onSelect, onAddToCart }: ProductCardProps) {
  const [successMsg, setSuccessMsg] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Default to the first color choice of the product
    const defaultColor = product.colors.length > 0 ? product.colors[0].name : 'สีมาตรฐาน';
    onAddToCart(product, defaultColor);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
    }, 2000);
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString('th-TH') + ' ฿';
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-blue hover:shadow-lg hover:shadow-sky-100/50 cursor-pointer"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Panel */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
        />

        {/* Rating Bubble */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-slate-800 shadow-xs">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <span>{product.rating.toFixed(1)}</span>
        </div>

        {/* Discount Badge */}
        {product.discountRate && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-red-500 px-2 py-0.5 text-xs font-extrabold text-white uppercase tracking-wider shadow-xs animate-pulse">
            <Sparkles size={11} />
            <span>ลด {product.discountRate}%</span>
          </div>
        )}

        {/* Out of stock Banner */}
        {(product.status === 'outofstock' || (!product.inStock && product.status !== 'preorder')) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-display font-medium text-white shadow-xs">
            <span className="rounded-lg bg-red-650 bg-red-600 px-4 py-1.5 shadow-md">สินค้าหมดชั่วคราว</span>
          </div>
        )}

        {/* Hover quick action card overlay */}
        <div className="absolute inset-0 bg-brand-blue-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <span className="flex items-center gap-1 bg-white/95 text-brand-blue font-sans font-bold text-xs px-4 py-2 rounded-full shadow-md transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            <Eye size={14} />
            ดูรายละเอียดและเปรียบเทียบ
          </span>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Category tag & Stock */}
        <div className="flex justify-between items-center mb-1.5 gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-sans font-extrabold tracking-wider text-brand-blue uppercase bg-sky-50 px-2 py-0.5 rounded-md">
              {product.categoryThai}
            </span>
            {/* Status Badge */}
            {product.status === 'instock' && (
              <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                มีสินค้า
              </span>
            )}
            {product.status === 'preorder' && (
              <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                พรีออเดอร์
              </span>
            )}
            {(product.status === 'outofstock' || (!product.inStock && product.status !== 'preorder')) && (
              <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                สินค้าหมด
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 shrink-0">
            รีวิว ({product.reviewCount})
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-display text-sm sm:text-base font-bold text-slate-800 line-clamp-1 group-hover:text-brand-blue transition-colors mb-2">
          {product.name}
        </h3>

        {/* Product specs indicators snippet */}
        <div className="grid grid-cols-2 gap-1.5 mb-4 text-[11px] text-slate-500 font-sans border-t border-slate-50 pt-2.5">
          {product.length && (
            <div>ยาว: <span className="font-semibold text-slate-700">{product.length}</span></div>
          )}
          {product.capacity && (
            <div>รับน้ำหนัก: <span className="font-semibold text-slate-700">{product.capacity}</span></div>
          )}
        </div>

        {/* Pricing Panel and Action Trigger */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
          <div>
            {product.originalPrice > product.price && (
              <span className="text-[10px] text-slate-400 line-through block leading-none mb-1">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="font-display text-base font-extrabold text-red-500 block leading-none">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-brand-blue bg-sky-50 hover:bg-brand-blue hover:text-white rounded-lg transition-all border border-sky-100 cursor-pointer"
              id={`view-details-btn-${product.id}`}
            >
              ดูรายละเอียด
            </button>

            <button
              onClick={handleAddToCart}
              disabled={product.status === 'outofstock' || (!product.inStock && product.status !== 'preorder')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                successMsg
                  ? 'bg-emerald-500 text-white'
                  : 'bg-brand-blue text-white hover:bg-brand-blue-light disabled:bg-slate-100 disabled:text-slate-400'
              }`}
              title={product.status === 'preorder' ? "จองสินค้าพรีออเดอร์" : "เพิ่มลงตะกร้า"}
              id={`add-to-cart-quick-${product.id}`}
            >
              {successMsg ? (
                <svg className="h-4.5 w-4.5 animate-scaleCheck" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <ShoppingCart size={15} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
