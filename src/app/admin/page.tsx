"use client";

import { useState } from 'react';
import { BookingGrid } from '@/components/booking/BookingGrid';
import { useBookingContext } from '@/contexts/BookingContext';
import { BookingModal } from '@/components/modals/BookingModal';
import { CancelModal } from '@/components/modals/CancelModal';

export default function AdminPage() {
  const { schedules, loading, error, createBooking, cancelBooking } = useBookingContext();
  
  // モーダル状態管理
  const [bookingModal, setBookingModal] = useState({ isOpen: false, dateTime: '', timeSlot: '' });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, dateTime: '', timeSlot: '' });

  const handleSlotClick = (dateTime: string) => {
    const slot = schedules[0]?.slots.find(s => s.dateTime === dateTime);
    const timeSlot = slot?.time || '';
    
    if (slot?.isBooked) {
      // 予約済みの場合：キャンセルモーダルを開く
      setCancelModal({ isOpen: true, dateTime, timeSlot });
    } else {
      // 空き枠の場合：予約モーダルを開く
      setBookingModal({ isOpen: true, dateTime, timeSlot });
    }
  };

  // 予約作成処理
  const handleBookingConfirm = async (bookerName: string) => {
    await createBooking(bookerName, bookingModal.dateTime);
  };

  // 予約キャンセル処理
  const handleCancelConfirm = async (bookerName: string) => {
    return await cancelBooking(bookerName, cancelModal.dateTime);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto mb-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
          <h5 className="font-semibold text-orange-800 mb-2">管理者モード</h5>
          <ul className="text-orange-700 space-y-1">
            <li>• <strong>予約</strong>：空き枠をタップして予約者名を入力</li>
            <li>• <strong>キャンセル</strong>：予約済み枠をタップして予約者名を入力</li>
            <li>• 予約済み枠には予約者名が表示されます</li>
          </ul>
        </div>
      </div>
      <BookingGrid 
        schedule={schedules[0]} 
        isAdminMode={true} 
        onSlotClick={handleSlotClick} 
      />
      
      {/* 予約モーダル */}
      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, dateTime: '', timeSlot: '' })}
        onConfirm={handleBookingConfirm}
        timeSlot={bookingModal.timeSlot}
        loading={loading}
      />
      
      {/* キャンセルモーダル */}
      <CancelModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, dateTime: '', timeSlot: '' })}
        onConfirm={handleCancelConfirm}
        timeSlot={cancelModal.timeSlot}
        loading={loading}
      />
    </div>
  );
}