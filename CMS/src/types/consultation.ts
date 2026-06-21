export interface Consultation {
  id: number;
  상담일자: string;     
  시작시간: string;    
  종료시간: string;     
  제목: string;
  고객참석자: string;
  자사참석자: string;
  
 
  작성자: string;       
  작성일: string;
  장소: string;
  주요상담내용: string; 
  상담내용: string;    
  조치진행사항: string;    
}


export interface ConsultationWithCompany extends Consultation {
  기업명: string;       
  지역구분: string;
  customerId?: number; 
}

export interface ConsultationFilterOptions {
  기업명: string;
  지역구분: string;
  정렬: '오름차순' | '내림차순' | '기업명순' | '';
}