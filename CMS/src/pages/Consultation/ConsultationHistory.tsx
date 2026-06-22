// 상담 현황 목록 — 표준 ListTable + useClientPagedList 기반

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListFilter } from 'lucide-react';
import { ConsultationFilterModal, ConsultationFilterOptions } from './ConsultationFilterModal';
import { ConsultationDetailModal } from './ConsultationDetailModal';
import { ActiveFilterTags } from '../../shared/ui/ActiveFilterTags';
import { ListTable, type ListColumn } from '../../shared/components/list/ListTable';
import { useClientPagedList } from '../../shared/hooks/useClientPagedList';
import { PageContainer, PageToolbar, CountBadge } from '../../shared/components/Page';
import { BTN } from '../../shared/ui/theme';
import { getRegionColor } from '../../shared/utils/colorMapping';
import { getAllConsultations } from '../../api/consultation';
import { ConsultationWithCompany } from '../../types/consultation';

const EMPTY_FILTERS: ConsultationFilterOptions = { 기업명: '', 지역구분: '', 정렬: '' };

const formatToLocalDate = (value: unknown): string => {
  if (!value) return '-';
  const date = new Date(value as string);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export function ConsultationHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [consultations, setConsultations] = useState<ConsultationWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithCompany | null>(null);
  const [filters, setFilters] = useState<ConsultationFilterOptions>(EMPTY_FILTERS);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  // 상담 목록 조회 (DB 영문 필드 → 화면 한글 필드 매핑)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dbData = await getAllConsultations();
        const mapped: ConsultationWithCompany[] = dbData.map((item: any) => ({
          id: item.id,
          customerId: item.company_id,
          기업명: item.company_name || '(삭제된 회사)',
          지역구분: item.region || '-',
          상담일자: formatToLocalDate(item.consult_date),
          시작시간: item.start_time ? item.start_time.slice(0, 5) : '',
          종료시간: item.end_time ? item.end_time.slice(0, 5) : '',
          제목: item.title,
          고객참석자: item.attendees_customer,
          자사참석자: item.attendees_company,
          장소: item.location,
          작성일: item.reg_date ? String(item.reg_date).split('T')[0] : '',
          작성자: item.writer,
          주요상담내용: item.content_general,
          상담내용: item.content_meeting,
          조치진행사항: item.content_future,
        }));
        setConsultations(mapped);
      } catch (error) {
        console.error('상담 이력 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  // 상세에서 돌아올 때 URL 파라미터로 해당 행 강조
  useEffect(() => {
    const consultationIdParam = searchParams.get('highlightConsultationId');
    if (consultationIdParam) {
      setHighlightId(Number(consultationIdParam));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const activeFilters = useMemo(() => {
    const active: { key: keyof ConsultationFilterOptions; label: string; value: string }[] = [];
    if (filters.기업명) active.push({ key: '기업명', label: '기업명', value: filters.기업명 });
    if (filters.지역구분) active.push({ key: '지역구분', label: '지역구분', value: filters.지역구분 });
    if (filters.정렬) active.push({ key: '정렬', label: '정렬', value: filters.정렬 });
    return active;
  }, [filters]);

  const removeFilter = (key: keyof ConsultationFilterOptions) =>
    setFilters((prev) => ({ ...prev, [key]: '' }));

  const filteredConsultations = useMemo(() => {
    const result = consultations.filter((c) => {
      if (filters.기업명 && !c.기업명.toLowerCase().includes(filters.기업명.toLowerCase())) return false;
      if (filters.지역구분 && c.지역구분 !== filters.지역구분) return false;
      return true;
    });

    if (filters.정렬 === '오름차순') {
      result.sort((a, b) => new Date(a.상담일자).getTime() - new Date(b.상담일자).getTime());
    } else if (filters.정렬 === '내림차순') {
      result.sort((a, b) => new Date(b.상담일자).getTime() - new Date(a.상담일자).getTime());
    } else if (filters.정렬 === '기업명순') {
      result.sort((a, b) => a.기업명.localeCompare(b.기업명, 'ko-KR'));
    } else {
      result.sort((a, b) => a.id - b.id);
    }
    return result;
  }, [consultations, filters]);

  const { pagedRows, baseNo, size, pagination } = useClientPagedList(filteredConsultations);

  // 강조 대상이 있는 페이지로 한 번 이동
  useEffect(() => {
    if (highlightId == null) return;
    const idx = filteredConsultations.findIndex((c) => c.id === highlightId);
    if (idx >= 0) pagination.onPageChange(Math.floor(idx / size));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, filteredConsultations, size]);

  const handleRowClick = (consultation: ConsultationWithCompany) => {
    setSelectedConsultation(consultation);
    setIsDetailOpen(true);
  };

  const columns: ListColumn<ConsultationWithCompany>[] = [
    { key: 'no', label: 'No.', width: '56px', render: (_row, index) => baseNo + index + 1 },
    { key: '기업명', label: '기업명' },
    {
      key: '지역구분',
      label: '지역',
      render: (row) => (
        <span
          className="px-2 py-1 rounded text-xs font-semibold inline-block"
          style={{ backgroundColor: `${getRegionColor(row.지역구분)}20`, color: getRegionColor(row.지역구분) }}
        >
          {row.지역구분}
        </span>
      ),
    },
    { key: '상담일자', label: '상담일자' },
    {
      key: '시간',
      label: '시간',
      render: (row) => (row.시작시간 && row.종료시간 ? `${row.시작시간}~${row.종료시간}` : '-'),
    },
    { key: '제목', label: '제목', align: 'left' },
    { key: '상담내용', label: '상담내용', align: 'left' },
  ];

  return (
    <PageContainer>
      <PageToolbar
        title="상담 현황"
        meta={
          <>
            <CountBadge>{filteredConsultations.length}건 상담</CountBadge>
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

      <ListTable<ConsultationWithCompany>
        columns={columns}
        rows={pagedRows}
        isLoading={isLoading}
        minWidth="1200px"
        emptyCell="-"
        emptyText="상담 내역이 없습니다."
        highlightedKey={highlightId}
        onRowClick={handleRowClick}
        pagination={pagination}
      />

      <ConsultationFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={(next) => setFilters(next)}
      />
      <ConsultationDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        consultation={selectedConsultation}
        기업명={selectedConsultation?.기업명 || ''}
        지역구분={selectedConsultation?.지역구분 || ''}
      />
    </PageContainer>
  );
}
