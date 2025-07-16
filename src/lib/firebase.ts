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

// Firebase-�
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

// �쯷���g
export const bookingsCollection = collection(db, 'bookings');

// ���ӹ
export const bookingService = {
  // h�����֗
  async getAll(): Promise<Booking[]> {
    try {
      console.log('FirestoreK������֗-...');
      const querySnapshot = await getDocs(bookingsCollection);
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        bookerName: doc.data().bookerName,
        bookingTime: doc.data().bookingTime,
      } as Booking));
      
      console.log('֗W_����:', bookings);
      return bookings;
    } catch (error) {
      console.error('����n֗k1WW~W_:', error);
      throw new Error('����n֗k1WW~W_');
    }
  },

  // ����\
  async create(bookerName: string, bookingTime: string): Promise<string> {
    try {
      console.log('����\-...', { bookerName, bookingTime });
      const docRef = await addDoc(bookingsCollection, {
        bookerName,
        bookingTime,
        createdAt: Timestamp.now()
      });
      
      console.log('�L\U�~W_:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('�n\k1WW~W_:', error);
      throw new Error('�n\k1WW~W_');
    }
  },

  // �������hB�g"	
  async deleteByNameAndTime(bookerName: string, bookingTime: string): Promise<boolean> {
    try {
      console.log('������-...', { bookerName, bookingTime });
      const q = query(
        bookingsCollection,
        where('bookerName', '==', bookerName),
        where('bookingTime', '==', bookingTime)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('�����an�L�dK�~[�');
        return false;
      }

      // pn�L�dKc_4hfJd
      await Promise.all(
        querySnapshot.docs.map(docSnapshot => 
          deleteDoc(doc(db, 'bookings', docSnapshot.id))
        )
      );
      
      console.log('�L����U�~W_');
      return true;
    } catch (error) {
      console.error('�n����k1WW~W_:', error);
      throw new Error('�n����k1WW~W_');
    }
  }
};