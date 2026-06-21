import { SlideModal } from '../../shared/ui/SlideModal';
import { ContractFilterOptions } from '../../types/contract';
interface ContractFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ContractFilterOptions;
  onFilterChange: (filters: ContractFilterOptions) => void;
  businessTypes?: string[];
}

export function ContractFilterModal({ 
  isOpen, 
  onClose, 
  filters = {
    기업명: '',
    사업구분: '',
    프로젝트명: '',
    계약번호: '',
    사업기간: '',
    정렬: '',
  }, 
  onFilterChange,
  businessTypes
}: ContractFilterModalProps) {
  const handleInputChange = (field: keyof ContractFilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      기업명: '',
      사업구분: '',
      프로젝트명: '',
      계약번호: '',
      사업기간: '',
      정렬: '',
    });
  };

  return (
    <SlideModal
      isOpen={isOpen}
      onClose={onClose}
      title="필터 옵션"
      footer={
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            닫기
          </button>
        </div>
      }
    >
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] p-1 scrollbar-hide">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기업명
          </label>
          <input
            type="text"
            value={filters.기업명}
            onChange={(e) => handleInputChange('기업명', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="기업명 입력"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사업구분
          </label>
          <select
            value={filters.사업구분}
            onChange={(e) => handleInputChange('사업구분', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체</option>
            {businessTypes?.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로젝트명
          </label>
          <input
            type="text"
            value={filters.프로젝트명}
            onChange={(e) => handleInputChange('프로젝트명', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="프로젝트명 입력"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            계약번호
          </label>
          <input
            type="text"
            value={filters.계약번호}
            onChange={(e) => handleInputChange('계약번호', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="계약번호 입력"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사업기간
          </label>
          <input
            type="text"
            value={filters.사업기간}
            onChange={(e) => handleInputChange('사업기간', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="사업기간 입력"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            정렬
          </label>
          <select
            value={filters.정렬}
            onChange={(e) => handleInputChange('정렬', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체</option>
            <option value="오름차순">오름차순</option>
            <option value="내림차순">내림차순</option>
            <option value="기업명순">기업명순</option>
          </select>
        </div>
      </div>
    </SlideModal>
  );
}