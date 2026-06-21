export interface CustomerContact {
  id: number;
  등록일자: string; 
  담당자: string; 
  부서: string;
  직책: string;
  휴대전화: string;
  이메일: string;
  비고: string;
}

export interface ManagerWithCompany extends CustomerContact {
  기업명: string; 
  지역구분: string;
  업종: string;
  customerId?: number;
}

export interface ManagerFilterOptions {
  기업명?: string; 
  담당자?: string; 
  지역구분?: string;
  업종: string;
  정렬: string; 
}