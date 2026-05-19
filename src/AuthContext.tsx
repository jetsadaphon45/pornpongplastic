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
  // Order Management for Customers
  addPreOrder: (preOrder: Omit<PreOrder, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync Auth State (Customers Only)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (uid: string, email?: string) => {
    try {
      const profile = await getUserProfile(uid);
      if (profile && profile.role === 'user') {
        setUser(profile);
      } else if (profile && profile.role === 'admin') {
        // Customers context should not handle admin role users if we want strict separation
        // but for now we just treat them as logged out in this context if they aren't 'user'
        // or just let them be. The user said: "Navbar ลูกค้าต้องไม่เปลี่ยน"
        setUser(null); 
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

  // Sync Data (Read Only for Customers, except adding orders)
  useEffect(() => {
    const fetchData = async () => {
      const savedProducts = localStorage.getItem('pornpong_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts([]);
      }

      const savedOrders = localStorage.getItem('pornpong_orders');
      if (savedOrders) {
        let orders = JSON.parse(savedOrders);
        if (user) {
          orders = orders.filter((o: PreOrder) => o.userId === user.id);
        } else {
          // If guest, maybe show guest orders from session? For now just empty or guest tagged
          orders = orders.filter((o: PreOrder) => o.userId === 'GUEST');
        }
        setPreOrders(orders);
      }
    };

    if (!loading) {
      fetchData();
    }
  }, [user, loading]);

  const login = async (email: string, password: string) => {
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
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    await saveUserProfile(updatedUser);
    setUser(updatedUser);
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
      
      if (!user || user.id === orderData.userId) {
        setPreOrders(prev => [newOrder, ...prev]);
      }
      
      alert('บันทึกการสั่งจองสำเร็จ พนักงานจะติดต่อกลับโดยเร็วที่สุด');
    } catch (err: any) {
      alert(`ไม่สามารถบันทึกการจองได้: ${err.message}`);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, products, preOrders, login, register, logout, updateProfile, addPreOrder
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
