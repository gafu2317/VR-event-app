"use client";

import { BookingGrid } from '@/components/booking/BookingGrid';
import { useBookingContext } from '@/contexts/BookingContext';




// // --- 初期データ ---
// const generateTimeSlots = (dateStr: string, startHour: string, endHour: string): TimeSlot[] => {
//   const slots: TimeSlot[] = [];

//   // Dateオブジェクトは日付と時刻の両方を持つため、正確な日時で初期化します。
//   // 例: "2025-07-16T09:00:00"
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
//     date: '2025年7月16日',
//     slots: generateTimeSlots('2025-07-16','10:00', '16:00'),
//   },
//   {
//     date: '2025年7月17日',
//     slots: generateTimeSlots('2025-07-17','09:30', '16:00'),
//   },
// ];


// --- メインコンポーネント ---
export default function Home() {
  const { schedules, loading, error, createBooking, cancelBooking } = useBookingContext();

  const handleSlotClick = async (dateTime: string) => {
    const slot = schedules[0]?.slots.find(s => s.dateTime === dateTime);
    
    if (slot?.isBooked) {
      // 予約済みの場合：キャンセル処理
      const bookerName = prompt('キャンセルする予約者名を入力してください:');
      if (!bookerName?.trim()) {
        return;
      }

      const confirmCancel = confirm(`${bookerName}さんの予約をキャンセルしますか？`);
      if (!confirmCancel) {
        return;
      }

      try {
        const success = await cancelBooking(bookerName.trim(), dateTime);
        if (success) {
          alert('予約がキャンセルされました！');
        } else {
          alert('指定された予約者名の予約が見つかりませんでした。');
        }
      } catch (error) {
        alert('キャンセルに失敗しました。もう一度お試しください。');
      }
    } else {
      // 空き枠の場合：予約作成処理
      const bookerName = prompt('予約者名を入力してください:');
      if (!bookerName?.trim()) {
        return;
      }

      try {
        await createBooking(bookerName.trim(), dateTime);
        alert('予約が完了しました！');
      } catch (error) {
        alert('予約に失敗しました。もう一度お試しください。');
      }
    }
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h5 className="font-semibold text-blue-800 mb-2">使い方</h5>
          <ul className="text-blue-700 space-y-1">
            <li>• <strong>予約</strong>：空き枠をタップして予約者名を入力</li>
            <li>• <strong>キャンセル</strong>：予約済み枠をタップして予約者名を入力</li>
          </ul>
        </div>
      </div>
      <BookingGrid 
        schedule={schedules[0]} 
        isAdminMode={false} 
        onSlotClick={handleSlotClick} 
      />
    </div>
  );
}