import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface SlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function SlideModal({ 
  isOpen, 
  onClose, 
  title,
  children,
  footer
}: SlideModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Slide Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-96 bg-white  z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-6 border-t border-gray-200">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
