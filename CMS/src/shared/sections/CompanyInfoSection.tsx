import { Upload } from 'lucide-react';

interface CompanyInfoSectionProps {
  formData: {
    생산제품: string;
    업종: string;
    업태: string;
    홈페이지: string;
    회사간략소개: string;
    회사간략소개_파일: File | null;
  };
  onProductChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onBusinessTypeChange: (value: string) => void;
  onHomepageChange: (value: string) => void;
  onIntroChange: (value: string) => void;
  onIntroFileChange: (file: File | null) => void;
}

export function CompanyInfoSection({
  formData,
  onProductChange,
  onIndustryChange,
  onBusinessTypeChange,
  onHomepageChange,
  onIntroChange,
  onIntroFileChange,
}: CompanyInfoSectionProps) {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onIntroFileChange(e.target.files[0]);
    }
  };

  return (
    <>
      {/* 생산제품, 업종, 업태 */}
      <div className="grid grid-cols-6 border-b border-gray-300">
        <div className="border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">생산제품</span>
        </div>
        <div className="border-r border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.생산제품}
            onChange={(e) => onProductChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
          />
        </div>
        <div className="border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">업종</span>
        </div>
        <div className="border-r border-gray-300 px-3 py-2">
          <select
            value={formData.업종}
            onChange={(e) => onIndustryChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
          >
            <option value="">선택</option>
            <option value="제조업">제조업</option>
            <option value="건설업">건설업</option>
            <option value="도소매업">도소매업</option>
            <option value="서비스업">서비스업</option>
            <option value="IT/소프트웨어">IT/소프트웨어</option>
            <option value="운송업">운송업</option>
            <option value="금융업">금융업</option>
            <option value="교육업">교육업</option>
            <option value="의료업">의료업</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div className="border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">업태</span>
        </div>
        <div className="px-3 py-2">
          <input
            type="text"
            value={formData.업태}
            onChange={(e) => onBusinessTypeChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
          />
        </div>
      </div>

      {/* 홈페이지 */}
      <div className="grid grid-cols-4 border-b border-gray-300">
        <div className="border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">홈페이지</span>
        </div>
        <div className="col-span-3 px-3 py-2">
          <input
            type="text"
            value={formData.홈페이지}
            onChange={(e) => onHomepageChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
            placeholder="https://"
          />
        </div>
      </div>

      {/* 회사간략소개 */}
      <div className="grid grid-cols-4">
        <div className="border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">회사간략소개</span>
        </div>
        <div className="col-span-3 px-3 py-2 flex items-center space-x-2">
          <textarea
            value={formData.회사간략소개}
            onChange={(e) => onIntroChange(e.target.value)}
            className="flex-1 border-none outline-none text-sm resize-none"
            rows={3}
          />
          <input
            type="file"
            id="회사간략소개파일"
            accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <label
            htmlFor="회사간략소개파일"
            className={`cursor-pointer px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
              formData.회사간략소개_파일
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>{formData.회사간략소개_파일 ? '등록됨' : '파일'}</span>
          </label>
        </div>
      </div>
    </>
  );
}
