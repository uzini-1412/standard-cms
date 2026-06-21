import { useEffect, useRef } from 'react';
import { getBusinessTypeColor } from '../../shared/utils/colorMapping';
import { Contract } from '../../types/contract';
/*
interface ContractHistory {
  id: number;
  사업구분: string;
  계약번호: string;
  계약일: string;
  프로젝트명: string;
  시작일: string;
  종료일: string;
  사업기간: string;
  계약금액: string;
  MD: string;
  PM: string;
  컨설턴트: string;
  비고: string;
  개월수?: string;
}
*/

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Contract | null;
}

export function ContractDetailModal({ isOpen, onClose, data }: ContractDetailModalProps) {
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
        className="bg-white rounded-lg w-[720px]  min-h-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <h3 className="text-base font-bold">계약정보</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          {/* 계약정보 입력 폼 */}
          <div className="border border-gray-300">
            {/* 사업구분, 계약번호 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">사업구분</span>
              </div>
              <div className="border-r border-gray-300 px-3 py-2">
                <span 
                  className="text-xs px-2 py-1 rounded inline-block font-semibold"
                  style={{
                    backgroundColor: `${getBusinessTypeColor(data.사업구분)}20`,
                    color: getBusinessTypeColor(data.사업구분)
                  }}
                >
                  {data.사업구분}
                </span>
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">계약번호</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.계약번호}</div>
              </div>
            </div>

            {/* 계약일, 프로젝트명 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">계약일</span>
              </div>
              <div className="border-r border-gray-300 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.계약일}</div>
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">프로젝트 명</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.프로젝트명}</div>
              </div>
            </div>

            {/* 사업기간 - 한 행 전체 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">사업기간</span>
              </div>
              <div className="col-span-3 px-3 py-2 flex justify-between items-center">
                <div className="text-xs break-all whitespace-pre-wrap">
                  {data.사업기간 || ''}
                </div>
                <div className="text-xs  whitespace-nowrap ml-2">
                  ({data.개월수 || ''})
                </div>
              </div>
            </div>

            {/* 계약금액, MD */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">계약금액</span>
              </div>
              <div className="border-r border-gray-300 px-3 py-2 relative">
                <div className="text-xs break-all whitespace-pre-wrap pr-6">{data.계약금액 || ''}</div>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 pointer-events-none">원</span>
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">MD</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.MD || ''}</div>
              </div>
            </div>

            {/* PM, 컨설턴트 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">PM</span>
              </div>
              <div className="border-r border-gray-300 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.PM || ''}</div>
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">컨설턴트</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{data.컨설턴트 || ''}</div>
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
                  value={data.비고 || ''}
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