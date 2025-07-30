"use client";

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookerName: string) => Promise<boolean>;
  timeSlot: string;
  loading: boolean;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  timeSlot,
  loading
}) => {
  const [bookerName, setBookerName] = useState('');
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookerName.trim()) {
      setError('予約者名を入力してください');
      return;
    }

    setError('');
    setShowConfirm(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const success = await onConfirm(bookerName.trim());
      if (success) {
        setBookerName('');
        setShowConfirm(false);
        onClose();
      } else {
        setError('指定された予約者名の予約が見つかりませんでした。');
        setShowConfirm(false);
      }
    } catch {
      setError('キャンセルに失敗しました。もう一度お試しください。');
      setShowConfirm(false);
    }
  };

  const handleClose = () => {
    setBookerName('');
    setError('');
    setShowConfirm(false);
    onClose();
  };

  const handleBackToInput = () => {
    setShowConfirm(false);
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        {!showConfirm ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              予約のキャンセル
            </h2>
            
            <div className="mb-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <span className="font-semibold">キャンセル対象:</span> {timeSlot}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <InputField
                  label="予約者名"
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  placeholder="予約時に入力したお名前を入力してください"
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
                  戻る
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={loading || !bookerName.trim()}
                  className="flex-1"
                >
                  次へ
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              キャンセル確認
            </h2>
            
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                以下の予約をキャンセルしますか？
              </p>
              <div className="space-y-1">
                <p className="font-semibold text-yellow-900">
                  予約者名: {bookerName}
                </p>
                <p className="font-semibold text-yellow-900">
                  時間: {timeSlot}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBackToInput}
                disabled={loading}
                className="flex-1"
              >
                戻る
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleConfirmCancel}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'キャンセル中...' : 'キャンセルする'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};