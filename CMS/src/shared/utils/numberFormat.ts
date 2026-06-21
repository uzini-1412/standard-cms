/**
 * 숫자 포매터 유틸 (표 숫자 컬럼 표준 표기)
 */

/**
 * 천단위 콤마 포매터 (표준)
 *
 * - 표/그리드의 모든 숫자 값 표시에 사용 (숫자 컬럼은 우측정렬 text-right 와 함께)
 * - number / 숫자 문자열 모두 허용 (문자열 내 기존 콤마는 무시)
 * - null/undefined/빈문자열 → "" 반환 (셀 공백 유지)
 * - 숫자로 해석 불가한 값 → 원본 문자열 그대로 반환
 */
export const formatNumber = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") return "";
  const n = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString();
};

/**
 * 금액(원) 포매터 — 천단위 콤마 앞에 ₩ 기호. 빈값/null → "".
 */
export const formatCurrency = (value?: number | string | null): string => {
  const n = formatNumber(value);
  return n === "" ? "" : `₩ ${n}`;
};
