import type { ReactNode } from 'react';
import { PAGE } from '../ui/theme';

/** 모든 화면을 감싸는 공통 셸 (배경 + 최대폭 + 패딩). */
export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className={PAGE.shell}>
      <div className={PAGE.container}>{children}</div>
    </div>
  );
}

interface PageToolbarProps {
  /** 좌측 제목 (예: "고객 현황"). */
  title: string;
  /** 제목 옆 보조 정보 (예: 건수 배지). */
  meta?: ReactNode;
  /** 우측 액션 영역 (버튼 등). */
  actions?: ReactNode;
}

/** 목록 화면 상단 공통 툴바 (제목 + 건수 + 액션). */
export function PageToolbar({ title, meta, actions }: PageToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        {meta}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** 건수 등 강조 배지. */
export function CountBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-[#4A5CC7]">
      {children}
    </span>
  );
}
