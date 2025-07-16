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

// Firebase-ö
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ≥ÏØ∑ÁÛ¬g
export const bookingsCollection = collection(db, 'bookings');

// àµ¸”π
export const bookingService = {
  // hà«¸øí÷ó
  async getAll(): Promise<Booking[]> {
    try {
      console.log('FirestoreKâà«¸øí÷ó-...');
      const querySnapshot = await getDocs(bookingsCollection);
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        bookerName: doc.data().bookerName,
        bookingTime: doc.data().bookingTime,
      } as Booking));
      
      console.log('÷óW_à«¸ø:', bookings);
      return bookings;
    } catch (error) {
      console.error('à«¸øn÷ók1WW~W_:', error);
      throw new Error('à«¸øn÷ók1WW~W_');
    }
  },

  // ∞èàí\
  async create(bookerName: string, bookingTime: string): Promise<string> {
    try {
      console.log('∞èàí\-...', { bookerName, bookingTime });
      const docRef = await addDoc(bookingsCollection, {
        bookerName,
        bookingTime,
        createdAt: Timestamp.now()
      });
      
      console.log('àL\Uå~W_:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('àn\k1WW~W_:', error);
      throw new Error('àn\k1WW~W_');
    }
  },

  // àí≠„ÛªÎàhBìg"	
  async deleteByNameAndTime(bookerName: string, bookingTime: string): Promise<boolean> {
    try {
      console.log('àí≠„ÛªÎ-...', { bookerName, bookingTime });
      const q = query(
        bookingsCollection,
        where('bookerName', '==', bookerName),
        where('bookingTime', '==', bookingTime)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('≠„ÛªÎ˛anàLãdKä~[ì');
        return false;
      }

      // pnàLãdKc_4hfJd
      await Promise.all(
        querySnapshot.docs.map(docSnapshot => 
          deleteDoc(doc(db, 'bookings', docSnapshot.id))
        )
      );
      
      console.log('àL≠„ÛªÎUå~W_');
      return true;
    } catch (error) {
      console.error('àn≠„ÛªÎk1WW~W_:', error);
      throw new Error('àn≠„ÛªÎk1WW~W_');
    }
  }
};