import React from "react";
import { BookingSlot } from "./BookingSlot"; // BookingSlotコンポーネントをインポート
import { Schedule, TimeSlot } from "@/lib/types"; // Schedule型とTimeSlot型をインポート

interface BookingGridProps {
  schedule: Schedule; // スケジュールデータ
  isAdminMode: boolean; // 管理者モードかどうか
  // 予約スロットがクリックされたときのハンドラ
  onSlotClick: (dateTime: string) => void;
}

/**
 * 1日分の予約枠全体を表示するコンポーネントです。
 * 各15分枠はBookingSlotコンポーネントとして描画され、内部スクロールはしません。
 */
export const BookingGrid: React.FC<BookingGridProps> = ({
  schedule,
  isAdminMode,
  onSlotClick,
}) => {

  return (
    <div
      // overflow-y-auto を削除しました。これにより、BookingGrid内部でのスクロールは発生しません。
      // max-h-[calc(100vh-10rem)] は、ヘッダーとフッターの高さ、およびメインコンテンツのパディングを考慮した
      // 最大高さです。この値を調整することで、コンテンツが画面に収まるように試みます。
      // ただし、時間枠の数が非常に多い場合は、ページ全体がスクロールする可能性があります。
      className="bg-white py-6 p-2 rounded-lg
                 max-w-4xl mx-auto h-auto max-h-[calc(100vh-10rem)]"
    >
      {/* 日付表示 */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {schedule.date} の予約状況
      </h2>
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">予約の10分前までにお越しください</h2>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-1 justify-items-center">
        {/* スケジュール内の各スロットをマップしてBookingSlotを描画 */}
        {schedule.slots.map((slot: TimeSlot) => (
          <BookingSlot
            key={slot.dateTime} // keyには一意なdateTimeを使用
            slot={slot} // TimeSlotオブジェクト全体をslot propとして渡す
            isAdminMode={isAdminMode}
            onClick={onSlotClick} // クリックハンドラを渡す
          />
        ))}
      </div>
    </div>
  );
};
