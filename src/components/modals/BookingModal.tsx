"use client";

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookerName: string) => Promise<void>;
  timeSlot: string;
  loading: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  timeSlot,
  loading
}) => {
  const [bookerName, setBookerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookerName.trim()) {
      setError('予約者名を入力してください');
      return;
    }

    try {
      setError('');
      await onConfirm(bookerName.trim());
      setBookerName('');
      onClose();
    } catch {
      setError('予約に失敗しました。もう一度お試しください。');
    }
  };

  const handleClose = () => {
    setBookerName('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          予約の作成
        </h2>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">予約時間:</span> {timeSlot}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputField
              label="予約者名"
              value={bookerName}
              onChange={(e) => setBookerName(e.target.value)}
              placeholder="お名前を入力してください"
              required
              disabled={loading}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={loading || !bookerName.trim()}
              className="flex-1"
            >
              {loading ? '予約中...' : '予約する'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};