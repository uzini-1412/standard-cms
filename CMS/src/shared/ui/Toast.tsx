import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 2000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] animate-fade-in">
      <div className="bg-white border border-sky-200 rounded-[2px] shadow-2xl px-8 py-6 min-w-[300px] max-w-[500px]">
        <p className="text-center text-base font-semibold text-gray-800 whitespace-pre-wrap">
          {message}
        </p>
      </div>
    </div>
  );
}