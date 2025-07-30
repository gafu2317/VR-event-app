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
  
  // 日付選択状態管理
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const handleSlotClick = (dateTime: string) => {
    const slot = schedules[selectedDateIndex]?.slots.find(s => s.dateTime === dateTime);
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
      {/* <div className="max-w-4xl mx-auto mb-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm mb-3">
          <h5 className="font-semibold text-orange-800 mb-2">管理者モード</h5>
          <ul className="text-orange-700 space-y-1">
            <li>• <strong>予約</strong>：空き枠をタップして予約者名を入力</li>
            <li>• <strong>キャンセル</strong>：予約済み枠をタップして予約者名を入力</li>
            <li>• 予約済み枠には予約者名が表示されます</li>
          </ul>
        </div>
      </div> */}
      
      {/* 日付切り替えタブ - グリッドのすぐ上 */}
      <div className="max-w-4xl mx-auto mb-2">
        <div className="flex bg-gray-100 rounded-t-lg overflow-hidden shadow-sm">
          {schedules.map((schedule, index) => (
            <button
              key={index}
              onClick={() => setSelectedDateIndex(index)}
              className={`flex-1 py-2 px-3 text-xs font-medium transition-all ${
                selectedDateIndex === index
                  ? 'bg-white text-orange-600 border-b-2 border-orange-600 shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-orange-600'
              }`}
            >
              {schedule.date}
            </button>
          ))}
        </div>
      </div>
      
      <BookingGrid 
        schedule={schedules[selectedDateIndex]} 
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