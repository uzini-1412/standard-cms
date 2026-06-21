import { Upload } from 'lucide-react';
import { NEXSA_STAFF_OPTIONS, REGION_OPTIONS } from '../constants/options';
import type { SalesYear } from '../../types/customer';
import { useState, useEffect } from 'react';

interface UnifiedFormSectionProps {
  formData: {
    고객번호: string;
    등록일: string;
    영업담당자: string;
    기업명: string;
    사업자등록번호: string;
    사업자등록번호_이미지: { name: string; data: string; type: string } | null;
    대표자: string;
    휴대전화: string;
    이메일: string;
    전화번호: string;
    팩스번호: string;
    지역구분: string;
    우편번호: string;
    주소1: string;
    주소2: string;
    생산제품: string;
    업종: string;
    업태: string;
    홈페이지: string;
    회사간략소개: string;
    회사간략소개_파일: { name: string; data: string; type: string } | null;
  };
  formErrors: {
    기업명: string;
    영업담당자: string;
    고객번호: string;
  };
  emailError: string;
  salesYears: SalesYear[];
  salesYearError: string;
  salesAmountError: string;
  salesPersonnelError: string;
  industries?: string[];
  onCustomerNumberChange: (value: string) => void;
  onSalesStaffChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onBusinessNumberChange: (value: string) => void;
  onBusinessNumberFileChange: (file: File | null) => void;
  onRepresentativeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onLandlineChange: (value: string) => void;
  onFaxChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onAddress1Change: (value: string) => void;
  onAddress2Change: (value: string) => void;
  onPostcodeSearch: () => void;
  onProductChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onBusinessTypeChange: (value: string) => void;
  onHomepageChange: (value: string) => void;
  onIntroChange: (value: string) => void;
  onIntroFileChange: (file: File | null) => void;
  onYearChange: (id: number, year: string) => void;
  onAmountChange: (id: number, value: string) => void;
  onPersonnelChange: (id: number, value: string) => void;
  onCancel?: () => void;
  onSubmit?: (e?: React.FormEvent) => void | Promise<void>;
  submitButtonText?: string;
  autoSaveStatus?: 'none' | 'saving' | 'saved';
}

// 행 데이터 타입 정의
type RowConfig = 
  | { type: 'single'; label: string; field: string; required?: boolean; error?: string }
  | { type: 'double'; items: Array<{ label: string; field: string; required?: boolean; error?: string }> }
  | { type: 'triple'; items: Array<{ label: string; field: string; required?: boolean; error?: string }> }
  | { type: 'full'; label: string; field: string; required?: boolean };

export function UnifiedFormSection({
  formData,
  formErrors,
  emailError,
  salesYears,
  salesYearError,
  salesAmountError,
  salesPersonnelError,
  industries,
  onCustomerNumberChange,
  onSalesStaffChange,
  onCompanyNameChange,
  onBusinessNumberChange,
  onBusinessNumberFileChange,
  onRepresentativeChange,
  onPhoneChange,
  onEmailChange,
  onLandlineChange,
  onFaxChange,
  onRegionChange,
  onAddress1Change,
  onAddress2Change,
  onPostcodeSearch,
  onProductChange,
  onIndustryChange,
  onBusinessTypeChange,
  onHomepageChange,
  onIntroChange,
  onIntroFileChange,
  onYearChange,
  onAmountChange,
  onPersonnelChange,
  onCancel,
  onSubmit,
  submitButtonText,
  autoSaveStatus,
}: UnifiedFormSectionProps) {
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // 업종 커스텀 입력 모드 상태
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [customIndustryValue, setCustomIndustryValue] = useState('');

  // formData.업종이 industries에 없으면 커스텀 모드로 자동 전환
  useEffect(() => {
    if (formData.업종 && industries && industries.length > 0) {
      const isInList = industries.includes(formData.업종);
      if (!isInList && formData.업종 !== '') {
        setIsCustomIndustry(true);
        setCustomIndustryValue(formData.업종);
      }
    }
  }, [formData.업종, industries]);

  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsTablet(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleIndustrySelectChange = (value: string) => {
    if (value === '기타') {
      setIsCustomIndustry(true);
      setCustomIndustryValue('');
    } else {
      onIndustryChange(value);
    }
  };

  const handleCustomIndustryChange = (value: string) => {
    setCustomIndustryValue(value);
    onIndustryChange(value);
  };

  const handleBackToSelect = () => {
    setIsCustomIndustry(false);
    setCustomIndustryValue('');
    onIndustryChange('');
  };

  const paddedSalesYears = [
    ...salesYears,
    ...Array(Math.max(0, 3 - salesYears.length)).fill(null).map((_, i) => ({
      id: Date.now() + i,
      year: '',
      amount: '',
      personnel: 0
    }))
  ];

  const getSelectedYears = () => {
    return paddedSalesYears.map(item => item.year).filter(Boolean);
  };

  const handleBusinessNumberFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onBusinessNumberFileChange(e.target.files[0]);
    }
  };

  const handleIntroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onIntroFileChange(e.target.files[0]);
    }
  };
