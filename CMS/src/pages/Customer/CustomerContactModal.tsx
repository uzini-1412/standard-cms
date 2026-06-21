import { useState, useEffect, useRef } from 'react';
import { getCurrentDate } from '../../shared/utils/date-utils';
import { 
  VALIDATION_PATTERNS, 
  ERROR_MESSAGES, 
  PLACEHOLDERS 
} from '../../shared/constants/modal-options';

interface CustomerContact {
  id: number;
  등록일자: string;
  이름: string;
  부서: string;
  직책: string;
  휴대전화: string;
  이메일: string;
  비고: string;
}

interface CustomerContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CustomerContact, 'id'>) => void;
  initialData?: CustomerContact | null;
  mode?: 'add' | 'edit';
  onDelete?: (id: number) => void;
}

export function CustomerContactModal({ isOpen, onClose, onSubmit, initialData, mode = 'add', onDelete }: CustomerContactModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState<Omit<CustomerContact, 'id'>>({
    등록일자: getCurrentDate(),
    이름: '',
    부서: '',
    직책: '',
    휴대전화: '',
    이메일: '',
    비고: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 편집 모드일 때 초기 데이터 로드
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        등록일자: initialData.등록일자,
        이름: initialData.이름,
        부서: initialData.부서,
        직책: initialData.직책,
        휴대전화: initialData.휴대전화,
        이메일: initialData.이메일,
        비고: initialData.비고,
      });
    } else {
      // 추가 모드일 때는 초기화
      setFormData({
        등록일자: getCurrentDate(),
        이름: '',
        부서: '',
        직책: '',
        휴대전화: '',
        이메일: '',
        비고: '',
      });
    }
    setErrors({});
  }, [initialData, mode]);

  // 비고란 높이 자동 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(60, textareaRef.current.scrollHeight) + 'px';
    }
  }, [formData.비고]);

  const handleChange = (field: keyof Omit<CustomerContact, 'id'>, value: string) => {
    // 휴대전화 자동 포맷팅
    if (field === '휴대전화') {
      const numbers = value.replace(/[^\d]/g, '');
      if (numbers.length > 11) return;
      
      let formatted = numbers;
      if (numbers.length > 3) {
        formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
      }
      if (numbers.length > 7) {
        formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7);
      }
      setFormData({ ...formData, [field]: formatted });
      
      // 유효성 검사
      if (formatted === '') {
        setErrors({ ...errors, 휴대전화: '' });
      } else {
        if (!VALIDATION_PATTERNS.PHONE.test(formatted)) {
          setErrors({ ...errors, 휴대전화: ERROR_MESSAGES.INVALID_PHONE });
        } else {
          setErrors({ ...errors, 휴대전화: '' });
        }
      }
    } 
    // 이메일 유효성 검사
    else if (field === '이메일') {
      setFormData({ ...formData, [field]: value });
      
      if (value === '') {
        setErrors({ ...errors, 이메일: '' });
      } else {
        if (!VALIDATION_PATTERNS.EMAIL.test(value)) {
          setErrors({ ...errors, 이메일: ERROR_MESSAGES.INVALID_EMAIL });
        } else {
          setErrors({ ...errors, 이메일: '' });
        }
      }
    }
    // 이름 유효성 검사
    else if (field === '이름') {
      setFormData({ ...formData, [field]: value });
      
      if (value.trim() === '') {
        setErrors({ ...errors, 이름: ERROR_MESSAGES.REQUIRED_NAME });
      } else {
        setErrors({ ...errors, 이름: '' });
      }
    }
    // 나머지 필드
    else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};
    
    // 이름 검증
    if (formData.이름.trim() === '') {
      newErrors['이름'] = ERROR_MESSAGES.REQUIRED_NAME;
    }
    
    // 휴대전화 검증
    if (!VALIDATION_PATTERNS.PHONE.test(formData.휴대전화)) {
      newErrors['휴대전화'] = ERROR_MESSAGES.INVALID_PHONE;
    }
    
    // 이메일 형식 검증
    if (!VALIDATION_PATTERNS.EMAIL.test(formData.이메일)) {
      newErrors['이메일'] = ERROR_MESSAGES.INVALID_EMAIL;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
    // Reset form
    setFormData({
      등록일자: getCurrentDate(),
      이름: '',
      부서: '',
      직책: '',
      휴대전화: '',
      이메일: '',
      비고: '',
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-[600px]  min-h-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <h3 className="text-base font-bold">고객 담당자</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="border border-gray-300">
            {/* 등록일자 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">등록일자</span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <input
                  type="date"
                  value={formData.등록일자}
                  onChange={(e) => handleChange('등록일자', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                />
              </div>
            </div>

            {/* 이름 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">이름 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <input
                  type="text"
                  value={formData.이름}
                  onChange={(e) => handleChange('이름', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                />
                {errors['이름'] && <span className="text-red-500 text-xs">{errors['이름']}</span>}
              </div>
            </div>

            {/* 부서, 직책 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">부서</span>
              </div>
              <div className="border-r border-gray-300 px-3 py-2">
                <input
                  type="text"
                  value={formData.부서}
                  onChange={(e) => handleChange('부서', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                />
              </div>
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">직책</span>
              </div>
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={formData.직책}
                  onChange={(e) => handleChange('직책', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                />
              </div>
            </div>

            {/* 휴대전화 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">휴대전화 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <input
                  type="text"
                  value={formData.휴대전화}
                  onChange={(e) => handleChange('휴대전화', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                  placeholder={PLACEHOLDERS.PHONE}
                />
                {errors['휴대전화'] && <span className="text-red-500 text-xs">{errors['휴대전화']}</span>}
              </div>
            </div>

            {/* 이메일 */}
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-center justify-center">
                <span className="text-xs">이메일 <span className="text-red-500 text-sm">*</span></span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <input
                  type="email"
                  value={formData.이메일}
                  onChange={(e) => handleChange('이메일', e.target.value)}
                  className="w-full border-none outline-none text-xs"
                  placeholder={PLACEHOLDERS.EMAIL}
                />
                {errors['이메일'] && <span className="text-red-500 text-xs">{errors['이메일']}</span>}
              </div>
            </div>

            {/* 비고 */}
            <div className="grid grid-cols-4">
              <div className="border-r border-gray-300 bg-blue-50 px-2 py-2 flex items-start justify-center pt-3">
                <span className="text-xs">비고</span>
              </div>
              <div className="col-span-3 px-3 py-2">
                <textarea
                  ref={textareaRef}
                  value={formData.비고}
                  onChange={(e) => handleChange('비고', e.target.value)}
                  className="w-full border-none outline-none text-xs resize-none"
                  rows={3}
                  style={{ minHeight: '60px', height: 'auto' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.max(60, target.scrollHeight) + 'px';
                  }}
                />
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
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(initialData?.id || 0)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                삭제
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              {mode === 'edit' ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}