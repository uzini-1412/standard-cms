//고객 등록
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { ConsultationModal } from '../Consultation/ConsultationModal';
import { ContractModal } from '../Contract/ContractModal';
import { CustomerContactModal } from './CustomerContactModal';
import { AutoSaveModal } from '../../shared/modals/AutoSaveModal';
import { UnifiedFormSection } from '../../shared/sections/UnifiedFormSection';
import { CustomerContactsSection } from '../../shared/sections/CustomerContactsSection';
import { ConsultationHistorySection } from '../../shared/sections/ConsultationHistorySection';
import { ContractHistorySection } from '../../shared/sections/ContractHistorySection';
import type { SalesYear, CustomerContact, ConsultationHistory, ContractHistory } from '../../types/customer';
import { 
  formatAmount, 
  formatBusinessNumber, 
  formatPhoneNumber, 
  formatLandlineNumber, 
  formatFaxNumber,
  formatCustomerNumber,
  validateEmail 
} from '../../shared/utils/formatters';
import { useToast } from '../../app/contexts/ToastContext';
import { createCompany, checkDuplicateCustomerCode } from '../../api/company';

// 업종 상수 정의
const DEFAULT_INDUSTRIES = ['제조업', '도소매업', '서비스업', '건설업', '정보통신업', '공공기관', '기타'];

