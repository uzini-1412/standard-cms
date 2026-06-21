//계약 현황 목록
import { ContractFilterModal } from './ContractFilterModal';
import { ContractDetailModal } from './ContractDetailModal';
import { ActiveFilterTags } from '../../shared/ui/ActiveFilterTags';
import { Pagination } from '../../shared/components/Pagination';
import { ListFilter } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBusinessTypeColor } from '../../shared/utils/colorMapping';
import { getAllContracts } from '../../api/contract'; 
import { Contract, ContractWithCompany, ContractFilterOptions } from '../../types/contract';

export interface ContractType {
  id?: number;
  사업구분: string;
  계약번호: string;
  계약일: string;
  프로젝트명: string;
  계약금액: string;
  MD?: number | string;
  PM?: string;
  컨설턴트?: string;
  비고?: string;
  사업기간?: string; 
  개월수?: string;
  시작일?: string;
  종료일?: string;

}
/*
interface ContractWithCompany extends ContractType {
  기업명: string;
  customerId?: number;
}*/

export function ContractHistory() {
  // DB 데이터를 담을 State
  const [contracts, setContracts] = useState<ContractWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(0); 
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);
  const [highlightedCustomerId, setHighlightedCustomerId] = useState<number | null>(null);
  const [highlightedContractId, setHighlightedContractId] = useState<number | null>(null);
  
  const [filters, setFilters] = useState<ContractFilterOptions>({
    기업명: '',
    사업구분: '',
    프로젝트명: '',
    계약번호: '',
    사업기간: '',
    정렬: '',
  });
  
  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  // 1. DB에서 데이터 가져오기 (마운트 시 1회)
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setIsLoading(true);
        const dbData = await getAllContracts();

        // DB 데이터를 화면 포맷으로 변환
        const mappedData = dbData.map((item: any) => {
          
          const sDate = item.start_date ? String(item.start_date).split('T')[0] : '';
          const eDate = item.end_date ? String(item.end_date).split('T')[0] : '';

          let monthDisplay = '-';     // "N개월"
          let periodDisplay = '-';    // "날짜 ~ 날짜"

          if (sDate && eDate) {
            const start = new Date(sDate);
            const end = new Date(eDate);
            const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            
            monthDisplay = `${diffMonths}개월`;
            periodDisplay = `${sDate} ~ ${eDate}`;
          }

          return {
            id: item.id,
            customerId: item.company_id,
            기업명: item.company_name || '(삭제된 고객)',
            
            사업구분: item.biz_type,
            계약번호: item.contract_no,
            계약일: item.contract_date ? String(item.contract_date).split('T')[0] : '',
            프로젝트명: item.project_name,
            
            // 계산된 기간 표시
            사업기간: periodDisplay,
            개월수: monthDisplay, 
            시작일: sDate,
            종료일: eDate,
            
            계약금액: item.amount ? Number(item.amount).toLocaleString() : '0',
            MD: item.md,
            PM: item.pm,
            컨설턴트: item.consultant_name,
            비고: item.note
          };
        });

        setContracts(mappedData);
      } catch (error) {
        console.error("계약 이력 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, []);

  // 2. URL 파라미터로 하이라이트 처리
  useEffect(() => {
    const customerIdParam = searchParams.get('highlightCustomerId');
    const contractIdParam = searchParams.get('highlightContractId');
    if (customerIdParam && contractIdParam) {
      setHighlightedCustomerId(parseInt(customerIdParam, 10));
      setHighlightedContractId(parseInt(contractIdParam, 10));
      // 파라미터 제거
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // 3. 하이라이트된 행으로 스크롤 이동
  useEffect(() => {
    if (highlightedContractId && highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedContractId]);

  // 4. 화면 높이에 따른 페이지당 항목 수 계산
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const headerHeight = 45;
        const paginationHeight = 44;
        const rowHeight = 42;
        const safetyMargin = 5;
        
        const availableHeight = containerHeight - headerHeight - paginationHeight - safetyMargin;
        const calculatedItems = Math.floor(availableHeight / rowHeight);
        
        if (calculatedItems > 0) {
          setItemsPerPage(Math.max(5, calculatedItems));
        }
      }
    };

    // 초기 계산 지연 실행
    setTimeout(calculateItemsPerPage, 100);
    window.addEventListener('resize', calculateItemsPerPage);
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, []);

  // 5. 필터 옵션 생성 (contracts State 기반)
  const businessTypes = useMemo(() => {
    const types = new Set<string>();
    contracts.forEach(c => { if (c.사업구분) types.add(c.사업구분); });
    return Array.from(types).sort();
  }, [contracts]);

  const activeFilters = useMemo(() => {
    const active: { key: keyof ContractFilterOptions; label: string; value: string }[] = [];
    if (filters.기업명) active.push({ key: '기업명', label: '기업명', value: filters.기업명 });
    if (filters.사업구분) active.push({ key: '사업구분', label: '사업구분', value: filters.사업구분 });
    if (filters.프로젝트명) active.push({ key: '프로젝트명', label: '프로젝트명', value: filters.프로젝트명 });
    if (filters.사업기간) active.push({ key: '사업기간', label: '사업기간', value: filters.사업기간 });
    if (filters.계약번호) active.push({ key: '계약번호', label: '계약번호', value: filters.계약번호 });
    if (filters.정렬) active.push({ key: '정렬', label: '정렬', value: filters.정렬 });
    return active;
  }, [filters]);

  const removeFilter = (key: keyof ContractFilterOptions) => setFilters({ ...filters, [key]: '' });

  // 6. 필터링 및 정렬 로직
  const filteredContracts = useMemo(() => {
    let result = contracts.filter(c => {
      if (filters.기업명 && !c.기업명.toLowerCase().includes(filters.기업명.toLowerCase())) return false;
      if (filters.사업구분 && c.사업구분 !== filters.사업구분) return false;
      if (filters.프로젝트명 && !c.프로젝트명.toLowerCase().includes(filters.프로젝트명.toLowerCase())) return false;
      if (filters.계약번호 && !c.계약번호.toLowerCase().includes(filters.계약번호.toLowerCase())) return false;
      if (filters.사업기간) {
      const searchTerm = filters.사업기간.toLowerCase(); 
      const period = (c.사업기간 || '').toLowerCase();  
      const months = (c.개월수 || '').toLowerCase(); 
      if (!period.includes(searchTerm) && !months.includes(searchTerm)) {
        return false;
      }
    }
      return true;
    });

    if (filters.정렬 === '오름차순') result.sort((a, b) => new Date(a.계약일).getTime() - new Date(b.계약일).getTime());
    else if (filters.정렬 === '내림차순') result.sort((a, b) => new Date(b.계약일).getTime() - new Date(a.계약일).getTime());
    else if (filters.정렬 === '기업명순') result.sort((a, b) => a.기업명.localeCompare(b.기업명, 'ko-KR'));
    else {//기본 id기준 오름차순
      result.sort((a, b) => a.id - b.id); 
    }
    return result;
  }, [contracts, filters]);

  // 7. 페이지네이션 처리
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = useMemo(() => {
    if (itemsPerPage === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContracts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContracts, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters: ContractFilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
    // [추가] 8. 하이라이트된 항목이 있는 페이지로 자동 이동
  useEffect(() => {
    // 하이라이트할 ID가 있고, 데이터가 로딩되었으며, 페이지당 항목 수가 계산된 경우 실행
    if (highlightedContractId && itemsPerPage > 0 && filteredContracts.length > 0) {
      
      // 전체 목록에서 해당 계약의 인덱스 찾기
      const itemIndex = filteredContracts.findIndex(
        c => c.id === highlightedContractId
      );

      // 항목을 찾았다면 페이지 계산하여 이동
      if (itemIndex !== -1) {
        const targetPage = Math.floor(itemIndex / itemsPerPage) + 1;
        
        // 현재 페이지가 타겟 페이지와 다를 경우에만 변경
        if (currentPage !== targetPage) {
          setCurrentPage(targetPage);
        }
      }
    }
  }, [highlightedContractId, itemsPerPage, filteredContracts, currentPage]);

  if (isLoading) return <div className="flex justify-center items-center h-full">로딩중...</div>;


  return (
  <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-white h-[calc(100vh-80px)] flex flex-col">
    <div className="max-w-[1600px] mx-auto px-6 py-4 flex-1 flex flex-col w-full">
      <ActiveFilterTags filters={activeFilters} onRemove={removeFilter} />
      
      <div className="mb-2 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          {formattedDate} <span className="ml-2 font-semibold">{filteredContracts.length}건 계약</span>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2 cursor-pointer"
          >
            <ListFilter className="w-4 h-4" />
            <span>필터</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-lg overflow-hidden flex flex-col" style={{ height: 'calc(100% - 2%)', maxHeight: 'calc(100% - 2%)' }} ref={tableContainerRef}>
        
 
        <div className="flex-1 overflow-auto scrollbar-hide">
        
          <table className="w-full min-w-[1500px] table-fixed">
            <colgroup>
               {/* 컬럼 너비 비율 고정 (선택사항이지만 table-fixed 사용 시 권장) */}
               <col style={{ width: '4%' }} />
               <col style={{ width: '8%' }} />
               <col style={{ width: '10%' }} />
               <col style={{ width: '8%' }} />
               <col style={{ width: '12%' }} />
               <col style={{ width: '15%' }} />
               <col style={{ width: '8%' }} />
               <col style={{ width: '10%' }} />
               <col style={{ width: '7%' }} />
               <col style={{ width: '8%' }} />
               <col style={{ width: '10%' }} />
            </colgroup>
            <thead className="bg-blue-500 text-white border-b border-blue-600 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">No.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">사업구분</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">계약번호</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">계약일</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">기업명</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">프로젝트명</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">사업기간</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">계약금액</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">MD</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">담당 컨설턴트</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedContracts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-500">
                    계약 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedContracts.map((contract, index) => {
                  const isHighlighted = contract.customerId === highlightedCustomerId && contract.id === highlightedContractId;
                  return (
                    <tr 
                      key={`${contract.기업명}-${contract.id}`} 
                      className={`hover:bg-blue-50 transition cursor-pointer ${
                        isHighlighted ? 'bg-yellow-200 hover:bg-yellow-300' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                      onClick={() => setSelectedContract(contract)}
                      onMouseLeave={() => {
                        if (isHighlighted) {
                          setHighlightedCustomerId(null);
                          setHighlightedContractId(null);
                        }
                      }}
                      ref={isHighlighted ? highlightedRowRef : null}
                    >
                      <td className="px-4 py-3 text-center text-[11px]">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-4 py-3 text-center text-[11px]">
                        <span 
                          className="px-2 py-1 rounded text-xs font-semibold inline-block"
                          style={{ 
                            backgroundColor: `${getBusinessTypeColor(contract.사업구분)}20`, 
                            color: getBusinessTypeColor(contract.사업구분)
                          }}
                        >
                          {contract.사업구분}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-[11px] truncate">{contract.계약번호}</td>
                      
                      {/* [수정 3] 날짜 자르기 적용 (split) */}
                      <td className="px-4 py-3 text-center text-[11px]">
                        {contract.계약일 ? String(contract.계약일).split('T')[0] : '-'}
                      </td>
                      
                      <td className="px-4 py-3 text-center text-[11px] font-medium text-gray-900 truncate">{contract.기업명}</td>
                      <td className="px-4 py-3 text-center text-[11px] truncate">{contract.프로젝트명}</td>
                      <td className="px-4 py-3 text-center text-[11px] font-medium truncate">
                        {contract.개월수}
                      </td>
                      <td className="px-4 py-3 text-center text-[11px] truncate">{contract.계약금액}</td>
                      <td className="px-4 py-3 text-center text-[11px] truncate">{contract.MD}</td>
                      <td className="px-4 py-3 text-center text-[11px] truncate">{contract.컨설턴트}</td>
                      <td className="px-4 py-3 text-center text-[11px] truncate">{contract.비고 || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
    <ContractFilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} onFilterChange={handleFilterChange} businessTypes={businessTypes} />
    <ContractDetailModal isOpen={selectedContract !== null} onClose={() => setSelectedContract(null)} data={selectedContract} />
  </div>
);
}