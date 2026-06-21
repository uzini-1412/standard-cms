// 시스템에서 사용하는 옵션 상수들

export const REGION_OPTIONS = [
  '서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종',
  '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주'
].map(region => ({ value: region, label: region }));

export const STATUS_OPTIONS = [
  '상담중', '계약진행중', '계약완료', '보류', '실패'
].map(status => ({ value: status, label: status }));

export const NEXSA_STAFF_OPTIONS = [
  '정태용', '김혜민'
].map(staff => ({ value: staff, label: staff }));