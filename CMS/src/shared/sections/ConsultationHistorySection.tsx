import { Plus } from 'lucide-react';
import type { ConsultationHistory } from '../../types/customer';

interface ConsultationHistorySectionProps {
  histories?: ConsultationHistory[];
  onAddClick: () => void;
  onRowClick?: (history: ConsultationHistory) => void;
}

export function ConsultationHistorySection({
  histories = [],
  onAddClick,
  onRowClick,
}: ConsultationHistorySectionProps) {
return (
    <div className="border border-gray-300 mb-4">
      <div className="bg-blue-50 px-3 py-2 flex items-center justify-between border-b border-gray-300">
        <span className="font-semibold text-xs text-gray-700">상담이력</span>
        <button
          type="button"
          onClick={onAddClick}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      
      {histories.length > 0 ? (
        <div className="max-h-[250px] overflow-y-auto overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse table-fixed min-w-[900px]">
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '47%' }} />
            </colgroup>
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f5f7ff' }}>
              <tr className="border-b border-gray-300">
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">순번</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">상담일자</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">고객참석자</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">자사참석자</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">상담내용</th>
              </tr>
            </thead>
            <tbody>
              {histories.map((history, index) => (
                <tr 
                  key={history.id} 
                  className="border-b border-gray-300 hover:bg-blue-50 cursor-pointer transition-colors bg-white"
                  onClick={() => onRowClick?.(history)}
                >
                  <td className="px-3 py-2 text-center text-xs text-gray-600">{index + 1}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600">
                    {history.상담일자 ? String(history.상담일자).split('T')[0] : '-'}
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{history.고객참석자}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{history.자사참석자}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">
                    {history.상담내용 || history.주요상담내용}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-3 py-4 text-center text-xs text-gray-500">등록된 상담이력이 없습니다.</div>
      )}
    </div>
  );
}