export function AddCustomer() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const currentYear = new Date().getFullYear();
  const [industries, setIndustries] = useState<string[]>(DEFAULT_INDUSTRIES);

  const [formData, setFormData] = useState({
    고객번호: `${currentYear}-`,
    등록일: new Date().toISOString().split('T')[0],
    영업담당자: '',
    기업명: '',
    사업자등록번호: '',
    사업자등록번호_이미지: null as { name: string; data: string; type: string } | null,
    대표자: '',
    휴대전화: '',
    이메일: '',
    전화번호: '',
    팩스번호: '',
    지역구분: '',
    우편번호: '',
    주소1: '',
    주소2: '',
    생산제품: '',
    업종: '',
    업태: '',
    인원: 0,
    담당자: '',
    부서: '',
    직책: '',
    상태: '상담중',
    홈페이지: '',
    회사간략소개: '',
    회사간략소개_파일: null as { name: string; data: string; type: string } | null,
  });

  const [salesYears, setSalesYears] = useState<SalesYear[]>([
    { id: 1, year: '', amount: '', personnel: 0 },
    { id: 2, year: '', amount: '', personnel: 0 },
    { id: 3, year: '', amount: '', personnel: 0 }
  ]);

  const [customerContacts, setCustomerContacts] = useState<CustomerContact[]>([]);
  const [consultationHistories, setConsultationHistories] = useState<ConsultationHistory[]>([]);
  const [contractHistories, setContractHistories] = useState<ContractHistory[]>([]);

  const [emailError, setEmailError] = useState<string>('');
  const [salesYearError, setSalesYearError] = useState<string>('');
  const [salesAmountError, setSalesAmountError] = useState<string>('');
  const [salesPersonnelError, setSalesPersonnelError] = useState<string>('');
  const [formErrors, setFormErrors] = useState({
    기업명: '',
    영업담당자: '',
    고객번호: '',
  });
  const [isPostcodeOpen, setIsPostcodeOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState<boolean>(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState<boolean>(false);
  const [isAutoSaveModalOpen, setIsAutoSaveModalOpen] = useState<boolean>(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'none' | 'saving' | 'saved'>('none');

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const statusTimer = useRef<NodeJS.Timeout | null>(null);
  const AUTOSAVE_KEY = 'customer_register_autosave';
  const AUTOSAVE_DELAY = 2000; 
  const [bizLicenseFile, setBizLicenseFile] = useState<File | null>(null);
  const [introFile, setIntroFile] = useState<File | null>(null);
  const [duplicateError, setDuplicateError] = useState('');

  // 페이지 로드 시 임시저장 데이터 확인
  useEffect(() => {
    const savedData = localStorage.getItem(AUTOSAVE_KEY);
    if (savedData) {
      setIsAutoSaveModalOpen(true);
    }
  }, []);

  // 자동저장 로직
  const autoSave = () => {
    const dataToSave = {
      formData,
      salesYears,
      customerContacts,
      consultationHistories,
      contractHistories,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
  };

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    
    autoSaveTimer.current = setTimeout(() => {
      const hasData = formData.기업명 || formData.영업담당자 || formData.대표자; // (생략: 간단하게 체크)
        
      if (hasData) {
        setAutoSaveStatus('saving');
        autoSave();
        if (statusTimer.current) clearTimeout(statusTimer.current);
        statusTimer.current = setTimeout(() => {
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('none'), 3000);
        }, 500);
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, [formData, salesYears, customerContacts, consultationHistories, contractHistories]);

  useEffect(() => {
    const inputCode = formData.고객번호;
    const prefix = `${currentYear}-`;

    // 1. 입력값이 없으면 검사 안 함
    if (!inputCode) {
      setDuplicateError('');
      return;
    }

    // 연도를 뗐든 안 뗐든, 검사는 '완성본'으로
    let codeToCheck = inputCode;
    
    // 만약 입력값이 "2026-"으로 시작하지 않으면, 가상으로 붙여서 검사
    if (!inputCode.startsWith(prefix)) {
        codeToCheck = prefix + inputCode; 
    }

    // 2. 디바운싱
    const timer = setTimeout(async () => {
      try {
        const result = await checkDuplicateCustomerCode(codeToCheck);
        
        if (result.isDuplicate) {
          // 에러 메시지도 구체적으로 표시
          setDuplicateError(`이미 존재하는 번호입니다. (${codeToCheck})`);
        } else {
          setDuplicateError('');
        }
      } catch (error) {
        console.error("중복 확인 에러", error);
      }
    }, 500);

    return () => clearTimeout(timer);

  }, [formData.고객번호]);

  useEffect(() => {
    const currentCode = formData.고객번호; // 예: "2026-1114"

    // 고객번호가 없거나 포맷이 너무 짧으면 무시
    if (!currentCode || currentCode.length < 5) return;

    setContractHistories(prevList => prevList.map(contract => {
      // 계약번호가 없으면 패스
      if (!contract.계약번호) return contract;

      // 1. 기존 계약번호를 쪼갭니다.
      // 예: "2026--001" -> ['2026', '', '001']
      // 예: "2026-001"  -> ['2026', '001']
      const parts = contract.계약번호.split('-');
      
      // 2. 맨 마지막 덩어리(순번, '001')만 가져옵니다.
      const seq = parts[parts.length - 1];

      // 3. 숫자로 된 순번인지 확인 (안전장치: 사용자가 수동으로 쓴 '프로젝트A' 같은 건 안 건드림)
      if (parts.length >= 2 && !isNaN(Number(seq))) {
        
        // 4. [핵심] "현재고객번호" + "-" + "순번" 으로 깔끔하게 조립
        // 결과: "2026-1114" + "-" + "001" = "2026-1114-001"
        const newContractNo = `${currentCode}-${seq}`;
        
        if (contract.계약번호 !== newContractNo) {
          return { ...contract, 계약번호: newContractNo };
        }
      }
      
      return contract;
    }));

  }, [formData.고객번호]);

  const loadAutoSaveData = () => {
    const savedData = localStorage.getItem(AUTOSAVE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData);
        setSalesYears(parsed.salesYears);
        setCustomerContacts(parsed.customerContacts || []);
        setConsultationHistories(parsed.consultationHistories || []);
        setContractHistories(parsed.contractHistories || []);
      } catch (e) {
        console.error('임시저장 데이터 로드 실패:', e);
      }
    }
    setIsAutoSaveModalOpen(false);
  };

  const discardAutoSaveData = () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    setIsAutoSaveModalOpen(false);
  };

  // 핸들러 함수들
  const handleYearChange = (id: number, year: string) => {
    const updated = salesYears.map(item => item.id === id ? { ...item, year } : item);
    setSalesYears(updated);
    if (year && salesYearError) setSalesYearError('');
    if (year && salesYears.length < 5) {
      if (!updated.some(item => !item.year)) {
        setSalesYears([...updated, { id: Date.now(), year: '', amount: '', personnel: 0 }]);
      }
    }
  };

  const handleSalesAmountChange = (id: number, value: string) => {
    const formatted = formatAmount(value);
    setSalesYears(salesYears.map(item => item.id === id ? { ...item, amount: formatted } : item));
    if (id === salesYears[0].id && formatted && salesAmountError) setSalesAmountError('');
  };

  const handleSalesPersonnelChange = (id: number, value: string) => {
    const personnel = parseInt(value) || 0;
    setSalesYears(salesYears.map(item => item.id === id ? { ...item, personnel } : item));
    if (id === salesYears[0].id && personnel > 0 && salesPersonnelError) setSalesPersonnelError('');
  };

  // [핵심] 저장 버튼 클릭 핸들러
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // --- 1. 유효성 검사 (기존 로직 유지) ---
    let hasError = false;
    setSalesYearError(''); setSalesAmountError(''); setSalesPersonnelError('');
    setFormErrors({ 기업명: '', 영업담당자: '', 고객번호: '' });

    if (!formData.고객번호 || formData.고객번호 === `${currentYear}-`) {
      setFormErrors(prev => ({ ...prev, 고객번호: '고객번호를 입력해주세요.' }));
      hasError = true;
    }
    if (!formData.영업담당자.trim()) {
      setFormErrors(prev => ({ ...prev, 영업담당자: '영업담당자를 선택해주세요.' }));
      hasError = true;
    }
    if (!formData.기업명.trim()) {
      setFormErrors(prev => ({ ...prev, 기업명: '기업명을 입력해주세요.' }));
      hasError = true;
    }

    const firstRow = salesYears[0];
    if (!firstRow.year || firstRow.year.trim() === '') {
      setSalesYearError('연도를 선택해주세요.');
      hasError = true;
    }
    if (!firstRow.amount || firstRow.amount === '0' || firstRow.amount.trim() === '') {
      setSalesAmountError('매출액을 입력해주세요.');
      hasError = true;
    }
    if (!firstRow.personnel || firstRow.personnel <= 0) {
      setSalesPersonnelError('인원을 입력해주세요.');
      hasError = true;
    }
    
    if (hasError) return;
    
    let finalCustomerCode = formData.고객번호; 
    const prefix = `${currentYear}-`;         

    // 만약 "2026-"으로 시작하지 않으면, 강제로 앞에 붙임
    if (!finalCustomerCode.startsWith(prefix)) {
      finalCustomerCode = prefix + finalCustomerCode; 
    }

    // --- 2. FormData 생성 
    const formDataToSend = new FormData();
    const timeString = new Date().toTimeString().split(' ')[0];

    // (1) 일반 텍스트 데이터 append
    formDataToSend.append('customer_code', finalCustomerCode);
    formDataToSend.append('reg_date', `${formData.등록일}T${timeString}`);
    formDataToSend.append('name', formData.기업명);
    formDataToSend.append('manager_name', formData.영업담당자);
    formDataToSend.append('biz_num', formData.사업자등록번호);
    formDataToSend.append('ceo_name', formData.대표자);
    formDataToSend.append('mobile_phone', formData.휴대전화);
    formDataToSend.append('email', formData.이메일);
    formDataToSend.append('tel', formData.전화번호);
    formDataToSend.append('fax', formData.팩스번호);
    formDataToSend.append('region', formData.지역구분);
    formDataToSend.append('zipcode', formData.우편번호);
    formDataToSend.append('address_main', formData.주소1);
    formDataToSend.append('address_sub', formData.주소2);
    formDataToSend.append('products', formData.생산제품);
    formDataToSend.append('industry', formData.업종);
    formDataToSend.append('biz_status', formData.업태);
    formDataToSend.append('homepage', formData.홈페이지);
    formDataToSend.append('brief_co', formData.회사간략소개);

    // (2) 파일 데이터 append (파일이 있을 때만)
    if (bizLicenseFile) {
      formDataToSend.append('biz_license_file', bizLicenseFile);
    }
    if (introFile) {
      formDataToSend.append('intro_file', introFile);
    }
    
    // [매출 이력] 유효한 연도만 필터링 후 변환
    const validSalesYears = salesYears.filter(sy => sy.year && sy.year.trim() !== '');
    const mappedSales = validSalesYears.map(s => ({
      year: s.year,
      amount: s.amount.replace(/,/g, ''), 
      personnel: s.personnel
    }));
    formDataToSend.append('salesYears', JSON.stringify(mappedSales));

    // [고객 담당자]
    const mappedContacts = customerContacts.map(c => ({
      name: c.이름,
      department: c.부서,
      position: c.직책,
      phone: c.휴대전화,
      email: c.이메일,
      note: c.비고,
      reg_date: c.등록일자 || new Date().toISOString()
    }));
    formDataToSend.append('customerContacts', JSON.stringify(mappedContacts));

    // [상담 이력]
    const mappedConsultations = consultationHistories.map(h => ({
      title: h.제목,
      writer: h.작성자,
      date: h.상담일자,
      start_time: h.시작시간,
      end_time: h.종료시간,
      location: h.장소,
      attendees_company: h.자사참석자,
      attendees_customer: h.고객참석자,
      content_general: h.주요상담내용,
      content_meeting: h.상담내용,
      content_future: h.조치진행사항
    }));
    formDataToSend.append('consultationHistories', JSON.stringify(mappedConsultations));

    // [계약 이력]
    const mappedContracts = contractHistories.map(c => ({
      biz_type: c.사업구분,
      contract_no: c.계약번호,
      contract_date: c.계약일,
      project_name: c.프로젝트명,
      start_date: c.시작일, 
      end_date:  c.종료일,
      amount: c.계약금액.replace(/,/g, ''), 
      md: c.MD,
      pm: c.PM,
      consultant_name: c.컨설턴트,
      note: c.비고
    }));
    formDataToSend.append('contractHistories', JSON.stringify(mappedContracts));
    
    if (bizLicenseFile) {
      formDataToSend.append('biz_license_file', bizLicenseFile);
    }

    if (introFile) {
      formDataToSend.append('intro_file', introFile);
    }



    // --- 3. API 전송 ---
    try {
      await createCompany(formDataToSend);
      
      localStorage.removeItem(AUTOSAVE_KEY);
      showToast('고객이 성공적으로 등록되었습니다.');
      navigate('/customer-status');

    } catch (error: any) {
      console.error('등록 에러:', error);
      if (error.message && error.message.includes('이미 등록된')) {
        setFormErrors(prev => ({ ...prev, 고객번호: '이미 등록된 고객번호입니다.' }));
      } else {
        alert(`저장 실패: ${error.message}`);
      }
    }
  };

  const handleCustomerNumberChange = (value: string) => {
    const formatted = formatCustomerNumber(value);
    setFormData({ ...formData, 고객번호: formatted || '' });
    if (formatted && formatted.length > 5 && formErrors.고객번호) {
        setFormErrors(prev => ({ ...prev, 고객번호: '' }));
    }
  };
  const handleBusinessNumberChange = (value: string) => {
    if (value.replace(/[^\d]/g, '').length > 10) return;
    setFormData({ ...formData, 사업자등록번호: formatBusinessNumber(value) });
  };
  const handlePhoneNumberChange = (value: string) => {
    if (value.replace(/[^\d]/g, '').length > 11) return;
    setFormData({ ...formData, 휴대전화: formatPhoneNumber(value) });
  };
  const handleLandlineChange = (value: string) => {
     if (value.replace(/[^\d]/g, '').length > 11) return;
    setFormData({ ...formData, 전화번호: formatLandlineNumber(value) });
  };
  const handleFaxNumberChange = (value: string) => {
    setFormData({ ...formData, 팩스번호: formatFaxNumber(value) });
  };
  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, 이메일: value });
    setEmailError(value && !validateEmail(value) ? '올바른 이메일 형식이 아닙니다.' : '');
  };
  const handlePostcode = (data: any) => {
    setFormData({ ...formData, 우편번호: data.zonecode, 주소1: data.address });
    setIsPostcodeOpen(false);
  };
  const updateCustomerContact = (id: number, field: keyof CustomerContact, value: string) => {
    setCustomerContacts(contacts => contacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  const handleCompanyNameChange = (value: string) => {
    setFormData({ ...formData, 기업명: value });
    
    // 값이 입력되면 에러 메시지 삭제
    if (value.trim() && formErrors.기업명) {
      setFormErrors(prev => ({ ...prev, 기업명: '' }));
    }
  };
  const handleSalesStaffChange = (value: string) => {
    setFormData({ ...formData, 영업담당자: value });
    if (value && formErrors.영업담당자) {
      setFormErrors(prev => ({ ...prev, 영업담당자: '' }));
    }
  };


  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="bg-white rounded-lg ">
          <div className="border-b px-6 py-4">
            <h2 className="font-bold">고객정보 등록</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <UnifiedFormSection
              formData={formData}
              formErrors={{
                ...formErrors, 
                고객번호: duplicateError || formErrors.고객번호 
              }}
              emailError={emailError}
              salesYears={salesYears}
              salesYearError={salesYearError}
              salesAmountError={salesAmountError}
              salesPersonnelError={salesPersonnelError}
              industries={industries}
              onCustomerNumberChange={handleCustomerNumberChange}
              onSalesStaffChange={handleSalesStaffChange}
              onCompanyNameChange={handleCompanyNameChange}
              onBusinessNumberChange={handleBusinessNumberChange}
              onBusinessNumberFileChange={(file) => {
                setBizLicenseFile(file); 
                if (file) {
                  setFormData(prev => ({
                    ...prev, 
                    사업자등록번호_이미지: { name: file.name, data: '', type: file.type } 
                  }));
                }
              }}

              onIntroFileChange={(file) => {
                setIntroFile(file);
                if (file) {
                  setFormData(prev => ({
                    ...prev, 
                    회사간략소개_파일: { name: file.name, data: '', type: file.type } 
                  }));
                }
              }}
              onRepresentativeChange={(value) => setFormData({ ...formData, 대표자: value })}
              onPhoneChange={handlePhoneNumberChange}
              onEmailChange={handleEmailChange}
              onLandlineChange={handleLandlineChange}
              onFaxChange={handleFaxNumberChange}
              onRegionChange={(value) => setFormData({ ...formData, 지역구분: value })}
              onAddress1Change={(value) => setFormData({ ...formData, 주소1: value })}
              onAddress2Change={(value) => setFormData({ ...formData, 주소2: value })}
              onPostcodeSearch={() => setIsPostcodeOpen(true)}
              onProductChange={(value) => setFormData({ ...formData, 생산제품: value })}
              onIndustryChange={(value) => {
                if (value === '기타') {
                   const custom = prompt('새로운 업종 입력:');
                   if (custom) { setIndustries([...industries, custom]); setFormData({...formData, 업종: custom}); }
                } else { setFormData({...formData, 업종: value}); }
              }}
              onBusinessTypeChange={(value) => setFormData({ ...formData, 업태: value })}
              onHomepageChange={(value) => setFormData({ ...formData, 홈페이지: value })}
              onIntroChange={(value) => setFormData({ ...formData, 회사간략소개: value })}

              onYearChange={handleYearChange}
              onAmountChange={handleSalesAmountChange}
              onPersonnelChange={handleSalesPersonnelChange}
              onCancel={() => navigate('/customer-status')}
              onSubmit={handleSubmit}
              autoSaveStatus={autoSaveStatus}
              submitButtonText="등록"
            />

            <CustomerContactsSection
              contacts={customerContacts}
              onAddClick={() => setIsContactModalOpen(true)}
              onUpdate={updateCustomerContact}
            />
            <ConsultationHistorySection
              histories={consultationHistories}
              onAddClick={() => setIsConsultationModalOpen(true)}
            />
            <ContractHistorySection
              histories={contractHistories}
              onAddClick={() => setIsContractModalOpen(true)}
            />
          </form>
        </div>
      </div>

      {/* 모달들 */}
      <CustomerContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={(data) => {
            setCustomerContacts([...customerContacts, { id: Date.now(), ...data }]);
            setIsContactModalOpen(false);
        }}
      />
      {isConsultationModalOpen && (
        <ConsultationModal
          isOpen={isConsultationModalOpen}
          onClose={() => setIsConsultationModalOpen(false)}
          onSubmit={(data) => {
            setConsultationHistories([...consultationHistories, { id: Date.now(), ...data }]);
            setIsConsultationModalOpen(false);
          }}
        />
      )}
      {isContractModalOpen && (
        <ContractModal
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          customerNo={formData.고객번호}
          onSubmit={(data) => {
            setContractHistories([...contractHistories, { id: Date.now(), ...data }]);
            setIsContractModalOpen(false);
          }}
        />
      )}
      {isPostcodeOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setIsPostcodeOpen(false)}>
           <div className="bg-white rounded-lg p-4 w-[500px]" onClick={e=>e.stopPropagation()}><DaumPostcode onComplete={handlePostcode}/></div>
        </div>
      )}
      <AutoSaveModal isOpen={isAutoSaveModalOpen} onLoad={loadAutoSaveData} onDiscard={discardAutoSaveData} />
    </div>
  );
}