"use client";

import { BookingGrid } from '@/components/booking/BookingGrid';
import { Schedule, TimeSlot } from '@/lib/types';




// --- 初期データ ---
const generateTimeSlots = (dateStr: string, startHour: string, endHour: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  // Dateオブジェクトは日付と時刻の両方を持つため、正確な日時で初期化します。
  // 例: "2025-07-16T09:00:00"
  let currentTime = new Date(`${dateStr}T${startHour}:00`);
  const endTime = new Date(`${dateStr}T${endHour}:00`);

  // 終了時刻になるまで15分ずつ時間を進めてスロットを生成します。
  while (currentTime < endTime) {
    // UI表示用の時間 (例: "09:00")
    const timeString = currentTime.toTimeString().substring(0, 5);
    // 予約データと紐付けるための正確な日時情報 (ISO 8601形式)
    const dateTimeString = currentTime.toISOString();

    slots.push({
      time: timeString,
      dateTime: dateTimeString,
      isBooked: false, // 初期状態では予約済みではない
      // bookingId と bookerName は予約時に設定されるため、ここでは含めない
    });

    // 次の15分に進めます
    currentTime.setMinutes(currentTime.getMinutes() + 15);
  }
  return slots;
};


const initialSchedule: Schedule[] = [
  {
    date: '2025年7月16日',
    slots: generateTimeSlots('2025-07-16','10:00', '16:00'),
  },
  {
    date: '2025年7月17日',
    slots: generateTimeSlots('2025-07-17','09:30', '16:00'),
  },
];


// --- メインコンポーネント ---
export default function Home() {


  return (
    <div>
      <BookingGrid schedule={initialSchedule[0]} isAdminMode={false} onSlotClick={() => {}} />
    </div>
  );
}