// 고객 현황 목록 조회 — 표준 ListTable + useClientPagedList 기반

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ListFilter, Plus } from 'lucide-react';
import { CustomerFilterModal, FilterOptions } from './CustomerFilterModal';
import { QuickAddCustomerModal } from './QuickAddCustomerModal';
import { ActiveFilterTags } from '../../shared/ui/ActiveFilterTags';
import { ListTable, type ListColumn } from '../../shared/components/list/ListTable';
import { useClientPagedList } from '../../shared/hooks/useClientPagedList';
import { PageContainer, PageToolbar, CountBadge, SearchBox } from '../../shared/components/Page';
import { BTN } from '../../shared/ui/theme';
import { getCompanies } from '../../api/company';
import { formatRevenue } from '../../shared/utils/formatters';
import { getRegionColor } from '../../shared/utils/colorMapping';

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

const DEFAULT_INDUSTRIES = ['제조업', '도소매업', '서비스업', '건설업', '정보통신업', '공공기관'];

const EMPTY_FILTERS: FilterOptions = {
  기업명: '',
  대표자: '',
  주소: '',
  지역구분: '',
  업종: '',
  업태: '',
  영업담당자: '',
};

export function CustomerStatus() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<CustomerUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(EMPTY_FILTERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  // 서버에서 고객 목록 조회 (DB 영문 필드 → 화면 한글 필드 매핑)
  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const dbData = await getCompanies();
      const mapped: CustomerUI[] = dbData.map((item: any) => ({
        id: item.id,
        기업명: item.name,
        대표자: item.ceo_name || '-',
        주소: item.address_main || '-',
        지역구분: item.region || '-',
        업종: item.industry || '-',
        업태: item.biz_status || '-',
        영업담당자: item.manager_name || '-',
        전화번호: item.tel || '-',
        등록일:
          item.created_at || item.reg_date
            ? (item.created_at || item.reg_date).split('T')[0]
            : formattedDate,
        매출규모: formatRevenue(item.recent_amount),
        직원수: item.recent_personnel ? `${item.recent_personnel}명` : '0명',
        휴대전화: item.contact_phone || '-',
        이메일: item.contact_email || '-',
        비고: item.memo || '',
      }));
      setCustomers(mapped);
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [formattedDate]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  // 빠른 등록 성공 후: 목록 새로고침 + 신규 행 강조
  const handleCreated = (newId: number) => {
    if (newId) setHighlightId(newId);
    void loadCustomers();
  };

  // 상세에서 돌아올 때 URL ?highlight=id 로 해당 행 강조
  useEffect(() => {
    const param = searchParams.get('highlight');
    if (param) {
      setHighlightId(Number(param));
      searchParams.delete('highlight');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const activeFilters = useMemo(
    () =>
      (Object.keys(filters) as Array<keyof FilterOptions>)
        .filter((key) => filters[key])
        .map((key) => ({ key, label: key, value: filters[key] })),
    [filters],
  );

  const removeFilter = (key: keyof FilterOptions) =>
    setFilters((prev) => ({ ...prev, [key]: '' }));

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return customers
      .filter((c) => {
        if (filters.기업명 && !c.기업명.toLowerCase().includes(filters.기업명.toLowerCase())) return false;
        if (filters.대표자 && !c.대표자.toLowerCase().includes(filters.대표자.toLowerCase())) return false;
        if (filters.주소 && !c.주소.toLowerCase().includes(filters.주소.toLowerCase())) return false;
        if (filters.지역구분 && c.지역구분 !== filters.지역구분) return false;
        if (filters.업종 && c.업종 !== filters.업종) return false;
        if (filters.영업담당자 && !c.영업담당자.toLowerCase().includes(filters.영업담당자.toLowerCase())) return false;
        if (
          q &&
          !`${c.기업명} ${c.대표자} ${c.영업담당자} ${c.주소} ${c.업종} ${c.업태} ${c.전화번호} ${c.휴대전화} ${c.이메일}`
            .toLowerCase()
            .includes(q)
        )
          return false;
        return true;
      })
      .sort((a, b) => b.id - a.id);
  }, [customers, filters, searchTerm]);

  const { pagedRows, baseNo, size, pagination } = useClientPagedList(filteredCustomers);

  // 강조 대상이 있는 페이지로 한 번 이동
  useEffect(() => {
    if (highlightId == null) return;
    const idx = filteredCustomers.findIndex((c) => c.id === highlightId);
    if (idx >= 0) pagination.onPageChange(Math.floor(idx / size));
    // 페이지 이동은 강조 대상이 정해질 때 한 번만 수행한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, filteredCustomers, size]);

  const industries = useMemo(() => {
    const set = new Set(DEFAULT_INDUSTRIES);
    customers.forEach((c) => {
      if (c.업종 && c.업종.trim() !== '' && c.업종 !== '-') set.add(c.업종);
    });
    return Array.from(set).sort();
  }, [customers]);

  const columns: ListColumn<CustomerUI>[] = [
    { key: 'no', label: 'No.', width: '56px', render: (_row, index) => baseNo + index + 1 },
    { key: '기업명', label: '기업명' },
    { key: '대표자', label: '대표자' },
    { key: '전화번호', label: '전화번호' },
    {
      key: '지역구분',
      label: '지역구분',
      render: (row) => (
        <span
          className="px-2 py-1 rounded text-xs font-semibold inline-block"
          style={{ backgroundColor: `${getRegionColor(row.지역구분)}20`, color: getRegionColor(row.지역구분) }}
        >
          {row.지역구분}
        </span>
      ),
    },
    { key: '주소', label: '주소', align: 'left' },
    { key: '업종', label: '업종' },
    { key: '업태', label: '업태' },
    { key: '매출규모', label: '최근 매출규모' },
    { key: '직원수', label: '인원' },
    { key: '영업담당자', label: '영업담당자' },
    { key: '휴대전화', label: '휴대전화' },
    { key: '이메일', label: '이메일' },
  ];

  return (
    <PageContainer>
      <PageToolbar
        title="고객 현황"
        meta={
          <>
            <CountBadge>{filteredCustomers.length}개 기업</CountBadge>
            <span className="hidden text-sm text-slate-400 sm:inline">{formattedDate} 기준</span>
          </>
        }
        actions={
          <>
            <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="기업·대표자·담당자…" />
            <button onClick={() => setIsFilterOpen(true)} className={BTN.secondary}>
              <ListFilter className="h-4 w-4" />
              필터
            </button>
            <button onClick={() => setIsQuickAddOpen(true)} className={BTN.primary}>
              <Plus className="h-4 w-4" />
              고객 추가
            </button>
          </>
        }
      />

      <ActiveFilterTags filters={activeFilters} onRemove={removeFilter} />

      <ListTable<CustomerUI>
        columns={columns}
        rows={pagedRows}
        isLoading={isLoading}
        minWidth="1100px"
        emptyCell="-"
        emptyText="등록된 고객이 없습니다."
        highlightedKey={highlightId}
        onRowClick={(row) => navigate(`/customer-status/${row.id}`)}
        pagination={pagination}
      />

      <CustomerFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={(next) => setFilters(next)}
        industries={industries}
      />

      <QuickAddCustomerModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onCreated={handleCreated}
        onOpenDetailForm={() => navigate('/customer-status/add')}
        industries={industries}
      />
    </PageContainer>
  );
}
