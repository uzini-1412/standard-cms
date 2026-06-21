export interface Contract {
  id: number;
  사업구분: string;
  계약번호: string;
  계약일: string;
  프로젝트명: string;
  계약금액: string;
  MD?: number;
  PM?: string;
  컨설턴트?: string;
  비고?: string;

  시작일?: string;
  종료일?: string;
  사업기간?: string; // "YYYY-MM-DD ~ YYYY-MM-DD"
  개월수?: string;   // "N개월"
}

// 2. 회사 정보가 포함된 확장 타입 (리스트/테이블 조회용)
export interface ContractWithCompany extends Contract {
  기업명: string;
  customerId?: number;
}

// 3. 필터링 옵션 타입
export interface ContractFilterOptions {
  기업명: string;
  사업구분: string;
  프로젝트명: string;
  계약번호: string;
  사업기간: string;
  정렬: '오름차순' | '내림차순' | '기업명순' | '';
}