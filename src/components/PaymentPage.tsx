import React from 'react';
import { 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  Check, 
  User, 
  Phone, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  Anchor,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  ShoppingBag,
  Loader2,
  Search,
  ExternalLink,
  Truck,
  Image as ImageIcon
} from 'lucide-react';
import { supabaseOrders, isSupabaseConfigured, supabase, isOrderPreOrder } from '../lib/supabase';

// Helper to determine if an order has been approved or moved beyond pending_verification
export const isOrderStatusApproved = (ord: any): boolean => {
  if (!ord) return false;
  const s = String(ord.status || '').toLowerCase().trim();
  const os = String(ord.order_status || '').toLowerCase().trim();
  const ps = String(ord.payment_status || '').toLowerCase().trim();
  const ds = String(ord.delivery_status || '').toLowerCase().trim();

  // 1. If status is pending_verification, it is STRICTLY NOT APPROVED. Never show green success screen.
  if (s === 'pending_verification' || s === 'waiting_verify' || s === 'waiting_approval' || s === 'waiting_payment') {
    return false;
  }
  // 2. If payment_status is pending_verification or waiting approval
  if (ps === 'pending_verification' || ps === 'waiting_verify' || ps === 'waiting_approval' || ps === 'pending_deposit') {
    return false;
  }
  // If payment is pending and status is not yet approved by admin:
  if (ps === 'pending' && !['paid', 'ready_to_ship', 'producing', 'manufacturing', 'in_transit', 'shipping', 'completed', 'delivered'].includes(s)) {
    return false;
  }

  // 3. Approved screen MUST ONLY be shown when status is changed to 'paid', 'ready_to_ship', 'producing' or 'in_transit' (or 'completed')
  const approvedStatuses = [
    'paid',
    'ready_to_ship',
    'producing',
    'manufacturing',
    'in_transit',
    'shipping',
    'ready_for_shipping',
    'completed',
    'delivered'
  ];

  if (approvedStatuses.includes(s)) {
    return true;
  }

  if (['verified', 'paid', 'approved'].includes(ps)) {
    if (approvedStatuses.includes(os) || approvedStatuses.includes(ds)) {
      return true;
    }
  }

  return false;
};

// Web Audio API success sound chime (zero external dependencies, reliable & crisp)
const playSuccessChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Tone 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: A5 (880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch {
    // Autoplay policy or browser mute fallback
  }
};

interface PaymentPageProps {
  order: any;
  onBackToHome: () => void;
  onViewOrderHistory?: () => void;
  onTrackOrder?: (order?: any) => void;
  triggerToast: (msg: string) => void;
}

