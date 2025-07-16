import React from 'react';
import { TimeSlot } from '@/lib/types'; // TimeSlot型をインポート

interface BookingSlotProps {
  slot: TimeSlot; // TimeSlotオブジェクト全体を受け取るように変更
  onClick?: (dateTime: string) => void; // クリック時のイベントハンドラ (空き枠の場合のみ)
  isAdminMode: boolean; // 管理者モードかどうか
}

/**
 * 個々の15分刻みの予約枠を表示するコンポーネントです。
 * 空きか予約済みかを視覚的に表示し、タップ（クリック）できることをアピールします。
 */
export const BookingSlot: React.FC<BookingSlotProps> = ({
  slot,
  onClick,
  isAdminMode,
}) => {
  // slotオブジェクトから必要なプロパティを抽出
  const { time, dateTime, isBooked, bookerName } = slot;

  const handleClick = () => {
    // onClickハンドラが渡されている場合、予約済み・空き関係なくクリックを処理
    if (onClick) {
      onClick(dateTime); // 正確な日時情報を渡す
    }
  };

  return (
    <div
      // Tailwind CSS クラスでスタイリング
      // 基本スタイル: flexboxで中央揃え、パディング、丸角、ボーダー、影
      // w-16 h-12: 固定サイズ (約半分に調整)
      // sm:w-20 sm:h-16: smスクリーンでのサイズ (約半分に調整)
      // md:w-24 md:h-20: mdスクリーンでのサイズ (約半分に調整)
      // lg:w-32 lg:h-24: lgスクリーンでのサイズ (約半分に調整)
      // cursor-pointer: クリック可能であることを示すカーソル
      // transition: ホバーエフェクトのためのトランジション
      className={`
        flex flex-col items-center justify-center p-2 m-1 mb-4
        rounded-md border-2 shadow-sm
        w-20 h-16 sm:w-20 sm:h-16 md:w-24 md:h-20 lg:w-32 lg:h-24
        transition-all duration-200 ease-in-out
        cursor-pointer
        ${isBooked
          ? 'bg-red-100 border-red-400 text-red-800 hover:bg-red-200 hover:shadow-md' // 予約済みの場合のスタイル
          : 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200 hover:shadow-md' // 空きの場合のスタイルとホバーエフェクト
        }
      `}
      onClick={handleClick}
    >
      {/* 時間表示 */}
      <span className="text-base font-semibold mb-0.5">{time}</span> {/* フォントサイズも調整 */}

      {/* 空きか予約済みかの表示 */}
      {isBooked ? (
        <span className="text-xs font-medium">予約済み</span> 
      ) : (
        <span className="text-xs font-medium">空き</span> 
      )}

      {/* 管理者モードで予約済みの場合のみ予約者名を表示 */}
      {isBooked && isAdminMode && bookerName && (
        <span className="text-xxs mt-0.5 text-red-600">予約者: {bookerName}</span> 
      )}
    </div>
  );
};
