import { Upload } from 'lucide-react';
import { SALES_STAFF_OPTIONS } from '../constants/options';

interface BasicInfoSectionProps {
  formData: {
    고객번호: string;
    등록일: string;
    영업담당자: string;
    기업명: string;
    사업자등록번호: string;
    사업자등록번호_이미지: File | null;
  };
  formErrors: {
    기업명: string;
    영업담당자: string;
    고객번호: string;
  };
  onCustomerNumberChange: (value: string) => void;
  onSalesStaffChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onBusinessNumberChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
}

export function BasicInfoSection({
  formData,
  formErrors,
  onCustomerNumberChange,
  onSalesStaffChange,
  onCompanyNameChange,
  onBusinessNumberChange,
  onFileChange,
}: BasicInfoSectionProps) {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <>
      {/* 고객번호 */}
      <div className="grid border-b border-gray-300" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <div className="col-span-3 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">고객번호 <span className="text-red-500 text-sm">*</span></span>
        </div>
        <div className="col-span-3 px-3 py-2">
          <input
            type="text"
            value={formData.고객번호}
            onChange={(e) => onCustomerNumberChange(e.target.value)}
            placeholder="yyyy-xxxx"
            className="w-full border-none outline-none text-sm"
          />
          {formErrors.고객번호 && <span className="text-red-500 text-xs">{formErrors.고객번호}</span>}
        </div>
      </div>

      {/* 등록일, 영업담당자 */}
      <div className="grid border-b border-gray-300" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <div className="col-span-3 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">등록일</span>
        </div>
        <div className="col-span-3 border-r border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.등록일}
            readOnly
            className="w-full border-none outline-none text-sm"
          />
        </div>
        <div className="col-span-3 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">영업담당자 <span className="text-red-500 text-sm">*</span></span>
        </div>
        <div className="col-span-3 px-3 py-2">
          <select
            value={formData.영업담당자}
            onChange={(e) => onSalesStaffChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
          >
            <option value="">선택</option>
            {SALES_STAFF_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {formErrors.영업담당자 && <span className="text-red-500 text-xs">{formErrors.영업담당자}</span>}
        </div>
      </div>

      {/* 기업명, 사업자등록번호 */}
      <div className="grid border-b border-gray-300" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <div className="col-span-3 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">기업명 <span className="text-red-500 text-sm">*</span></span>
        </div>
        <div className="col-span-3 border-r border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.기업명}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
          />
          {formErrors.기업명 && <span className="text-red-500 text-xs">{formErrors.기업명}</span>}
        </div>
        <div className="col-span-3 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">사업자등록번호</span>
        </div>
        <div className="col-span-3 px-3 py-2 flex items-center gap-2">
          <input
            type="text"
            value={formData.사업자등록번호}
            onChange={(e) => onBusinessNumberChange(e.target.value)}
            className="flex-1 border-none outline-none text-sm"
            placeholder="000-00-00000"
          />
          <input
            type="file"
            id="사업자등록증"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <label
            htmlFor="사업자등록증"
            className={`cursor-pointer px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
              formData.사업자등록번호_이미지
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>{formData.사업자등록번호_이미지 ? '등록됨' : '이미지'}</span>
          </label>
        </div>
      </div>
    </>
  );
}