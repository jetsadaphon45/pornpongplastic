import React from 'react';
import { ShoppingCart, MessageCircle, Info, CalendarClock } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed h-8">
          {product.description}
        </p>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">ราคาโดยประมาณ</span>
              <span className="text-2xl font-black text-blue-600">
                ฿{product.price.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">ไม่รวมค่าจัดส่ง</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(product)}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-bold">ใส่ตะกร้า</span>
            </button>
            <Link
              to={`/preorder?product=${product.id}`}
              className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 py-3 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <CalendarClock className="h-4 w-4" />
              <span className="text-sm font-bold">พรีออเดอร์</span>
            </Link>
          </div>
          
          <a
            href={`https://line.me/ti/p/@pornpong`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-100"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-bold">สอบถามราคาส่งทาง LINE</span>
          </a>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Info className="h-3 w-3" />
          <span>{product.specs.size}</span>
        </div>
        <span className="text-[10px] bg-blue-50 text-blue-500 font-bold px-2 py-0.5 rounded">
          {product.specs.capacity}
        </span>
      </div>
    </motion.div>
  );
};

export default ProductCard;
