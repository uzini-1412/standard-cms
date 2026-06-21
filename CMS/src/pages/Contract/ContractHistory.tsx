// 계약 현황 목록 — 표준 ListTable + useClientPagedList 기반

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListFilter } from 'lucide-react';
import { ContractFilterModal } from './ContractFilterModal';
import { ContractDetailModal } from './ContractDetailModal';
import { ActiveFilterTags } from '../../shared/ui/ActiveFilterTags';
import { ListTable, type ListColumn } from '../../shared/components/list/ListTable';
import { useClientPagedList } from '../../shared/hooks/useClientPagedList';
import { getBusinessTypeColor } from '../../shared/utils/colorMapping';
import { getAllContracts } from '../../api/contract';
import { Contract, ContractWithCompany, ContractFilterOptions } from '../../types/contract';

const EMPTY_FILTERS: ContractFilterOptions = {
  기업명: '',
  사업구분: '',
  프로젝트명: '',
  계약번호: '',
  사업기간: '',
  정렬: '',
};

export function ContractHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contracts, setContracts] = useState<ContractWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [filters, setFilters] = useState<ContractFilterOptions>(EMPTY_FILTERS);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  // 계약 목록 조회 (DB 영문 필드 → 화면 한글 필드 매핑 + 기간 계산)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dbData = await getAllContracts();
        const mapped: ContractWithCompany[] = dbData.map((item: any) => {
          const sDate = item.start_date ? String(item.start_date).split('T')[0] : '';
          const eDate = item.end_date ? String(item.end_date).split('T')[0] : '';

          let monthDisplay = '-';
          let periodDisplay = '-';
          if (sDate && eDate) {
            const start = new Date(sDate);
            const end = new Date(eDate);
            const diffMonths =
              (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
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
            사업기간: periodDisplay,
            개월수: monthDisplay,
            시작일: sDate,
            종료일: eDate,
            계약금액: item.amount ? Number(item.amount).toLocaleString() : '0',
            MD: item.md,
            PM: item.pm,
            컨설턴트: item.consultant_name,
            비고: item.note,
          };
        });
        setContracts(mapped);
      } catch (error) {
        console.error('계약 이력 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  // 상세에서 돌아올 때 URL 파라미터로 해당 행 강조
  useEffect(() => {
    const contractIdParam = searchParams.get('highlightContractId');
    if (contractIdParam) {
      setHighlightId(Number(contractIdParam));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const businessTypes = useMemo(() => {
    const types = new Set<string>();
    contracts.forEach((c) => {
      if (c.사업구분) types.add(c.사업구분);
    });
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

  const removeFilter = (key: keyof ContractFilterOptions) =>
    setFilters((prev) => ({ ...prev, [key]: '' }));

  const filteredContracts = useMemo(() => {
    const result = contracts.filter((c) => {
      if (filters.기업명 && !c.기업명.toLowerCase().includes(filters.기업명.toLowerCase())) return false;
      if (filters.사업구분 && c.사업구분 !== filters.사업구분) return false;
      if (filters.프로젝트명 && !c.프로젝트명.toLowerCase().includes(filters.프로젝트명.toLowerCase())) return false;
      if (filters.계약번호 && !c.계약번호.toLowerCase().includes(filters.계약번호.toLowerCase())) return false;
      if (filters.사업기간) {
        const term = filters.사업기간.toLowerCase();
        const period = (c.사업기간 || '').toLowerCase();
        const months = (c.개월수 || '').toLowerCase();
        if (!period.includes(term) && !months.includes(term)) return false;
      }
      return true;
    });

    if (filters.정렬 === '오름차순') {
      result.sort((a, b) => new Date(a.계약일).getTime() - new Date(b.계약일).getTime());
    } else if (filters.정렬 === '내림차순') {
      result.sort((a, b) => new Date(b.계약일).getTime() - new Date(a.계약일).getTime());
    } else if (filters.정렬 === '기업명순') {
      result.sort((a, b) => a.기업명.localeCompare(b.기업명, 'ko-KR'));
    } else {
      result.sort((a, b) => a.id - b.id);
    }
    return result;
  }, [contracts, filters]);

  const { pagedRows, baseNo, size, pagination } = useClientPagedList(filteredContracts);

  // 강조 대상이 있는 페이지로 한 번 이동
  useEffect(() => {
    if (highlightId == null) return;
    const idx = filteredContracts.findIndex((c) => c.id === highlightId);
    if (idx >= 0) pagination.onPageChange(Math.floor(idx / size));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, filteredContracts, size]);

  const columns: ListColumn<ContractWithCompany>[] = [
    { key: 'no', label: 'No.', width: '56px', render: (_row, index) => baseNo + index + 1 },
    {
      key: '사업구분',
      label: '사업구분',
      render: (row) => (
        <span
          className="px-2 py-1 rounded text-xs font-semibold inline-block"
          style={{
            backgroundColor: `${getBusinessTypeColor(row.사업구분)}20`,
            color: getBusinessTypeColor(row.사업구분),
          }}
        >
          {row.사업구분}
        </span>
      ),
    },
    { key: '계약번호', label: '계약번호' },
    { key: '계약일', label: '계약일' },
    { key: '기업명', label: '기업명' },
    { key: '프로젝트명', label: '프로젝트명', align: 'left' },
    { key: '개월수', label: '사업기간' },
    { key: '계약금액', label: '계약금액', align: 'right' },
    { key: 'MD', label: 'MD' },
    { key: '컨설턴트', label: '담당 컨설턴트' },
    { key: '비고', label: '비고', align: 'left' },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex-1 flex flex-col w-full">
        <ActiveFilterTags filters={activeFilters} onRemove={removeFilter} />

        <div className="mb-2 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            {formattedDate}
            <span className="ml-2 font-semibold">{filteredContracts.length}건 계약</span>
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

        <ListTable<ContractWithCompany>
          columns={columns}
          rows={pagedRows}
          isLoading={isLoading}
          minWidth="1500px"
          emptyCell="-"
          emptyText="계약 내역이 없습니다."
          highlightedKey={highlightId}
          onRowClick={(row) => setSelectedContract(row)}
          pagination={pagination}
        />
      </div>

      <ContractFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={(next) => setFilters(next)}
        businessTypes={businessTypes}
      />
      <ContractDetailModal
        isOpen={selectedContract !== null}
        onClose={() => setSelectedContract(null)}
        data={selectedContract}
      />
    </div>
  );
}
