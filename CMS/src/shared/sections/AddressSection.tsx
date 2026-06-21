import { REGION_OPTIONS } from '../constants/options';

interface AddressSectionProps {
  formData: {
    지역구분: string;
    우편번호: string;
    주소1: string;
    주소2: string;
  };
  onRegionChange: (value: string) => void;
  onAddress1Change: (value: string) => void;
  onAddress2Change: (value: string) => void;
  onPostcodeSearch: () => void;
}

export function AddressSection({
  formData,
  onRegionChange,
  onAddress1Change,
  onAddress2Change,
  onPostcodeSearch,
}: AddressSectionProps) {
  return (
    <>
      {/* 지역구분, 우편번호 */}
      <div className="grid border-b border-gray-300" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <div className="col-span-3 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">지역구분</span>
        </div>
        <div className="col-span-3 border-r border-gray-300 px-3 py-2">
          <select
            value={formData.지역구분}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
          >
            <option value="">선택</option>
            {REGION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-3 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">우편번호</span>
        </div>
        <div className="col-span-3 px-3 py-2 flex items-center gap-2">
          <input
            type="text"
            value={formData.우편번호}
            readOnly
            className="flex-1 border-none outline-none text-sm bg-gray-50"
          />
          <button
            type="button"
            onClick={onPostcodeSearch}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
          >
            검색
          </button>
        </div>
      </div>

      {/* 주소1(본사) */}
      <div className="grid grid-cols-4 border-b border-gray-300">
        <div className="border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">주소1(본사)</span>
        </div>
        <div className="col-span-3 px-3 py-2">
          <input
            type="text"
            value={formData.주소1}
            onChange={(e) => onAddress1Change(e.target.value)}
            className="w-full border-none outline-none text-sm"
            placeholder="상세주소 입력"
          />
        </div>
      </div>

      {/* 주소2(공장) */}
      <div className="grid grid-cols-4 border-b border-gray-300">
        <div className="border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">주소2(공장)</span>
        </div>
        <div className="col-span-3 px-3 py-2">
          <input
            type="text"
            value={formData.주소2}
            onChange={(e) => onAddress2Change(e.target.value)}
            className="w-full border-none outline-none text-sm"
            placeholder="상세주소 입력"
          />
        </div>
      </div>
    </>
  );
}
