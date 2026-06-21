import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRegionColor } from '../../shared/utils/colorMapping';
import { useState, useEffect, useRef } from 'react';
import { Pagination } from '../../shared/components/Pagination';

// [수정] 부모 컴포넌트(CustomerStatus)에서 보내주는 데이터 형태와 일치시킴
interface CustomerUI {
  id: number;
  기업명: string;
  대표자: string;
  주소: string;
  지역구분: string;
  업종: string;
  업태: string;
  매출규모: string; // "3.5억" (문자열)
  직원수: string;   // "10명" (문자열)
  영업담당자: string;
  전화번호: string;
  이메일: string;
  휴대전화: string;
  // 필요한 경우 추가
  담당자명?: string; 
  부서?: string;
  직책?: string;
}

interface CustomerTableProps {
  customers: CustomerUI[]; // [수정] 타입 변경 (Customer[] -> CustomerUI[])
  startIndex?: number;
  startNumber?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

// ★ [삭제됨] formatSalesInBillion, getLatestPersonnel, getFirstContact 함수들 싹 다 제거함!

export function CustomerTable({ customers, startIndex = 0, startNumber = 1, currentPage, totalPages, onPageChange }: CustomerTableProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);

  // 하이라이트 관련 로직 (기존 유지)
  useEffect(() => {
    const highlightParam = searchParams.get('highlight');
    if (highlightParam) {
      setHighlightedId(parseInt(highlightParam, 10));
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (highlightedId && highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedId, customers]);

  const handleRowDoubleClick = (customerId: number) => {
    navigate(`/customer-status/${customerId}`);
  };

  const handleMouseLeave = (customerId: number) => {
    if (highlightedId === customerId) setHighlightedId(null);
  };

  return (
    <div className="bg-white rounded-lg  overflow-hidden flex flex-col" style={{ height: 'calc(100% - 2%)', maxHeight: 'calc(100% - 2%)' }}>
      <div className="flex-1 overflow-auto scrollbar-hide">
        <table className="w-full min-w-[900px]">
          <thead className="bg-blue-500 text-white border-b border-blue-600 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">No.</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">기업명</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">대표자</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">전화번호</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">지역구분</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">주소</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">업종</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">업태</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">최근 매출규모</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">인원</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">영업담당자</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">휴대전화</th>
              <th className="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">이메일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer, index) => {
              // ★ [수정] 복잡한 변수 선언(salesText 등) 다 삭제함
              const isHighlighted = highlightedId === customer.id;
              const baseRowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
              const hoverClass = isHighlighted ? 'hover:bg-yellow-100' : 'hover:bg-blue-50';
              const highlightClass = isHighlighted ? 'bg-yellow-200' : baseRowClass;
              
              return (
                <tr 
                  key={customer.id} 
                  className={`${hoverClass} ${highlightClass} transition cursor-pointer`}
                  onClick={() => handleRowDoubleClick(customer.id)}
                  onMouseLeave={() => handleMouseLeave(customer.id)}
                  ref={isHighlighted ? highlightedRowRef : null}
                >
                  <td className="px-2 py-3 text-center text-[11px]">{startNumber - index}</td>
                  <td className="px-2 py-3 text-center text-[11px] font-medium text-gray-900">
                    <div className="truncate max-w-[140px] mx-auto" title={customer.기업명}>
                      {customer.기업명}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center text-[11px]">
                    <div className="truncate">{customer.대표자}</div>
                  </td>
                  <td className="px-2 py-3 text-center text-[11px]">
                    <div className="truncate">{customer.전화번호}</div>
                  </td>
                  <td className="px-2 py-3 text-center text-[11px]">
                    <span 
                      className="px-2 py-1 rounded text-xs font-semibold inline-block"
                      style={{ 
                        backgroundColor: `${getRegionColor(customer.지역구분)}20`, 
                        color: getRegionColor(customer.지역구분) 
                      }}
                    >
                      {customer.지역구분}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center text-[11px]">
                    <div className="truncate max-w-[190px] mx-auto" title={customer.주소}>
                      {customer.주소}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center text-[11px]">
                    <div className="truncate">{customer.업종}</div>
                  </td>
                  <td className="px-2 py-3 text-center text-[11px]">
                    <div className="truncate">{customer.업태}</div>
                  </td>
                  
                  <td className="px-2 py-3 text-center text-[11px]">{customer.매출규모}</td>
                  <td className="px-2 py-3 text-center text-[11px]">{customer.직원수}</td>
                  
                  <td className="px-2 py-3 text-center text-[11px]">
                    <div className="truncate">{customer.영업담당자}</div>
                  </td>
                  <td className="px-2 py-3 text-center text-[11px]">
                    <div className="truncate">{customer.휴대전화}</div>
                  </td>
                  <td className="px-2 py-3 text-center text-[11px]">
                    <div className="truncate">{customer.이메일}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {currentPage !== undefined && totalPages !== undefined && onPageChange && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}