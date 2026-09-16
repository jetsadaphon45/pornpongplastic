import React from 'react';
import { 
  Plus, 
  Check, 
  Pencil, 
  Trash2, 
  Phone, 
  MapPin, 
  User, 
  X, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { UserAddress } from '../types';
import { supabaseUserAddresses } from '../lib/supabase';

interface AddressManagementViewProps {
  currentUser: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  } | null;
  triggerToast: (msg: string) => void;
  onAddressUpdated?: () => void;
}

// Sample fallback addresses if user has no saved addresses yet
const DEFAULT_INITIAL_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-default-1',
    user_id: 'sample',
    title: 'บ้าน',
    recipient_name: 'คุณสมชาย พรพงศ์พาณิชย์',
    phone: '081-234-5678',
    address: '88/12 หมู่บ้านธารารมณ์ ซอยรามคำแหง 150 แขวงสะพานสูง เขตสะพานสูง กรุงเทพมหานคร 10240 (จุดสังเกต: ท่าเทียบเรือหน้าบ้านริมคลอง)',
    is_default: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'addr-default-2',
    user_id: 'sample',
    title: 'ที่ทำงาน',
    recipient_name: 'พรพงศ์พลาสติก สาขา 2 (ฝ่ายพัสดุ)',
    phone: '034-876-5432',
    address: '123/45 หมู่ 2 ถนนเจษฎาวิถี ตำบลโคกขาม อำเภอเมืองสมุทรสาคร จังหวัดสมุทรสาคร 74000 (ประตู 3 จุดโหลดเรือ)',
    is_default: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'addr-default-3',
    user_id: 'sample',
    title: 'โกดังริมน้ำ',
    recipient_name: 'คุณสมชาย พรพงศ์พาณิชย์ (โกดังท่าเรือ)',
    phone: '089-987-6543',
    address: '456 หมู่ 5 ถนนสุขุมวิท-พัทยา ตำบลนาเกลือ อำเภอบางละมุง จังหวัดชลบุรี 20150 (เข้าซอยนาเกลือ 12 โครงการริมทะเล)',
    is_default: false,
    created_at: new Date().toISOString()
  }
];

