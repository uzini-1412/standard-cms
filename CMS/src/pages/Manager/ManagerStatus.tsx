import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ManagerFilterModal} from './ManagerFilterModal';
import { ActiveFilterTags } from '../../shared/ui/ActiveFilterTags';
import { Pagination } from '../../shared/components/Pagination';
import { ListFilter } from 'lucide-react';
import { CustomerContactDetailModal } from '../Customer/CustomerContactDetailModal';
import { getRegionColor } from '../../shared/utils/colorMapping';

import { getAllManagers } from '../../api/manager';
import { ManagerWithCompany, ManagerFilterOptions } from '../../types/manager';

export function ManagerStatus() {
  // [변경] DB 데이터를 담을 State
  const [managers, setManagers] = useState<ManagerWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ManagerWithCompany | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(0); 
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);
  const [highlightedCustomerId, setHighlightedCustomerId] = useState<number | null>(null);
  const [highlightedContactId, setHighlightedContactId] = useState<number | null>(null);
  
  const [filters, setFilters] = useState<ManagerFilterOptions>({
    기업명: '',
    담당자: '',
    지역구분: '',
    업종: '',
    정렬: '',
  });
  
  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  // 1. DB 데이터 가져오기 (마운트 시)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dbData = await getAllManagers();

        // DB 데이터(영어) -> UI 데이터(한글) 매핑
        const mappedData = dbData.map((item: any) => ({
          id: item.id,
          customerId: item.company_id, // 하이라이트용
          
          // 회사 정보 매핑
          기업명: item.company_name || '(삭제된 회사)',
          지역구분: item.region || '-',
          업종: item.industry || '-',
          
          // 담당자 정보 매핑
          //등록일자: item.reg_date ? String(item.reg_date).split('T')[0] : '',
          등록일자: item.reg_date,
          담당자: item.name,
          부서: item.department,
          직책: item.position,
          휴대전화: item.mobile_phone,
          이메일: item.email,
          비고: item.note
        }));

        setManagers(mappedData);
      } catch (error) {
        console.error("담당자 목록 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. URL 파라미터 처리
  useEffect(() => {
    const customerIdParam = searchParams.get('highlightCustomerId');
    const contactIdParam = searchParams.get('highlightContactId');
    if (customerIdParam && contactIdParam) {
      setHighlightedCustomerId(parseInt(customerIdParam, 10));
      setHighlightedContactId(parseInt(contactIdParam, 10));
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // 3. 스크롤 이동
  useEffect(() => {
    if (highlightedContactId && highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedContactId]);

  // 4. 화면 높이 계산
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const availableHeight = containerHeight - 45 - 44 - 5; 
        const calculatedItems = Math.floor(availableHeight / 42);
        if (calculatedItems > 0) setItemsPerPage(Math.max(5, calculatedItems));
      }
    };
    setTimeout(calculateItemsPerPage, 100);
    window.addEventListener('resize', calculateItemsPerPage);
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, []);

  // 5. 활성화된 필터 목록
  const activeFilters = useMemo(() => {
    const active: { key: keyof ManagerFilterOptions; label: string; value: string }[] = [];
    if (filters.기업명) active.push({ key: '기업명', label: '기업명', value: filters.기업명 });
    if (filters.담당자) active.push({ key: '담당자', label: '담당자', value: filters.담당자 });
    if (filters.지역구분) active.push({ key: '지역구분', label: '지역구분', value: filters.지역구분 });
    if (filters.업종) active.push({ key: '업종', label: '업종', value: filters.업종 });
    if (filters.정렬) active.push({ key: '정렬', label: '정렬', value: filters.정렬 });
    return active;
  }, [filters]);

  const removeFilter = (key: keyof ManagerFilterOptions) => setFilters({ ...filters, [key]: '' });

  // 6. 필터링 로직 (DB 데이터 기반)
  const filteredManagers = useMemo(() => {
    let result = managers.filter(manager => {
      if (filters.기업명 && !manager.기업명.toLowerCase().includes(filters.기업명.toLowerCase())) return false;
      if (filters.담당자 && !manager.담당자.toLowerCase().includes(filters.담당자.toLowerCase())) return false;
      if (filters.지역구분 && manager.지역구분 !== filters.지역구분) return false;
      if (filters.업종 && !manager.업종.toLowerCase().includes(filters.업종.toLowerCase())) return false;
      return true;
    });

    if (filters.정렬 === '내림차순') {
      result = result.sort((a, b) => new Date(b.등록일자).getTime() - new Date(a.등록일자).getTime());
    } else if (filters.정렬 === '기업명순') {
      result = result.sort((a, b) => a.기업명.localeCompare(b.기업명, 'ko-KR'));
    } else {
      // 기본값: 오름차순 
     result.sort((a, b) => a.id - b.id); 
    }

    return result;
  }, [managers, filters]);

  // 7. 페이지네이션
  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);
  const paginatedManagers = useMemo(() => {
    if (itemsPerPage === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredManagers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredManagers, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters: ManagerFilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // 하이라이트 페이지 자동 이동
  useEffect(() => {
    if (highlightedCustomerId && highlightedContactId && itemsPerPage > 0 && filteredManagers.length > 0) {
      const itemIndex = filteredManagers.findIndex(
        m => m.customerId === highlightedCustomerId && m.id === highlightedContactId
      );
      if (itemIndex !== -1) {
        const targetPage = Math.floor(itemIndex / itemsPerPage) + 1;
        setCurrentPage(targetPage);
      }
    }
  }, [highlightedCustomerId, highlightedContactId, itemsPerPage, filteredManagers]);

  const handleMouseLeave = (customerId: number, contactId: number) => {
    if (highlightedCustomerId === customerId && highlightedContactId === contactId) {
      setHighlightedCustomerId(null);
      setHighlightedContactId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-full">로딩중...</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-white h-[calc(100vh-80px)] flex flex-col">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex-1 flex flex-col w-full">
        <ActiveFilterTags filters={activeFilters} onRemove={removeFilter} />
        
        <div className="mb-2 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            {formattedDate} <span className="ml-2 font-semibold">{filteredManagers.length}명 담당자</span>
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

        <div className="flex-1 min-h-0 bg-white rounded-lg  overflow-hidden flex flex-col" style={{ height: 'calc(100% - 2%)', maxHeight: 'calc(100% - 2%)' }} ref={tableContainerRef}>
          <div className="flex-1 overflow-auto scrollbar-hide">
            <table className="w-full">
              <thead className="bg-blue-500 text-white border-b border-blue-600 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">No.</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">등록일자</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">기업명</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">지역구분</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">업종</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">담당자</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">부서</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">직책</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">휴대전화</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">이메일</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedManagers.length > 0 ? (
                  paginatedManagers.map((manager, index) => {
                    const isHighlighted = highlightedCustomerId === manager.customerId && highlightedContactId === manager.id;
                    const baseRowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                    const hoverClass = isHighlighted ? 'hover:bg-yellow-100' : 'hover:bg-blue-50';
                    const highlightClass = isHighlighted ? 'bg-yellow-200' : baseRowClass;
                    
                    return (
                      <tr 
                        key={`${manager.기업명}-${manager.id}`} 
                        className={`${hoverClass} ${highlightClass} transition cursor-pointer`}
                        onClick={() => setSelectedContact(manager)}
                        ref={isHighlighted ? highlightedRowRef : null}
                        onMouseLeave={() => handleMouseLeave(manager.customerId || 0, manager.id)}
                      >
                        <td className="px-4 py-3 text-center text-[11px]">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="px-4 py-3 text-center text-[11px] max-w-[100px] truncate">{manager.등록일자 ? String(manager.등록일자).split('T')[0] : '-'}</td>
                        <td className="px-4 py-3 text-center text-[11px] text-gray-900 max-w-[150px] truncate">{manager.기업명}</td>
                        <td className="px-4 py-3 text-center text-[11px] max-w-[80px] truncate">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold inline-block"
                            style={{ 
                              backgroundColor: `${getRegionColor(manager.지역구분)}20`, 
                              color: getRegionColor(manager.지역구분) 
                            }}
                          >
                            {manager.지역구분}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-[11px] max-w-[100px] truncate">{manager.업종}</td>
                        <td className="px-4 py-3 text-center text-[11px] text-gray-900 max-w-[100px] truncate">{manager.담당자}</td>
                        <td className="px-4 py-3 text-center text-[11px] max-w-[100px] truncate">{manager.부서 || '-'}</td>
                        <td className="px-4 py-3 text-center text-[11px] max-w-[100px] truncate">{manager.직책 || '-'}</td>
                        <td className="px-4 py-3 text-center text-[11px] max-w-[120px] truncate">{manager.휴대전화 || '-'}</td>
                        <td className="px-4 py-3 text-center text-[11px] max-w-[150px] truncate">{manager.이메일 || '-'}</td>
                        <td className="px-4 py-3 text-center text-[11px] max-w-[200px] truncate">{manager.비고 || '-'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-500">
                      담당자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
      <ManagerFilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} onFilterChange={handleFilterChange} />
      <CustomerContactDetailModal isOpen={selectedContact !== null} 
        onClose={() => setSelectedContact(null)} 
        data={selectedContact ? {
            ...selectedContact,
            등록일자: selectedContact.등록일자 ? String(selectedContact.등록일자).split('T')[0] : '-'
          } : null} />
    </div>
  );
}