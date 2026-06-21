/**
 * 표/그리드 공통 정렬 토큰 (전역 단일 소스)
 *
 * 목록 화면의 숫자 컬럼 정렬을 바꾸려면 이 파일의 NUMBER_ALIGN 한 줄만 수정하면
 * 이 상수를 참조하는 모든 목록 화면이 한 번에 바뀐다.
 */
export const NUMBER_ALIGN = "text-right";

/** 헤더(<th>)는 값 정렬과 무관하게 항상 가운데 정렬한다. */
export const HEADER_ALIGN = "text-center";

/** 목록 표 외곽/스크롤/페이징 래퍼 공통 스타일 토큰. */
export const LIST_TABLE_STYLES = {
  container: "border border-gray-200 rounded-sm overflow-hidden bg-white",
  scrollWrapper: "overflow-x-auto overflow-y-auto",
  paginationWrapper: "border-t border-gray-200",
} as const;
