/**
 * @interface Booking
 * @description Firestoreに保存される個々の予約データ構造を定義します。
 * 要件定義で指定された「id、予約者名、予約時間」に対応します。
 */
export interface Booking {
  id: string;          // 予約を一意に識別するID (FirestoreのドキュメントIDなど)
  bookerName: string;  // 予約者名
  bookingTime: string; // 予約された具体的な日時 (例: "2025-07-08T10:00:00" または "2025-07-08 10:00")
                       // ISO 8601形式の文字列を推奨します。
}

/**
 * @interface TimeSlot
 * @description UIで表示される15分刻みの時間枠の情報を定義します。
 * 予約済みかどうかの状態や、表示用の予約者名を含みます。
 */
export interface TimeSlot {
  time: string;        // 15分刻みの時間表示 (例: "10:00")
  dateTime: string;    // その時間枠の完全な日時 (例: "2025-07-08T10:00:00")
                       // 予約データと紐付けるための正確な日時情報
  isBooked: boolean;   // この時間枠が予約済みかどうか
  bookingId?: string;  // 予約済みの場合、その予約のID (キャンセル時に使用)
  bookerName?: string; // 予約済みの場合、予約者名 (管理者モードでのみ表示)
}

/**
 * @type Schedule
 * @description 1日分の予約スケジュールを表す型。
 * TimeSlotオブジェクトの配列として定義します。
 */
export type Schedule = {
  date: string;
  slots: TimeSlot[];
};

/**
 * @enum Mode
 * @description アプリケーションの表示モード (ユーザーモード/管理者モード) を定義します。
 */
export enum Mode {
  User = 'user',
  Admin = 'admin',
}
