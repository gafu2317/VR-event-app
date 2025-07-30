"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Booking, Schedule, TimeSlot } from '@/lib/types';
import { bookingService } from '@/lib/firebase';

interface BookingContextType {
  bookings: Booking[];
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  updateBookings: (newBookings: Booking[]) => void;
  updateScheduleWithBookings: (bookings: Booking[]) => void;
  refreshBookings: () => Promise<void>;
  createBooking: (bookerName: string, bookingTime: string) => Promise<void>;
  cancelBooking: (bookerName: string, bookingTime: string) => Promise<boolean>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

const generateTimeSlots = (dateStr: string, startHour: string, endHour: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const currentTime = new Date(`${dateStr}T${startHour}:00`);
  const endTime = new Date(`${dateStr}T${endHour}:00`);

  while (currentTime < endTime) {
    const timeString = currentTime.toTimeString().substring(0, 5);
    const dateTimeString = currentTime.toISOString();

    slots.push({
      time: timeString,
      dateTime: dateTimeString,
      isBooked: false,
    });

    currentTime.setMinutes(currentTime.getMinutes() + 15);
  }
  return slots;
};

const initialSchedules: Schedule[] = [
  {
    date: '2025年8月16日',
    slots: generateTimeSlots('2025-08-16','10:00', '16:00'),
  },
  {
    date: '2025年8月17日',
    slots: generateTimeSlots('2025-08-17','09:30', '16:00'),
  },
];

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateScheduleWithBookings = useCallback((bookingData: Booking[]) => {
    const updatedSchedules = initialSchedules.map(schedule => ({
      ...schedule,
      slots: schedule.slots.map(slot => {
        const booking = bookingData.find(b => b.bookingTime === slot.dateTime);
        return {
          ...slot,
          isBooked: !!booking,
          bookingId: booking?.id,
          bookerName: booking?.bookerName
        };
      })
    }));
    setSchedules(updatedSchedules);
  }, []);

  const updateBookings = useCallback((newBookings: Booking[]) => {
    setBookings(newBookings);
    updateScheduleWithBookings(newBookings);
  }, [updateScheduleWithBookings]);


  const refreshBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('予約データを更新中...');
      const allBookings = await bookingService.getAll();
      updateBookings(allBookings);
    } catch (err: unknown) {
      console.error('予約データの読み込みエラー:', err);
      
      // エラーメッセージを詳細に表示
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('タイムアウト')) {
        setError('サーバーの応答が遅すぎます。ネットワーク接続を確認してください。');
      } else if (errorMessage.includes('permission')) {
        setError('データベースへのアクセス権限がありません。');
      } else {
        setError('予約データの読み込みに失敗しました。Firebase設定を確認してください。');
      }
    } finally {
      setLoading(false);
    }
  }, [updateBookings]);

  const createBooking = async (bookerName: string, bookingTime: string) => {
    setLoading(true);
    setError(null);
    try {
      await bookingService.create(bookerName, bookingTime);
      // リアルタイムリスナーが自動的にデータを更新するため、refreshBookingsは不要
    } catch (err: unknown) {
      setError('予約の作成に失敗しました');
      console.error(err);
      throw err; // UIでエラーハンドリングするため再throw
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookerName: string, bookingTime: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await bookingService.deleteByNameAndTime(bookerName, bookingTime);
      // リアルタイムリスナーが自動的にデータを更新するため、refreshBookingsは不要
      return success;
    } catch (err: unknown) {
      setError('予約のキャンセルに失敗しました');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // リアルタイムリスナーを設定
  useEffect(() => {
    console.log('リアルタイムリスナーを設定中...');
    
    // リアルタイムリスナーを開始
    const unsubscribe = bookingService.subscribeToBookings((newBookings) => {
      console.log('リアルタイム更新を受信:', newBookings);
      updateBookings(newBookings);
      setLoading(false);
      setError(null);
    });

    // 初期ローディング状態
    setLoading(true);

    // クリーンアップ関数でリスナーを解除
    return () => {
      console.log('リアルタイムリスナーを解除');
      unsubscribe();
    };
  }, [updateBookings]);

  const value: BookingContextType = {
    bookings,
    schedules,
    loading,
    error,
    updateBookings,
    updateScheduleWithBookings,
    refreshBookings,
    createBooking,
    cancelBooking,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};