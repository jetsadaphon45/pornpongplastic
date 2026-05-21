import React from 'react';
import { 
  Bell, Check, Trash2, ShoppingBag, Calendar, Tag, Sparkles, X, CheckCheck, Inbox, AlertCircle 
} from 'lucide-react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'preorder' | 'promotion' | 'new_product';
  date: string;
  isRead: boolean;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDeleteNotification
}: NotificationDropdownProps) {
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // If they click on elements with IDs of the bell trigger, do not close immediately (let the trigger handle it)
        const target = event.target as HTMLElement;
        if (target.closest('#notification-bell-trigger') || target.closest('#mobile-notification-bell-trigger')) {
          return;
        }
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ShoppingBag size={14} />
          </div>
        );
      case 'preorder':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <Calendar size={14} />
          </div>
        );
      case 'promotion':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100">
            <Tag size={14} />
          </div>
        );
      default: // new_product
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-brand-blue border border-sky-100">
            <Sparkles size={14} />
          </div>
        );
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2.5 w-full max-w-sm sm:w-[380px] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl transition-all duration-300 animate-fadeIn z-50 pointer-events-auto"
      id="notifications-dropdown-container"
    >
      {/* Dropdown Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4.5 py-3.5 bg-gradient-to-r from-sky-50/70 to-white">
        <div className="flex items-center gap-1.5">
          <Bell size={15} className="text-brand-blue" />
          <h4 className="font-display text-sm font-black text-slate-800">การแจ้งเตือน</h4>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white leading-none">
              ใหม่ {unreadCount}
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Quick Toolbar for and Marking / Clearing notifications */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/40 px-4 py-1.8 text-[11px]">
          <button
            onClick={() => {
              onMarkAllAsRead();
            }}
            className="flex items-center gap-1.2 font-bold text-brand-blue hover:text-brand-blue-dark transition-all cursor-pointer"
            id="mark-all-read-btn"
          >
            <CheckCheck size={11} />
            <span>อ่านทั้งหมด</span>
          </button>
          
          <button
            onClick={() => {
              onClearAll();
            }}
            className="flex items-center gap-1 text-slate-500 hover:text-red-550 hover:text-red-600 transition-all cursor-pointer font-semibold"
            id="clear-all-noti-btn"
          >
            <Trash2 size={11} />
            <span>ลบแจ้งเตือนทั้งหมด</span>
          </button>
        </div>
      )}

      {/* Notifications Scroll Area */}
      <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100/70">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-slate-50 p-3 text-slate-350 text-slate-400 mb-2.5">
              <Inbox size={28} strokeWidth={1.5} />
            </div>
            <p className="text-xs font-bold text-slate-700">ไม่มีการแจ้งเตือน</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">ทางเราจะส่งข่าวพรีเซลส์เรือพลาสติกและคำสั่งสินค้ามาแจ้งไว้ ณ ที่นี่</p>
          </div>
        ) : (
          notifications.map((noti) => (
            <div 
              key={noti.id}
              className={`flex gap-3 p-4 transition-colors relative hover:bg-sky-50/15 ${
                noti.isRead ? 'bg-white' : 'bg-sky-50/5'
              }`}
            >
              {/* Unread Indicator Glow Dot */}
              {!noti.isRead && (
                <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-brand-blue" />
              )}

              {/* Icon box based on category type */}
              {getIcon(noti.type)}

              {/* Notification textual layout */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h5 className={`text-xs truncate ${noti.isRead ? 'font-semibold text-slate-750' : 'font-bold text-slate-850'}`}>
                    {noti.title}
                  </h5>
                  <span className="text-[9px] text-slate-400 font-mono shrink-0 select-none">
                    {noti.date}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                  {noti.message}
                </p>

                {/* Individual Inline Action Links */}
                {!noti.isRead && (
                  <button
                    onClick={() => onMarkAsRead(noti.id)}
                    className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-brand-blue hover:underline"
                  >
                    <Check size={10} strokeWidth={3} />
                    <span>ทำเครื่องหมายว่าอ่านแล้ว</span>
                  </button>
                )}
              </div>

              {/* Clear / Delete this specific item */}
              <button
                onClick={() => onDeleteNotification(noti.id)}
                className="absolute right-3.5 top-4 text-slate-300 hover:text-red-500 p-1 rounded-sm hover:bg-slate-50 transition-all cursor-pointer"
                title="ลบเฉพาะรายการนี้"
              >
                <X size={11} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Info Tip standard Footer on dropdown */}
      <div className="border-t border-slate-100 p-2.5 bg-slate-50/70 text-center text-[10px] text-slate-400">
        บริการแจ้งข่าวสารพรพงศ์พลาสติก โรงงานผลิตเรือพาราฯ สมุทรสาคร
      </div>
    </div>
  );
}
