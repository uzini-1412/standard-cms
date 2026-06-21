//상담 현황 목록

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConsultationFilterModal, ConsultationFilterOptions } from './ConsultationFilterModal';
import { ConsultationDetailModal } from './ConsultationDetailModal';
import { ActiveFilterTags } from '../../shared/ui/ActiveFilterTags';
import { Pagination } from '../../shared/components/Pagination';
import { ListFilter } from 'lucide-react';
import { getRegionColor } from '../../shared/utils/colorMapping';

import { getAllConsultations } from '../../api/consultation';
import { ConsultationWithCompany } from '../../types/consultation';

export function ConsultationHistory() {
  // DB 데이터를 담을 State
  const [consultations, setConsultations] = useState<ConsultationWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithCompany | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(0); 
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);
  const [highlightedCustomerId, setHighlightedCustomerId] = useState<number | null>(null);
  const [highlightedConsultationId, setHighlightedConsultationId] = useState<number | null>(null);
  
  const [filters, setFilters] = useState<ConsultationFilterOptions>({
    기업명: '',
    지역구분: '',
    정렬: '',
  });
  
  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  
  const formatToLocalDate = (dateString: any) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  // 1. DB 데이터 가져오기 (마운트 시)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dbData = await getAllConsultations();

        // DB 데이터(영어) -> UI 데이터(한글) 매핑
        const mappedData = dbData.map((item: any) => ({
          id: item.id,
          customerId: item.company_id, // 하이라이트 기능용
          
          // [핵심] JOIN으로 가져온 기업명과 지역구분 매핑
          기업명: item.company_name || '(삭제된 회사)', 
          지역구분: item.region || '-', 
          
          상담일자: formatToLocalDate(item.consult_date),
          시작시간: item.start_time ? item.start_time.slice(0, 5) : '', // HH:mm:ss -> HH:mm
          종료시간: item.end_time ? item.end_time.slice(0, 5) : '',
          
          제목: item.title,
          고객참석자: item.attendees_customer,
          자사참석자: item.attendees_company,
          장소: item.location,
          작성일: item.reg_date ? String(item.reg_date).split('T')[0] : '',
          작성자: item.writer,
          주요상담내용: item.content_general,
          상담내용: item.content_meeting,
          조치진행사항: item.content_future
        }));

        setConsultations(mappedData);
      } catch (error) {
        console.error("상담 이력 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. URL 파라미터로 하이라이트 처리
  useEffect(() => {
    const customerIdParam = searchParams.get('highlightCustomerId');
    const consultationIdParam = searchParams.get('highlightConsultationId');
    if (customerIdParam && consultationIdParam) {
      setHighlightedCustomerId(parseInt(customerIdParam, 10));
      setHighlightedConsultationId(parseInt(consultationIdParam, 10));
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // 3. 하이라이트된 행으로 스크롤 이동
  useEffect(() => {
    if (highlightedConsultationId && highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedConsultationId]);

  // 4. 화면 높이에 따른 페이지당 항목 수 계산
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

  // 5. 활성화된 필터 태그 목록
  const activeFilters = useMemo(() => {
    const active: { key: keyof ConsultationFilterOptions; label: string; value: string }[] = [];
    if (filters.기업명) active.push({ key: '기업명', label: '기업명', value: filters.기업명 });
    if (filters.지역구분) active.push({ key: '지역구분', label: '지역구분', value: filters.지역구분 });
    if (filters.정렬) active.push({ key: '정렬', label: '정렬', value: filters.정렬 });
    return active;
  }, [filters]);

  const removeFilter = (key: keyof ConsultationFilterOptions) => setFilters({ ...filters, [key]: '' });

  // 6. 필터링 로직 (DB에서 가져온 consultations 사용)
  const filteredConsultations = useMemo(() => {
    let result = consultations.filter(consultation => {
      if (filters.기업명 && !consultation.기업명.toLowerCase().includes(filters.기업명.toLowerCase())) {
        return false;
      }
      // 지역구분 필터
      if (filters.지역구분 && consultation.지역구분 !== filters.지역구분) {
        return false;
      }
      return true;
    });

    // 정렬 로직
    if (filters.정렬 === '오름차순') {
      result = result.sort((a, b) => new Date(a.상담일자).getTime() - new Date(b.상담일자).getTime());
    } else if (filters.정렬 === '내림차순') {
      result = result.sort((a, b) => new Date(b.상담일자).getTime() - new Date(a.상담일자).getTime());
    } else if (filters.정렬 === '기업명순') {
      result = result.sort((a, b) => a.기업명.localeCompare(b.기업명, 'ko-KR'));
    } else {
        // 기본값: 최신 역순
        result = result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [consultations, filters]);

  // 7. 페이지네이션
  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  const paginatedConsultations = useMemo(() => {
    if (itemsPerPage === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredConsultations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredConsultations, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters: ConsultationFilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleRowClick = (consultation: ConsultationWithCompany) => {
    setSelectedConsultation(consultation);
    setIsDetailOpen(true);
  };

  // 하이라이트된 항목이 있는 페이지로 자동 이동
  useEffect(() => {
    if (highlightedCustomerId && highlightedConsultationId && itemsPerPage > 0 && filteredConsultations.length > 0) {
      const itemIndex = filteredConsultations.findIndex(
        c => c.customerId === highlightedCustomerId && c.id === highlightedConsultationId
      );
      if (itemIndex !== -1) {
        const targetPage = Math.floor(itemIndex / itemsPerPage) + 1;
        setCurrentPage(targetPage);
      }
    }
  }, [highlightedCustomerId, highlightedConsultationId, itemsPerPage, filteredConsultations]);

  const handleMouseLeave = (customerId: number, consultationId: number) => {
    if (highlightedCustomerId === customerId && highlightedConsultationId === consultationId) {
      setHighlightedCustomerId(null);
      setHighlightedConsultationId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-full">로딩중...</div>;

  return (
  <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-white h-[calc(100vh-80px)] flex flex-col">
    <div className="max-w-[1600px] mx-auto px-6 py-4 flex-1 flex flex-col w-full">
      {/* 활성화된 필터 태그 표시 */}
      <ActiveFilterTags filters={activeFilters} onRemove={removeFilter} />
      
      <div className="mb-2 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          {formattedDate} <span className="ml-2 font-semibold">{filteredConsultations.length}건 상담</span>
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
          
          <table className="w-full min-w-[1200px] table-fixed">
            <colgroup><col style={{ width: '5%' }} /><col style={{ width: '12%' }} /><col style={{ width: '8%' }} /><col style={{ width: '10%' }} /><col style={{ width: '10%' }} /><col style={{ width: '20%' }} /><col style={{ width: '35%' }} /></colgroup>
            
            <thead className="bg-blue-500 text-white border-b border-blue-600 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">No.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">기업명</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">지역</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">상담일자</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">시간</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">제목</th>
                <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">상담내용</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedConsultations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                    상담 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedConsultations.map((consultation, index) => {
                  const isHighlighted = consultation.customerId === highlightedCustomerId && consultation.id === highlightedConsultationId;
                  return (
                    <tr 
                      key={`${consultation.기업명}-${consultation.id}`} 
                      className={`hover:bg-blue-50 transition cursor-pointer ${
                        isHighlighted ? 'bg-yellow-200 hover:bg-yellow-300' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                      onClick={() => handleRowClick(consultation)}
                      onMouseLeave={() => consultation.customerId && handleMouseLeave(consultation.customerId, consultation.id)}
                      ref={isHighlighted ? highlightedRowRef : null}
                    >
                      <td className="px-4 py-3 text-center text-[11px]">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-4 py-3 text-center text-[11px] font-medium text-gray-900 truncate">{consultation.기업명}</td>
                      <td className="px-4 py-3 text-center text-[11px]">
                        {/* 지역구분 배지 */}
                        <span 
                          className="px-2 py-1 rounded text-xs font-semibold inline-block"
                          style={{ 
                            backgroundColor: `${getRegionColor(consultation.지역구분)}20`, 
                            color: getRegionColor(consultation.지역구분)
                          }}
                        >
                          {consultation.지역구분}
                        </span>
                      </td>

                      {/* [수정 3] 상담일자 날짜 포맷팅 (T 제거) */}
                      <td className="px-4 py-3 text-center text-[11px] truncate">
                       {consultation.상담일자 || '-'}
                      </td>
                      
                      <td className="px-4 py-3 text-center text-[11px] truncate">
                         {consultation.시작시간 && consultation.종료시간 ? `${consultation.시작시간}~${consultation.종료시간}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-[11px] truncate">{consultation.제목}</td>
                      <td className="px-4 py-3 text-center text-[11px] truncate">
                        {consultation.상담내용 || '-'}
                      </td>
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
    <ConsultationFilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} onFilterChange={handleFilterChange} />
    <ConsultationDetailModal 
      isOpen={isDetailOpen} 
      onClose={() => setIsDetailOpen(false)} 
      consultation={selectedConsultation}
      기업명={selectedConsultation?.기업명 || ''} 
      지역구분={selectedConsultation?.지역구분 || ''} />
  </div>
);
}