return (
    <>
      {isTablet && onCancel && onSubmit && (
        <div className="mb-2 flex items-center justify-end gap-2 w-full">
           {autoSaveStatus && autoSaveStatus !== 'none' && (
             <span className="text-xs text-green-600 mr-2">{autoSaveStatus === 'saving' ? '저장 중...' : '자동저장됨'}</span>
           )}
           <button type="button" onClick={onCancel} className="px-4 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition-colors font-semibold">취소</button>
           <button type="button" onClick={() => onSubmit()} className="px-4 py-1.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors font-semibold">{submitButtonText || '등록'}</button>
        </div>
      )}

      <div 
        className="border-l border-b border-gray-300 mb-4 inline-grid overflow-x-hidden w-full" 
        style={{ 
          gridTemplateColumns: isTablet ? '200px 1fr' : '200px 1fr 200px 1fr 200px 1fr'
        }}
      >
        
        <div className="border-r border-b border-t border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs font-semibold">
          고객번호 <span className="text-red-500 text-sm ml-0.5">*</span>
        </div>
        <div className="border-r border-b border-t border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.고객번호}
            onChange={(e) => onCustomerNumberChange(e.target.value)}
            placeholder="yyyy-xxxx"
            className="outline-none text-sm w-full bg-transparent"
          />
          {formErrors.고객번호 && <div className="text-red-500 text-xs mt-1">{formErrors.고객번호}</div>}
        </div>

        {!isTablet && (
          <div className="border-b border-gray-300 px-3 py-2 flex items-center justify-end gap-2" style={{ gridColumn: 'span 4' }}>
            {onCancel && onSubmit && (
              <>
                {autoSaveStatus && autoSaveStatus !== 'none' && (
                  <span className="text-xs text-green-600 mr-2">{autoSaveStatus === 'saving' ? '저장 중...' : '자동저장됨'}</span>
                )}
                <button type="button" onClick={onCancel} className="px-4 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition-colors font-semibold">취소</button>
                <button type="button" onClick={() => onSubmit()} className="px-4 py-1.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors font-semibold">{submitButtonText || '등록'}</button>
              </>
            )}
          </div>
        )}
        

        {/* 등록일, 영업담당자 */}
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">등록일</span>
        </div>
        <div className="border-r border-b border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
          <input
            type="text"
            value={formData.등록일}
            readOnly
            className="w-full border-none outline-none text-sm bg-transparent text-gray-600"
          />
        </div>
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">영업담당자 <span className="text-red-500 text-sm">*</span></span>
        </div>
        <div className="border-b border-r border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
          <select
            value={formData.영업담당자}
            onChange={(e) => onSalesStaffChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
          >
            <option value="">선택</option>
            {NEXSA_STAFF_OPTIONS?.map((option: any) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {formErrors.영업담당자 && <span className="text-red-500 text-xs">{formErrors.영업담당자}</span>}
        </div>

        {/* 기업명, 사업자등록번호 */}
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">기업명 <span className="text-red-500 text-sm">*</span></span>
        </div>
        <div className="border-r border-b border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
          <input
            type="text"
            value={formData.기업명}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
          />
          {formErrors.기업명 && <span className="text-red-500 text-xs">{formErrors.기업명}</span>}
        </div>
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">사업자등록번호</span>
        </div>
        <div className="border-b border-r border-gray-300 px-3 py-2 flex items-center gap-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
          <input
            type="text"
            value={formData.사업자등록번호}
            onChange={(e) => onBusinessNumberChange(e.target.value)}
            className="flex-1 border-none outline-none text-sm bg-transparent"
            placeholder="000-00-00000"
          />
          <input
            type="file"
            id="사업자등록증"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={handleBusinessNumberFileChange}
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

        {/* 대표자, 휴대전화, 이메일 */}
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">대표자</span>
        </div>
        <div className="border-r border-b border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.대표자}
            onChange={(e) => onRepresentativeChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
          />
        </div>
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">휴대전화</span>
        </div>
        <div className="border-r border-b border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.휴대전화}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
            placeholder="010-0000-0000"
          />
        </div>
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">이메일</span>
        </div>
        <div className="border-b border-r border-gray-300 px-3 py-2">
          <input
            type="email"
            value={formData.이메일}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
            placeholder="example@company.com"
          />
          {emailError && <span className="text-red-500 text-xs">{emailError}</span>}
        </div>

        {/* 전화번호, 팩스번호 */}
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">전화번호</span>
        </div>
        <div className="border-r border-b border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
          <input
            type="text"
            value={formData.전화번호}
            onChange={(e) => onLandlineChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
            placeholder="02-0000-0000"
          />
        </div>
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">팩스번호</span>
        </div>
        <div className="border-b border-r border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
          <input
            type="text"
            value={formData.팩스번호}
            onChange={(e) => onFaxChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
            placeholder="지역번호-xxxx-xxxx"
          />
        </div>

        {/* 지역구분, 우편번호 */}
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">지역구분</span>
        </div>
        <div className="border-r border-b border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
          <select
            value={formData.지역구분}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
          >
            <option value="">선택</option>
            {REGION_OPTIONS?.map((option: any) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">우편번호</span>
        </div>
        <div className="border-b border-r border-gray-300 px-3 py-2 flex items-center gap-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
          <input
            type="text"
            value={formData.우편번호}
            readOnly
            className="flex-1 border-none outline-none text-sm bg-transparent text-gray-600"
          />
          <button
            type="button"
            onClick={onPostcodeSearch}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
          >
            검색
          </button>
        </div>

        {/* 주소1, 주소2 (긴 항목 처리) */}
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">주소1(본사)</span>
        </div>
        <div className="border-b border-r border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 5' }}>
          <input
            type="text"
            value={formData.주소1}
            onChange={(e) => onAddress1Change(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
            placeholder="상세주소 입력"
          />
        </div>
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">주소2(공장)</span>
        </div>
        <div className="border-b border-r border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 5' }}>
          <input
            type="text"
            value={formData.주소2}
            onChange={(e) => onAddress2Change(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
            placeholder="상세주소 입력"
          />
        </div>

        {/* 생산제품, 업종, 업태 */}
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">생산제품</span>
        </div>
        <div className="border-r border-b border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.생산제품}
            onChange={(e) => onProductChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
          />
        </div>
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">업종</span>
        </div>
        <div className="border-r border-b border-gray-300 px-3 py-2">
          {isCustomIndustry ? (
            <div className="flex flex-col">
              <input
                type="text"
                value={customIndustryValue}
                onChange={(e) => handleCustomIndustryChange(e.target.value)}
                className="w-full border-none outline-none text-sm bg-transparent"
                placeholder="업종 입력"
              />
              <button
                type="button"
                onClick={handleBackToSelect}
                className="text-xs text-gray-500 underline hover:text-gray-700 text-left mt-1"
              >
                취소
              </button>
            </div>
          ) : (
            <select
              value={formData.업종}
              onChange={(e) => handleIndustrySelectChange(e.target.value)}
              className="w-full border-none outline-none text-sm bg-transparent"
            >
              <option value="">선택</option>
              {industries && industries.length > 0 ? (
                industries.map((industry: string) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))
              ) : (
                <option value="기타">기타</option>
              )}
            </select>
          )}
        </div>
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">업태</span>
        </div>
        <div className="border-b border-r border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.업태}
            onChange={(e) => onBusinessTypeChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
          />
        </div>

        {/* 홈페이지 */}
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">홈페이지</span>
        </div>
        <div className="border-b border-r border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 5' }}>
          <input
            type="text"
            value={formData.홈페이지}
            onChange={(e) => onHomepageChange(e.target.value)}
            className="w-full border-none outline-none text-sm bg-transparent"
            placeholder="https://"
          />
        </div>

        {/* 회사간략소개 */}
        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
          <span className="text-xs">회사간략소개</span>
        </div>
        <div className="border-b border-r border-gray-300 px-3 py-2 flex items-center space-x-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 5' }}>
          <textarea
            value={formData.회사간략소개}
            onChange={(e) => onIntroChange(e.target.value)}
            className="flex-1 border-none outline-none text-sm resize-none bg-transparent"
            rows={3}
          />
          <input
            type="file"
            id="회사간략소개파일"
            accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleIntroFileChange}
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

        {/* 매출규모 (데스크탑/태블릿 분리) */}
        <div className="border-r border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center" 
        style={{ gridRow: `span ${paddedSalesYears?.length || salesYears.length}` }}>
          <span className="text-xs">매출규모</span>
        </div>

        {paddedSalesYears?.map((yearData: any, index: number) => {
          if (!isTablet) {
            return (
              <div key={yearData.id || index} className="contents">
                <div className="border-r border-b border-gray-300 px-3 py-2">
                  <select
                    value={yearData.year}
                    onChange={(e) => onYearChange(yearData.id, e.target.value)}
                    className="w-full border-none outline-none text-sm bg-transparent"
                  >
                    <option value="">연도 {index === 0 && '*'}</option>
                    {availableYears?.map((y: number) => (
                      <option key={y} value={y.toString()} disabled={getSelectedYears().includes(y.toString()) && yearData.year !== y.toString()}>
                        {y}
                      </option>
                    ))}
                  </select>
                  {index === 0 && salesYearError && <span className="text-red-500 text-xs">{salesYearError}</span>}
                </div>
                <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
                  <span className="text-xs">금액 {index === 0 && <span className="text-red-500 text-sm">*</span>}</span>
                </div>
                <div className="border-r border-b border-gray-300 px-3 py-2">
                  <input
                    type="text"
                    value={yearData.amount}
                    onChange={(e) => onAmountChange(yearData.id, e.target.value)}
                    className="w-full border-none outline-none text-sm bg-transparent"
                    placeholder="금액"
                  />
                  {index === 0 && salesAmountError && <span className="text-red-500 text-xs">{salesAmountError}</span>}
                </div>
                <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center">
                  <span className="text-xs">인원 {index === 0 && <span className="text-red-500 text-sm">*</span>}</span>
                </div>
                <div className="border-b border-r border-gray-300 px-3 py-2">
                  <input
                    type="number"
                    value={yearData.personnel || ''}
                    onChange={(e) => onPersonnelChange(yearData.id, e.target.value)}
                    className="w-full border-none outline-none text-sm bg-transparent"
                    placeholder="0"
                  />
                  {index === 0 && salesPersonnelError && <span className="text-red-500 text-xs">{salesPersonnelError}</span>}
                </div>
              </div>
            );
          } else {
            // 태블릿용 렌더링
            return (
              <div key={yearData.id || index} className="border-r border-b border-gray-300 flex overflow-x-auto scrollbar-hide" style={{ gridColumn: 'span 1' }}>
                
                {/* 1. 연도 */}
                <div className="flex-[1] min-w-[80px] px-2 py-2 border-r border-gray-300 flex flex-col items-center justify-center">
                  <select
                    value={yearData.year}
                    onChange={(e) => onYearChange(yearData.id, e.target.value)}
                    className="w-full border-none outline-none text-sm bg-transparent text-center"
                  >
                    {/* [수정 1] 연도 옆에 * 표시 추가 */}
                    <option value="">연도 {index === 0 && '*'}</option>
                    {availableYears?.map((y: number) => (
                      <option key={y} value={y.toString()} disabled={getSelectedYears().includes(y.toString()) && yearData.year !== y.toString()}>
                        {y}
                      </option>
                    ))}
                  </select>
                  {/* [수정 2] 연도 에러 메시지 추가 */}
                  {index === 0 && salesYearError && <span className="text-red-500 text-[10px] mt-1 text-center whitespace-nowrap">{salesYearError}</span>}
                </div>

                {/* 2. 금액 라벨 */}
                <div className="flex-[1] min-w-[50px] px-2 py-2 border-r border-gray-300 bg-blue-50 flex items-center justify-center text-xs">
                  {/* [수정 3] 금액 라벨 옆에 * 표시 추가 */}
                  금액 {index === 0 && <span className="text-red-500 text-sm ml-1">*</span>}
                </div>

                {/* 3. 금액 입력 */}
                <div className="flex-[2] min-w-[100px] px-2 py-2 border-r border-gray-300 flex flex-col items-center justify-center">
                  <input
                    type="text"
                    value={yearData.amount}
                    onChange={(e) => onAmountChange(yearData.id, e.target.value)}
                    className="w-full border-none outline-none text-sm bg-transparent text-center"
                    placeholder="0"
                  />
                  {/* [수정 4] 금액 에러 메시지 추가 */}
                  {index === 0 && salesAmountError && <span className="text-red-500 text-[10px] mt-1 text-center whitespace-nowrap">{salesAmountError}</span>}
                </div>

                {/* 4. 인원 라벨 */}
                <div className="flex-[1] min-w-[50px] px-2 py-2 border-r border-gray-300 bg-blue-50 flex items-center justify-center text-xs">
                  {/* [수정 5] 인원 라벨 옆에 * 표시 추가 */}
                  인원 {index === 0 && <span className="text-red-500 text-sm ml-1">*</span>}
                </div>

                {/* 5. 인원 입력 */}
                <div className="flex-[1] min-w-[60px] px-2 py-2 flex flex-col items-center justify-center">
                  <input
                    type="number"
                    value={yearData.personnel || ''}
                    onChange={(e) => onPersonnelChange(yearData.id, e.target.value)}
                    className="w-full border-none outline-none text-sm bg-transparent text-center"
                    placeholder="0"
                  />
                  {/* [수정 6] 인원 에러 메시지 추가 */}
                  {index === 0 && salesPersonnelError && <span className="text-red-500 text-[10px] mt-1 text-center whitespace-nowrap">{salesPersonnelError}</span>}
                </div>
              </div>
            );
          }
        })}
      </div>
    </>
  );
}