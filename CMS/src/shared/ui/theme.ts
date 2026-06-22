// 디자인 토큰 (모던 SaaS — 인디고 + 슬레이트)
// 색·간격을 한곳에 모아 전 화면이 같은 톤을 공유하도록 한다.

/** 브랜드 인디고 (ListTable 헤더와 동일 계열). */
export const BRAND = {
  indigo: '#4A5CC7',
  indigoDark: '#3d4eb5',
} as const;

/** 페이지 공통 배경/컨테이너. */
export const PAGE = {
  shell: 'min-h-[calc(100vh-64px)] bg-slate-50',
  container: 'mx-auto w-full max-w-[1600px] px-4 md:px-6 py-5',
} as const;

/** 카드(흰 배경 + 연한 테두리 + 부드러운 그림자). */
export const CARD = 'bg-white rounded-xl border border-slate-200/80 shadow-sm';

/** 버튼 프리셋. */
export const BTN = {
  primary:
    'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4A5CC7] text-white text-sm font-medium hover:bg-[#3d4eb5] transition shadow-sm cursor-pointer disabled:opacity-50',
  secondary:
    'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition cursor-pointer disabled:opacity-50',
} as const;
