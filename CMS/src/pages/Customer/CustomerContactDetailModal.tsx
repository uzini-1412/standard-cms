import { useEffect, useRef } from 'react';
import { CustomerContact } from '../../types/manager';

interface CustomerContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CustomerContact | null;
}

export function CustomerContactDetailModal({ isOpen, onClose, data }: CustomerContactDetailModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && data) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(60, textareaRef.current.scrollHeight) + 'px';
    }
  }, [data]);

  if (!isOpen || !data) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-[600px]  min-h-[400px] overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <h3 className="text-base font-bold">고객 담당자</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          <div className="border border-gray-300">
            {/* 등록일자 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">등록일자</span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.등록일자}</div>
              </div>
            </div>

            {/* 이름 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">담당자</span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.담당자}</div>
              </div>
            </div>

            {/* 부서, 직책 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">부서</span>
              </div>
              <div className="border-r border-gray-300 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.부서}</div>
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">직책</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.직책}</div>
              </div>
            </div>

            {/* 휴대전화 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">휴대전화</span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.휴대전화}</div>
              </div>
            </div>

            {/* 이메일 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">이메일</span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.이메일}</div>
              </div>
            </div>

            {/* 비고 */}
            <div className="grid grid-cols-4">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-start justify-center pt-3">
                <span className="text-xs">비고</span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <textarea
                  ref={textareaRef}
                  value={data.비고}
                  readOnly
                  className="w-full border-none outline-none text-xs resize-none bg-transparent"
                  rows={3}
                  style={{ minHeight: '60px', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}