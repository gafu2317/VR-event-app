"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  let currentTime = new Date(`${dateStr}T${startHour}:00`);
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
    date: '2025年7月16日',
    slots: generateTimeSlots('2025-07-16','10:00', '16:00'),
  },
  {
    date: '2025年7月17日',
    slots: generateTimeSlots('2025-07-17','09:30', '16:00'),
  },
];

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    updateScheduleWithBookings(newBookings);
  };

  const updateScheduleWithBookings = (bookingData: Booking[]) => {
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
  };

  const refreshBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('予約データを更新中...');
      const allBookings = await bookingService.getAll();
      updateBookings(allBookings);
    } catch (err: any) {
      console.error('予約データの読み込みエラー:', err);
      
      // エラーメッセージを詳細に表示
      if (err?.message?.includes('タイムアウト')) {
        setError('サーバーの応答が遅すぎます。ネットワーク接続を確認してください。');
      } else if (err?.message?.includes('permission')) {
        setError('データベースへのアクセス権限がありません。');
      } else {
        setError('予約データの読み込みに失敗しました。Firebase設定を確認してください。');
      }
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookerName: string, bookingTime: string) => {
    setLoading(true);
    setError(null);
    try {
      await bookingService.create(bookerName, bookingTime);
      await refreshBookings(); // 作成後に最新データを取得
    } catch (err: any) {
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
      if (success) {
        await refreshBookings(); // キャンセル後に最新データを取得
      }
      return success;
    } catch (err: any) {
      setError('予約のキャンセルに失敗しました');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 初期データ読み込み（遅延実行でUI表示を優先）
  useEffect(() => {
    // UIの初期表示を優先するため、少し遅延させる
    const timer = setTimeout(() => {
      refreshBookings();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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