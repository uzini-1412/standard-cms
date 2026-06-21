interface ContactInfoSectionProps {
  formData: {
    대표자: string;
    휴대전화: string;
    이메일: string;
    전화번호: string;
    팩스번호: string;
  };
  emailError: string;
  onRepresentativeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onLandlineChange: (value: string) => void;
  onFaxChange: (value: string) => void;
}

export function ContactInfoSection({
  formData,
  emailError,
  onRepresentativeChange,
  onPhoneChange,
  onEmailChange,
  onLandlineChange,
  onFaxChange,
}: ContactInfoSectionProps) {
  return (
    <>
      {/* 대표자, 휴대전화, 이메일 */}
      <div className="grid border-b border-gray-300" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <div className="col-span-2 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">대표자</span>
        </div>
        <div className="col-span-2 border-r border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.대표자}
            onChange={(e) => onRepresentativeChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
          />
        </div>
        <div className="col-span-2 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">휴대전화</span>
        </div>
        <div className="col-span-2 border-r border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.휴대전화}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
            placeholder="010-0000-0000"
          />
        </div>
        <div className="col-span-2 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">이메일</span>
        </div>
        <div className="col-span-2 px-3 py-2">
          <input
            type="email"
            value={formData.이메일}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
            placeholder="example@company.com"
          />
          {emailError && <span className="text-red-500 text-xs">{emailError}</span>}
        </div>
      </div>

      {/* 전화번호, 팩스번호 */}
      <div className="grid border-b border-gray-300" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <div className="col-span-3 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">전화번호</span>
        </div>
        <div className="col-span-3 border-r border-gray-300 px-3 py-2">
          <input
            type="text"
            value={formData.전화번호}
            onChange={(e) => onLandlineChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
            placeholder="02-0000-0000"
          />
        </div>
        <div className="col-span-3 border-r border-gray-300 bg-blue-50 px-3 py-2">
          <span className="text-xs">팩스번호</span>
        </div>
        <div className="col-span-3 px-3 py-2">
          <input
            type="text"
            value={formData.팩스번호}
            onChange={(e) => onFaxChange(e.target.value)}
            className="w-full border-none outline-none text-sm"
            placeholder="지역번호-xxxx-xxxx"
          />
        </div>
      </div>
    </>
  );
}
