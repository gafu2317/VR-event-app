"use client";

import { useState } from 'react';
import { BookingGrid } from '@/components/booking/BookingGrid';
import { useBookingContext } from '@/contexts/BookingContext';
import { BookingModal } from '@/components/modals/BookingModal';
import { CancelModal } from '@/components/modals/CancelModal';




// // --- 初期データ ---
// const generateTimeSlots = (dateStr: string, startHour: string, endHour: string): TimeSlot[] => {
//   const slots: TimeSlot[] = [];

//   // Dateオブジェクトは日付と時刻の両方を持つため、正確な日時で初期化します。
//   // 例: "2025-08-16T09:00:00"
//   let currentTime = new Date(`${dateStr}T${startHour}:00`);
//   const endTime = new Date(`${dateStr}T${endHour}:00`);

//   // 終了時刻になるまで15分ずつ時間を進めてスロットを生成します。
//   while (currentTime < endTime) {
//     // UI表示用の時間 (例: "09:00")
//     const timeString = currentTime.toTimeString().substring(0, 5);
//     // 予約データと紐付けるための正確な日時情報 (ISO 8601形式)
//     const dateTimeString = currentTime.toISOString();

//     slots.push({
//       time: timeString,
//       dateTime: dateTimeString,
//       isBooked: false, // 初期状態では予約済みではない
//       // bookingId と bookerName は予約時に設定されるため、ここでは含めない
//     });

//     // 次の15分に進めます
//     currentTime.setMinutes(currentTime.getMinutes() + 15);
//   }
//   return slots;
// };


// const initialSchedule: Schedule[] = [
//   {
//     date: '2025年8月16日',
//     slots: generateTimeSlots('2025-08-16','10:00', '16:00'),
//   },
//   {
//     date: '2025年8月17日',
//     slots: generateTimeSlots('2025-08-17','09:30', '16:00'),
//   },
// ];


// --- メインコンポーネント ---
export default function Home() {
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
      <div className="max-w-4xl mx-auto mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm mb-3">
          <h5 className="font-semibold text-blue-800 mb-2">使い方</h5>
          <ul className="text-blue-700 space-y-1">
            <li>• <strong>予約</strong>：空き枠をタップして予約者名を入力</li>
            <li>• <strong>キャンセル</strong>：予約済み枠をタップして予約者名を入力</li>
          </ul>
        </div>
      </div>
      
      {/* 日付切り替えタブ - グリッドのすぐ上 */}
      <div className="max-w-4xl mx-auto mb-2">
        <div className="flex bg-gray-100 rounded-t-lg overflow-hidden shadow-sm">
          {schedules.map((schedule, index) => (
            <button
              key={index}
              onClick={() => setSelectedDateIndex(index)}
              className={`flex-1 py-2 px-3 text-xs font-medium transition-all ${
                selectedDateIndex === index
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600'
              }`}
            >
              {schedule.date}
            </button>
          ))}
        </div>
      </div>
      
      <BookingGrid 
        schedule={schedules[selectedDateIndex]} 
        isAdminMode={false} 
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