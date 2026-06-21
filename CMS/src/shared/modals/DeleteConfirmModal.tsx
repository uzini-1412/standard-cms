import { useState } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerNumber: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, customerNumber }: DeleteConfirmModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    setStep(2);
  };

  const handleDeleteClick = () => {
    if (inputValue === customerNumber) {
      onConfirm();
      handleClose();
    } else {
      alert('고객번호가 일치하지 않습니다.');
    }
  };

  const handleClose = () => {
    setStep(1);
    setInputValue('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-[450px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 1 ? (
          <>
            <h3 className="text-lg font-bold mb-4">고객 삭제</h3>
            <p className="text-gray-700 mb-6">정말 삭제하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmClick}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                확인
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-4">고객번호 확인</h3>
            <p className="text-gray-700 mb-4">삭제하려는 고객번호를 입력해주세요.</p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={customerNumber}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-6 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                삭제하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
