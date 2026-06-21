//고객 정보 수정

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCompanyById, updateCompany } from '../../api/company';
import DaumPostcode from 'react-daum-postcode';
import { ConsultationModal } from '../Consultation/ConsultationModal';
import { ContractModal } from '../Contract/ContractModal';
import { CustomerContactModal } from './CustomerContactModal';
import { UnifiedFormSection } from '../../shared/sections/UnifiedFormSection';
import { CustomerContactsSection } from '../../shared/sections/CustomerContactsSection';
import { ConsultationHistorySection } from '../../shared/sections/ConsultationHistorySection';
import { ContractHistorySection } from '../../shared/sections/ContractHistorySection';
import type { SalesYear, CustomerContact, ConsultationHistory, ContractHistory } from '../../types/customer';
import { 
  formatBusinessNumber, 
  formatPhoneNumber, 
  formatLandlineNumber, 
  formatFaxNumber,
  formatCustomerNumber,
  validateEmail 
} from '../../shared/utils/formatters';
import { useToast } from '../../app/contexts/ToastContext';

// 업종 목록 (Context에서 제거되었으므로 상수로 정의)
const DEFAULT_INDUSTRIES = [
  '제조업', '도소매업', '서비스업', '건설업', '정보통신업', '공공기관', '기타'
];

