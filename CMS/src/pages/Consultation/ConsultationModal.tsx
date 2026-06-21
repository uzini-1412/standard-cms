import { useState, useEffect } from 'react';
import { getCurrentDate } from '../../shared/utils/date-utils';
import { 
  CONSULTATION_WRITER_OPTIONS, 
  VALIDATION_PATTERNS, 
  ERROR_MESSAGES, 
  PLACEHOLDERS 
} from '../../shared/constants/modal-options';
import { Consultation } from '../../types/consultation';


interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Consultation, 'id'>) => void;
  editingConsultation?: Consultation | null;
  onDelete?: (id: number) => void;
}

export function ConsultationModal({ isOpen, onClose, onSubmit, editingConsultation, onDelete }: ConsultationModalProps) {
  const [formData, setFormData] = useState<Omit<Consultation, 'id'>>({
    상담일자: getCurrentDate(),
    시작시간: '',
    종료시간: '',
    제목: '',
    고객참석자: '',
    자사참석자: '',
    장소: '',
    작성일: getCurrentDate(),
    작성자: '',
    주요상담내용: '',
    상담내용: '',
    조치진행사항: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 편집 모드일 때 초기 데이터 로드
  useEffect(() => {
    if (editingConsultation) {
      setFormData({
        상담일자: editingConsultation.상담일자.toString().split('T')[0],
        시작시간: editingConsultation.시작시간,
        종료시간: editingConsultation.종료시간,
        제목: editingConsultation.제목,
        고객참석자: editingConsultation.고객참석자,
        자사참석자: editingConsultation.자사참석자,
        장소: editingConsultation.장소,
        작성일: editingConsultation.작성일,
        작성자: editingConsultation.작성자,
        주요상담내용: editingConsultation.주요상담내용,
        상담내용: editingConsultation.상담내용,
        조치진행사항: editingConsultation.조치진행사항,
      });
    } else {
      setFormData({
        상담일자: getCurrentDate(),
        시작시간: '',
        종료시간: '',
        제목: '',
        고객참석자: '',
        자사참석자: '',
        장소: '',
        작성일: getCurrentDate(),
        작성자: '',
        주요상담내용: '',
        상담내용: '',
        조치진행사항: '',
      });
    }
    setErrors({});
  }, [editingConsultation]);

  const handleChange = (field: keyof Omit<Consultation, 'id'>, value: string) => {
    setFormData({ ...formData, [field]: value });
    // 입력 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const newErrors: {[key: string]: string} = {};
    if (!formData.상담일자) {
      newErrors['상담일자'] = ERROR_MESSAGES.REQUIRED_DATE;
    }
    
    if (!formData.시작시간.trim()) {
      newErrors['시작시간'] = ERROR_MESSAGES.REQUIRED_TIME;
    }
    
    if (!formData.종료시간.trim()) {
      newErrors['종료시간'] = ERROR_MESSAGES.REQUIRED_TIME;
    }
    
    if (!formData.제목.trim()) {
      newErrors['제목'] = ERROR_MESSAGES.REQUIRED_TITLE;
    }
    
    if (!formData.작성자) {
      newErrors['작성자'] = ERROR_MESSAGES.REQUIRED_WRITER;
    }
    
    if (!formData.자사참석자.trim()) {
      newErrors['자사참석자'] = ERROR_MESSAGES.REQUIRED_PARTICIPANTS;
    }
    
    if (!formData.고객참석자.trim()) {
      newErrors['고객참석자'] = ERROR_MESSAGES.REQUIRED_PARTICIPANTS;
    }
    
    if (!formData.주요상담내용.trim()) {
      newErrors['주요상담내용'] = ERROR_MESSAGES.REQUIRED_CONTENT;
    }
    
    if (!formData.상담내용.trim()) {
      newErrors['상담내용'] = ERROR_MESSAGES.REQUIRED_CONTENT;
    }
    
    if (!formData.조치진행사항.trim()) {
      newErrors['조치진행사항'] = ERROR_MESSAGES.REQUIRED_CONTENT;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
    // Reset form
    setFormData({
      상담일자: getCurrentDate(),
      시작시간: '',
      종료시간: '',
      제목: '',
      고객참석자: '',
      자사참석자: '',
      장소: '',
      작성일: getCurrentDate(),
      작성자: '',
      주요상담내용: '',
      상담내용: '',
      조치진행사항: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-[720px]  max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <h3 className="text-base font-bold">상담일지</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="border border-gray-300">
            {/* 일시 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">일시 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="col-span-5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={formData.상담일자}
                    onChange={(e) => handleChange('상담일자', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                  />
                  <input
                    type="time"
                    value={formData.시작시간}
                    onChange={(e) => handleChange('시작시간', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                  />
                  <span className="text-xs">~</span>
                  <input
                    type="time"
                    value={formData.종료시간}
                    onChange={(e) => handleChange('종료시간', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                  />
                </div>
                {(errors['시작시간'] || errors['종료시간']) && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors['시작시간'] || errors['종료시간']}
                  </div>
                )}
              </div>
            </div>

            {/* 제목 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">제목 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="col-span-5 px-3 py-2">
                <input
                  type="text"
                  value={formData.제목}
                  onChange={(e) => handleChange('제목', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                  placeholder="영업활동과 건설 관련 미팅"
                />
                {errors['제목'] && <span className="text-red-500 text-xs">{errors['제목']}</span>}
              </div>
            </div>

            {/* 작성자 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">작성자 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="col-span-2 border-r border-gray-300 px-3 py-2">
                <select
                  value={formData.작성자}
                  onChange={(e) => handleChange('작성자', e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                >
                  <option value="">선택</option>
                  {CONSULTATION_WRITER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {errors['작성자'] && <span className="text-red-500 text-xs">{errors['작성자']}</span>}
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">작성일</span>
              </div>
              <div className="col-span-2 px-3 py-2">
                <input
                  type="text"
                  value={formData.작성일}
                  readOnly
                  className="w-full border-none outline-none text-xs bg-gray-50"
                />
              </div>
            </div>

            {/* 장소 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">장소</span>
              </div>
              <div className="col-span-5 px-3 py-2">
                <input
                  type="text"
                  value={formData.장소}
                  onChange={(e) => handleChange('장소', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                />
              </div>
            </div>

            {/* 자사참석자 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">자사참석자 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="col-span-5 px-3 py-2">
                <input
                  type="text"
                  value={formData.자사참석자}
                  onChange={(e) => handleChange('자사참석자', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                />
                {errors['자사참석자'] && <span className="text-red-500 text-xs">{errors['자사참석자']}</span>}
              </div>
            </div>

            {/* 고객 참석자 */}
            <div className="grid grid-cols-6 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">고객 참석자 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="col-span-5 px-3 py-2">
                <input
                  type="text"
                  value={formData.고객참석자}
                  onChange={(e) => handleChange('고객참석자', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                />
                {errors['고객참석자'] && <span className="text-red-500 text-xs">{errors['고객참석자']}</span>}
              </div>
            </div>

            {/* 주요 상담 내용 헤더 */}
            <div className="border-b border-gray-300 bg-blue-50 py-2">
              <div className="text-center text-xs font-semibold">주요 상담 내용 <span className="text-red-500 text-sm">*</span></div>
            </div>

            {/* 기업 일반 사항 */}
            <div className="border-b border-gray-300">
              <div className="px-3 py-2">
                <textarea
                  value={formData.주요상담내용}
                  onChange={(e) => handleChange('주요상담내용', e.target.value)}
                  className="w-full border-none outline-none text-xs resize-none"
                  placeholder="* 기업 일반 사항 (매출, 인사, 업적, 제품)"
                  rows={6}
                />
                {errors['주요상담내용'] && <span className="text-red-500 text-xs">{errors['주요상담내용']}</span>}
              </div>
            </div>

            {/* 미팅내용 */}
            <div className="border-b border-gray-300">
              <div className="px-3 py-2">
                <textarea
                  value={formData.상담내용}
                  onChange={(e) => handleChange('상담내용', e.target.value)}
                  className="w-full border-none outline-none text-xs resize-none"
                  placeholder="* 미팅내용"
                  rows={6}
                />
                {errors['상담내용'] && <span className="text-red-500 text-xs">{errors['상담내용']}</span>}
              </div>
            </div>

            {/* 장후 진행방안 */}
            <div>
              <div className="px-3 py-2">
                <textarea
                  value={formData.조치진행사항}
                  onChange={(e) => handleChange('조치진행사항', e.target.value)}
                  className="w-full border-none outline-none text-xs resize-none"
                  placeholder="* 향후 진행방안"
                  rows={6}
                />
                {errors['조치진행사항'] && <span className="text-red-500 text-xs">{errors['조치진행사항']}</span>}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
            >
              취소
            </button>
            {onDelete && editingConsultation && (
              <button
                type="button"
                onClick={() => onDelete(editingConsultation.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                삭제
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              {editingConsultation ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}