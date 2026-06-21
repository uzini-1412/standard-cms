import { useState, useEffect, useRef } from 'react';
import { useCustomers } from '../../app/contexts/CustomersContext';
import { generateInitialContractNo } from '../../shared/utils/contract-utils';
import { formatProjectPeriod, getMonthsOnly } from '../../shared/utils/dateCalculations';
import { getBusinessTypeColor } from '../../shared/utils/colorMapping';
import { ERROR_MESSAGES } from '../../shared/constants/modal-options';
import { Contract } from '../../types/contract';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Contract, 'id'>) => void;
  customerNo?: string;
  editingContract?: Contract | null;
  onDelete?: (id: number) => void;
  existingContracts?: Contract[]; //계약번호 부여용
}

export function ContractModal({ isOpen, 
  onClose, 
  onSubmit, 
  customerNo, 
  editingContract, 
  onDelete,
  existingContracts = []
 }: ContractModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { contractBusinessTypes, addContractBusinessType } = useCustomers();
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Contract, 'id'>>({
    사업구분: '',
    //계약번호: generateInitialContractNo(customerNo),
    계약번호: '',
    계약일: '',
    프로젝트명: '',
    시작일: '',
    종료일: '',
    사업기간: '',
    계약금액: '',
    MD: undefined,
    PM: '',
    컨설턴트: '',
    비고: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const generateAutoContractNo = () => {
    if (!customerNo) return '';

    //const year = new Date().getFullYear();
    // 예: "2026-1001-"
    const prefix = `${customerNo}-`; 

    // 1. 현재 연도와 고객번호가 일치하는 계약만 찾음
    const currentYearContracts = existingContracts.filter(c => 
      c.계약번호 && c.계약번호.startsWith(prefix)
    );

    if (currentYearContracts.length === 0) {
      return `${prefix}001`; // 첫 계약이면 001
    }

    // 2. 가장 큰 뒷자리 숫자 찾기
    // "2026-1001-005" -> 5 추출
    const maxSeq = currentYearContracts.reduce((max, c) => {
      const parts = c.계약번호.split('-');
      const lastPart = parts[parts.length - 1]; // "005"
      const num = parseInt(lastPart, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);

    // 3. +1 해서 3자리로 맞춤 (006)
    const nextSeq = String(maxSeq + 1).padStart(3, '0');
    return `${prefix}${nextSeq}`;
  };

  // 초기 데이터 설정
  useEffect(() => {
    if (editingContract) {
      setFormData({
        사업구분: editingContract.사업구분 || '',
        계약번호: editingContract.계약번호 || '',
        계약일: editingContract.계약일 || '',
        프로젝트명: editingContract.프로젝트명 || '',
        시작일: editingContract.시작일 ? editingContract.시작일.split('T')[0] : '',
        종료일: editingContract.종료일 ? editingContract.종료일.split('T')[0] : '',
        사업기간: editingContract.사업기간 || '',
        계약금액: editingContract.계약금액 || '',
        MD: editingContract.MD ,
        PM: editingContract.PM || '',
        컨설턴트: editingContract.컨설턴트 || '',
        비고: editingContract.비고 || '',
      });
    } else {
      setFormData({
        사업구분: '',
        //계약번호: generateInitialContractNo(customerNo),
        계약번호: generateAutoContractNo(),
        //계약일: '',
        계약일: new Date().toISOString().split('T')[0],
        프로젝트명: '',
        시작일: '',
        종료일: '',
        사업기간: '',
        계약금액: '',
        MD: undefined,
        PM: '',
        컨설턴트: '',
        비고: '',
      });
    }
    setErrors({});
  }, [editingContract, customerNo, isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(60, textareaRef.current.scrollHeight) + 'px';
    }
  }, [formData.비고]);

  const handleChange = (field: keyof Omit<Contract, 'id'>, value: string) => {
    let updatedData = { ...formData, [field]: value };
    const newErrors = { ...errors }; // 에러 상태 복사

    // 사업구분 처리
    if (field === '사업구분') {
      if (value === '기타') {
        setShowCustomInput(true);
        setCustomBusinessType('');
      } else {
        setShowCustomInput(false);
        setCustomBusinessType('');
      }
      if (newErrors[field]) delete newErrors[field];
    }
    
    // 계약번호 처리
    else if (field === '계약번호') {
      const cleanValue = value.replace(/[^0-9-]/g, '');
      updatedData = { ...formData, [field]: cleanValue };
      if (newErrors[field]) delete newErrors[field];
    }

    // 계약금액 처리
    else if (field === '계약금액') {
      const cleanValue = value.replace(/[^0-9]/g, '');
      if (cleanValue === '') {
        updatedData = { ...formData, [field]: '' };
      } else {
        const formatted = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        updatedData = { ...formData, [field]: formatted };
      }
    }

    // ★ [수정됨] MD 처리 (숫자만 허용, 3자리 제한, 에러 메시지)
    else if (field === 'MD') {
      // 1. 숫자가 아닌 문자가 포함되어 있으면 에러 메시지 설정
      if (/[^0-9]/.test(value)) {
        newErrors['MD'] = '숫자만 입력 가능합니다.';
      } else {
        delete newErrors['MD'];
      }

      // 2. 실제 데이터는 숫자만 남기고 저장 (입력 막기)
      const cleanValue = value.replace(/[^0-9]/g, '');
      const limitedValue = cleanValue.slice(0, 3);
      
      updatedData = { 
        ...formData, 
        [field]: limitedValue === '' ? undefined : Number(limitedValue) 
      };
    }

    // 기간 처리
    else if (field === '시작일' || field === '종료일') {
      updatedData[field] = value;
      const 시작일 = field === '시작일' ? value : (formData.시작일 || '');
      const 종료일 = field === '종료일' ? value : (formData.종료일 || '');
      
      if (시작일 && 종료일) {
        updatedData.사업기간 = formatProjectPeriod(시작일, 종료일);
      } else {
        updatedData.사업기간 = '';
      }
      if (newErrors[field]) delete newErrors[field];
    } else {
      updatedData[field] = value;
      if (newErrors[field]) delete newErrors[field];
    }
    
    setErrors(newErrors);
    setFormData(updatedData);
  };

  // ★ [수정] FormEvent가 아니라 일반 함수로 변경 (e? 옵셔널 처리)
  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    let final사업구분 = formData.사업구분;
    if (formData.사업구분 === '기타' && customBusinessType.trim()) {
      final사업구분 = customBusinessType.trim();
      if (!contractBusinessTypes.includes(final사업구분)) {
        addContractBusinessType(final사업구분);
      }
    }
    
    const newErrors: {[key: string]: string} = {};
    if (!final사업구분.trim()) newErrors['사업구분'] = ERROR_MESSAGES.REQUIRED_BUSINESS_TYPE;
    if (!formData.계약번호.trim()) newErrors['계약번호'] = ERROR_MESSAGES.REQUIRED_CONTRACT_NO;
    if (!formData.계약일) newErrors['계약일'] = ERROR_MESSAGES.REQUIRED_DATE;
    if (!formData.프로젝트명.trim()) newErrors['프로젝트명'] = ERROR_MESSAGES.REQUIRED_PROJECT_NAME;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const finalData = { ...formData, 사업구분: final사업구분 };
    onSubmit(finalData);
    
    // 초기화
    setFormData({
      사업구분: '',
      계약번호: generateInitialContractNo(customerNo),
      계약일: '',
      프로젝트명: '',
      시작일: '',
      종료일: '',
      사업기간: '',
      계약금액: '',
      MD: undefined,
      PM: '',
      컨설턴트: '',
      비고: '',
    });
    setShowCustomInput(false);
    setCustomBusinessType('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-[720px]  min-h-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <h3 className="text-base font-bold">계약정보</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        {/* ★ [수정] form 태그를 div로 변경 (중첩 에러 방지) */}
        <div className="p-4"> 
          <div className="border border-gray-300">
            {/* 사업구분, 계약번호 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">사업구분 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="border-r border-gray-300 px-3 py-2">
                {!showCustomInput ? (
                  <>
                    <select
                      value={formData.사업구분}
                      onChange={(e) => handleChange('사업구분', e.target.value)}
                      className="w-full border-none outline-none text-xs bg-transparent"
                    >
                      <option value="">선택하세요</option>
                      {contractBusinessTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                      <option value="기타">기타</option>
                    </select>
                    {formData.사업구분 && formData.사업구분 !== '기타' && (
                      <div className="mt-2">
                        <span 
                          className="text-xs px-2 py-1 rounded inline-block font-semibold"
                          style={{
                            backgroundColor: `${getBusinessTypeColor(formData.사업구분)}20`,
                            color: getBusinessTypeColor(formData.사업구분)
                          }}
                        >
                          {formData.사업구분}
                        </span>
                      </div>
                    )}
                    {errors['사업구분'] && <span className="text-red-500 text-xs block mt-1">{errors['사업구분']}</span>}
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={customBusinessType}
                      onChange={(e) => setCustomBusinessType(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 outline-none text-xs"
                      placeholder="새로운 사업구분 입력"
                      autoFocus
                    />
                    {customBusinessType.trim() && (
                      <div className="mt-2">
                        <span 
                          className="text-xs px-2 py-1 rounded inline-block font-semibold"
                          style={{
                            backgroundColor: `${getBusinessTypeColor(customBusinessType.trim())}20`,
                            color: getBusinessTypeColor(customBusinessType.trim())
                          }}
                        >
                          {customBusinessType.trim()}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">(미리보기)</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false);
                        setFormData({ ...formData, 사업구분: '' });
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                    >
                      취소
                    </button>
                  </>
                )}
              </div>
              {/*<div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">계약번호 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={formData.계약번호}
                  onChange={(e) => handleChange('계약번호', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                  placeholder="yyyy-기업번호-계약no"
                />
                {errors['계약번호'] && <span className="text-red-500 text-xs">{errors['계약번호']}</span>}
              </div>
            </div>*/}
            <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">계약번호</span>
              </div>
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={formData.계약번호}
                  readOnly // ★ 수정 불가
                  className="w-full border-none outline-none text-xs bg-gray-50 text-gray-500 cursor-not-allowed" // ★ 회색 배경 스타일
                  placeholder="자동 생성됩니다"
                />
                {/* 에러 메시지 필요 없음 (자동이라) */}
              </div>
            </div>

            {/* 계약일, 프로젝트명 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">계약일 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="border-r border-gray-300 px-3 py-2">
                <input
                  type="date"
                  value={formData.계약일}
                  onChange={(e) => handleChange('계약일', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                />
                {errors['계약일'] && <span className="text-red-500 text-xs">{errors['계약일']}</span>}
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">프로젝트 명 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={formData.프로젝트명}
                  onChange={(e) => handleChange('프로젝트명', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                  placeholder="프로젝트명"
                />
                {errors['프로젝트명'] && <span className="text-red-500 text-xs">{errors['프로젝트명']}</span>}
              </div>
            </div>

            {/* 사업기간 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">사업기간</span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="date"
                      value={formData.시작일}
                      onChange={(e) => handleChange('시작일', e.target.value.split('T')[0])}
                      className="w-[140px] border-none outline-none text-xs"
                      placeholder="시작일"
                    />
                    <span className="text-xs text-gray-500">~</span>
                    <input
                      type="date"
                      value={formData.종료일}
                      onChange={(e) => handleChange('종료일', e.target.value.split('T')[0])}
                      className="w-[140px] border-none outline-none text-xs"
                      placeholder="종료일"
                    />
                  </div>
                  <div className="w-[60px] text-right">
                    {formData.시작일 && formData.종료일 && (
                      <span className="text-xs text-gray-600">{getMonthsOnly(formData.시작일, formData.종료일)}개월</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 계약금액, MD */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">계약금액</span>
              </div>
              <div className="border-r border-gray-300 px-3 py-2 relative">
                <input
                  type="text"
                  value={formData.계약금액}
                  onChange={(e) => handleChange('계약금액', e.target.value)}
                  className="w-full border-none outline-none text-xs pr-6"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 pointer-events-none">원</span>
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">MD</span>
              </div>
              
              {/* ★ [수정] MD 입력 필드: 에러 메시지 표시 */}
              <div className="px-3 py-2 relative">
                <input
                  type="text"
                  value={formData.MD ?? ''}
                  onChange={(e) => handleChange('MD', e.target.value)}
                  maxLength={3}
                  className="w-full border-none outline-none text-xs"
                  placeholder="0"
                />
                 {errors['MD'] && <span className="text-red-500 text-xs block mt-1">{errors['MD']}</span>}
              </div>
            </div>

            {/* PM, 컨설턴트 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">PM</span>
              </div>
              <div className="border-r border-gray-300 px-3 py-2">
                <input
                  type="text"
                  value={formData.PM}
                  onChange={(e) => handleChange('PM', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                />
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">컨설턴트</span>
              </div>
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={formData.컨설턴트}
                  onChange={(e) => handleChange('컨설턴트', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                />
              </div>
            </div>

            {/* 비고 */}
            <div className="grid grid-cols-4">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-start justify-center pt-3">
                <span className="text-xs">비고</span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <textarea
                  ref={textareaRef}
                  value={formData.비고}
                  onChange={(e) => handleChange('비고', e.target.value)}
                  className="w-full border-none outline-none text-xs resize-none"
                  rows={3}
                  style={{ minHeight: '60px', height: 'auto' }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
            >
              취소
            </button>
            {editingContract && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(editingContract.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                삭제
              </button>
            )}
            <button
              type="button" // ★ [중요] submit -> button으로 변경 (onClick 핸들러 사용)
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              {editingContract ? '수정' : '추가'}
            </button>
          </div>
        </div> 
        {/* div 닫힘 (form 대신) */}
      </div>
    </div>
  );
}