export function EditCustomer() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const currentYear = new Date().getFullYear();
  
  // 업종 관리 상태
  const [industries, setIndustries] = useState<string[]>(DEFAULT_INDUSTRIES);
  
  const [bizLicenseFile, setBizLicenseFile] = useState<File | null>(null);
  const [introFile, setIntroFile] = useState<File | null>(null);

  // 폼 데이터 상태
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
    홈페이지: '',
    회사간략소개: '',
    회사간략소개_파일: null as { name: string; data: string; type: string } | null,
  });

  const [salesYears, setSalesYears] = useState<SalesYear[]>([
    { id: 1, year: '', amount: '', personnel: 0 }
  ]);

  const [customerContacts, setCustomerContacts] = useState<CustomerContact[]>([]);
  const [consultationHistories, setConsultationHistories] = useState<ConsultationHistory[]>([]);
  const [contractHistories, setContractHistories] = useState<ContractHistory[]>([]);

  // 에러 및 모달 상태
  const [emailError, setEmailError] = useState<string>('');
  const [salesYearError, setSalesYearError] = useState<string>('');
  const [formErrors, setFormErrors] = useState({
    기업명: '',
    영업담당자: '',
    고객번호: '',
  });

  const [isPostcodeOpen, setIsPostcodeOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState<boolean>(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<CustomerContact | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<ConsultationHistory | null>(null);
  const [editingContract, setEditingContract] = useState<ContractHistory | null>(null);
  const formatToLocalDate = (dateString: any) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // [변경 2] API로 데이터 불러오기 (DB -> State 매핑)
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;

      try {
        const dbData = await getCompanyById(id);
        
        // 1. 기본 정보 매핑
        setFormData({
          고객번호: dbData.customer_code || '',
          등록일: dbData.reg_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          영업담당자: dbData.manager_name || '',
          기업명: dbData.name || '',
          사업자등록번호: dbData.biz_num || '',
          사업자등록번호_이미지: dbData.biz_num_file 
            ? { name: dbData.biz_num_file.split('/').pop(), data: '', type: '' } 
            : null,
          대표자: dbData.ceo_name || '',
          휴대전화: dbData.mobile_phone || '',
          이메일: dbData.email || '',
          전화번호: dbData.tel || '',
          팩스번호: dbData.fax || '',
          지역구분: dbData.region || '',
          우편번호: dbData.zipcode || '',
          주소1: dbData.address_main || '',
          주소2: dbData.address_sub || '',
          생산제품: dbData.products || '',
          업종: dbData.industry || '',
          업태: dbData.biz_status || '',
          인원: 0, // salesYears에서 가져옴
          담당자: '', // 구 데이터 호환용
          부서: '', 
          직책: '',
          홈페이지: dbData.homepage || '',
          회사간략소개: dbData.brief_co || '',
          회사간략소개_파일: dbData.brief_co_file 
            ? { name: dbData.brief_co_file.split('/').pop(), data: '', type: '' } 
            : null,
        });

        // 업종이 기본 목록에 없으면 추가
        if (dbData.industry && !industries.includes(dbData.industry)) {
          setIndustries(prev => [...prev, dbData.industry]);
        }

        // 2. 매출 정보 매핑
        if (dbData.salesYears && dbData.salesYears.length > 0) {
          setSalesYears(dbData.salesYears.map((sale: any) => ({
            id: sale.id,
            year: sale.year,
            amount: sale.amount ? sale.amount.toLocaleString() : '',
            personnel: sale.personnel || 0
          })));
        }

        // 3. 고객 담당자 매핑 
        if (dbData.customerContacts) {
          setCustomerContacts(dbData.customerContacts.map((c: any) => ({
            id: c.id,
            등록일자: c.reg_date?.split('T')[0] || '',
            이름: c.name,
            부서: c.department,
            직책: c.position,
            휴대전화: c.phone,  //내가 이거 db는 mobile_phone해두고 서버는 phone햇던데.. 서버기준으로수정해야함
            이메일: c.email,
            비고: c.note
          })));
        }

        // 4. 상담 이력 매핑
        if (dbData.consultationHistories) {
          setConsultationHistories(dbData.consultationHistories.map((h: any) => ({
            id: h.id,
            상담일자: formatToLocalDate(h.consult_date),
            시작시간: h.start_time,
            종료시간: h.end_time,
            제목: h.title,
            고객참석자: h.attendees_customer,
            자사참석자: h.attendees_company,
            장소: h.location,
            작성일: h.reg_date?.split('T')[0],
            작성자: h.writer,
            주요상담내용: h.content_general, 
            상담내용: h.content_meeting,
            조치진행사항: h.content_future
          })));
        }

if (dbData.contractHistories) {
  const mapped = dbData.contractHistories.map((c: any) => {
    const startDate = c.start_date?.split('T')[0] || '';
    const endDate = c.end_date?.split('T')[0] || '';

    let monthDuration = '';
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffMonths =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      monthDuration = `${diffMonths}개월`;
    }

    return {
      id: c.id,
      사업구분: c.biz_type,
      계약번호: c.contract_no,
      계약일: c.contract_date?.split('T')[0] || '',
      프로젝트명: c.project_name,
      시작일: startDate,
      종료일:endDate,
      사업기간: monthDuration || `${startDate} ~ ${endDate}`,
      계약금액: c.amount ? c.amount.toLocaleString() : '',
      MD: c.md,
      PM: c.pm,
      컨설턴트: c.consultant_name,
      비고: c.note
      
    };
  });

  setContractHistories(mapped);
}

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        alert("고객 정보를 불러오는데 실패했습니다.");
        navigate('/customer-status');
      }
    };

    fetchCustomer();
  }, [id, navigate]); 


  const handleYearChange = (id: number, year: string) => {
    const updated = salesYears.map(item => 
      item.id === id ? { ...item, year } : item
    );
    setSalesYears(updated);
    if (year && salesYears.length < 5) {
      const hasEmptyYear = updated.some(item => !item.year);
      if (!hasEmptyYear) {
        setSalesYears([...updated, { id: Date.now(), year: '', amount: '', personnel: 0 }]);
      }
    }
  };

  const handleSalesAmountChange = (id: number, value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setSalesYears(salesYears.map(item => item.id === id ? { ...item, amount: formatted } : item));
  };

  // [변경 3] 저장(수정) 로직: State -> API Payload(영어) 변환
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // 유효성 검사
    const newErrors = { 고객번호: '', 기업명: '', 영업담당자: '' };
    let hasError = false;

    if (!formData.고객번호 || formData.고객번호.trim() === '' || formData.고객번호.trim() === `${currentYear}-`) {
      newErrors.고객번호 = '고객번호를 입력해주세요.';
      hasError = true;
    }
    if (!formData.기업명 || formData.기업명.trim() === '') {
      newErrors.기업명 = '기업명을 입력해주세요.';
      hasError = true;
    }
    if (!formData.영업담당자 || formData.영업담당자.trim() === '') {
      newErrors.영업담당자 = '영업담당자를 선택해주세요.';
      hasError = true;
    }
    setFormErrors(newErrors);
    
    const validSalesYears = salesYears.filter(item => item.year);
    if (validSalesYears.length === 0) {
      setSalesYearError('최소 1개의 매출규모를 입력해주세요.');
      hasError = true;
    }

    if (hasError) return;

    if (id) {
      try {
       const formDataToSend = new FormData();

        // 1. 일반 텍스트 데이터 append
        formDataToSend.append('customer_code', formData.고객번호);
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

        // 2. 파일 데이터 append (새 파일이 선택되었을 때만!)
        if (bizLicenseFile) {
          formDataToSend.append('biz_license_file', bizLicenseFile);
        }
        if (introFile) {
          formDataToSend.append('intro_file', introFile);
        }

        // 3. 배열 데이터 append (JSON.stringify 사용)
        
        // [매출]
        const mappedSales = validSalesYears.map(s => ({
            year: s.year,
            amount: s.amount.replace(/,/g, ''),
            personnel: s.personnel
        }));
        formDataToSend.append('salesYears', JSON.stringify(mappedSales));

        // [담당자]
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

        // [상담]
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
            content_future: h.조치진행사항,
            reg_date: h.작성일 || new Date().toISOString()
        }));
        formDataToSend.append('consultationHistories', JSON.stringify(mappedConsultations));

        // [계약]
        const mappedContracts = contractHistories.map(c => ({
            biz_type: c.사업구분,
            contract_no: c.계약번호,
            contract_date: c.계약일,
            project_name: c.프로젝트명,
            start_date: c.시작일,
            end_date: c.종료일,
            amount: c.계약금액.replace(/,/g, ''),
            md: c.MD,
            pm: c.PM,
            consultant_name: c.컨설턴트,
            note: c.비고
        }));
        formDataToSend.append('contractHistories', JSON.stringify(mappedContracts));


        // 4. API 호출 (FormData 전송)
        await updateCompany(id, formDataToSend);
        
        showToast('고객 정보가 성공적으로 수정되었습니다.');
        navigate(`/customer-detail/${id}`);

      } catch (error) {
        console.error("수정 실패:", error);
        alert("저장에 실패했습니다.");
      }
    }
  };

  // 나머지 핸들러들은 그대로 유지 (UI 조작용)
  const handleCustomerNumberChange = (value: string) => {
    const formatted = formatCustomerNumber(value);
    if (formatted !== null) setFormData({ ...formData, 고객번호: formatted });
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

  // 1. 담당자 모달 핸들러
  const handleContactSubmitModal = (data: any) => {
    if (editingContact) {
      setCustomerContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...data } : c));
    } else {
      setCustomerContacts(prev => [...prev, { id: Date.now(), ...data }]);
    }
    setIsContactModalOpen(false);
    setEditingContact(null);
  };
  const handleContactDelete = (contactId: number) => {
    if (confirm('삭제하시겠습니까?')) {
      setCustomerContacts(prev => prev.filter(c => c.id !== contactId));
      setIsContactModalOpen(false);
    }
  };

  // 2. 상담 모달 핸들러
  const handleConsultationSubmitModal = (data: any) => {
    if (editingConsultation) {
      setConsultationHistories(prev => prev.map(c => c.id === editingConsultation.id ? { ...c, ...data } : c));
    } else {
      setConsultationHistories(prev => [...prev, { id: Date.now(), ...data }]);
    }
    setIsConsultationModalOpen(false);
    setEditingConsultation(null);
  };
  const handleConsultationDelete = (id: number) => {
    if (confirm('삭제하시겠습니까?')) {
      setConsultationHistories(prev => prev.filter(c => c.id !== id));
      setIsConsultationModalOpen(false);
    }
  };

  // 3. 계약 모달 핸들러
