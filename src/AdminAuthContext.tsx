import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PreOrder } from './types';
import { uploadToCloudinary } from './services/cloudinaryService';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdminLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  // Product Management
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  // Order Management
  preOrders: PreOrder[];
  updateOrderStatus: (orderId: string, status: PreOrder['status']) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('pornpong_admin_auth');
    if (savedAdmin === 'true') {
      setAdminUser({
        id: 'admin-demo',
        name: 'Admin',
        email: 'admin@pornpongplastic.com',
        role: 'admin'
      });
    }
    setIsAdminLoading(false);
  }, []);

  // Sync Data for Admin
  useEffect(() => {
    const fetchData = () => {
      const savedProducts = localStorage.getItem('pornpong_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedOrders = localStorage.getItem('pornpong_orders');
      if (savedOrders) setPreOrders(JSON.parse(savedOrders));
    };

    fetchData();
  }, [adminUser]);

  const adminLogin = async (email: string, password: string) => {
    if (email === 'admin@pornpongplastic.com' && password === 'admin123') {
      const user: AdminUser = {
        id: 'admin-demo',
        name: 'Admin',
        email: 'admin@pornpongplastic.com',
        role: 'admin'
      };
      localStorage.setItem('pornpong_admin_auth', 'true');
      setAdminUser(user);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    localStorage.removeItem('pornpong_admin_auth');
    setAdminUser(null);
  };

  const addProduct = async (product: Product) => {
    try {
      const id = crypto.randomUUID();
      const newProduct = { ...product, id };
      const updatedProducts = [newProduct, ...products];
      localStorage.setItem('pornpong_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      alert('เพิ่มสินค้าสำเร็จ');
    } catch (err: any) {
      alert(`ไม่สามารถเพิ่มสินค้าได้: ${err.message}`);
      throw err;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const updatedProducts = products.map(p => p.id === product.id ? product : p);
      localStorage.setItem('pornpong_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      alert('แก้ไขสินค้าสำเร็จ');
    } catch (err: any) {
      alert(`ไม่สามารถแก้ไขสินค้าได้: ${err.message}`);
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const updatedProducts = products.filter(p => p.id !== productId);
      localStorage.setItem('pornpong_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      alert('ลบสินค้าสำเร็จ');
    } catch (err: any) {
      alert(`ไม่สามารถลบสินค้าได้: ${err.message}`);
      throw err;
    }
  };

  const uploadImage = async (file: File) => {
    return await uploadToCloudinary(file);
  };

  const updateOrderStatus = async (orderId: string, status: PreOrder['status']) => {
    try {
      const savedOrders = localStorage.getItem('pornpong_orders');
      if (savedOrders) {
        const allOrders = JSON.parse(savedOrders);
        const updatedAllOrders = allOrders.map((o: PreOrder) => o.id === orderId ? { ...o, status } : o);
        localStorage.setItem('pornpong_orders', JSON.stringify(updatedAllOrders));
        setPreOrders(updatedAllOrders);
      }
    } catch (err: any) {
      alert(`ไม่สามารถอัปเดตสถานะได้: ${err.message}`);
      throw err;
    }
  };

  return (
    <AdminAuthContext.Provider value={{ 
      adminUser, isAdminLoading, adminLogin, adminLogout,
      products, addProduct, updateProduct, deleteProduct, uploadImage,
      preOrders, updateOrderStatus
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
