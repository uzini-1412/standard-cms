import { ConsultationHistory } from "../../app/contexts/CustomersContext";


interface ConsultationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: ConsultationHistory | null;
  기업명: string;
  지역구분: string;
}

export function ConsultationDetailModal({ 
  isOpen, 
  onClose, 
  consultation,
  기업명, 
  지역구분
}: ConsultationDetailModalProps) {
  
  if (!isOpen || !consultation) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-[720px]  max-h-[95vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <h3 className="text-base font-bold">상담일지</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          <div className="border border-gray-300">
            {/* 기업명 / 지역구분 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">기업명</span>
              </div>
              <div className="col-span-2 border-r border-gray-300 px-3 py-2">
                <div className="text-xs font-medium break-all whitespace-pre-wrap">{기업명}</div>
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">지역구분</span>
              </div>
              <div className="col-span-2 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{지역구분}</div>
              </div>
            </div>

            {/* 일시 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">일시</span>
              </div>
              <div className="col-span-5 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">
                  {consultation.상담일자?.split('T')[0] || '-'} {consultation.시작시간.slice(0, 5)} ~ {consultation.종료시간.slice(0, 5)}
                </div>
              </div>
            </div>

            {/* 제목 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">제목</span>
              </div>
              <div className="col-span-5 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{consultation.제목 || '-'}</div>
              </div>
            </div>

            {/* 작성자 / 작성일 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">작성자</span>
              </div>
              <div className="col-span-2 border-r border-gray-300 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{consultation.작성자 || '-'}</div>
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">작성일</span>
              </div>
              <div className="col-span-2 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{consultation.작성일 || '-'}</div>
              </div>
            </div>

            {/* 장소 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">장소</span>
              </div>
              <div className="col-span-5 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{consultation.장소 || '-'}</div>
              </div>
            </div>

            {/* 자사참석자 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">자사참석자</span>
              </div>
              <div className="col-span-5 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{consultation.자사참석자 || '-'}</div>
              </div>
            </div>

            {/* 고객 참석자 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">고객 참석자</span>
              </div>
              <div className="col-span-5 px-3 py-2">
                <div className="text-xs break-all whitespace-pre-wrap">{consultation.고객참석자 || '-'}</div>
              </div>
            </div>

            {/* 주요 상담 내용 헤더 */}
            <div className="border-b border-gray-300 bg-blue-50 py-2">
              <div className="text-center text-xs font-semibold">주요 상담 내용</div>
            </div>

            {/* 주요 상담 내용 */}
            <div className="border-b border-gray-300">
              <div className="px-3 py-2">
                <div className="w-full text-xs break-all whitespace-pre-wrap min-h-[120px]">
                  {consultation.주요상담내용 || '-'}
                </div>
              </div>
            </div>

            {/* 미팅내용 */}
            <div className="border-b border-gray-300">
              <div className="px-3 py-2">
                <div className="w-full text-xs break-all whitespace-pre-wrap min-h-[120px]">
                  {consultation.상담내용 || '-'}
                </div>
              </div>
            </div>

            {/* 조치 진행 사항 */}
            <div>
              <div className="px-3 py-2">
                <div className="w-full text-xs break-all whitespace-pre-wrap min-h-[120px]">
                  {consultation.조치진행사항 || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}