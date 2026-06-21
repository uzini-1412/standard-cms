// 두 날짜 사이의 개월 수를 계산 (월 차이만 계산)
export function calculateMonthsBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 연도 차이 * 12 + 월 차이 (같은 달이면 0개월)
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
  return Math.max(0, months);
}

// 사업기간 문자열 생성: "YYYY-MM-DD ~ YYYY-MM-DD (n개월)"
export function formatProjectPeriod(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return '';
  
  const months = calculateMonthsBetween(startDate, endDate);
  return `${startDate} ~ ${endDate} (${months}개월)`;
}

// 개월 수만 반환 (숫자만)
export function getMonthsOnly(startDate: string, endDate: string): number {
  return calculateMonthsBetween(startDate, endDate);
}

// 사업기간 문자열이나 날짜에서 개월 수만 추출: "n개월"
export function formatMonthsOnly(periodOrStartDate: string, endDate?: string): string {
  // 두 개의 인자가 주어진 경우 (시작일, 종료일)
  if (endDate) {
    const months = calculateMonthsBetween(periodOrStartDate, endDate);
    return `${months}개월`;
  }
  
  // 하나의 인자가 주어진 경우 (사업기간 문자열)
  if (!periodOrStartDate) return '';
  
  // "YYYY-MM-DD ~ YYYY-MM-DD (n개월)" 형식에서 개월수 추출
  const match = periodOrStartDate.match(/\((\d+)개월\)/);
  if (match) {
    return `${match[1]}개월`;
  }
  
  // 날짜 형식이면 빈 문자열 반환
  return '';
}