export default function AddressManagementView({
  currentUser,
  triggerToast,
  onAddressUpdated
}: AddressManagementViewProps) {
  const [addresses, setAddresses] = React.useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Modal State for Add / Edit
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<UserAddress | null>(null);

  // Form Fields
  const [title, setTitle] = React.useState('บ้าน');
  const [recipientName, setRecipientName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [isDefault, setIsDefault] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  // Delete Confirmation State
  const [addressToDelete, setAddressToDelete] = React.useState<UserAddress | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Load addresses from Supabase and Local Storage
  const loadAddresses = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = currentUser?.id;
      const userEmail = currentUser?.email;
      const list = await supabaseUserAddresses.listByUser(userId, userEmail);

      if (list && list.length > 0) {
        setAddresses(list);
      } else {
        // Prepare personalized initial items if none exist yet
        const seedAddresses = DEFAULT_INITIAL_ADDRESSES.map(item => ({
          ...item,
          recipient_name: currentUser?.name || item.recipient_name,
          phone: currentUser?.phone || item.phone,
          user_id: currentUser?.id || 'sample'
        }));
        setAddresses(seedAddresses);

        // Store into localStorage cache for consistency
        const localKey = `pornpong_addresses_${userId || userEmail || 'guest'}`;
        localStorage.setItem(localKey, JSON.stringify(seedAddresses));
      }
    } catch (err) {
      console.warn('Failed to load addresses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  React.useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingAddress(null);
    setTitle('บ้าน');
    setRecipientName(currentUser?.name || '');
    setPhone(currentUser?.phone || '');
    setAddress('');
    setIsDefault(addresses.length === 0);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (addr: UserAddress) => {
    setEditingAddress(addr);
    setTitle(addr.title || 'บ้าน');
    setRecipientName(addr.recipient_name || currentUser?.name || '');
    setPhone(addr.phone || currentUser?.phone || '');
    setAddress(addr.address || '');
    setIsDefault(!!addr.is_default);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Save (Create or Update) Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!recipientName.trim()) {
      errors.recipientName = 'กรุณากรอกชื่อ-นามสกุล ผู้รับ';
    }
    const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '').replace(/^\+66/, '0');
    if (!phone.trim()) {
      errors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^[0-9]+$/.test(cleanPhone)) {
      errors.phone = 'เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น';
    } else if (cleanPhone.length !== 10) {
      errors.phone = `เบอร์โทรศัพท์ไทยต้องมี 10 หลัก (ปัจจุบันมี ${cleanPhone.length} หลัก)`;
    } else if (!cleanPhone.startsWith('0')) {
      errors.phone = 'เบอร์โทรศัพท์ไทยต้องขึ้นต้นด้วยเลข 0 (เช่น 0812345678)';
    }
    if (!address.trim()) {
      errors.address = 'กรุณากรอกรายละเอียดที่อยู่จัดส่ง';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const userId = currentUser?.id || 'guest';
      const userEmail = currentUser?.email;

      if (editingAddress) {
        // Update existing address
        await supabaseUserAddresses.update(
          editingAddress.id,
          {
            title: title.trim(),
            recipient_name: recipientName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            is_default: isDefault
          },
          userId,
          userEmail
        );

        setAddresses(prev => {
          return prev.map(item => {
            if (item.id === editingAddress.id) {
              return {
                ...item,
                title: title.trim(),
                recipient_name: recipientName.trim(),
                phone: phone.trim(),
                address: address.trim(),
                is_default: isDefault
              };
            }
            if (isDefault) {
              return { ...item, is_default: false };
            }
            return item;
          });
        });

        triggerToast('อัปเดตที่อยู่จัดส่งสำเร็จ');
      } else {
        // Create new address
        const res = await supabaseUserAddresses.create({
          user_id: userId,
          title: title.trim(),
          recipient_name: recipientName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          is_default: isDefault,
          email: userEmail
        });

        if (res.data) {
          const newAddr = res.data;
          setAddresses(prev => {
            let nextList = [...prev];
            if (isDefault) {
              nextList = nextList.map(item => ({ ...item, is_default: false }));
            }
            return [newAddr, ...nextList];
          });
        }

        triggerToast('เพิ่มที่อยู่จัดส่งใหม่สำเร็จ');
      }

      setIsFormModalOpen(false);
      onAddressUpdated?.();
      window.dispatchEvent(new Event('address-updated'));
    } catch (err) {
      console.error('Failed to save address:', err);
      triggerToast('เกิดข้อผิดพลาดในการบันทึกที่อยู่');
    } finally {
      setIsSaving(false);
    }
  };

  // Set as default address
  const handleSetDefault = async (addrId: string) => {
    try {
      const userId = currentUser?.id;
      const userEmail = currentUser?.email;

      await supabaseUserAddresses.setDefault(addrId, userId, userEmail);

      setAddresses(prev =>
        prev.map(item => ({
          ...item,
          is_default: item.id === addrId
        }))
      );

      triggerToast('ตั้งเป็นที่อยู่จัดส่งเริ่มต้นเรียบร้อยแล้ว');
      onAddressUpdated?.();
      window.dispatchEvent(new Event('address-updated'));
    } catch (err) {
      console.error('Failed to set default address:', err);
      triggerToast('ไม่สามารถตั้งค่าที่อยู่เริ่มต้นได้');
    }
  };

  // Confirm delete address
  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    setIsDeleting(true);

    try {
      const userId = currentUser?.id;
      const userEmail = currentUser?.email;

      await supabaseUserAddresses.delete(addressToDelete.id, userId, userEmail);

      setAddresses(prev => prev.filter(item => item.id !== addressToDelete.id));

      triggerToast('ลบที่อยู่จัดส่งเรียบร้อยแล้ว');
      setAddressToDelete(null);
      onAddressUpdated?.();
      window.dispatchEvent(new Event('address-updated'));
    } catch (err) {
      console.error('Failed to delete address:', err);
      triggerToast('เกิดข้อผิดพลาดในการลบที่อยู่');
    } finally {
      setIsDeleting(false);
    }
  };

  const PRESET_LABELS = ['บ้าน', 'ที่ทำงาน', 'โกดัง', 'ท่าเทียบเรือ', 'สาขา 2'];

  return (
    <div className="w-full font-sans">
      {/* Top Header: Title on Left, Primary Blue Add Button on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-sky-100/80">
        <div>
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-800 tracking-tight" id="address-management-heading">
            ที่อยู่ของฉัน
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการที่อยู่จัดส่งสำหรับการสั่งซื้อเรือพลาสติกและอุปกรณ์
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          id="btn-add-new-address"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>เพิ่มที่อยู่ใหม่</span>
        </button>
      </div>

      {/* 3-Column Grid System */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={24} className="animate-spin text-sky-500" />
          <span className="text-xs font-medium">กำลังโหลดข้อมูลที่อยู่...</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/30">
          <MapPin size={28} className="mx-auto text-sky-300 mb-2" />
          <h3 className="font-bold text-sm text-slate-700">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            เพิ่มที่อยู่จัดส่งสินค้าเรือพลาสติกเพื่อความสะดวกและรวดเร็วในการสั่งซื้อครั้งถัดไป
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>เพิ่มที่อยู่ใหม่</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5" id="address-grid-container">
          {addresses.map((addr) => {
            const isDef = !!addr.is_default;
            return (
              <div
                key={addr.id}
                className={`flex flex-col justify-between bg-white rounded-2xl p-4.5 border transition-all relative ${
                  isDef 
                    ? 'border-sky-300 shadow-xs hover:shadow-md ring-1 ring-sky-100' 
                    : 'border-slate-200/90 hover:border-sky-200 hover:shadow-xs'
                }`}
                id={`address-card-${addr.id}`}
              >
                {/* Top of Card: Title + Default Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-sky-800 bg-sky-50/80 px-2.5 py-0.5 rounded-lg border border-sky-100">
                      <MapPin size={11} className="text-sky-600" />
                      {addr.title || 'ที่อยู่จัดส่ง'}
                    </span>

                    {/* Default Badge: Blue tone with Checkmark icon */}
                    {isDef && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shrink-0">
                        <Check size={12} className="text-sky-600 stroke-[2.5]" />
                        ค่าเริ่มต้น
                      </span>
                    )}
                  </div>

                  {/* Recipient Details */}
                  <div className="space-y-0.5 mb-2.5">
                    <h3 className="font-bold text-sm text-slate-800 leading-snug">
                      {addr.recipient_name || currentUser?.name || 'ผู้สั่งซื้อ'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Phone size={12} className="text-sky-500 shrink-0" />
                      <span>{addr.phone || currentUser?.phone || 'ไม่ระบุเบอร์โทร'}</span>
                    </p>
                  </div>

                  {/* Detailed Delivery Address */}
                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100 min-h-[4.2rem] break-words">
                    {addr.address}
                  </div>
                </div>

                {/* Bottom of Card: Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100/80">
                  {/* Left: "ตั้งเป็นค่าเริ่มต้น" text for non-default card */}
                  <div>
                    {!isDef ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline transition-colors cursor-pointer"
                        id={`btn-set-default-${addr.id}`}
                      >
                        ตั้งเป็นค่าเริ่มต้น
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-sky-600/80">
                        ที่อยู่จัดส่งหลัก
                      </span>
                    )}
                  </div>

                  {/* Right: Action Buttons (Edit Pencil & Delete Trash) in matching blue tone */}
                  <div className="flex items-center gap-1">
                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 rounded-lg text-sky-600 hover:text-sky-700 hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-colors cursor-pointer"
                      title="แก้ไขที่อยู่นี้"
                      id={`btn-edit-address-${addr.id}`}
                    >
                      <Pencil size={15} />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setAddressToDelete(addr)}
                      className="p-1.5 rounded-lg text-sky-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                      title="ลบที่อยู่นี้"
                      id={`btn-delete-address-${addr.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Add / Edit Address Form */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div 
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-sky-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            id="address-form-modal"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                  <MapPin size={16} />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-800">
                  {editingAddress ? 'แก้ไขที่อยู่จัดส่ง' : 'เพิ่มที่อยู่จัดส่งใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Address Label Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ป้ายกำกับที่อยู่ (เช่น บ้าน, ที่ทำงาน)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_LABELS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setTitle(label)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        title === label
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="หรือพิมพ์ชื่อป้ายกำกับเอง เช่น โกดังบางบัวทอง..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden transition-all"
                />
              </div>

              {/* Recipient Name & Phone in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุล ผู้รับ *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => {
                        setRecipientName(e.target.value);
                        if (formErrors.recipientName && e.target.value.trim()) {
                          setFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.recipientName;
                            return next;
                          });
                        }
                      }}
                      placeholder="เช่น คุณสมชาย พรพงศ์พาณิชย์"
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden transition-all"
                    />
                    <User size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                  {formErrors.recipientName && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.recipientName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ผู้รับ (10 หลัก) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhone(val);
                        if (formErrors.phone && val.trim()) {
                          setFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.phone;
                            return next;
                          });
                        }
                      }}
                      placeholder="เช่น 081-234-5678 หรือ 0812345678"
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden transition-all"
                    />
                    <Phone size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Delivery Address Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รายละเอียดที่อยู่จัดส่งโดยละเอียด *
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (formErrors.address && e.target.value.trim()) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.address;
                        return next;
                      });
                    }
                  }}
                  placeholder="บ้านเลขที่, หมู่บ้าน/อาคาร, ถนน, ซอย, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์ และจุดสังเกตเรือ..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden transition-all leading-relaxed"
                />
                {formErrors.address && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.address}</p>
                )}
              </div>

              {/* Checkbox: Set as default */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-sky-100 bg-sky-50/40 cursor-pointer hover:bg-sky-50/70 transition-colors">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">
                  ตั้งเป็นที่อยู่จัดส่งเริ่มต้น (Default Delivery Address)
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  id="btn-submit-address"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>บันทึกที่อยู่</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: Delete Address */}
      {addressToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div 
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-150"
            id="delete-address-dialog"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-sm text-slate-800">ยืนยันการลบที่อยู่</h4>
                <span className="text-xs text-slate-400 font-medium">{addressToDelete.title || 'ที่อยู่จัดส่ง'}</span>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-800 mb-2 leading-relaxed">
              คุณต้องการลบที่อยู่จัดส่งนี้ใช่หรือไม่?
            </p>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4 line-clamp-2">
              <span className="font-semibold text-slate-800">{addressToDelete.recipient_name}</span> - {addressToDelete.address}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAddressToDelete(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                id="btn-cancel-delete-address"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                id="btn-confirm-delete-address"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>ยืนยันการลบ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
