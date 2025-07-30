import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { Booking } from './types';

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// デバッグ用：設定値を確認
console.log('Firebase設定確認:', {
  apiKey: firebaseConfig.apiKey ? '設定済み' : '未設定',
  authDomain: firebaseConfig.authDomain ? '設定済み' : '未設定',
  projectId: firebaseConfig.projectId ? '設定済み' : '未設定',
  storageBucket: firebaseConfig.storageBucket ? '設定済み' : '未設定',
  messagingSenderId: firebaseConfig.messagingSenderId ? '設定済み' : '未設定',
  appId: firebaseConfig.appId ? '設定済み' : '未設定'
});

// Firebase初期化
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Firestoreキャッシュを有効化（パフォーマンス向上）
import { enableNetwork } from 'firebase/firestore';

// 接続を事前に確立
enableNetwork(db).catch(console.error);

// コレクション参照
export const bookingsCollection = collection(db, 'bookings');

// メモリキャッシュ（簡易実装）
let cachedBookings: Booking[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30秒

// 予約サービス
export const bookingService = {
  // 全予約データを取得
  async getAll(): Promise<Booking[]> {
    try {
      console.log('Firestoreから予約データを取得中...');
      
      // キャッシュチェック
      const now = Date.now();
      if (cachedBookings && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('キャッシュからデータを取得');
        return cachedBookings;
      }
      
      console.time('Firestore取得時間');
      
      // タイムアウト処理を追加
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('タイムアウト: 10秒以内に応答がありませんでした')), 10000);
      });
      
      const querySnapshot = await Promise.race([
        getDocs(bookingsCollection),
        timeoutPromise
      ]);
      
      console.timeEnd('Firestore取得時間');
      
      const bookings = (querySnapshot as { docs: { id: string; data: () => { bookerName: string; bookingTime: string } }[] }).docs.map((doc) => ({
        id: doc.id,
        bookerName: doc.data().bookerName,
        bookingTime: doc.data().bookingTime,
      } as Booking));
      
      // キャッシュに保存
      cachedBookings = bookings;
      cacheTimestamp = now;
      
      console.log('取得した予約データ:', bookings);
      return bookings;
    } catch (error: unknown) {
      console.error('予約データの取得に失敗しました:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('タイムアウト')) {
        throw new Error('サーバーの応答が遅すぎます。しばらくしてから再試行してください。');
      }
      throw new Error('予約データの取得に失敗しました');
    }
  },

  // 新規予約を作成
  async create(bookerName: string, bookingTime: string): Promise<string> {
    try {
      console.log('新規予約を作成中...', { bookerName, bookingTime });
      const docRef = await addDoc(bookingsCollection, {
        bookerName,
        bookingTime,
        createdAt: Timestamp.now()
      });
      
      // キャッシュを無効化
      cachedBookings = null;
      cacheTimestamp = 0;
      
      console.log('予約が作成されました:', docRef.id);
      return docRef.id;
    } catch (error: unknown) {
      console.error('予約の作成に失敗しました:', error);
      throw new Error('予約の作成に失敗しました');
    }
  },

  // 予約をキャンセル（予約者名と時間で検索）
  async deleteByNameAndTime(bookerName: string, bookingTime: string): Promise<boolean> {
    try {
      console.log('予約をキャンセル中...', { bookerName, bookingTime });
      const q = query(
        bookingsCollection,
        where('bookerName', '==', bookerName),
        where('bookingTime', '==', bookingTime)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('キャンセル対象の予約が見つかりません');
        return false;
      }

      // 複数の予約が見つかった場合、全て削除
      await Promise.all(
        querySnapshot.docs.map((docSnapshot) => 
          deleteDoc(doc(db, 'bookings', docSnapshot.id))
        )
      );
      
      // キャッシュを無効化
      cachedBookings = null;
      cacheTimestamp = 0;
      
      console.log('予約がキャンセルされました');
      return true;
    } catch (error: unknown) {
      console.error('予約のキャンセルに失敗しました:', error);
      throw new Error('予約のキャンセルに失敗しました');
    }
  }
};