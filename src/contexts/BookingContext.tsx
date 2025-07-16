"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Booking, Schedule, TimeSlot } from '@/lib/types';

interface BookingContextType {
  bookings: Booking[];
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  updateBookings: (newBookings: Booking[]) => void;
  updateScheduleWithBookings: (bookings: Booking[]) => void;
  refreshBookings: () => Promise<void>;
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
      // この部分は後でfirebase.tsと連携します
      console.log('予約データを更新中...');
      // const allBookings = await bookingService.getAll();
      // updateBookings(allBookings);
    } catch (err) {
      setError('予約データの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const value: BookingContextType = {
    bookings,
    schedules,
    loading,
    error,
    updateBookings,
    updateScheduleWithBookings,
    refreshBookings,
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