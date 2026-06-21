import { SlideModal } from '../../shared/ui/SlideModal';
import { useCustomers } from '../../app/contexts/CustomersContext';


interface CustomerFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  industries: string[];
}

export interface FilterOptions {
  기업명: string;
  대표자: string;
  주소: string;
  지역구분: string;
  업종: string;
  업태: string;
  영업담당자: string;
}

export function CustomerFilterModal({ 
  isOpen, 
  onClose, 
  filters = {
    기업명: '',
    대표자: '',
    주소: '',
    지역구분: '',
    업종: '',
    업태: '',
    영업담당자: '',
  }, 
  onFilterChange,
  industries,
}: CustomerFilterModalProps) {
  //const { industries } = useCustomers();

  const handleInputChange = (field: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      기업명: '',
      대표자: '',
      주소: '',
      지역구분: '',
      업종: '',
      업태: '',
      영업담당자: '',
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
            대표자
          </label>
          <input
            type="text"
            value={filters.대표자}
            onChange={(e) => handleInputChange('대표자', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="대표자 입력"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주소
          </label>
          <input
            type="text"
            value={filters.주소}
            onChange={(e) => handleInputChange('주소', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="주소 입력"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            지역구분
          </label>
          <select
            value={filters.지역구분}
            onChange={(e) => handleInputChange('지역구분', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체</option>
            <option value="서울">서울</option>
            <option value="부산">부산</option>
            <option value="인천">인천</option>
            <option value="대구">대구</option>
            <option value="광주">광주</option>
            <option value="대전">대전</option>
            <option value="울산">울산</option>
            <option value="세종">세종</option>
            <option value="경기">경기</option>
            <option value="강원">강원</option>
            <option value="충북">충북</option>
            <option value="충남">충남</option>
            <option value="전북">전북</option>
            <option value="전남">전남</option>
            <option value="경북">경북</option>
            <option value="경남">경남</option>
            <option value="제주">제주</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            업종
          </label>
          <select
            value={filters.업종}
            onChange={(e) => handleInputChange('업종', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            업태
          </label>
          <select
            value={filters.업태}
            onChange={(e) => handleInputChange('업태', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체</option>
            <option value="도매">도매</option>
            <option value="소매">소매</option>
            <option value="제조">제조</option>
            <option value="서비스">서비스</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            담당자
          </label>
          <input
            type="text"
            value={filters.영업담당자}
            onChange={(e) => handleInputChange('영업담당자', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="담당자 입력"
          />
        </div>
      </div>
    </SlideModal>
  );
}