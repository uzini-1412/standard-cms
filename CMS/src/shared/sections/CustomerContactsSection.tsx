import { Plus } from 'lucide-react';
import { CustomerContact } from '../../types/customer';

interface CustomerContactsSectionProps {
  contacts?: CustomerContact[];
  onAddClick: () => void;
  onUpdate: (id: number, field: keyof CustomerContact, value: string) => void;
  onRowClick?: (contact: CustomerContact) => void;
}

export function CustomerContactsSection({
  contacts = [],
  onAddClick,
  onUpdate,
  onRowClick,
}: CustomerContactsSectionProps) {
return (
    <div className="border border-gray-300 mb-4">
      <div className="bg-blue-50 px-3 py-2 flex items-center justify-between border-b border-gray-300">
        <span className="font-semibold text-xs text-gray-700">고객담당자</span>
        <button
          type="button"
          onClick={onAddClick}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      
      {contacts.length > 0 ? (
        /* 상세 페이지와 동일하게 overflow-x-auto와 scrollbar-hide 적용 */
        <div className="max-h-[250px] overflow-y-auto overflow-x-auto scrollbar-hide">
          {/* 탭에서 찌그러지지 않게 min-w-[1000px] 설정 */}
          <table className="w-full table-fixed min-w-[1000px]" style={{ borderCollapse: 'collapse' }}>
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f5f7ff' }}>
              <tr className="border-b border-gray-300">
                <th className="px-3 py-2 text-xs font-semibold w-[60px] text-gray-600">순번</th>
                <th className="px-3 py-2 text-xs font-semibold w-[110px] text-gray-600">등록일자</th>
                <th className="px-3 py-2 text-xs font-semibold w-[90px] text-gray-600">이름</th>
                <th className="px-3 py-2 text-xs font-semibold w-[120px] text-gray-600">부서</th>
                <th className="px-3 py-2 text-xs font-semibold w-[100px] text-gray-600">직책</th>
                <th className="px-3 py-2 text-xs font-semibold w-[130px] text-gray-600">휴대전화</th>
                <th className="px-3 py-2 text-xs font-semibold w-[200px] text-gray-600">이메일</th>
                <th className="px-3 py-2 text-xs font-semibold w-[190px] text-gray-600">비고</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => (
                <tr 
                  key={contact.id} 
                  className="border-b border-gray-300 hover:bg-blue-50 cursor-pointer transition-colors bg-white"
                  onClick={() => onRowClick?.(contact)}
                >
                  <td className="px-3 py-2 text-center text-xs text-gray-600">{index + 1}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600">
                    {/* 날짜 T 자르기 적용 */}
                    {contact.등록일자 ? String(contact.등록일자).split('T')[0] : '-'}
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600  truncate">{contact.이름}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{contact.부서}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{contact.직책}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600">{contact.휴대전화}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{contact.이메일}</td>
                  <td className="px-3 py-2 text-xs text-gray-600 truncate" title={contact.비고}>{contact.비고}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-3 py-4 text-center text-xs text-gray-500">등록된 담당자가 없습니다.</div>
      )}
    </div>
  );
}