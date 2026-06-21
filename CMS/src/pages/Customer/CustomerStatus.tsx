//고객 현황 목록 조회

import { CustomerTable } from './CustomerTable';
import { CustomerFilterModal, FilterOptions } from './CustomerFilterModal';
import { ActiveFilterTags } from '../../shared/ui/ActiveFilterTags';
import { ListFilter } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHighlightNavigation } from '../hooks/useHighlightNavigation';
import { getCompanies } from '../../api/company';
import { formatRevenue } from '../../shared/utils/formatters';

interface CustomerUI {
  id: number;
  기업명: string;
  대표자: string;
  주소: string;
  지역구분: string;
  업종: string;
  업태: string;
  영업담당자: string;
  전화번호: string;
  등록일: string;
  매출규모: string;
  직원수: string;
  휴대전화: string;
  이메일: string;
  비고: string;
}

export function CustomerStatus() {
  const [customers, setCustomers] = useState<CustomerUI[]>([]); 
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(0); 
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<FilterOptions>({
    기업명: '',
    대표자: '',
    주소: '',
    지역구분: '',
    업종: '',
    업태: '',
    영업담당자: '',
  });
  
  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  // 서버에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbData = await getCompanies();

        // 2. DB 데이터(영어) -> UI 데이터(한국어) 변환
        const mappedData = dbData.map((item: any) => ({
          id: item.id,
          기업명: item.name,
          대표자: item.ceo_name || '-',
          주소: item.address_main || '-',
          지역구분: item.region || '-',
          업종: item.industry || '-',
          업태: item.biz_status || '-',
          영업담당자: item.manager_name || '-', 
          전화번호: item.tel || '-',
          등록일: item.created_at || item.reg_date ? (item.created_at || item.reg_date).split('T')[0] : formattedDate,

          매출규모: formatRevenue(item.recent_amount), 
          직원수: item.recent_personnel ? `${item.recent_personnel}명` : '0명',
          

          // 고객담당자의 이름/번호/이메일
          담당자명: item.contact_name || '-',
          휴대전화: item.contact_phone || '-',
          이메일: item.contact_email || '-',

          비고: item.memo || ''
        }));
        
        setCustomers(mappedData);

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };

    fetchData();
  }, []);


  // 화면 높이에 따라 페이지당 항목 수 동적 계산
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
          const newItemsPerPage = Math.max(5, calculatedItems); 
          setItemsPerPage(newItemsPerPage);
        }
      }
    };

    setTimeout(calculateItemsPerPage, 100);
    window.addEventListener('resize', calculateItemsPerPage);
    
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, []);

  // 활성화된 필터 목록
  const activeFilters = useMemo(() => {
    const active: { key: keyof FilterOptions; label: string; value: string }[] = [];
    
    (Object.keys(filters) as Array<keyof FilterOptions>).forEach((key) => {
      if (filters[key]) {
        active.push({
          key,
          label: key,
          value: filters[key]
        });
      }
    });
    
    return active;
  }, [filters]);

  const removeFilter = (key: keyof FilterOptions) => {
    setFilters({
      ...filters,
      [key]: ''
    });
  };
  

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      if (filters.기업명 && !customer.기업명.toLowerCase().includes(filters.기업명.toLowerCase())) return false;
      if (filters.대표자 && !customer.대표자.toLowerCase().includes(filters.대표자.toLowerCase())) return false;
      if (filters.주소 && !customer.주소.toLowerCase().includes(filters.주소.toLowerCase())) return false;
      if (filters.지역구분 && customer.지역구분 !== filters.지역구분) return false;
      if (filters.업종 && customer.업종 !== filters.업종) return false;
      if (filters.영업담당자 && !customer.영업담당자.toLowerCase().includes(filters.영업담당자.toLowerCase())) return false;
      
      return true;
    }).sort((a, b) => b.id - a.id);
  }, [customers, filters]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const startNumber = filteredCustomers.length - (currentPage - 1) * itemsPerPage;

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  useHighlightNavigation({
    items: filteredCustomers,
    itemsPerPage: itemsPerPage,
    getId: (customer) => customer.id,
    onPageChange: setCurrentPage,
  });
  const DEFAULT_INDUSTRIES = ['제조업', '도소매업', '서비스업', '건설업', '정보통신업', '공공기관'];
  const industries = useMemo(() => {
    const industrySet = new Set(DEFAULT_INDUSTRIES);
    
    // DB에서 가져온 고객들의 업종을 하나씩 확인해서 추가
    customers.forEach(c => {
      if (c.업종 && c.업종.trim() !== '' && c.업종 !== '-') {
        industrySet.add(c.업종);
      }
    });

    return Array.from(industrySet).sort();
  }, [customers]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-white h-[calc(100vh-80px)] flex flex-col">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex-1 flex flex-col w-full">
        <ActiveFilterTags
          filters={activeFilters}
          onRemove={removeFilter}
        />
        
        <div className="mb-2 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            {formattedDate} <span className="ml-2 font-semibold">{filteredCustomers.length}개 기업</span>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/customer-status/add')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              고객 추가
            </button>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2 cursor-pointer"
            >
              <ListFilter className="w-4 h-4" />
              <span>필터</span>
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0" ref={tableContainerRef}>
          <CustomerTable 
            customers={paginatedCustomers} 
            startIndex={(currentPage - 1) * itemsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startNumber={startNumber}
          />
        </div>
      </div>

      <CustomerFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        industries={industries}
      />
    </div>
  );
}