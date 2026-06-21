/**
 * 사업자등록번호 포맷팅 (000-00-00000)
 */
export function formatBusinessNumber(value: string): string {
  const numbers = value.replace(/[^\d]/g, '');
  
  if (numbers.length > 10) {
    return value; // 최대 10자리 초과 시 현재 값 유지
  }
  
  let formatted = numbers;
  if (numbers.length > 3) {
    formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
  }
  if (numbers.length > 5) {
    formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 5) + '-' + numbers.slice(5);
  }
  
  return formatted;
}

/**
 * 휴대전화 포맷팅 (010-0000-0000)
 */
export function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/[^\d]/g, '');
  
  if (numbers.length > 11) {
    return value; // 최대 11자리 초과 시 현재 값 유지
  }
  
  let formatted = numbers;
  if (numbers.length > 3) {
    formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
  }
  if (numbers.length > 7) {
    formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7);
  }
  
  return formatted;
}

/**
 * 일반 전화번호 포맷팅 (지역번호 포함)
 */
export function formatLandlineNumber(value: string): string {
  const numbers = value.replace(/[^\d]/g, '');
  
  if (numbers.length > 11) {
    return value; // 최대 11자리 초과 시 현재 값 유지
  }
  
  let formatted = numbers;
  
  // 02로 시작하는 서울 지역번호
  if (numbers.startsWith('02')) {
    if (numbers.length > 2) {
      formatted = numbers.slice(0, 2) + '-' + numbers.slice(2);
    }
    // 02-XXX-XXXX (9자리) 또는 02-XXXX-XXXX (10자리)
    if (numbers.length >= 6) {
      const middleLength = numbers.length === 9 ? 3 : 4;
      const middle = numbers.slice(2, 2 + middleLength);
      const last = numbers.slice(2 + middleLength);
      if (last.length > 0) {
        formatted = numbers.slice(0, 2) + '-' + middle + '-' + last;
      } else {
        formatted = numbers.slice(0, 2) + '-' + middle;
      }
    }
  } 
  // 서울 이외 지역 (031~064 등)
  else if (numbers.startsWith('0')) {
    if (numbers.length > 3) {
      formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
    }
    // 0XX-XXX-XXXX (10자리) 또는 0XX-XXXX-XXXX (11자리)
    if (numbers.length >= 7) {
      const middleLength = numbers.length === 10 ? 3 : 4;
      const middle = numbers.slice(3, 3 + middleLength);
      const last = numbers.slice(3 + middleLength);
      if (last.length > 0) {
        formatted = numbers.slice(0, 3) + '-' + middle + '-' + last;
      } else {
        formatted = numbers.slice(0, 3) + '-' + middle;
      }
    }
  }
  
  return formatted;
}

/**
 * 팩스번호 포맷팅 (일반전화와 동일하지만 국제번호 지원)
 */
export function formatFaxNumber(value: string): string {
  // 국제번호 형식 (+로 시작)
  if (value.startsWith('+')) {
    // +, 숫자, 하이픈만 허용
    return value.replace(/[^\d+-]/g, '');
  }
  
  const numbers = value.replace(/[^\d]/g, '');
  
  if (numbers.length > 15) {
    return value; // 최대 15자리 초과 시 현재 값 유지
  }
  
  let formatted = numbers;
  
  // 02로 시작하는 서울 지역번호
  if (numbers.startsWith('02')) {
    if (numbers.length > 2) {
      formatted = numbers.slice(0, 2) + '-' + numbers.slice(2);
    }
    if (numbers.length >= 6) {
      const middleLength = numbers.length === 9 ? 3 : numbers.length === 10 ? 4 : 4;
      const middle = numbers.slice(2, 2 + middleLength);
      const last = numbers.slice(2 + middleLength);
      if (last.length > 0) {
        formatted = numbers.slice(0, 2) + '-' + middle + '-' + last;
      } else {
        formatted = numbers.slice(0, 2) + '-' + middle;
      }
    }
  } 
  // 서울 이외 지역
  else if (numbers.startsWith('0')) {
    if (numbers.length > 3) {
      formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
    }
    if (numbers.length >= 7) {
      const middleLength = numbers.length === 10 ? 3 : numbers.length === 11 ? 4 : 4;
      const middle = numbers.slice(3, 3 + middleLength);
      const last = numbers.slice(3 + middleLength);
      if (last.length > 0) {
        formatted = numbers.slice(0, 3) + '-' + middle + '-' + last;
      } else {
        formatted = numbers.slice(0, 3) + '-' + middle;
      }
    }
  }
  
  return formatted;
}

/**
 * 이메일 검증
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * 고객번호 포맷팅 (yyyy-xxxx)
 */
export function formatCustomerNumber(value: string): string {
  // 숫자와 하이픈만 남김
  const cleaned = value.replace(/[^\d-]/g, '');
  
  // 빈 문자열이면 빈 문자열 반환
  if (cleaned === '') {
    return '';
  }
  
  // 하이픈 제거 후 숫자만 추출
  const numbers = cleaned.replace(/-/g, '');
  
  // 숫자가 4자리 이하면 그대로 반환 (연도 입력 중)
  if (numbers.length <= 4) {
    return numbers;
  }
  
  // 4자리를 초과하면 yyyy-xxxx 형식으로 포맷
  const year = numbers.slice(0, 4);
  const sequence = numbers.slice(4, 8); // 최대 4자리까지만
  
  return `${year}-${sequence}`;
}

/**
 * 금액 포맷팅 (천 단위 콤마)
 */
export function formatAmount(value: string): string {
  const numbers = value.replace(/[^\d]/g, '');
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * ★ [수정됨] 매출액 포맷팅 (단위 변환 + 길이 제한)
 * 1. 1억 이상: "3.5억"
 * 2. 1천만 이상: "0.5억"
 * 3. [NEW] 전체 길이가 8글자를 넘으면 뒤를 잘라내고 "..." 붙임
 */
export function formatRevenue(value: number | string | undefined | null): string {
  if (!value) return '-';

  // 문자열로 들어오면 콤마 제거 후 숫자로 변환
  const num = typeof value === 'string' 
    ? Number(value.replace(/,/g, '')) 
    : value;

  // 숫자가 아니거나 0이면 '-'
  if (isNaN(num) || num === 0) return '-';

  // 1. 무조건 1억으로 나누고 소수점 1자리 고정 (예: 1234.5억)
  const inOk = (num / 100000000).toFixed(1);
  let formatted = `${inOk}억`;

  // 2. [추가된 기능] 길이 제한 (8글자 초과 시 ...)
  // 예: "12,345,678" (10글자) -> "12,345,6..."
  if (formatted.length > 8) {
    return formatted.slice(0, 8) + '...';
  }

  return formatted;
}