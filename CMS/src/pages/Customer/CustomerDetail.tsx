//고객 상세정보 조회

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCompanyById, deleteCompany } from '../../api/company'; 
import { CustomerContactDetailModal } from './CustomerContactDetailModal';
import { ConsultationDetailModal } from '../Consultation/ConsultationDetailModal';
import { ContractDetailModal } from '../Contract/ContractDetailModal';
import { DeleteConfirmModal } from '../../shared/modals/DeleteConfirmModal';
import { Download } from 'lucide-react';
import React from 'react';
import { formatMonthsOnly } from '../../shared/utils/dateCalculations';
import { useToast } from '../../app/contexts/ToastContext';
import { SERVER_URL } from '../../config';

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

interface ConsultationHistory {
  id: number;
  상담일자: string;
  시작시간: string;
  종료시간: string;
  제목: string;
  고객참석자: string;
  자사참석자: string;
  장소: string;
  작성일: string;
  작성자: string;
  주요상담내용: string;
  상담내용: string;
  조치진행사항: string;
}

interface ContractHistory {
  id: number;
  사업구분: string;
  계약번호: string;
  계약일: string;
  프로젝트명: string;
  사업기간: string;
  개월수?: string;
  계약금액: string;
  MD: string;
  PM: string;
  컨설턴트: string;
  비고: string;
}

export function CustomerDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  
  // 데이터 상태 관리
  const [customer, setCustomer] = useState<any>(null);
  
  // 모달 상태
  const [selectedContact, setSelectedContact] = useState<CustomerContact | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationHistory | null>(null);
  const [selectedContract, setSelectedContract] = useState<ContractHistory | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
  // 날짜 포맷팅 함수 (UTC -> 한국 시간)
  const formatToLocalDate = (dateString: any) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    const handleResize = () => setIsTablet(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // [변경 2] API로 데이터 가져오기 (핵심!)
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // 1. 서버에서 데이터 가져옴 (영어 컬럼명)
        const dbData = await getCompanyById(id);

        // 2. UI에 맞게 한글로 변환 (Mapping)
        const mappedData = {
          // 기본정보
          id: dbData.id,
          고객번호: dbData.customer_code,
          등록일: dbData.reg_date?.split('T')[0] || '-', // 날짜 형식 다듬기
          영업담당자: dbData.manager_name,
          기업명: dbData.name,
          사업자등록번호: dbData.biz_num,
          대표자: dbData.ceo_name,
          휴대전화: dbData.mobile_phone,
          이메일: dbData.email,
          전화번호: dbData.tel,
          팩스번호: dbData.fax,
          지역구분: dbData.region,
          우편번호: dbData.zipcode,
          주소1: dbData.address_main,
          주소2: dbData.address_sub,
          생산제품: dbData.products,
          업종: dbData.industry,
          업태: dbData.biz_status,
          홈페이지: dbData.homepage,
          회사간략소개: dbData.brief_co,
          사업자등록번호_이미지: dbData.biz_num_file || null, 
          회사간략소개_파일: dbData.brief_co_file || null,

          // 3. 하위 테이블 데이터 변환
          매출연도: dbData.salesYears?.map((sale: any) => ({
            id: sale.id,
            year: sale.year,
            amount: sale.amount ? sale.amount.toLocaleString() : '0',
            personnel: sale.personnel
          })) || [],

          고객담당자: dbData.customerContacts?.map((contact: any) => ({
            id: contact.id,
            등록일자: contact.reg_date?.split('T')[0] || '-',
            이름: contact.name,
            부서: contact.department,
            직책: contact.position,
            휴대전화: contact.mobile_phone,
            이메일: contact.email,
            비고: contact.note
          })) || [],

          상담이력: dbData.consultationHistories?.map((consult: any) => ({
            id: consult.id,
           상담일자: formatToLocalDate(consult.consult_date),
            시작시간: consult.start_time,
            종료시간: consult.end_time,
            제목: consult.title,
            고객참석자: consult.attendees_customer,
            자사참석자: consult.attendees_company,
            장소: consult.location,
            작성일: consult.reg_date?.split('T')[0],
            작성자: consult.writer,
            // DB의 3개 컬럼을 합쳐서 보여주거나 따로 보여줄 수 있음
            주요상담내용: consult.content_general, 
            상담내용: consult.content_meeting,
            조치진행사항: consult.content_future
          })) || [],

          계약이력: dbData.contractHistories?.map((contract: any) => {
            const startDate = contract.start_date ? contract.start_date.split('T')[0] : '';
            const endDate = contract.end_date ? contract.end_date.split('T')[0] : '';
            
            // 2. 개월 수 계산 로직
            let monthDuration = '-';
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              // 연도 차이 * 12 + 월 차이 (단순 월 차이 계산)
              const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
              // 필요하다면 +1을 해서 '기간'을 맞출 수도 있습니다. (보통은 단순 차이)
              monthDuration = `${diffMonths}개월`;
            }

            return {
              id: contract.id,
              사업구분: contract.biz_type,
              계약번호: contract.contract_no,
              계약일: contract.contract_date ? contract.contract_date.split('T')[0] : '-', // 계약일도 시간 제거
              프로젝트명: contract.project_name,

              사업기간: `${startDate} ~ ${endDate}`,
              개월수: monthDuration, 
              
              계약금액: contract.amount ? contract.amount.toLocaleString() : '0',
              MD: contract.md, 
              PM: contract.pm,
              컨설턴트: contract.consultant_name,
              비고: contract.note
            };
          }) || []
        };
        
        setCustomer(mappedData);

      } catch (error) {
        console.error("상세 정보 로딩 실패:", error);
        alert("데이터를 불러오지 못했습니다.");
        navigate('/customers');
      }
    };

    fetchData();
  }, [id, navigate]);

  // [변경 3] 삭제 기능 API 연결
  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCompany(id); 
      showToast('고객 정보가 삭제되었습니다.');
      navigate('/customer-status'); 
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (!customer) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

