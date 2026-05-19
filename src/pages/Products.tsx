import { useState } from 'react';
import { useAuth } from '../AuthContext';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { Search, Filter } from 'lucide-react';

export default function Products() {
  const { products } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'ทั้งหมด' },
    { id: 'fiberglass', name: 'เรือไฟเบอร์' },
    { id: 'plastic', name: 'เรือพลาสติก' },
    { id: 'rowboat', name: 'เรือพาย' },
    { id: 'accessory', name: 'อุปกรณ์เสริม' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">สินค้าทั้งหมด</h1>
          <p className="text-gray-500">เลือกชมสินค้าคุณภาพจาก พรพงศ์พลาสติก</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0 mb-12">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-blue-200'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">ไม่พบสินค้าที่คุณกำลังมองหา</p>
                <p className="text-sm">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่</p>
             </div>
             <button 
                onClick={() => {setActiveCategory('all'); setSearchQuery('');}}
                className="text-blue-600 font-bold hover:underline"
              >
                ดูสินค้าทั้งหมด
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
