import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseHighlightNavigationProps<T> {
  items: T[];
  itemsPerPage: number;
  getId: (item: T) => number;
  onPageChange: (page: number) => void;
}

/**
 * URL 파라미터의 highlight ID를 기반으로 자동으로 해당 항목이 있는 페이지로 이동하는 훅
 * 
 * @param items - 전체 아이템 배열 (필터링/정렬된 상태)
 * @param itemsPerPage - 페이지당 항목 수
 * @param getId - 아이템에서 ID를 추출하는 함수
 * @param onPageChange - 페이지 변경 함수
 * 
 * @example
 * useHighlightNavigation({
 *   items: filteredCustomers,
 *   itemsPerPage: itemsPerPage,
 *   getId: (customer) => customer.id,
 *   onPageChange: setCurrentPage
 * });
 */
export function useHighlightNavigation<T>({
  items,
  itemsPerPage,
  getId,
  onPageChange,
}: UseHighlightNavigationProps<T>) {
  const [searchParams] = useSearchParams();
  const savedHighlightId = useRef<string | null>(null);
  const hasNavigated = useRef(false);

  // URL 파라미터에서 highlight 확인하고 저장
  useEffect(() => {
    const highlightParam = searchParams.get('highlight');
    
    // highlight 파라미터가 있으면 저장 (한 번만)
    if (highlightParam && !savedHighlightId.current) {
      savedHighlightId.current = highlightParam;
    }
  }, [searchParams]);

  // 페이지당 항목 수가 계산되면 저장된 highlight ID로 페이지 이동
  useEffect(() => {
    
    if (savedHighlightId.current && itemsPerPage > 0 && !hasNavigated.current) {
      const targetId = parseInt(savedHighlightId.current, 10);
      const itemIndex = items.findIndex(item => getId(item) === targetId);
      
      
      if (itemIndex !== -1) {
        // 해당 아이템이 있는 페이지 계산
        const targetPage = Math.floor(itemIndex / itemsPerPage) + 1;
        onPageChange(targetPage);
        hasNavigated.current = true;
      }
    }
  }, [items, itemsPerPage, getId, onPageChange]);

  return savedHighlightId.current;
}
