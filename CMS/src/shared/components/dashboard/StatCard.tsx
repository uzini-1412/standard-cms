import type { LucideIcon } from 'lucide-react';
import { CARD } from '../../ui/theme';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** 아이콘/강조 색 계열 (tailwind 색 토큰). */
  tone?: 'indigo' | 'emerald' | 'violet' | 'amber';
  onClick?: () => void;
}

const TONES: Record<NonNullable<StatCardProps['tone']>, { bg: string; fg: string; bar: string }> = {
  indigo: { bg: 'bg-indigo-50', fg: 'text-[#4A5CC7]', bar: 'bg-[#4A5CC7]' },
  emerald: { bg: 'bg-emerald-50', fg: 'text-emerald-600', bar: 'bg-emerald-500' },
  violet: { bg: 'bg-violet-50', fg: 'text-violet-600', bar: 'bg-violet-500' },
  amber: { bg: 'bg-amber-50', fg: 'text-amber-600', bar: 'bg-amber-500' },
};

/** 대시보드 지표 카드. */
export function StatCard({ label, value, icon: Icon, tone = 'indigo', onClick }: StatCardProps) {
  const t = TONES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${CARD} group relative overflow-hidden p-5 text-left transition hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${t.bar}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-800">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${t.bg}`}>
          <Icon className={`h-6 w-6 ${t.fg}`} />
        </div>
      </div>
    </button>
  );
}
