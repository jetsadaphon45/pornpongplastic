import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import { Plus, Search, Filter, Edit2, Trash2, MoreVertical, Image as ImageIcon, CheckCircle2, XCircle, Clock as ClockIcon, Upload } from 'lucide-react';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, uploadImage } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'fiberglass',
    price: 0,
    description: '',
    specs: { size: '', material: '', capacity: '' },
    image: '',
    status: 'available'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'fiberglass',
        price: 0,
        description: '',
        specs: { size: '', material: '', capacity: '' },
        image: '',
        status: 'available'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(formData as Product);
      } else {
        await addProduct(formData as Product);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('ยืนยันการลบสินค้า?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบสินค้า');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อเรือ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="h-5 w-5" />
          <span>เพิ่มสินค้าใหม่</span>
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">เรือ</th>
              <th className="px-6 py-4">หมวดหมู่</th>
              <th className="px-6 py-4">ราคา</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">ไม่พบข้อมูลสินค้า</td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                       <img src={p.image} className="w-12 h-12 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                       <div>
                          <p className="font-bold text-gray-900">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.specs.size}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-blue-600">
                    {p.price && p.price > 0 
                      ? `฿${p.price.toLocaleString()}` 
                      : 'สอบถามราคา'}
                  </td>
                  <td className="px-6 py-4">
                     <span className={cn(
                       "px-3 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit",
                       p.status === 'available' ? "bg-green-50 text-green-600" :
                       p.status === 'preorder' ? "bg-blue-50 text-blue-600" :
                       "bg-red-50 text-red-600"
                     )}>
                        {p.status === 'available' ? <CheckCircle2 className="h-3 w-3" /> :
                         p.status === 'preorder' ? <ClockIcon className="h-3 w-3" /> :
                         <XCircle className="h-3 w-3" />}
                        <span>{p.status}</span>
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleOpenModal(p)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                           <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-2xl font-black text-gray-900">
                    {editingProduct ? 'แก้ไขข้อมูลเรือ' : 'เพิ่มสินค้าใหม่'}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all">
                    <XCircle className="h-6 w-6" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[70vh] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ชื่อเรือ</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ราคา (บาท)</label>
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="0.00 (เว้นว่างหรือ 0 = สอบถามราคา)"
                      value={formData.price || ''}
                      onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">หมวดหมู่</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as any})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="fiberglass">เรือไฟเบอร์</option>
                      <option value="plastic">เรือพลาสติก</option>
                      <option value="rowboat">เรือพาย</option>
                      <option value="accessory">อุปกรณ์เสริม</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">สถานะ</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="available">พร้อมขาย</option>
                      <option value="preorder">พรีออเดอร์</option>
                      <option value="outofstock">หมด</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">รูปสินค้า (URL หรือ อัปโหลด)</label>
                   <div className="flex space-x-4">
                     <input 
                        value={formData.image || ''}
                        onChange={e => setFormData({...formData, image: e.target.value})}
                        placeholder="https://cloudinary.com/..."
                        className="flex-grow bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                      <label 
                        className={cn(
                          "shrink-0 px-6 rounded-xl flex items-center justify-center cursor-pointer transition-all font-bold text-xs border-2 border-dashed",
                          isUploading ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                        )}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isUploading) return;
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            setIsUploading(true);
                            try {
                              const url = await uploadImage(file);
                              setFormData({ ...formData, image: url });
                            } catch (err: any) {
                              alert(err.message || 'ไม่สามารถอัปโหลดรูปภาพได้');
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                      >
                         {isUploading ? (
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                         ) : (
                           <Upload className="h-4 w-4 mr-2" />
                         )}
                         {isUploading ? 'กำลังอัปโหลด...' : 'เลือกรูป/ลากวาง'}
                         <input 
                            type="file" 
                            className="hidden" 
                            accept="image/jpeg,image/png,image/webp"
                            disabled={isUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setIsUploading(true);
                                try {
                                  const url = await uploadImage(file);
                                  setFormData({ ...formData, image: url });
                                } catch (err: any) {
                                  alert(err.message || 'ไม่สามารถอัปโหลดรูปภาพได้');
                                } finally {
                                  setIsUploading(false);
                                }
                              }
                            }}
                         />
                      </label>
                   </div>
                   {formData.image && (
                     <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all font-bold"
                        >
                          ×
                        </button>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ขนาดเรือ</label>
                      <input 
                        value={formData.specs?.size}
                        onChange={e => setFormData({...formData, specs: {...formData.specs!, size: e.target.value}})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">วัสดุ</label>
                      <input 
                        value={formData.specs?.material}
                        onChange={e => setFormData({...formData, specs: {...formData.specs!, material: e.target.value}})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ความจุ</label>
                      <input 
                        value={formData.specs?.capacity}
                        onChange={e => setFormData({...formData, specs: {...formData.specs!, capacity: e.target.value}})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">รายละเอียดสินค้า</label>
                   <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" 
                    />
                </div>

                <div className="pt-6 flex space-x-4">
                   <button type="submit" className="flex-grow bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                      {editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                   </button>
                   <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all"
                   >
                      ยกเลิก
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
