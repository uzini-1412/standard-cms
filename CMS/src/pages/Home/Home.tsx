import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MessageSquare, FileText, Users, ArrowRight, LoaderCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getRegionColor, getBusinessTypeColor } from '../../shared/utils/colorMapping';
import { PageContainer } from '../../shared/components/Page';
import { StatCard } from '../../shared/components/dashboard/StatCard';
import { CARD } from '../../shared/ui/theme';
import { getCompanies } from '../../api/company';
import { getAllConsultations } from '../../api/consultation';
import { getAllContracts } from '../../api/contract';
import { getAllManagers } from '../../api/manager';

interface CompanyRow { id: number; 기업명: string; 등록일: string; 지역구분: string; 업종: string }
interface ConsultationRow { id: number; customerId: number; 기업명: string; 제목: string; 작성자: string; 작성일: string }
interface ContractRow { id: number; customerId: number; 기업명: string; 사업구분: string; 프로젝트명: string; 사업기간: string; 계약금액: string }
interface ManagerRow { id: number; customerId: number; 기업명: string; 담당자: string; 부서: string; 직책: string; 휴대전화: string; 이메일: string }

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export function Home() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRow[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const [c, s, ct, m] = await Promise.all([
          getCompanies(),
          getAllConsultations(),
          getAllContracts(),
          getAllManagers(),
        ]);
        setCompanies(
          c.map((i: any) => ({
            id: i.id,
            기업명: i.name,
            등록일: i.reg_date ? String(i.reg_date).split('T')[0] : '',
            지역구분: i.region || '미분류',
            업종: i.industry || '미분류',
          })),
        );
        setConsultations(
          s.map((i: any) => ({
            id: i.id,
            customerId: i.company_id,
            기업명: i.company_name || '(삭제된 회사)',
            제목: i.title,
            작성자: i.writer,
            작성일: i.reg_date || '',
          })),
        );
        setContracts(
          ct.map((i: any) => ({
            id: i.id,
            customerId: i.company_id,
            기업명: i.company_name || '(삭제된 회사)',
            사업구분: i.biz_type || '기타',
            프로젝트명: i.project_name,
            사업기간:
              i.start_date && i.end_date
                ? `${(new Date(i.end_date).getFullYear() - new Date(i.start_date).getFullYear()) * 12 + (new Date(i.end_date).getMonth() - new Date(i.start_date).getMonth())}개월`
                : '-',
            계약금액: i.amount ? Number(i.amount).toLocaleString() : '0',
          })),
        );
        setManagers(
          m.map((i: any) => ({
            id: i.id,
            customerId: i.company_id,
            기업명: i.company_name || '(삭제된 회사)',
            담당자: i.name,
            부서: i.department,
            직책: i.position,
            휴대전화: i.mobile_phone,
            이메일: i.email,
          })),
        );
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchAll();
  }, []);

  // 최근 6개월 신규 고객 추이
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: monthKey(d), label: `${d.getMonth() + 1}월`, count: 0 });
    }
    const index = new Map(buckets.map((b) => [b.key, b]));
    companies.forEach((c) => {
      if (!c.등록일) return;
      const b = index.get(c.등록일.slice(0, 7));
      if (b) b.count += 1;
    });
    return buckets;
  }, [companies]);

  // 지역별 고객 분포 (상위 6 + 기타)
  const regionData = useMemo(() => {
    const counts = new Map<string, number>();
    companies.forEach((c) => counts.set(c.지역구분, (counts.get(c.지역구분) || 0) + 1));
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 6).map(([name, value]) => ({ name, value }));
    const rest = sorted.slice(6).reduce((sum, [, v]) => sum + v, 0);
    if (rest > 0) top.push({ name: '기타', value: rest });
    return top;
  }, [companies]);

  const recent = <T extends { id: number }>(rows: T[]) => [...rows].sort((a, b) => b.id - a.id).slice(0, 6);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-[60vh] items-center justify-center gap-2 text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin text-[#4A5CC7]" />
          데이터를 불러오는 중입니다...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="mb-5 text-xl font-bold text-slate-800">대시보드</h1>

      {/* 지표 카드 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="총 고객사" value={companies.length} icon={Building2} tone="indigo" onClick={() => navigate('/customer-status')} />
        <StatCard label="상담 건수" value={consultations.length} icon={MessageSquare} tone="emerald" onClick={() => navigate('/consultation-history')} />
        <StatCard label="총 계약" value={contracts.length} icon={FileText} tone="violet" onClick={() => navigate('/contract-history')} />
        <StatCard label="고객 담당자" value={managers.length} icon={Users} tone="amber" onClick={() => navigate('/manager-status')} />
      </div>

      {/* 차트 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${CARD} p-5 lg:col-span-2`}>
          <h2 className="mb-4 text-sm font-semibold text-slate-700">최근 6개월 신규 고객 추이</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A5CC7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4A5CC7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v: number) => [`${v}건`, '신규 고객']}
                />
                <Area type="monotone" dataKey="count" stroke="#4A5CC7" strokeWidth={2.5} fill="url(#fillIndigo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${CARD} p-5`}>
          <h2 className="mb-4 text-sm font-semibold text-slate-700">지역별 고객 분포</h2>
          <div className="h-[260px]">
            {regionData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">데이터 없음</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {regionData.map((entry) => (
                      <Cell key={entry.name} fill={getRegionColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n) => [`${v}개사`, n]} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 최근 목록 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentCard title="최근 등록한 고객사" to="/customer-status" headers={['등록일', '기업명', '지역', '업종']}>
          {recent(companies).map((c) => (
            <Row key={c.id} onClick={() => navigate(`/customer-status?highlight=${c.id}`)}>
              <Cell2 muted>{c.등록일 || '-'}</Cell2>
              <Cell2 strong>{c.기업명}</Cell2>
              <Cell2><RegionBadge region={c.지역구분} /></Cell2>
              <Cell2 muted>{c.업종}</Cell2>
            </Row>
          ))}
        </RecentCard>

        <RecentCard title="최근 등록한 상담" to="/consultation-history" headers={['작성일', '기업명', '제목', '작성자']}>
          {recent(consultations).map((s) => (
            <Row key={s.id} onClick={() => navigate(`/consultation-history?highlightCustomerId=${s.customerId}&highlightConsultationId=${s.id}`)}>
              <Cell2 muted>{s.작성일 ? String(s.작성일).split('T')[0] : '-'}</Cell2>
              <Cell2 strong>{s.기업명}</Cell2>
              <Cell2 muted>{s.제목}</Cell2>
              <Cell2 muted>{s.작성자}</Cell2>
            </Row>
          ))}
        </RecentCard>

        <RecentCard title="최근 등록한 계약" to="/contract-history" headers={['사업구분', '기업명', '프로젝트명', '금액']}>
          {recent(contracts).map((ct) => (
            <Row key={ct.id} onClick={() => navigate(`/contract-history?highlightCustomerId=${ct.customerId}&highlightContractId=${ct.id}`)}>
              <Cell2>
                <span className="inline-block rounded px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${getBusinessTypeColor(ct.사업구분)}20`, color: getBusinessTypeColor(ct.사업구분) }}>
                  {ct.사업구분}
                </span>
              </Cell2>
              <Cell2 strong>{ct.기업명}</Cell2>
              <Cell2 muted>{ct.프로젝트명}</Cell2>
              <Cell2 muted>{ct.계약금액}원</Cell2>
            </Row>
          ))}
        </RecentCard>

        <RecentCard title="등록된 고객 담당자" to="/manager-status" headers={['기업명', '담당자', '부서', '연락처']}>
          {recent(managers).map((m) => (
            <Row key={m.id} onClick={() => navigate(`/manager-status?highlightCustomerId=${m.customerId}&highlightContactId=${m.id}`)}>
              <Cell2 strong>{m.기업명}</Cell2>
              <Cell2>{m.담당자}</Cell2>
              <Cell2 muted>{m.부서 || '-'}</Cell2>
              <Cell2 muted>{m.휴대전화 || '-'}</Cell2>
            </Row>
          ))}
        </RecentCard>
      </div>
    </PageContainer>
  );
}

/* ---------- 최근 목록 카드 (대시보드 전용) ---------- */

function RecentCard({ title, to, headers, children }: { title: string; to: string; headers: string[]; children: ReactNode }) {
  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <Link to={to} className="flex items-center gap-1 text-xs font-medium text-[#4A5CC7] hover:underline">
          전체보기 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="max-h-[280px] overflow-auto">
        <table className="w-full table-fixed">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              {headers.map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <tr className="cursor-pointer border-t border-slate-100 transition hover:bg-indigo-50/50" onClick={onClick}>
      {children}
    </tr>
  );
}

function Cell2({ children, muted, strong }: { children: ReactNode; muted?: boolean; strong?: boolean }) {
  return (
    <td
      className={`truncate px-3 py-2.5 text-xs ${
        strong ? 'font-medium text-slate-800' : muted ? 'text-slate-500' : 'text-slate-700'
      }`}
    >
      {children}
    </td>
  );
}

function RegionBadge({ region }: { region: string }) {
  return (
    <span className="inline-block rounded px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${getRegionColor(region)}20`, color: getRegionColor(region) }}>
      {region}
    </span>
  );
}
