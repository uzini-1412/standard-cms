// 빠른 고객 등록 — 핵심 필드만 입력하는 간편 등록 모달.
// 상세 정보(매출/담당자/상담/계약 등)는 등록 후 상세 화면에서 추가한다.

import { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { createCompany } from '../../api/company';
import { useToast } from '../../app/contexts/ToastContext';
import { REGION_OPTIONS, STATUS_OPTIONS, SALES_STAFF_OPTIONS } from '../../shared/constants/options';
import { BTN } from '../../shared/ui/theme';

interface QuickAddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newId: number) => void;
  onOpenDetailForm: () => void;
  industries: string[];
}

const FIELD =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#4A5CC7] focus:ring-2 focus:ring-indigo-100';
const LABEL = 'mb-1 block text-xs font-medium text-slate-600';

export function QuickAddCustomerModal({
  isOpen,
  onClose,
  onCreated,
  onOpenDetailForm,
  industries,
}: QuickAddCustomerModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: '',
    ceo_name: '',
    manager_name: '',
    region: '',
    industry: '',
    tel: '',
    mobile_phone: '',
    email: '',
    biz_status: '상담중',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('기업명을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const year = new Date().getFullYear();
      const customerCode = `${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      const fd = new FormData();
      // 백엔드 INSERT 가 바인딩하는 전체 컬럼 — 미입력은 빈 문자열로 전송.
      const payload: Record<string, string> = {
        customer_code: customerCode,
        name: form.name.trim(),
        reg_date: new Date().toISOString().split('T')[0],
        manager_name: form.manager_name,
        biz_num: '',
        ceo_name: form.ceo_name,
        mobile_phone: form.mobile_phone,
        email: form.email,
        tel: form.tel,
        fax: '',
        region: form.region,
        zipcode: '',
        address_main: '',
        address_sub: '',
        products: '',
        industry: form.industry,
        biz_status: form.biz_status,
        homepage: '',
        brief_co: '',
      };
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));

      const res = await createCompany(fd);
      showToast('고객이 등록되었습니다.');
      resetAndClose();
      onCreated(Number(res?.id));
    } catch (err: any) {
      showToast(err?.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setForm({
      name: '',
      ceo_name: '',
      manager_name: '',
      region: '',
      industry: '',
      tel: '',
      mobile_phone: '',
      email: '',
      biz_status: '상담중',
    });
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={resetAndClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#4A5CC7]">
              <Zap className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-800">빠른 고객 등록</h3>
          </div>
          <button onClick={resetAndClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="space-y-4 px-5 py-5">
          <div>
            <label className={LABEL}>
              기업명 <span className="text-rose-500">*</span>
            </label>
            <input
              className={FIELD}
              value={form.name}
              onChange={(e) => {
                set('name', e.target.value);
                if (error) setError('');
              }}
              placeholder="(주)예시기업"
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>대표자</label>
              <input className={FIELD} value={form.ceo_name} onChange={(e) => set('ceo_name', e.target.value)} placeholder="홍길동" />
            </div>
            <div>
              <label className={LABEL}>영업담당자</label>
              <select className={FIELD} value={form.manager_name} onChange={(e) => set('manager_name', e.target.value)}>
                <option value="">선택</option>
                {SALES_STAFF_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>지역구분</label>
              <select className={FIELD} value={form.region} onChange={(e) => set('region', e.target.value)}>
                <option value="">선택</option>
                {REGION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>업종</label>
              <select className={FIELD} value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                <option value="">선택</option>
                {industries.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>전화번호</label>
              <input className={FIELD} value={form.tel} onChange={(e) => set('tel', e.target.value)} placeholder="02-1234-5678" />
            </div>
            <div>
              <label className={LABEL}>휴대전화</label>
              <input className={FIELD} value={form.mobile_phone} onChange={(e) => set('mobile_phone', e.target.value)} placeholder="010-0000-0000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>이메일</label>
              <input className={FIELD} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="contact@example.com" />
            </div>
            <div>
              <label className={LABEL}>상태</label>
              <select className={FIELD} value={form.biz_status} onChange={(e) => set('biz_status', e.target.value)}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              resetAndClose();
              onOpenDetailForm();
            }}
            className="text-sm font-medium text-slate-500 hover:text-[#4A5CC7] hover:underline"
          >
            상세 입력으로 등록 →
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={resetAndClose} className={BTN.secondary}>
              취소
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting} className={BTN.primary}>
              {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
