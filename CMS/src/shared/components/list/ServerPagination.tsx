import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 목록 페이징 컨트롤.
 * - 0-based page 인덱스
 * - <<, >> : 첫/끝 페이지로 즉시 이동
 * - <, >   : 표시되는 페이지 번호 창(window)만 이동
 * - 숫자 버튼 클릭 시 실제 페이지 이동
 */
export interface ServerPaginationProps {
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  sizeOptions?: number[];
  loading?: boolean;
  windowSize?: number; // 한 번에 보여줄 페이지 버튼 개수
}

export function ServerPagination({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
  sizeOptions = [50, 100, 200, 300],
  loading = false,
  windowSize = 5,
}: ServerPaginationProps) {
  const [windowStart, setWindowStart] = useState<number>(() => {
    if (totalPages <= 0) return 0;
    return Math.max(0, Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize));
  });

  useEffect(() => {
    if (totalPages <= 0) return;
    if (page < windowStart || page >= windowStart + windowSize) {
      const desired = Math.max(0, Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize));
      setWindowStart(desired < 0 ? 0 : desired);
    }
  }, [page, totalPages, windowSize]);

  if (totalPages <= 0) return null;

  const effectiveWindowStart = Math.max(0, Math.min(windowStart, Math.max(0, totalPages - windowSize)));
  const effectiveWindowEnd = Math.min(totalPages - 1, effectiveWindowStart + windowSize - 1);

  const canShiftLeft = effectiveWindowStart > 0;
  const canShiftRight = effectiveWindowEnd < totalPages - 1;

  const shiftLeft = () => {
    if (!canShiftLeft) return;
    setWindowStart(Math.max(0, effectiveWindowStart - windowSize));
  };
  const shiftRight = () => {
    if (!canShiftRight) return;
    setWindowStart(Math.min(Math.max(0, totalPages - windowSize), effectiveWindowStart + windowSize));
  };

  const renderPageNumbers = () => {
    const buttons: React.ReactNode[] = [];
    for (let p = effectiveWindowStart; p <= effectiveWindowEnd; p++) {
      buttons.push(
        <button
          key={p}
          onClick={() => onPageChange(p)}
          disabled={loading || p === page}
          className={
            "min-w-[32px] h-8 px-2 text-xs rounded border transition-colors " +
            (p === page
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50")
          }
        >
          {p + 1}
        </button>,
      );
    }
    return buttons;
  };

  return (
    <div className="flex items-center justify-between px-2 py-2 text-xs text-slate-600">
      <div className="flex items-center gap-2">
        {onSizeChange && (
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            disabled={loading}
            className="h-7 px-2 border border-slate-300 rounded bg-white text-xs"
          >
            {sizeOptions.map((s) => (
              <option key={s} value={s}>
                {s}건/쪽
              </option>
            ))}
          </select>
        )}
        <span>
          총 <span className="font-semibold text-slate-800">{totalElements.toLocaleString()}</span>건
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(0)}
          disabled={loading || page === 0}
          title="첫 페이지"
          className="h-8 px-2 text-xs rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          {"<<"}
        </button>
        <button
          onClick={shiftLeft}
          disabled={loading || !canShiftLeft}
          title="이전 페이지 번호들 보기"
          className="h-8 w-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {renderPageNumbers()}
        <button
          onClick={shiftRight}
          disabled={loading || !canShiftRight}
          title="다음 페이지 번호들 보기"
          className="h-8 w-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={loading || page >= totalPages - 1}
          title="마지막 페이지"
          className="h-8 px-2 text-xs rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}
