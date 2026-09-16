import React from 'react';
import { X, MapPin } from 'lucide-react';
import AddressManagementView from './AddressManagementView';

interface AddressManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function AddressManagementModal({
  isOpen,
  onClose,
  currentUser,
  triggerToast,
  onAddressUpdated
}: AddressManagementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/50 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-5xl rounded-3xl bg-white shadow-2xl border border-sky-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        id="address-management-modal-container"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100/80 bg-sky-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <MapPin size={17} />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-sm text-slate-800">จัดการที่อยู่จัดส่ง (Address Management)</h2>
              <p className="text-[11px] text-slate-500">จัดการข้อมูลที่อยู่สำหรับการสั่งซื้อเรือพลาสติกและอุปกรณ์</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            id="close-address-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 bg-white">
          <AddressManagementView
            currentUser={currentUser}
            triggerToast={triggerToast}
            onAddressUpdated={onAddressUpdated}
          />
        </div>
      </div>
    </div>
  );
}
