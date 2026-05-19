import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, PreOrder } from './types';
import { supabase } from './lib/supabase';
import { 
  getUserProfile, 
  saveUserProfile
} from './services/supabaseService';
import { uploadToCloudinary } from './services/cloudinaryService';

interface AuthContextType {
  user: User | null;
  products: Product[];
  preOrders: PreOrder[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: User) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  // Product Management
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  // Order Management
  addPreOrder: (preOrder: Omit<PreOrder, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: PreOrder['status']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync Auth State
  useEffect(() => {
    const checkAuth = async () => {
      // Check for hardcoded local admin first
      const localAdmin = localStorage.getItem('localAdmin');
      if (localAdmin === 'true') {
        setUser({
          id: 'admin-demo',
          name: 'Admin',
          email: 'admin@pornpongplastic.com',
          role: 'admin',
          phone: '',
          lineId: '',
          address: ''
        });
        setLoading(false);
        return;
      }

      // Fallback to Supabase (Temporarily bypassed by user request but kept for structure)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email);
      } else if (localStorage.getItem('localAdmin') !== 'true') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (uid: string, email?: string) => {
    try {
      const profile = await getUserProfile(uid);
      if (profile) {
        setUser(profile);
      } else {
        const newUser: User = {
          id: uid,
          name: email?.split('@')[0] || 'ผู้ใช้งาน',
          email: email || '',
          phone: '',
          lineId: '',
          address: '',
          role: 'user'
        };
        await saveUserProfile(newUser);
        setUser(newUser);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync Data
  useEffect(() => {
    const fetchData = async () => {
      // Load products from localStorage
      const savedProducts = localStorage.getItem('pornpong_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts([]);
      }

      // Load orders from localStorage
      const savedOrders = localStorage.getItem('pornpong_orders');
      if (savedOrders) {
        let orders = JSON.parse(savedOrders);
        // Filter by user if not admin
        if (user && user.role !== 'admin') {
          orders = orders.filter((o: PreOrder) => o.userId === user.id);
        }
        setPreOrders(orders);
      }
    };

    if (!loading) {
      fetchData();
    }
  }, [user, loading]);

  const login = async (email: string, password: string) => {
    // 1. Check Hardcoded Admin Credentials
    if (email === 'admin@pornpongplastic.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-demo',
        name: 'Admin',
        email: 'admin@pornpongplastic.com',
        role: 'admin',
        phone: '',
        lineId: '',
        address: ''
      };
      localStorage.setItem('localAdmin', 'true');
      setUser(adminUser);
      return true;
    }

    // 2. Normal Supabase Auth (kept but can be ignored for now)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      if (data.user) {
        await fetchUserProfile(data.user.id, data.user.email);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error.message);
      return false;
    }
  };

  const register = async (userData: User) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || '12345678',
      });
      
      if (error) throw error;
      if (data.user) {
        const newUser: User = {
          ...userData,
          id: data.user.id,
        };
        const { password, ...safeUserData } = newUser;
        await saveUserProfile(safeUserData as User);
        setUser(safeUserData as User);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Register error:', error.message);
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('localAdmin');
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    await saveUserProfile(updatedUser);
    setUser(updatedUser);
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

  const addPreOrder = async (orderData: Omit<PreOrder, 'id' | 'createdAt' | 'status'>) => {
    try {
      const id = crypto.randomUUID();
      const newOrder: PreOrder = {
        ...orderData,
        id,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };
      
      const savedOrders = localStorage.getItem('pornpong_orders');
      const allOrders = savedOrders ? JSON.parse(savedOrders) : [];
      const updatedAllOrders = [newOrder, ...allOrders];
      
      localStorage.setItem('pornpong_orders', JSON.stringify(updatedAllOrders));
      
      // Update local state (filtered for current view)
      if (user && (user.role === 'admin' || user.id === orderData.userId)) {
        setPreOrders(prev => [newOrder, ...prev]);
      } else if (!user || orderData.userId === 'GUEST') {
        setPreOrders(prev => [newOrder, ...prev]);
      }
      
      alert('บันทึกการสั่งจองสำเร็จ พนักงานจะติดต่อกลับโดยเร็วที่สุด');
    } catch (err: any) {
      alert(`ไม่สามารถบันทึกการจองได้: ${err.message}`);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: PreOrder['status']) => {
    try {
      const savedOrders = localStorage.getItem('pornpong_orders');
      if (savedOrders) {
        const allOrders = JSON.parse(savedOrders);
        const updatedAllOrders = allOrders.map((o: PreOrder) => o.id === orderId ? { ...o, status } : o);
        localStorage.setItem('pornpong_orders', JSON.stringify(updatedAllOrders));
        setPreOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err: any) {
      alert(`ไม่สามารถอัปเดตสถานะได้: ${err.message}`);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, products, preOrders, login, register, logout, updateProfile,
      addProduct, updateProduct, deleteProduct, uploadImage, addPreOrder, updateOrderStatus
    }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
