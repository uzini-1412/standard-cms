import { Consultation } from "./consultation";

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

export type ConsultationHistory = Consultation;

export interface ContractHistory {
  end_date?: string;
  start_date?: string;
  시작일?: string;
  종료일?: string;
  id: number;
  사업구분: string;
  계약번호: string;
  계약일: string;
  프로젝트명: string;

  사업기간?: string; // 계산된 값: "YYYY-MM-DD ~ YYYY-MM-DD (n개월)"
  계약금액: string;
  MD?: number | string;
  PM?: string;
  컨설턴트?: string;
  비고?: string;
  개월수?: string;
}