return (
  <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-white">
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <div className="bg-white rounded-lg ">
        <div className="border-b px-6 py-4 flex justify-between items-center ">
          <h2 className="font-bold text-gray-800">고객정보 상세</h2>
        </div>

        <div className="p-6">
          
          {isTablet && (
            <div className="mb-2 flex items-center justify-end gap-2 w-full">
              <button type="button" onClick={() => navigate('/customer-status')} className="px-4 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition-colors font-semibold">목록</button>
              <button type="button" onClick={() => navigate(`/customer-status/${id}/edit`)} className="px-4 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors font-semibold">수정</button>
              <button type="button" onClick={() => setDeleteModalOpen(true)} className="px-4 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors font-semibold">삭제</button>
            </div>
          )}

          {/* 기본 정보 그리드 */}
          <div 
            className="border-l border-b border-gray-300 mb-4 inline-grid overflow-x-hidden w-full" 
            style={{ 
              gridTemplateColumns: isTablet ? '200px 1fr' : '200px 1fr 200px 1fr 200px 1fr'
            }}
          >
            <div className="border-r border-b border-t border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs font-semibold">
              고객번호
            </div>
            <div className="border-r border-b border-t border-gray-300 px-3 py-2 text-sm break-words">
              {customer.고객번호 || '-'}
            </div>
            
            {!isTablet && (
              <div 
                className="border-b border-gray-300 bg-white px-3 py-2 flex items-center justify-end gap-2" 
                style={{ gridColumn: 'span 4' }}
              >
                <button type="button" onClick={() => navigate('/customer-status')} className="px-4 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition-colors font-semibold">목록</button>
                <button type="button" onClick={() => navigate(`/customer-status/${id}/edit`)} className="px-4 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors font-semibold">수정</button>
                <button type="button" onClick={() => setDeleteModalOpen(true)} className="px-4 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors font-semibold">삭제</button>
              </div>
            )}
              
              {/* 등록일 & 영업담당자 */}
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">등록일</div>
              <div className="border-r border-b border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
                <span className="text-sm">{customer.등록일 || '-'}</span>
              </div>
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">영업담당자</div>
              <div className="border-b border-r border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
                <span className="text-sm">{customer.영업담당자 || '-'}</span>
              </div>

              {/* 기업명 & 사업자번호 */}
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">기업명</div>
              <div className="border-r border-b border-gray-300 px-3 py-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
                <span className="text-sm">{customer.기업명 || '-'}</span>
              </div>
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">사업자등록번호</div>
              <div className="border-b border-r border-gray-300 px-3 py-2 flex items-center justify-between gap-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 2' }}>
                <span className="text-sm">{customer.사업자등록번호 || '-'}</span>
                {customer.사업자등록번호_이미지 && (
                  <a href={`${SERVER_URL}/${customer.사업자등록번호_이미지.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500"><Download size={16} /></a>
                )}
              </div>

              {/* 대표자, 휴대전화, 이메일 */}
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">대표자</div>
              <div className="border-r border-b border-gray-300 px-3 py-2"><span className="text-sm">{customer.대표자 || '-'}</span></div>
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">휴대전화</div>
              <div className="border-r border-b border-gray-300 px-3 py-2"><span className="text-sm">{customer.휴대전화 || '-'}</span></div>
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">이메일</div>
              <div className="border-b border-r border-gray-300 px-3 py-2"><span className="text-sm">{customer.이메일 || '-'}</span></div>

              {/* 주소 섹션 */}
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">주소1(본사)</div>
              <div className="border-b border-r border-gray-300 px-3 py-2 break-words" style={{ gridColumn: isTablet ? 'span 1' : 'span 5' }}>
                <span className="text-sm">{customer.주소1 || '-'}</span>
              </div>
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">주소2(공장)</div>
              <div className="border-b border-r border-gray-300 px-3 py-2 break-words" style={{ gridColumn: isTablet ? 'span 1' : 'span 5' }}>
                <span className="text-sm">{customer.주소2 || '-'}</span>
              </div>

              {/* 생산제품, 업종, 업태 */}
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">생산제품</div>
              <div className="border-r border-b border-gray-300 px-3 py-2"><span className="text-sm">{customer.생산제품 || '-'}</span></div>
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">업종</div>
              <div className="border-r border-b border-gray-300 px-3 py-2"><span className="text-sm">{customer.업종 || '-'}</span></div>
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">업태</div>
              <div className="border-b border-r border-gray-300 px-3 py-2"><span className="text-sm">{customer.업태 || '-'}</span></div>

              {/* 매출규모 리스트 */}
              {customer.매출연도 && customer.매출연도.length > 0 ? (
              <>
                {/* '매출규모' 타이틀 칸: 데스크탑/탭 모두 동일하게 유지 */}
                <div 
                  className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center" 
                  style={{ gridRow: `span ${customer.매출연도.length}` }}
                >
                  <span className="text-xs">매출규모</span>
                </div>

                {customer.매출연도.map((sales: any) => (
                  <div key={sales.id} className="contents">
                    {!isTablet ? (
                      /* 1. 데스크탑 버전: 기존 코드 그대로 */
                      <>
                        <div className="border-r border-b border-gray-300 px-3 py-2">
                          <span className="text-sm">{sales.year ? sales.year + '년' : '-'}</span>
                        </div>
                        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">금액</div>
                        <div className="border-r border-b border-gray-300 px-3 py-2" style={{ gridColumn: 'span 1' }}>
                          <span className="text-sm">{sales.amount}원</span>
                        </div>
                        <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">인원</div>
                        <div className="border-b border-r border-gray-300 px-3 py-2" style={{ gridColumn: 'span 1' }}>
                          <span className="text-sm">{sales.personnel ? sales.personnel + '명' : '-'}</span>
                        </div>
                      </>
                    ) : (
                      /* 2. 탭 버전: 데스크탑과 '똑같은 구성'을 한 줄에 배치 */
                      <div className="border-r border-b border-gray-300 flex w-full overflow-x-auto scrollbar-hide">
                        <div className="flex-[1] min-w-[70px] py-2 border-r border-gray-300 flex items-center justify-center">
                          <span className="text-sm">{sales.year ? sales.year + '년' : '-'}</span>
                        </div>
                        <div className="flex-[1] min-w-[60px] py-2 border-r border-gray-300 bg-blue-50 flex items-center justify-center text-xs">
                          금액
                        </div>
                        <div className="flex-[2] min-w-[120px] py-2 border-r border-gray-300 flex items-center justify-center">
                          <span className="text-sm">{sales.amount}원</span>
                        </div>
                        <div className="flex-[1] min-w-[60px] py-2 border-r border-gray-300 bg-blue-50 flex items-center justify-center text-xs">
                          인원
                        </div>

                        <div className="flex-[1] min-w-[70px] py-2 flex items-center justify-center">
                          <span className="text-sm">{sales.personnel ? sales.personnel + '명' : '-'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">매출규모</div>
                <div className="border-r border-b border-gray-300 px-3 py-2 text-sm" style={{ gridColumn: isTablet ? 'span 1' : 'span 5' }}>-</div>
              </>
            )}

              {/* 홈페이지 */}
              <div className="border-r border-b border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">홈페이지</div>
              <div className="border-b border-r border-gray-300 px-3 py-2 break-words" style={{ gridColumn: isTablet ? 'span 1' : 'span 5' }}>
                <span className="text-sm break-all">{customer.홈페이지 || '-'}</span>
              </div>

              {/* 회사소개 */}
              <div className="border-r border-gray-300 bg-blue-50 px-3 py-2 flex items-center justify-center text-xs">회사간략소개</div>
              <div className="border-r border-gray-300 px-3 py-2 flex items-center justify-between gap-2" style={{ gridColumn: isTablet ? 'span 1' : 'span 5' }}>
                <span className="text-sm break-all flex-1">{customer.회사간략소개 || '-'}</span>
                {customer.회사간략소개_파일 && (
                  <a href={`${SERVER_URL}/${customer.회사간략소개_파일.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500"><Download size={16} /></a>
                )}
              </div>
            </div>

            {/* 고객담당자 (매핑된 customer.고객담당자 사용) */}
            <div className="border border-gray-300 mb-4">
              <div className="bg-blue-50 px-3 py-2 border-b border-gray-300">
                <span className="font-semibold text-xs text-gray-700">고객담당자</span>
              </div>
              
              {customer.고객담당자.length > 0 ? (
                /* [수정] overflow-x-auto 추가하여 가로 스크롤 허용 */
                <div className="max-h-[250px] overflow-y-auto overflow-x-auto scrollbar-hide">
                  {/* [수정] min-w-[900px] 추가하여 테이블 형태 보존 */}
                  <table className="w-full table-fixed min-w-[900px]" style={{ borderCollapse: 'collapse' }}>
                    <colgroup>
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '16%' }} />
                    </colgroup>
                    <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f5f7ff' }}>
                      <tr className="border-b border-gray-300">
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">순번</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">등록일자</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">이름</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">부서</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">직책</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">휴대전화</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">이메일</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.고객담당자.map((contact: any, index: number) => (
                        <tr 
                          key={contact.id} 
                          className="border-b border-gray-300 hover:bg-blue-50 cursor-pointer transition bg-white"
                          onClick={() => setSelectedContact(contact)}
                        >
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{index + 1}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contact.등록일자}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600 ">{contact.이름}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contact.부서}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contact.직책}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contact.휴대전화}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contact.이메일}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600 truncate" title={contact.비고}>{contact.비고}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">등록된 담당자가 없습니다.</div>
              )}
            </div>

            {/* 상담이력 */}
            <div className="border border-gray-300 mb-4">
              <div className="bg-blue-50 px-3 py-2 border-b border-gray-300">
                <span className="font-semibold text-xs text-gray-700">상담이력</span>
              </div>
              {customer.상담이력.length > 0 ? (
                /* [수정] overflow-x-auto 추가 */
                <div className="max-h-[250px] overflow-y-auto overflow-x-auto scrollbar-hide">
                  {/* [수정] min-w-[800px] 추가 */}
                  <table className="w-full border-collapse table-fixed min-w-[800px]">
                    <colgroup>
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '47%' }} />
                    </colgroup>
                    <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f5f7ff' }}>
                      <tr className="border-b border-gray-300">
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">순번</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">상담일자</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">고객참석자</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">자사참석자</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">상담내용</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.상담이력.map((history: any, index: number) => (
                        <tr 
                          key={history.id} 
                          className="border-b border-gray-300 hover:bg-blue-50 cursor-pointer transition bg-white"
                          onClick={() => setSelectedConsultation(history)}
                        >
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{index + 1}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{history.상담일자 ? String(history.상담일자).split('T')[0] : '-'}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{history.고객참석자}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{history.자사참석자}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{history.상담내용 || history.주요상담내용}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">등록된 상담이력이 없습니다.</div>
              )}
            </div>

            {/* 계약이력 */}
            <div className="border border-gray-300 mb-6">
              <div className="bg-blue-50 px-3 py-2 border-b border-gray-300">
                <span className="font-semibold text-xs text-gray-700">계약이력</span>
              </div>
              {customer.계약이력.length > 0 ? (
                /* [수정] overflow-x-auto 추가 */
                <div className="max-h-[250px] overflow-y-auto overflow-x-auto scrollbar-hide">
                  {/* [수정] min-w-[1100px] 추가 (계약은 컬럼이 많으므로 더 넓게 설정) */}
                  <table className="w-full border-collapse table-fixed min-w-[1100px]">
                    <colgroup>
                      <col style={{ width: '5%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f5f7ff' }}>
                      <tr className="border-b border-gray-300">
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">순번</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">사업구분</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">계약번호</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">계약일</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">프로젝트 명</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">사업기간</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">계약금액</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">MD</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">PM</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">컨설턴트</th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-600">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.계약이력.map((contract: any, index: number) => (
                        <tr 
                          key={contract.id} 
                          className="border-b border-gray-300 hover:bg-blue-50 cursor-pointer transition bg-white"
                          onClick={() => setSelectedContract(contract)}
                        >
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{index + 1}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contract.사업구분}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contract.계약번호}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contract.계약일}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600  truncate">{contract.프로젝트명}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contract.개월수}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600 ">{contract.계약금액}원</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contract.MD}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contract.PM}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600">{contract.컨설턴트}</td>
                           <td className="px-3 py-2 text-center text-xs text-gray-600 truncate">{contract.비고}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">등록된 계약이력이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 보기 모달들 */}
      <CustomerContactDetailModal 
        isOpen={selectedContact !== null}
        onClose={() => setSelectedContact(null)}
        data={selectedContact}
      />
      
      <ConsultationDetailModal 
        isOpen={selectedConsultation !== null}
        onClose={() => setSelectedConsultation(null)}
        consultation={selectedConsultation}
        기업명={customer?.기업명 || ''}
        지역구분={customer?.지역구분 || ''}
      />
      
      <ContractDetailModal 
        isOpen={selectedContract !== null}
        onClose={() => setSelectedContract(null)}
        data={selectedContract}
      />

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete} // [변경] 새로 만든 API 삭제 함수 연결
        customerNumber={customer?.고객번호 || ''}
      />
    </div>
  );
}