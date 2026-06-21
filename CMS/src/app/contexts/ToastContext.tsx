import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Toast } from '../../shared/ui/Toast';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastMessage && (
        <Toast message={toastMessage} onClose={closeToast} duration={2000} />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}