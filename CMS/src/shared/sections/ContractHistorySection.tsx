import { Plus } from 'lucide-react';
import type { ContractHistory } from '../../types/customer';
import { formatMonthsOnly } from '../utils/dateCalculations';
import { getBusinessTypeColor } from '../utils/colorMapping';

interface ContractHistorySectionProps {
  histories?: ContractHistory[];
  onAddClick: () => void;
  onRowClick?: (history: ContractHistory) => void;
  handleContractClick?: (contract: ContractHistory) => void;
}

export function ContractHistorySection({
  histories = [],
  onAddClick,
  onRowClick,
  handleContractClick,
}: ContractHistorySectionProps) {
return (
    <div className="border border-gray-300 mb-6">
      <div className="bg-blue-50 px-3 py-2 flex items-center justify-between border-b border-gray-300">
        <span className="font-semibold text-xs text-gray-700">계약이력</span>
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
          <table className="w-full border-collapse table-fixed min-w-[1200px]">
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '13%' }} />
            </colgroup>
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f5f7ff' }}>
              <tr className="border-b border-gray-300">
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">No.</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">사업구분</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">계약번호</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">계약일</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">프로젝트명</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">사업기간</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">계약금액</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">MD</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">PM</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">컨설턴트</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600">비고</th>
              </tr>
            </thead>
            <tbody>
              {histories.map((contract, index) => (
                <tr 
                  key={contract.id} 
                  className={`hover:bg-blue-50 transition cursor-pointer bg-white border-b border-gray-300`}
                  onClick={() => onRowClick?.(contract)}
                >
                  <td className="px-3 py-2 text-center text-xs text-gray-600">{index + 1}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{contract.사업구분}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600">{contract.계약번호}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600">
                    {contract.계약일 ? String(contract.계약일).split('T')[0] : '-'}
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 font-medium truncate">{contract.프로젝트명}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{contract.사업기간}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 ">
                    {contract.계약금액 ? `${contract.계약금액}원` : ''}
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{contract.MD}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{contract.PM}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{contract.컨설턴트}</td>
                  <td className="px-3 py-2 text-xs text-gray-600 truncate">{contract.비고}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-3 py-4 text-center text-xs text-gray-500">등록된 계약이력이 없습니다.</div>
      )}
    </div>
  );
}