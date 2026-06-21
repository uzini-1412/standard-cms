import { getCurrentYear } from './date-utils';

/**
 * 고객번호를 기반으로 초기 계약번호를 생성
 * @param customerNo 고객번호 (예: "2025-001")
 * @returns 계약번호 (예: "2026-001-")
 */
export const generateInitialContractNo = (customerNo?: string): string => {
  const currentYear = getCurrentYear();
  
  if (customerNo) {
    // 고객번호에서 기업번호 추출 (예: "2025-001" -> "001")
    const parts = customerNo.split('-');
    const companyNo = parts.length > 1 && parts[1] ? parts[1] : '';
    
    // 기업번호가 있으면 "2026-001-", 없으면 "2026-"
    if (companyNo) {
      return `${currentYear}-${companyNo}-`;
    }
  }
  
  return `${currentYear}-`;
};