const handleContractSubmitModal = (data: any) => {
    
    // 1. 날짜 가져오기 (모달에서 온 '시작일'/'종료일' 사용)
    const sDate = data.시작일 || data.start_date;
    const eDate = data.종료일 || data.end_date;

    // 2. [핵심] 무조건 'N개월'로 계산해서 변수에 담기
    let durationDisplay = '';
    
    if (sDate && eDate) {
      const start = new Date(sDate);
      const end = new Date(eDate);
      
      // 월 차이 계산
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + 
                         (end.getMonth() - start.getMonth());
      
      durationDisplay = `${diffMonths}개월`; // 예: "3개월"
    }

    // 3. 데이터 합치기
    const newData = {
      ...data,
      
      // DB 전송을 위해 날짜는 그대로 유지
      start_date: sDate, 
      end_date: eDate,
      시작일: sDate,
      종료일: eDate,

      // ★ [여기가 포인트] 표에 보여줄 '사업기간' 칸에 'N개월'을 넣습니다.
      사업기간: durationDisplay 
    };

    // 4. 리스트 업데이트
    if (editingContract) {
      setContractHistories(prev =>
        prev.map(c => c.id === editingContract.id ? { ...c, ...newData } : c)
      );
    } else {
      setContractHistories(prev => [
        ...prev,
        { id: Date.now(), ...newData }
      ]);
    }
    

    setIsContractModalOpen(false);
    setEditingContract(null);
  };

  const handleContractDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      // 1. 리스트에서 해당 ID를 가진 계약을 제외 (화면상 삭제)
      setContractHistories(prev => prev.filter(c => c.id !== id));
      
      // 2. 모달 닫기 및 초기화
      setIsContractModalOpen(false);
      setEditingContract(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-6">
      <div className="bg-white rounded-lg  overflow-hidden">
        <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="font-bold">고객정보 수정</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <UnifiedFormSection
              formData={formData}
              formErrors={formErrors}
              emailError={emailError}
              salesYears={salesYears}
              salesYearError={salesYearError}
              salesAmountError={''}
              salesPersonnelError={''}
              industries={industries}
              onCustomerNumberChange={handleCustomerNumberChange}
              onSalesStaffChange={(value) => setFormData({ ...formData, 영업담당자: value })}
              onCompanyNameChange={(value) => setFormData({ ...formData, 기업명: value })}
              onBusinessNumberChange={handleBusinessNumberChange}
              onBusinessNumberFileChange={(file) => {
                setBizLicenseFile(file); // 1. 전송용 파일 저장
                if (file) {
                  // 2. 화면 표시용 업데이트
                  setFormData(prev => ({
                     ...prev, 
                     사업자등록번호_이미지: { name: file.name, data: '', type: file.type } 
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
                  if (custom) {
                    setIndustries(prev => [...prev, custom]);
                    setFormData({ ...formData, 업종: custom });
                  }
                } else {
                  setFormData({ ...formData, 업종: value });
                }
              }}
              onBusinessTypeChange={(value) => setFormData({ ...formData, 업태: value })}
              onHomepageChange={(value) => setFormData({ ...formData, 홈페이지: value })}
              onIntroChange={(value) => setFormData({ ...formData, 회사간략소개: value })}
              onIntroFileChange={(file) => {
                setIntroFile(file); // 1. 전송용 파일 저장
                if (file) {
                  // 2. 화면 표시용 업데이트
                  setFormData(prev => ({
                     ...prev, 
                     회사간략소개_파일: { name: file.name, data: '', type: file.type } 
                  }));
                }
              }}
              onYearChange={handleYearChange}
              onAmountChange={handleSalesAmountChange}
              onPersonnelChange={(id, value) => {
                setSalesYears(salesYears.map(item => item.id === id ? { ...item, personnel: parseInt(value) || 0 } : item));
              }}
              onCancel={() => navigate(-1)}
              onSubmit={handleSubmit}
              submitButtonText="수정 저장"
            />

            <CustomerContactsSection
              contacts={customerContacts}
              onAddClick={() => { setEditingContact(null); setIsContactModalOpen(true); }}
              onUpdate={() => {}} // 모달에서 처리하므로 비워둠
              onRowClick={(contact) => { setEditingContact(contact); setIsContactModalOpen(true); }}
            />

            <ConsultationHistorySection
              histories={consultationHistories}
              onAddClick={() => { setEditingConsultation(null); setIsConsultationModalOpen(true); }}
              onRowClick={(history) => { setEditingConsultation(history); setIsConsultationModalOpen(true); }}
            />

            <ContractHistorySection
              histories={contractHistories}
              onAddClick={() => { setEditingContract(null); setIsContractModalOpen(true); }}
              onRowClick={(contract) => { setEditingContract(contract); setIsContractModalOpen(true); }}
            />
          </form>

          {/* 모달들 */}
          <CustomerContactModal 
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            onSubmit={handleContactSubmitModal}
            onDelete={editingContact ? () => handleContactDelete(editingContact.id) : undefined}
            initialData={editingContact}
            mode={editingContact ? 'edit' : 'add'}
          />

          <ConsultationModal 
            isOpen={isConsultationModalOpen}
            onClose={() => setIsConsultationModalOpen(false)}
            onSubmit={handleConsultationSubmitModal}
            onDelete={editingConsultation ? () => handleConsultationDelete(editingConsultation.id) : undefined}
            editingConsultation={editingConsultation}
          />

          <ContractModal 
            isOpen={isContractModalOpen}
            onClose={() => setIsContractModalOpen(false)}
            customerNo={formData.고객번호}
            onSubmit={handleContractSubmitModal}
            onDelete={editingContract ? () => handleContractDelete(editingContract.id) : undefined}
            editingContract={editingContract}
            existingContracts={contractHistories}
          />

          {isPostcodeOpen && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setIsPostcodeOpen(false)}>
              <div className="bg-white rounded-lg p-4 w-[500px]" onClick={e => e.stopPropagation()}>
                <DaumPostcode onComplete={handlePostcode} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}