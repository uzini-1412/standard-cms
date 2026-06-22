// 담당자 현황 목록 — 표준 ListTable + useClientPagedList 기반

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListFilter } from 'lucide-react';
import { ManagerFilterModal } from './ManagerFilterModal';
import { ActiveFilterTags } from '../../shared/ui/ActiveFilterTags';
import { CustomerContactDetailModal } from '../Customer/CustomerContactDetailModal';
import { ListTable, type ListColumn } from '../../shared/components/list/ListTable';
import { useClientPagedList } from '../../shared/hooks/useClientPagedList';
import { PageContainer, PageToolbar, CountBadge } from '../../shared/components/Page';
import { BTN } from '../../shared/ui/theme';
import { getRegionColor } from '../../shared/utils/colorMapping';
import { getAllManagers } from '../../api/manager';
import { ManagerWithCompany, ManagerFilterOptions } from '../../types/manager';

const EMPTY_FILTERS: ManagerFilterOptions = {
  기업명: '',
  담당자: '',
  지역구분: '',
  업종: '',
  정렬: '',
};

export function ManagerStatus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [managers, setManagers] = useState<ManagerWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ManagerWithCompany | null>(null);
  const [filters, setFilters] = useState<ManagerFilterOptions>(EMPTY_FILTERS);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  // 담당자 목록 조회 (DB 영문 필드 → 화면 한글 필드 매핑)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dbData = await getAllManagers();
        const mapped: ManagerWithCompany[] = dbData.map((item: any) => ({
          id: item.id,
          customerId: item.company_id,
          기업명: item.company_name || '(삭제된 회사)',
          지역구분: item.region || '-',
          업종: item.industry || '-',
          등록일자: item.reg_date,
          담당자: item.name,
          부서: item.department,
          직책: item.position,
          휴대전화: item.mobile_phone,
          이메일: item.email,
          비고: item.note,
        }));
        setManagers(mapped);
      } catch (error) {
        console.error('담당자 목록 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  // 상세에서 돌아올 때 URL 파라미터로 해당 행 강조
  useEffect(() => {
    const contactIdParam = searchParams.get('highlightContactId');
    if (contactIdParam) {
      setHighlightId(Number(contactIdParam));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const activeFilters = useMemo(() => {
    const active: { key: keyof ManagerFilterOptions; label: string; value: string }[] = [];
    if (filters.기업명) active.push({ key: '기업명', label: '기업명', value: filters.기업명 });
    if (filters.담당자) active.push({ key: '담당자', label: '담당자', value: filters.담당자 });
    if (filters.지역구분) active.push({ key: '지역구분', label: '지역구분', value: filters.지역구분 });
    if (filters.업종) active.push({ key: '업종', label: '업종', value: filters.업종 });
    if (filters.정렬) active.push({ key: '정렬', label: '정렬', value: filters.정렬 });
    return active;
  }, [filters]);

  const removeFilter = (key: keyof ManagerFilterOptions) =>
    setFilters((prev) => ({ ...prev, [key]: '' }));

  const filteredManagers = useMemo(() => {
    const result = managers.filter((m) => {
      if (filters.기업명 && !m.기업명.toLowerCase().includes(filters.기업명.toLowerCase())) return false;
      if (filters.담당자 && !m.담당자.toLowerCase().includes(filters.담당자.toLowerCase())) return false;
      if (filters.지역구분 && m.지역구분 !== filters.지역구분) return false;
      if (filters.업종 && !m.업종.toLowerCase().includes(filters.업종.toLowerCase())) return false;
      return true;
    });

    if (filters.정렬 === '내림차순') {
      result.sort((a, b) => new Date(b.등록일자).getTime() - new Date(a.등록일자).getTime());
    } else if (filters.정렬 === '기업명순') {
      result.sort((a, b) => a.기업명.localeCompare(b.기업명, 'ko-KR'));
    } else {
      result.sort((a, b) => a.id - b.id);
    }
    return result;
  }, [managers, filters]);

  const { pagedRows, baseNo, size, pagination } = useClientPagedList(filteredManagers);

  // 강조 대상이 있는 페이지로 한 번 이동
  useEffect(() => {
    if (highlightId == null) return;
    const idx = filteredManagers.findIndex((m) => m.id === highlightId);
    if (idx >= 0) pagination.onPageChange(Math.floor(idx / size));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, filteredManagers, size]);

  const columns: ListColumn<ManagerWithCompany>[] = [
    { key: 'no', label: 'No.', width: '56px', render: (_row, index) => baseNo + index + 1 },
    {
      key: '등록일자',
      label: '등록일자',
      render: (row) => (row.등록일자 ? String(row.등록일자).split('T')[0] : '-'),
    },
    { key: '기업명', label: '기업명' },
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
    { key: '업종', label: '업종' },
    { key: '담당자', label: '담당자' },
    { key: '부서', label: '부서' },
    { key: '직책', label: '직책' },
    { key: '휴대전화', label: '휴대전화' },
    { key: '이메일', label: '이메일' },
    { key: '비고', label: '비고', align: 'left' },
  ];

  return (
    <PageContainer>
      <PageToolbar
        title="담당자 현황"
        meta={
          <>
            <CountBadge>{filteredManagers.length}명 담당자</CountBadge>
            <span className="hidden text-sm text-slate-400 sm:inline">{formattedDate} 기준</span>
          </>
        }
        actions={
          <button onClick={() => setIsFilterOpen(true)} className={BTN.secondary}>
            <ListFilter className="h-4 w-4" />
            필터
          </button>
        }
      />

      <ActiveFilterTags filters={activeFilters} onRemove={removeFilter} />

      <ListTable<ManagerWithCompany>
        columns={columns}
        rows={pagedRows}
        isLoading={isLoading}
        minWidth="1300px"
        emptyCell="-"
        emptyText="담당자가 없습니다."
        highlightedKey={highlightId}
        onRowClick={(row) => setSelectedContact(row)}
        pagination={pagination}
      />

      <ManagerFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={(next) => setFilters(next)}
      />
      <CustomerContactDetailModal
        isOpen={selectedContact !== null}
        onClose={() => setSelectedContact(null)}
        data={
          selectedContact
            ? {
                ...selectedContact,
                등록일자: selectedContact.등록일자 ? String(selectedContact.등록일자).split('T')[0] : '-',
              }
            : null
        }
      />
    </PageContainer>
  );
}
