// 상담일지 모달 옵션
export const CONSULTATION_WRITER_OPTIONS = [
  { value: '정태용', label: '정태용' },
  { value: '김혜민', label: '김혜민' },
  { value: '박정배', label: '박정배' },
  { value: '김유진', label: '김유진' },
];

// 계약정보 모달 옵션
export const CONTRACT_BUSINESS_TYPE_OPTIONS = [
  { value: '컨설팅', label: '컨설팅' },
  { value: '스마트공장', label: '스마트공장' },
];

// 공통 정규식 패턴
export const VALIDATION_PATTERNS = {
  PHONE: /^01[016789]-\d{3,4}-\d{4}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TIME_INPUT: /^[0-9:~\-\s]*$/, // 상담시간 입력용
};

// 공통 에러 메시지
export const ERROR_MESSAGES = {
  REQUIRED_NAME: '이름을 입력해주세요.',
  REQUIRED_PHONE: '휴대전화를 입력해주세요.',
  REQUIRED_EMAIL: '이메일을 입력해주세요.',
  INVALID_PHONE: '올바른 휴대전화 형식이 아닙니다.',
  INVALID_EMAIL: '올바른 이메일 형식이 아닙니다.',
  REQUIRED_DATE: '일자를 입력해주세요.',
  REQUIRED_TIME: '시간을 입력해주세요.',
  REQUIRED_TITLE: '제목을 입력해주세요.',
  REQUIRED_WRITER: '작성자를 선택해주세요.',
  REQUIRED_PARTICIPANTS: '참석자를 입력해주세요.',
  REQUIRED_CONTENT: '내용을 입력해주세요.',
  REQUIRED_BUSINESS_TYPE: '사업구분을 입력해주세요.',
  REQUIRED_CONTRACT_NO: '계약번호를 입력해주세요.',
  REQUIRED_PROJECT_NAME: '프로젝트명을 입력해주세요.',
};

// 플레이스홀더 텍스트
export const PLACEHOLDERS = {
  TIME: '10:00 ~ 11:00',
  PHONE: '010-0000-0000',
  EMAIL: 'example@company.com',
  CONTRACT_NO: 'yyyy-기업번호-계약no',
  PROJECT_NAME: '관한 공동주',
  CONSULTATION_TITLE: '영업활동과 건설 관련 미팅',
  COMPANY_INFO: '* 기업 일반 사항 (매출, 인사, 업적, 제품)',
  MEETING_CONTENT: '* 미팅내용',
  FUTURE_PLAN: '* 향후 진행방안',
  AMOUNT: '0',
};