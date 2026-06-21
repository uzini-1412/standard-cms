import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface SalesYear {
  id: number;
  year: string;
  amount: string;
  personnel: number;
}

export interface CustomerContact {
  id: number;
  등록일자: string;
  이름: string;
  부서: string;
  직책: string;
  휴대전화: string;
  이메일: string;
  비고: string;
}

export interface ConsultationHistory {
  id: number;
  상담일자: string;
  시작시간: string;
  종료시간: string;
  제목: string;
  고객참석자: string;
  자사참석자: string;
  장소: string;
  작성일: string;
  작성자: string;
  주요상담내용: string;
  상담내용: string;
  조치진행사항: string;
}

export interface ContractHistory {
  id: number;
  사업구분: string;
  계약번호: string;
  계약일: string;
  프로젝트명: string;
  시작일: string;
  종료일: string;
  사업기간: string;
  계약금액: string;
  MD: string;
  PM: string;
  컨설턴트: string;
  비고: string;
}

export interface Customer {
  id: number;
  고객번호?: string;
  기업명: string;
  대표자: string;
  담당자: string;
  전화번호: string;
  휴대전화: string;
  이메일: string;
  주소: string;
  주소1?: string;
  주소2?: string;
  지역구분: string;
  업종: string;
  업태: string;
  매출규모: number;
  인원: number;
  상태: string;
  등록일: string;
  부서: string;
  직책: string;
  영업담당자?: string;
  사업자등록번호?: string;
  사업자등록번호_이미지?: { name: string; data: string; type: string } | null;
  팩스번호?: string;
  우편번호?: string;
  생산제품?: string;
  홈페이지?: string;
  회사간략소개?: string;
  회사간략소개_파일?: { name: string; data: string; type: string } | null;
  매출연도?: SalesYear[];
  고객담당자?: CustomerContact[];
  상담이력?: ConsultationHistory[];
  계약이력?: ContractHistory[];
}

interface CustomersContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: number, customer: Partial<Customer>) => void;
  deleteCustomer: (id: number) => void;
  deleteConsultation: (customerId: number, consultationId: number) => void;
  deleteCustomerContact: (customerId: number, contactId: number) => void;
  deleteContract: (customerId: number, contractId: number) => void;
  businessTypes: string[];
  addBusinessType: (type: string) => void;
  contractBusinessTypes: string[];
  addContractBusinessType: (type: string) => void;
  industries: string[];
  addIndustry: (industry: string) => void;
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

// 기본 업종 (항상 표시)
const DEFAULT_INDUSTRIES = ['제조업', 'IT서비스', '소프트웨어', '시스템통합', '무역', '건설'];

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newId = Math.max(...customers.map(c => c.id), 0) + 1;
    setCustomers([...customers, { ...customer, id: newId }]);
  };

  const updateCustomer = (id: number, customer: Partial<Customer>) => {
    setCustomers(customers.map(c => (c.id === id ? { ...c, ...customer } : c)));
  };

  const deleteCustomer = (id: number) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const deleteConsultation = (customerId: number, consultationId: number) => {
    setCustomers(customers.map(c => 
      c.id === customerId ? {
        ...c,
        상담이력: c.상담이력?.filter(consultation => consultation.id !== consultationId)
      } : c
    ));
  };

  const deleteCustomerContact = (customerId: number, contactId: number) => {
    setCustomers(customers.map(c => 
      c.id === customerId ? {
        ...c,
        고객담당자: c.고객담당자?.filter(contact => contact.id !== contactId)
      } : c
    ));
  };

  const deleteContract = (customerId: number, contractId: number) => {
    setCustomers(customers.map(c => 
      c.id === customerId ? {
        ...c,
        계약이력: c.계약이력?.filter(contract => contract.id !== contractId)
      } : c
    ));
  };

  const [businessTypes, setBusinessTypes] = useState<string[]>([
    'IT서비스', '소프트웨어', '시스템통합', '제조업', '클라우드', '인공지능', '데이터분석', '모바일앱', '웹개발', 'ERP', '무역', '신재생에너지', '금융IT', '교육IT', '바이오', '자동차부품'
  ]);

  const addBusinessType = (type: string) => {
    setBusinessTypes([...businessTypes, type]);
  };

  const [contractBusinessTypes, setContractBusinessTypes] = useState<string[]>([
    '컨설팅', '스마트공장', '클라우드', '플랫폼', '앱'
  ]);

  const addContractBusinessType = (type: string) => {
    setContractBusinessTypes([...contractBusinessTypes, type]);
  };

  const [industries, setIndustries] = useState<string[]>(DEFAULT_INDUSTRIES);

  // 고객 데이터에서 사용된 업종을 industries에 추가 (기본 업종은 항상 유지, 기타 업종은 사용 중일 때만 표시)
  useEffect(() => {
    // 기본 업종은 항상 포함
    const allIndustries = new Set(DEFAULT_INDUSTRIES);
    
    // 실제 고객 데이터에서 사용 중인 업종 추가
    customers.forEach(customer => {
      if (customer.업종 && customer.업종.trim() !== '') {
        allIndustries.add(customer.업종);
      }
    });
    
    const updatedIndustries = Array.from(allIndustries);
    
    // 배열이 변경되었는지 확인
    if (updatedIndustries.length !== industries.length || 
        !updatedIndustries.every(ind => industries.includes(ind))) {
      setIndustries(updatedIndustries);
    }
  }, [customers]);

  const addIndustry = (industry: string) => {
    if (!industries.includes(industry)) {
      setIndustries([...industries, industry]);
    }
  };

  return (
    <CustomersContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, deleteConsultation, deleteCustomerContact, deleteContract, businessTypes, addBusinessType, contractBusinessTypes, addContractBusinessType, industries, addIndustry }}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomersContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  return context;
}