export default function PaymentPage({ order, onBackToHome, onViewOrderHistory, onTrackOrder, triggerToast }: PaymentPageProps) {
  // Navigation Step: 'pay' -> 'verifying' -> 'approved'
  const [step, setStep] = React.useState<'pay' | 'verifying' | 'approved'>('pay');
  const [isApprovalModalOpen, setIsApprovalModalOpen] = React.useState<boolean>(false);
  const [copiedAccount, setCopiedAccount] = React.useState(false);
  const [slipFile, setSlipFile] = React.useState<File | null>(null);
  const [slipPreview, setSlipPreview] = React.useState<string | null>(null);
  const [slipError, setSlipError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // 3-Second Auto-Redirect countdown state when payment is approved (only active when modal is closed)
  const [autoRedirectCountdown, setAutoRedirectCountdown] = React.useState<number>(3);
  const [isWaitingModalDelay, setIsWaitingModalDelay] = React.useState<boolean>(false);
  const hasRedirectedRef = React.useRef(false);
  const modalTimerRef = React.useRef<any>(null);

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, []);

  // Fallback initial order info
  const [activeOrder, setActiveOrder] = React.useState<any>(order || {
    id: 'PP-ORD-' + Math.floor(1000 + Math.random() * 9000),
    customer_name: 'คุณผู้ใช้บริการ',
    customer_email: 'customer@example.com',
    customer_phone: '081-XXX-XXXX',
    total_amount: 15400,
    payment_status: 'pending',
    order_status: 'waiting_payment',
    productName: 'เรือพลาสติก รุ่นยอดนิยม และอุปกรณ์พายเรือคู่',
    color: 'น้ำเงินส้มสีผสม'
  });

  const [currentPaymentStatus, setCurrentPaymentStatus] = React.useState(activeOrder.payment_status || 'pending');
  const [currentOrderStatus, setCurrentOrderStatus] = React.useState(activeOrder.order_status || 'waiting_payment');
  const [uploadedSlipUrl, setUploadedSlipUrl] = React.useState<string>('');

  const handleReturnHome = React.useCallback(() => {
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = '/';
    }
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  }, [onBackToHome]);

  const handleGoToTracking = React.useCallback(() => {
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    if (onTrackOrder) {
      onTrackOrder(activeOrder);
    } else if (onViewOrderHistory) {
      onViewOrderHistory();
    } else {
      handleReturnHome();
    }
  }, [onTrackOrder, onViewOrderHistory, handleReturnHome, activeOrder]);

  // Auto-Redirect effect to Track Order when entering 'approved' step (only runs if modal is closed and delay passed)
  React.useEffect(() => {
    if (step !== 'approved' || isApprovalModalOpen || isWaitingModalDelay) return;

    setAutoRedirectCountdown(3);
    hasRedirectedRef.current = false;

    const timer = setInterval(() => {
      setAutoRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGoToTracking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [step, isApprovalModalOpen, isWaitingModalDelay, handleGoToTracking]);

  // Unified function to transition order to approved with sound, notification, and modal
  const triggerApprovalSuccess = React.useCallback((updatedData?: any) => {
    playSuccessChime();
    triggerToast('🎉 ชำระเงินสำเร็จแล้ว! เจ้าหน้าที่ตรวจสอบและอนุมัติเรียบร้อยแล้ว');

    const nextStatus = updatedData?.status || updatedData?.order_status || 'ready_to_ship';
    setActiveOrder((prev: any) => ({
      ...prev,
      ...(updatedData || {}),
      payment_status: 'paid',
      status: nextStatus,
      order_status: nextStatus
    }));
    setCurrentPaymentStatus('paid');
    setCurrentOrderStatus(nextStatus);
    if (updatedData?.payment_slip_url || updatedData?.slip_url) {
      setUploadedSlipUrl(updatedData.payment_slip_url || updatedData.slip_url);
    }
    setStep('approved');

    // Requirement 1: Delay Before Showing Success Modal (1.5 Seconds / 1500ms)
    setIsWaitingModalDelay(true);
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
    }
    modalTimerRef.current = setTimeout(() => {
      setIsWaitingModalDelay(false);
      setIsApprovalModalOpen(true);
    }, 1500);
  }, [triggerToast]);

  // Synchronize and lookup order from url params or prop
  React.useEffect(() => {
    if (order) {
      setActiveOrder(order);
      const s = String(order.status || '').toLowerCase().trim();
      const ps = String(order.payment_status || '').toLowerCase().trim();
      const hasSlip = Boolean(order.payment_slip_url || order.slip_url);

      setCurrentPaymentStatus(order.payment_status || 'pending');
      setCurrentOrderStatus(order.order_status || order.status || 'waiting_payment');
      
      if (hasSlip) {
        setUploadedSlipUrl(order.payment_slip_url || order.slip_url);
      }

      // Requirement 2:
      // If status === 'pending_verification' -> ALWAYS show 'verifying' (yellow/amber screen), NEVER 'approved'
      if (s === 'pending_verification' || ps === 'pending_verification' || ['waiting_verify', 'waiting_approval'].includes(ps) || (hasSlip && !isOrderStatusApproved(order))) {
        setStep('verifying');
      } else if (isOrderStatusApproved(order)) {
        setStep('approved');
      } else {
        setStep('pay');
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('orderId');
    if (orderIdFromUrl) {
      const fetchOrder = async () => {
        try {
          if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase
              .from('orders')
              .select('*')
              .eq('id', orderIdFromUrl)
              .maybeSingle();
            
            if (data && !error) {
              const formattedOrder = {
                ...data,
                id: data.id,
                customer_name: data.customer_name || data.customerName || 'คุณผู้ใช้บริการ',
                customer_email: data.customer_email || 'guest@example.com',
                customer_phone: data.customer_phone || '081-XXX-XXXX',
                total_amount: Number(data.total_amount || data.amount || 0),
                payment_status: data.payment_status || data.status || 'pending',
                status: data.status || data.order_status || 'waiting_payment',
                order_status: data.order_status || data.status || 'waiting_payment',
                productName: data.productName || data.product_name || 'เรือและชุดพ่วงอุปกรณ์',
                color: data.color || 'คละสี',
                payment_slip_url: data.payment_slip_url || data.slip_url || ''
              };
              setActiveOrder(formattedOrder);
              setCurrentPaymentStatus(formattedOrder.payment_status);
              setCurrentOrderStatus(formattedOrder.status);

              const s = String(formattedOrder.status || '').toLowerCase().trim();
              const ps = String(formattedOrder.payment_status || '').toLowerCase().trim();
              const hasSlip = Boolean(formattedOrder.payment_slip_url);
              
              if (hasSlip) {
                setUploadedSlipUrl(formattedOrder.payment_slip_url);
              }

              // Check pending_verification first
              if (s === 'pending_verification' || ps === 'pending_verification' || ['waiting_verify', 'waiting_approval'].includes(ps) || (hasSlip && !isOrderStatusApproved(formattedOrder))) {
                setStep('verifying');
              } else if (isOrderStatusApproved(formattedOrder)) {
                setStep('approved');
              } else {
                setStep('pay');
              }
            }
          }
        } catch (err) {
          console.error('Error fetching order by URL orderId in PaymentPage:', err);
        }
      };
      fetchOrder();
    }
  }, [order]);

  // REAL-TIME STATUS SYNC & POLLING (Supabase Realtime + 1.5s Polling + Window Broadcast + Cross-tab Storage)
  React.useEffect(() => {
    const targetOrderId = activeOrder?.id;
    if (!targetOrderId || step === 'approved') return;

    // 1. High-frequency Polling (every 1.5 seconds) for guaranteed rapid responsiveness
    const pollInterval = setInterval(async () => {
      try {
        // A. Direct query to Supabase orders table
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', targetOrderId)
            .maybeSingle();

          if (data && !error && isOrderStatusApproved(data)) {
            triggerApprovalSuccess(data);
            return;
          }

          // Also check deliveries table
          const { data: delivData } = await supabase
            .from('deliveries')
            .select('*')
            .eq('order_id', targetOrderId)
            .maybeSingle();
          if (delivData && delivData.delivery_status && !['pending', 'waiting'].includes(delivData.delivery_status)) {
            triggerApprovalSuccess({ ...data, status: delivData.delivery_status, payment_status: 'verified' });
            return;
          }
        }

        // B. Check local storage fallback (instant sync when tested in same browser)
        try {
          const localOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
          const found = localOrders.find((o: any) => String(o.id) === String(targetOrderId));
          if (found && isOrderStatusApproved(found)) {
            triggerApprovalSuccess(found);
            return;
          }

          // Check pornpong_unshown_approvals
          const approvals = JSON.parse(localStorage.getItem('pornpong_unshown_approvals') || '[]');
          const hasApproval = approvals.some((a: any) => String(a.orderId) === String(targetOrderId));
          if (hasApproval) {
            triggerApprovalSuccess({ status: 'ready_to_ship', payment_status: 'verified' });
            return;
          }
        } catch {}
      } catch (pollErr) {
        console.warn('Polling order status check error:', pollErr);
      }
    }, 1500);

    // 2. Custom window event listeners (dispatched directly when admin approves in AdminDashboard)
    const handleBroadcastApproval = (e: any) => {
      const orderId = e.detail?.orderId || e.detail?.id;
      if (orderId && String(orderId) === String(targetOrderId)) {
        triggerApprovalSuccess(e.detail);
      }
    };
    window.addEventListener('pornpong-order-approved', handleBroadcastApproval);
    window.addEventListener('pornpong-shipping-in-transit', handleBroadcastApproval);
    window.addEventListener('pornpong-delivery-updated', handleBroadcastApproval);
    window.addEventListener('orders-updated', handleBroadcastApproval);

    // 3. Storage event listener for cross-window / cross-tab changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pornpong_unshown_approvals' || e.key === 'admin_orders' || e.key === 'pornpong_orders') {
        try {
          const localOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
          const found = localOrders.find((o: any) => String(o.id) === String(targetOrderId));
          if (found && isOrderStatusApproved(found)) {
            triggerApprovalSuccess(found);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 4. Supabase Realtime Subscription (postgres_changes on orders and deliveries)
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel(`order-realtime-listener-${targetOrderId}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
              filter: `id=eq.${targetOrderId}`
            },
            (payload: any) => {
              const updated = payload.new || payload.record;
              if (updated && isOrderStatusApproved(updated)) {
                triggerApprovalSuccess(updated);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'deliveries',
              filter: `order_id=eq.${targetOrderId}`
            },
            (payload: any) => {
              const updated = payload.new || payload.record;
              if (updated) {
                triggerApprovalSuccess({
                  status: updated.delivery_status || 'ready_to_ship',
                  payment_status: 'verified'
                });
              }
            }
          )
          .subscribe((status: string) => {
            console.log(`[Supabase Realtime] Order #${targetOrderId} subscription status:`, status);
          });
      } catch (channelErr) {
        console.warn('Realtime channel subscription error:', channelErr);
      }
    }

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('pornpong-order-approved', handleBroadcastApproval);
      window.removeEventListener('pornpong-shipping-in-transit', handleBroadcastApproval);
      window.removeEventListener('pornpong-delivery-updated', handleBroadcastApproval);
      window.removeEventListener('orders-updated', handleBroadcastApproval);
      window.removeEventListener('storage', handleStorageChange);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeOrder?.id, step, triggerApprovalSuccess]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('123-4-56789-0');
    setCopiedAccount(true);
    triggerToast('คัดลอกหมายเลขบัญชีธนาคารสำเร็จ!');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const validExtensions = ['jpg', 'jpeg', 'png'];

      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
        setSlipError('กรุณาเลือกเฉพาะไฟล์รูปภาพกลุ่ม .jpg, .jpeg, หรือ .png เท่านั้น');
        triggerToast('กรุณาเลือกเฉพาะไฟล์รูปภาพกลุ่ม .jpg, .jpeg, หรือ .png เท่านั้น');
        return;
      }

      setSlipError(null);
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit via slip attachment path (Mandatory)
  const handleUploadAndSubmitSlip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!slipFile) {
      setSlipError('กรุณาแนบสลิปหลักฐานการโอนเงินก่อนทำการยืนยัน');
      triggerToast('กรุณาแนบสลิปหลักฐานการโอนเงินก่อนทำการยืนยัน');
      return;
    }

    setSlipError(null);
    setIsProcessing(true);
    try {
      let slipUrl = '';
      if (isSupabaseConfigured) {
        try {
          const resUrl = await supabaseOrders.uploadSlip(activeOrder.id, slipFile);
          if (resUrl) {
            slipUrl = resUrl;
            setUploadedSlipUrl(resUrl);
          }
        } catch (uploadErr) {
          console.warn('Storage upload fallback to data URL preview:', uploadErr);
          slipUrl = slipPreview || '';
          setUploadedSlipUrl(slipUrl);
        }
      } else {
        slipUrl = slipPreview || '';
        setUploadedSlipUrl(slipUrl);
      }

      // Update to status = 'pending_verification' and payment_status = 'pending' per requirement
      setCurrentPaymentStatus('pending');
      setCurrentOrderStatus('pending_verification');

      if (isSupabaseConfigured) {
        try {
          if (supabase) {
            await supabase.from('orders').update({
              status: 'pending_verification',
              payment_status: 'pending',
              order_status: 'pending_verification',
              payment_slip_url: slipUrl,
              slip_url: slipUrl,
              updated_at: new Date().toISOString()
            }).eq('id', activeOrder.id);
          }
          await supabaseOrders.updateStatus(activeOrder.id, 'pending_verification');
        } catch (errStatus) {
          console.warn('Error updating status in Supabase:', errStatus);
        }
      }

      // Sync local storage orders for immediate UI reflection in Admin and Order history
      try {
        const localOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const updatedLocal = localOrders.map((o: any) => 
          o.id === activeOrder.id 
            ? { 
                ...o, 
                payment_slip_url: slipUrl || slipPreview, 
                slip_url: slipUrl || slipPreview, 
                status: 'pending_verification',
                payment_status: 'pending', 
                order_status: 'pending_verification' 
              }
            : o
        );
        localStorage.setItem('admin_orders', JSON.stringify(updatedLocal));

        const preLocal = JSON.parse(localStorage.getItem('admin_preorders') || '[]');
        const updatedPre = preLocal.map((p: any) =>
          p.id === activeOrder.id 
            ? { 
                ...p, 
                payment_slip_url: slipUrl || slipPreview, 
                slip_url: slipUrl || slipPreview, 
                status: 'pending_verification',
                payment_status: 'pending', 
                order_status: 'pending_verification' 
              }
            : p
        );
        localStorage.setItem('admin_preorders', JSON.stringify(updatedPre));

        window.dispatchEvent(new CustomEvent('orders-updated'));
      } catch {}

      setActiveOrder((prev: any) => ({
        ...prev,
        status: 'pending_verification',
        payment_status: 'pending',
        order_status: 'pending_verification',
        payment_slip_url: slipUrl,
        slip_url: slipUrl
      }));

      // Add a notification for the customer
      try {
        const currentNotis = JSON.parse(localStorage.getItem('pornpong_notifications') || '[]');
        const newNoti = {
          id: 'noti-' + Date.now(),
          title: 'ระบบได้รับสลิปการโอนเงินแล้ว',
          message: `คำสั่งซื้อ ${activeOrder.id} กำลังอยู่ในขั้นตอนการตรวจสอบสลิปการโอนเงิน (ใช้เวลาประมาณ 5-15 นาที)`,
          type: 'order',
          date: 'เมื่อครู่',
          isRead: false
        };
        localStorage.setItem('pornpong_notifications', JSON.stringify([newNoti, ...currentNotis]));
      } catch {}

      triggerToast('ระบบได้รับหลักฐานการชำระเงินเรียบร้อยแล้ว กำลังตรวจสอบสลิป...');
      setStep('verifying');
    } catch (err: any) {
      console.error('Failed to submit slip:', err);
      setUploadedSlipUrl(slipPreview || '');
      setCurrentPaymentStatus('pending');
      setCurrentOrderStatus('pending_verification');
      setActiveOrder((prev: any) => ({
        ...prev,
        status: 'pending_verification',
        payment_status: 'pending'
      }));
      triggerToast('ระบบได้รับหลักฐานการชำระเงินเรียบร้อยแล้ว');
      setStep('verifying');
    } finally {
      setIsProcessing(false);
    }
  };

  // APPROVAL SUCCESS MODAL
  const renderApprovalModal = () => {
    if (!isApprovalModalOpen) return null;
    const isPreOrder = isOrderPreOrder(activeOrder);
    const orderId = activeOrder?.id || 'ORD';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans animate-fadeIn">
        <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-emerald-100 text-center space-y-5 animate-scaleUp">
          
          {/* Animated Green Circular Icon */}
          <div className="flex justify-center">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute -inset-2 rounded-full bg-emerald-400/25 blur-md animate-ping"></div>
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                <CheckCircle2 size={36} className="animate-in zoom-in-75 duration-300 drop-shadow-xs" />
              </div>
            </div>
          </div>

          {/* Badge & Titles */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
              <Check size={12} strokeWidth={3} />
              <span>✓ แอดมินอนุมัติการชำระเงินเรียบร้อย</span>
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-black text-slate-850">
              การชำระเงินเสร็จสิ้น!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans px-1">
              {isPreOrder
                ? `การชำระเงินเสร็จสิ้น! คำสั่งซื้อ #${orderId} เป็นสินค้าสั่งผลิต ลำดับคิวการผลิตเริ่มต้นแล้ว โรงงานเริ่มกระบวนการผลิตทันที`
                : `การชำระเงินเสร็จสิ้น! คำสั่งซื้อ #${orderId} เป็นสินค้าพร้อมส่ง คลังสินค้ากำลังเตรียมจัดส่งตรงถึงคุณ`}
            </p>
          </div>

          {/* Order ID Frame */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200 text-xs flex justify-between items-center font-mono">
            <span className="text-slate-400 font-sans">รหัสคำสั่งซื้อ:</span>
            <span className="font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
              #{orderId}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsApprovalModalOpen(false);
                handleReturnHome();
              }}
              className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-all active:scale-[0.99]"
              id="btn-dismiss-approval-modal"
            >
              รับทราบ
            </button>
            <button
              type="button"
              onClick={() => {
                setIsApprovalModalOpen(false);
                handleGoToTracking();
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
              id="btn-view-order-history-modal"
            >
              <ShoppingBag size={14} />
              <span>ดูประวัติคำสั่งซื้อ</span>
            </button>
          </div>

        </div>
      </div>
    );
  };

  // STEP 2: VERIFICATION PENDING SCREEN (กำลังตรวจสอบการชำระเงิน)
  if (step === 'verifying') {
    return (
      <div className="font-sans min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10 relative">
        {renderApprovalModal()}
        <div className="max-w-xl w-full bg-white rounded-3xl border border-sky-100 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-fadeIn">
          
          {/* Animated Spinner & Clock Header Icon */}
          <div className="flex justify-center">
            <div className="relative inline-flex items-center justify-center">
              {/* Soft pulsing glow background */}
              <div className="absolute -inset-3 rounded-full bg-amber-400/25 blur-lg animate-pulse"></div>
              
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                <Clock size={38} className="animate-pulse" />
                {/* Gentle rotating ring around icon */}
                <div className="absolute inset-0 rounded-full border-2 border-white/50 border-t-white animate-spin"></div>
              </div>
            </div>
          </div>
          
          {/* Main Titles */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>กำลังตรวจสอบการชำระเงิน (Payment Verification)</span>
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-850">
              ระบบได้รับหลักฐานการชำระเงินเรียบร้อยแล้ว
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              ทางโรงงานกำลังทำการตรวจสอบสลิปการโอนเงินของท่าน (ใช้เวลาประมาณ 5-15 นาที) เมื่อตรวจสอบสำเร็จ ระบบจะดำเนินการหลอม/จัดเตรียมสินค้าให้อัตโนมัติ
            </p>
          </div>

          {/* Summary Box (กล่องสรุปข้อมูล) */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
            <div className="font-bold text-slate-800 pb-2 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-brand-blue" />
                <span>สรุปรายละเอียดคำสั่งซื้อ</span>
              </span>
              <span className="font-mono text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                {activeOrder.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="text-slate-400 text-[11px] block">เลขที่สั่งซื้อ (Order ID):</span>
                <span className="font-bold text-slate-800 font-mono">{activeOrder.id}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">ยอดเงินที่โอน:</span>
                <span className="font-display font-extrabold text-brand-blue text-sm">
                  ฿{Number(activeOrder.total_amount).toLocaleString('th-TH')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">ชื่อผู้สั่งซื้อ:</span>
                <span className="font-semibold text-slate-700">{activeOrder.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">เบอร์โทรศัพท์:</span>
                <span className="font-semibold text-slate-700">{activeOrder.customer_phone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-400 text-[11px] block mb-0.5">รายการสินค้า:</span>
              <span className="font-bold text-slate-800 block line-clamp-2">
                {activeOrder.productName || 'เรือและชุดพ่วงอุปกรณ์'}
              </span>
              {activeOrder.color && (
                <span className="text-[10.5px] text-brand-blue font-semibold mt-0.5 block">
                  สี: {activeOrder.color}
                </span>
              )}
            </div>

            {/* Slip Photo Preview */}
            {(uploadedSlipUrl || slipPreview) && (
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold block mb-1.5 flex items-center justify-between">
                  <span>ภาพสลิปที่แนบส่งไป:</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    แนบสำเร็จ
                  </span>
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center shadow-xs">
                  <img 
                    src={uploadedSlipUrl || slipPreview || ''} 
                    alt="สลิปหลักฐานการโอนเงิน" 
                    referrerPolicy="no-referrer"
                    className="max-h-52 object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Estimated verification timeframe notice */}
          <div className="border border-amber-200/80 p-3.5 rounded-2xl bg-amber-50/60 text-slate-700 text-xs flex items-center gap-3 text-left">
            <Clock size={20} className="text-amber-600 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-bold text-slate-850">
                ฝ่ายบัญชีกำลังเทียบยอดเงินกับรายการเดินบัญชี
              </p>
              <p className="text-[11px] text-slate-500 leading-snug">
                ท่านจะได้รับข้อความแจ้งเตือนทันทีเมื่อสลิปได้รับการอนุมัติ ท่านสามารถตรวจสอบสถานะได้ตลอดเวลาในหน้าประวัติคำสั่งซื้อ
              </p>
            </div>
          </div>

          {/* Action Button: Centered Return to Home */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full sm:w-auto sm:min-w-[260px] px-8 rounded-2xl bg-brand-blue hover:bg-brand-blue-dark text-white font-display font-bold text-xs py-4 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99]"
              id="btn-return-home-from-verify"
            >
              <ArrowLeft size={16} />
              <span>กลับสู่หน้าแรก</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // STEP 3: PAYMENT APPROVED SCREEN (ชำระเงินเสร็จสิ้น เรียลไทม์)
  if (step === 'approved') {
    return (
      <div className="font-sans min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10 relative">
        {renderApprovalModal()}
        <div className="max-w-xl w-full bg-white rounded-3xl border border-emerald-100 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-fadeIn">
          
          {/* Glowing Green Checkmark Icon */}
          <div className="flex justify-center">
            <div className="relative inline-flex items-center justify-center">
              {/* Radiant emerald pulsing glow background */}
              <div className="absolute -inset-4 rounded-full bg-emerald-500/25 blur-xl animate-pulse"></div>
              
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                <CheckCircle2 size={42} className="animate-in zoom-in-75 duration-300 drop-shadow-xs" />
                <div className="absolute inset-0 rounded-full border-2 border-white/60"></div>
              </div>
            </div>
          </div>
          
          {/* Main Titles */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ชำระเงินสำเร็จแล้ว (Payment Approved & Verified)</span>
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-850">
              ชำระเงินสำเร็จแล้ว!
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              ทางโรงงานได้ตรวจสอบและอนุมัติการชำระเงินของท่านเรียบร้อยแล้ว เตรียมจัดส่งสินค้าตามกำหนดการ
            </p>
          </div>

          {/* Summary Box (กล่องสรุปข้อมูลเดิม) */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
            <div className="font-bold text-slate-800 pb-2 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-emerald-600" />
                <span>สรุปรายละเอียดคำสั่งซื้อ</span>
              </span>
              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {activeOrder.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="text-slate-400 text-[11px] block">เลขที่สั่งซื้อ (Order ID):</span>
                <span className="font-bold text-slate-800 font-mono">{activeOrder.id}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">ยอดเงินที่ชำระ:</span>
                <span className="font-display font-extrabold text-emerald-600 text-sm">
                  ฿{Number(activeOrder.total_amount).toLocaleString('th-TH')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">ชื่อผู้สั่งซื้อ:</span>
                <span className="font-semibold text-slate-700">{activeOrder.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">เบอร์โทรศัพท์:</span>
                <span className="font-semibold text-slate-700">{activeOrder.customer_phone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-400 text-[11px] block mb-0.5">รายการสินค้า:</span>
              <span className="font-bold text-slate-800 block line-clamp-2">
                {activeOrder.productName || 'เรือและชุดพ่วงอุปกรณ์'}
              </span>
              {activeOrder.color && (
                <span className="text-[10.5px] text-brand-blue font-semibold mt-0.5 block">
                  สี: {activeOrder.color}
                </span>
              )}
            </div>

            {/* Slip Photo Preview */}
            {(uploadedSlipUrl || slipPreview) && (
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold block mb-1.5 flex items-center justify-between">
                  <span>หลักฐานการโอนเงินที่อนุมัติ:</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
                    <Check size={11} /> อนุมัติการชำระเงินแล้ว
                  </span>
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center shadow-xs">
                  <img 
                    src={uploadedSlipUrl || slipPreview || ''} 
                    alt="สลิปหลักฐานการโอนเงินที่อนุมัติ" 
                    referrerPolicy="no-referrer"
                    className="max-h-52 object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Delivery & Production Notice */}
          {(() => {
            const isPre = isOrderPreOrder(activeOrder);
            return (
              <div className="border border-emerald-200/80 p-3.5 rounded-2xl bg-emerald-50/70 text-slate-700 text-xs flex items-center gap-3 text-left">
                <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-850">
                    {isPre 
                      ? 'ฝ่ายผลิตกำลังเตรียมหลอมขึ้นรูปและจัดส่งสินค้าตามกำหนดการ'
                      : 'คลังสินค้ากำลังเตรียมบรรจุหีบห่อและส่งมอบให้ขนส่งโดยตรง (สินค้าพร้อมส่ง)'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {isPre
                      ? 'เจ้าหน้าที่จะติดต่อประสานงานยืนยันวันนัดหมายจัดส่งล่วงหน้า ท่านสามารถเช็กสถานะการผลิตได้ในประวัติคำสั่งซื้อ'
                      : 'สินค้าพร้อมส่งไม่ต้องรอรอบหลอมผลิต ท่านสามารถติดตามเลขพัสดุและสถานะการจัดส่งได้ทันทีในหน้าติดตามจัดส่ง'}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Action Button: Auto-Redirect to Track Order + Primary Tracking Button */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleGoToTracking}
              className="w-full sm:w-auto sm:min-w-[280px] px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs py-4 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99]"
              id="btn-track-order-from-approved"
            >
              <Truck size={17} />
              <span>ไปยังหน้าติดตามคำสั่งซื้อทันที (Track Order)</span>
            </button>
            <p className="text-[11.5px] text-slate-500 font-medium flex items-center gap-1.5 animate-pulse">
              <Clock size={13} className="text-emerald-600" />
              <span>กำลังนำท่านไปยังหน้าติดตามคำสั่งซื้ออัตโนมัติใน {autoRedirectCountdown} วินาที...</span>
            </p>
            <button
              type="button"
              onClick={handleReturnHome}
              className="text-[11.5px] text-slate-500 hover:text-slate-700 font-semibold underline transition-colors cursor-pointer"
              id="btn-return-home-from-approved"
            >
              กลับสู่หน้าแรก
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Generate PromptPay string format
  const promptPayData = `00020101021130300016A0000006770101110213123456789012353037645405${activeOrder.total_amount}.005802TH`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(promptPayData)}&color=0d2b45`;

  return (
    <div className="font-sans min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {renderApprovalModal()}
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        
        {/* Top Header Row with back controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
            <span>กลับไปเลือกเรือพลาสติก</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-white shadow-xs">
              <Anchor size={18} className="rotate-12" />
            </div>
            <div>
              <h2 className="font-display text-sm font-extrabold text-slate-800 leading-none">
                พรพงศ์พลาสติก
              </h2>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                วิทยฐานะใบชำระ
              </span>
            </div>
          </div>
        </div>

        {/* Page Titles */}
        <div className="text-center sm:text-left py-2 border-b border-slate-200">
          <h1 className="font-display text-2xl font-black text-slate-800">
            ระบบตรวจสอบหนี้และสิทธิ์จัดส่งเรือ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            สแกนด้วยแอปพลิเคชันธนาคารและดำเนินการแนบหลักฐานแบบฟอร์มด้านล่างเพื่ออ้างอิงสิทธ์คิวดำเนินการหลอมด่วนพิเศษ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: BILLSUMMARY / ORDER DETAILS & YOD-CHAMRA */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* INVOICE BILL */}
            <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-display text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText size={15} className="text-slate-500" />
                  <span>สรุปยอดจำลองใบจรรโลงสั่งเรือ</span>
                </h3>
                <span className="rounded-full font-bold text-[10px] px-2 py-0.5 bg-yellow-50 text-yellow-600 border border-yellow-200 uppercase animate-pulse">
                  {currentPaymentStatus}
                </span>
              </div>

              {/* Bill Fields */}
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg font-mono">
                  <span className="text-slate-400 font-sans">เลขที่ใบสั่งซื้อ:</span>
                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-[155px]" title={activeOrder.id}>
                    {activeOrder.id}
                  </span>
                </div>

                <div className="pt-2 flex flex-col gap-2 font-sans text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-400">ผู้สั่งซื้อ:</span>{' '}
                    <span className="font-bold text-slate-800">{activeOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-400">เบอร์ติดต่อกลับ:</span>{' '}
                    <span className="font-bold text-slate-800">{activeOrder.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-400">สเกลอีเมล:</span>{' '}
                    <span className="font-medium text-slate-800 truncate" title={activeOrder.customer_email}>{activeOrder.customer_email}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="font-bold text-slate-800 text-[11px] block mb-1">รายการสินค้าเรือที่สั่งหลอมแม่พิมพ์:</span>
                  <div className="bg-sky-50/40 p-2.5 rounded-xl border border-sky-50 mt-1">
                    <p className="font-bold text-slate-850 leading-relaxed font-sans text-xs">
                      {activeOrder.productName || 'เรือคายัคเกรดพรีเมียมตราพรพงศ์'}
                    </p>
                    {activeOrder.color && (
                      <p className="text-[10px] text-brand-blue font-bold mt-1">
                        สีผลิตภัณฑ์คิวผลิต: {activeOrder.color}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* YOD CHAMRA (YOD CHUMRA) */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">ยอดชำระที่ต้องยืนยัน (Net Total Amount)</span>
                <div className="flex justify-between items-baseline bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">มัดจำพิเศษ</span>
                  <strong className="text-2xl font-display font-extrabold text-brand-blue">
                    ฿{Number(activeOrder.total_amount).toLocaleString('th-TH')}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 justify-center">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>ความรับผิดชอบรักษาความปลอดภัยด้วยเทคโนโลยีเข้ารหัส SSL</span>
              </div>
            </div>

            {/* QUICK BANK SCB CARD */}
            <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3">
              <strong className="text-xs font-bold text-slate-800 block">ข้อมูลสนับสนุนช่องทางโอนทางเลือก</strong>
              <div className="flex items-center justify-between gap-2 p-3 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-[#4e2a84] flex items-center justify-center text-white text-[11px] font-black font-mono">
                    SCB
                  </div>
                  <div>
                    <strong className="text-slate-800 text-[11px] block">ธนาคารไทยพาณิชย์ (SCB)</strong>
                    <code className="text-xs font-mono font-bold text-slate-700">123-4-56789-0</code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1.5 text-slate-400 hover:text-brand-blue bg-white rounded-lg border border-slate-250 cursor-pointer hover:shadow-xs transition-all"
                  title="คัดอกเลขบัญชี"
                >
                  {copiedAccount ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[10px] text-slate-400 block font-semibold">ชื่อบัญชีโรงหลอมแม่แป้น</span>
                <strong className="text-xs text-slate-700 font-sans">บจก. พรพงศ์ พลาสติก ไลท์</strong>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: PAYMENT GATEWAY AREA (QR CODE, UPLOADER & BUTTONS) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* BRANDED PROMPTPAY QR KIOSK */}
              <div className="rounded-2xl overflow-hidden border border-slate-150 shadow-sm">
                
                {/* PromptPay Dark Header Banner */}
                <div className="bg-[#003d5b] text-white p-3 flex justify-between items-center px-4">
                  <div className="flex items-center gap-1">
                    <QrCode size={18} className="text-[#bfdbfe]" />
                    <span className="font-display font-black text-xs uppercase tracking-widest text-[#bfdbfe]">Thai PromptPay</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-300">
                    Scan to Pay
                  </div>
                </div>

                <div className="p-6 bg-white flex flex-col items-center justify-center text-center space-y-4">
                  
                  {/* Real QR Generator Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center max-w-[210px] w-full">
                    <img 
                      src={qrCodeUrl} 
                      alt="PromptPay Payment QR Code" 
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain rounded-lg border border-slate-205"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-sans text-slate-400 font-bold uppercase tracking-wider">
                      โปรดสแกนยอดมัดจำสุทธิ
                    </p>
                    <p className="text-2xl font-black text-[#003d5b]">
                      ฿{Number(activeOrder.total_amount).toLocaleString('th-TH')}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-500 leading-relaxed max-w-xs font-sans">
                    สามารถเปิดแอป SCB, K-Bank, Krungthai แสกนคิวอาร์เพื่อดัดแปลงตาราง orders ของระบบจำลองโรงเรือนพรพงศ์ได้ทันที
                  </div>

                </div>

              </div>

              {/* MANDATORY SLIP UPLOAD & PAYMENT CONFIRMATION */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <UploadCloud size={16} className="text-brand-blue" />
                    <span>แนบสลิปหลักฐานการโอนเงิน (Mandatory Slip Upload)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    * บังคับแนบสลิป
                  </span>
                </div>

                <form onSubmit={handleUploadAndSubmitSlip} className="space-y-4">
                  {/* Drag & drop style input */}
                  <div 
                    onClick={() => setSlipError(null)}
                    className={`border-2 border-dashed rounded-2xl duration-200 cursor-pointer overflow-hidden relative group transition-all ${
                      slipError 
                        ? 'border-rose-400 bg-rose-50/30' 
                        : slipFile 
                          ? 'border-emerald-500 bg-emerald-50/20' 
                          : 'border-slate-200 hover:border-brand-blue bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleSlipChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {slipPreview ? (
                      <div className="p-4 relative flex flex-col items-center justify-center bg-slate-50 min-h-[170px]">
                        <img 
                          src={slipPreview} 
                          alt="Slip File Preview" 
                          className="max-h-[150px] rounded-lg object-contain shadow-xs border border-slate-200"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 text-[9px] px-2.5 font-bold z-20 flex items-center gap-1 shadow-sm">
                          <Check size={11} strokeWidth={3} />
                          <span>แนบสลิปเรียบร้อย (คลิกเพื่อเปลี่ยน)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-1.5">
                        <ImageIcon size={30} className="mx-auto text-slate-400 group-hover:scale-110 duration-200 group-hover:text-brand-blue" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">คลิกที่นี่ เพื่อเลือกรูปภาพสลิปหลักฐานการโอนเงิน</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">รองรับไฟล์ .jpg, .jpeg, .png (ขนาดไม่เกิน 10MB)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Red Warning Banner when user attempts to submit without a slip */}
                  {slipError && (
                    <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                      <AlertCircle size={16} className="shrink-0 text-rose-500" />
                      <span className="font-semibold">{slipError}</span>
                    </div>
                  )}

                  {/* Mandatory Confirm Payment Button */}
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (!slipFile) {
                        e.preventDefault();
                        setSlipError('กรุณาแนบสลิปหลักฐานการโอนเงินก่อนทำการยืนยัน');
                        triggerToast('กรุณาแนบสลิปหลักฐานการโอนเงินก่อนทำการยืนยัน');
                      }
                    }}
                    disabled={isProcessing}
                    className={`w-full flex items-center justify-center gap-2 rounded-2xl font-display font-bold text-xs py-4 transition-all duration-200 shadow-md ${
                      !slipFile
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-brand-blue hover:bg-brand-blue-dark text-white cursor-pointer hover:shadow-lg active:scale-[0.99]'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <span>กำลังอัปโหลดสลิปและยืนยันการชำระเงิน...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>ยืนยันการชำระเงิน</span>
                      </>
                    )}
                  </button>

                  {!slipFile && (
                    <p className="text-[10.5px] text-slate-400 text-center font-sans">
                      * ปุ่มยืนยันจะเปิดใช้งานอัตโนมัติเมื่อท่านเลือกไฟล์สลิปหลักฐานการโอนเงินเรียบร้อย
                    </p>
                  )}
                </form>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
