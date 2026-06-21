import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getRegionColor, getBusinessTypeColor } from '../../shared/utils/colorMapping';

// [필수] API 함수들 임포트
import { getCompanies } from '../../api/company';           // 1단계에서 만든 것
import { getAllConsultations } from '../../api/consultation'; // 상담현황 때 만든 것
import { getAllContracts } from '../../api/contract';       // 계약현황 때 만든 것
import { getAllManagers } from '../../api/manager';         

export function Home() {
  const navigate = useNavigate();

  // [변경] DB 데이터를 저장할 State
  const [stats, setStats] = useState({
    companies: [] as any[],
    consultations: [] as any[],
    contracts: [] as any[],
    managers: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // Promise.all로 병렬 요청 (속도 최적화)
        const [companiesData, consultationsData, contractsData, managersData] = await Promise.all([
          getCompanies(),
          getAllConsultations(),
          getAllContracts(),
          getAllManagers()
        ]);

        // 1. 회사 데이터 매핑
        const mappedCompanies = companiesData.map((item: any) => ({
          id: item.id,
          기업명: item.name,
          등록일: item.reg_date ? String(item.reg_date).split('T')[0] : '-',
          지역구분: item.region || '-',
          업종: item.industry || '-'
        }));

        // 2. 상담 데이터 매핑
        const mappedConsultations = consultationsData.map((item: any) => ({
          id: item.id,
          customerId: item.company_id,
          기업명: item.company_name || '(삭제된 회사)',
          제목: item.title,
          작성자: item.writer,
          작성일: item.reg_date || '' 
        }));

        // 3. 계약 데이터 매핑 (기간 계산 포함)
        const mappedContracts = contractsData.map((item: any) => {
          // 기간 계산
          let durationDisplay = '-';
          if (item.start_date && item.end_date) {
            const start = new Date(item.start_date);
            const end = new Date(item.end_date);
            const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            durationDisplay = `${diffMonths}개월`;
          }

          return {
            id: item.id,
            customerId: item.company_id,
            기업명: item.company_name || '(삭제된 회사)',
            사업구분: item.biz_type,
            프로젝트명: item.project_name,
            계약일: item.contract_date || '', // 정렬용
            사업기간: durationDisplay,
            계약금액: item.amount ? Number(item.amount).toLocaleString() : '0'
          };
        });

        // 4. 담당자 데이터 매핑
        const mappedManagers = managersData.map((item: any) => ({
          id: item.id,
          customerId: item.company_id,
          기업명: item.company_name || '(삭제된 회사)',
          이름: item.name,
          부서: item.department,
          직책: item.position,
          휴대전화: item.mobile_phone,
          이메일: item.email
        }));

        setStats({
          companies: mappedCompanies,
          consultations: mappedConsultations,
          contracts: mappedContracts,
          managers: mappedManagers
        });

      } catch (error) {
        console.error("대시보드 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // --- 정렬 및 자르기 (최신 10개) ---

  // 1. 최근 회사 (ID 역순 = 최신 등록순)
  const recentCompanies = [...stats.companies]
    .sort((a, b) => b.id - a.id)
    .slice(0, 10);

  // 2. 최근 상담 (작성일 내림차순)
  const recentConsultations = [...stats.consultations]
    .sort((a, b) => new Date(b.작성일).getTime() - new Date(a.작성일).getTime())
    .slice(0, 10);

  // 3. 최근 계약 (id역순 = 최신순)
  const recentContracts = [...stats.contracts]
  .sort((a, b) => b.id - a.id) 
  .slice(0, 10);

  // 4. 최근 담당자 (ID 역순 = 최신순)
  const recentContacts = [...stats.managers]
    .sort((a, b) => b.id - a.id)
    .slice(0, 10);


  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-80px)]">데이터를 불러오는 중입니다...</div>;
  }

return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        
        {/* 통계 카드 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {/* 총 고객사 */}
          <div className="bg-white rounded-lg shadow-md p-[22px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-semibold">총 고객사</p>
                <p className="text-3xl font-bold text-blue-600">{stats.companies.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 상담 건수 */}
          <div className="bg-white rounded-lg shadow-md p-[22px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-semibold">상담 건수</p>
                <p className="text-3xl font-bold text-green-600">{stats.consultations.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 총 계약 */}
          <div className="bg-white rounded-lg shadow-md p-[22px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-semibold">총 계약</p>
                <p className="text-3xl font-bold text-purple-600">{stats.contracts.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 총 고객 담당자 */}
          <div className="bg-white rounded-lg shadow-md p-[22px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-semibold">총 고객 담당자</p>
                <p className="text-3xl font-bold text-orange-600">{stats.managers.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 리스트 영역 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          <div className="space-y-6">
            
            {/* 최근 등록한 회사 리스트 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 flex justify-between items-center border-b-2 border-blue-600">
                <h2 className="text-lg font-bold text-blue-600">최근 등록한 회사</h2>
                <Link to="/customer-status" className="text-sm text-blue-600 hover:text-blue-800 transition font-medium">전체보기 →</Link>
              </div>
              
              <div className="h-[275px] overflow-y-auto overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">등록일</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">기업명</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">지역구분</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">업종</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentCompanies.map((company, index) => (
                      <tr 
                        key={company.id} 
                        className={`hover:bg-blue-50 transition cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        onClick={() => navigate(`/customer-status?highlight=${company.id}`)}
                      >
                        <td className="px-1 py-2 text-xs text-gray-600 text-center max-w-0 truncate">{company.등록일}</td>
                        <td className="px-1 py-2 text-xs text-gray-900 text-center max-w-0 truncate">{company.기업명}</td>
                        <td className="px-1 py-2 text-center max-w-0 truncate">
                          <span className="px-2 py-1 rounded text-xs font-semibold inline-block whitespace-nowrap" style={{ backgroundColor: `${getRegionColor(company.지역구분)}20`, color: getRegionColor(company.지역구분) }}>
                            {company.지역구분}
                          </span>
                        </td>
                        <td className="px-1 py-2 text-xs text-gray-600 text-center max-w-0 truncate">{company.업종}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 최근 등록한 상담 리스트 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 flex justify-between items-center border-b-2 border-blue-600">
                <h2 className="text-lg font-bold text-blue-600">최근 등록한 상담</h2>
                <Link to="/consultation-history" className="text-sm text-blue-600 hover:text-blue-800 transition font-medium">전체보기 →</Link>
              </div>
              <div className="h-[275px] overflow-y-auto overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[500px] table-fixed">
                  <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[30%]" />
                    <col className="w-[30%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">작성일</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">기업명</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">제목</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">작성자</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentConsultations.map((consultation, index) => (
                      <tr 
                        key={consultation.id} 
                        className={`hover:bg-blue-50 transition cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        onClick={() => navigate(`/consultation-history?highlightCustomerId=${consultation.customerId}&highlightConsultationId=${consultation.id}`)}
                      >
                        <td className="px-1 py-3 text-xs text-gray-600 text-center max-w-0 truncate">
                          {consultation.작성일 ? String(consultation.작성일).split('T')[0] : '-'}
                        </td>
                        <td className="px-1 py-3 text-xs text-gray-900 text-center max-w-0 truncate">{consultation.기업명}</td>
                        <td className="px-1 py-3 text-xs text-gray-600 text-center max-w-0 truncate">{consultation.제목}</td>
                        <td className="px-1 py-3 text-xs text-gray-600 text-center max-w-0 truncate">{consultation.작성자}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* 최근 등록한 담당자 리스트 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 flex justify-between items-center border-b-2 border-blue-600">
                <h2 className="text-lg font-bold text-blue-600">등록된 고객 담당자</h2>
                <Link to="/manager-status" className="text-sm text-blue-600 hover:text-blue-800 transition font-medium">전체보기 →</Link>
              </div>
              <div className="h-[275px] overflow-y-auto overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[600px] table-fixed">
                  <colgroup>
                    <col className="w-[22%]" /> 
                    <col className="w-[16%]" /> 
                    <col className="w-[12%]" /> 
                    <col className="w-[12%]" /> 
                    <col className="w-[18%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="pl-4 pr-1 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">기업명</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">담당자</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">부서</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">직책</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">번호</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">메일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentContacts.map((contact, index) => (
                      <tr 
                        key={contact.id} 
                        className={`hover:bg-blue-50 transition cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        onClick={() => navigate(`/manager-status?highlightCustomerId=${contact.customerId}&highlightContactId=${contact.id}`)}
                      >
                        <td className="pl-4 pr-1 py-3 text-xs text-gray-900 text-left max-w-0 truncate">{contact.기업명}</td>
                        <td className="px-1 py-3 text-xs text-gray-900 text-center max-w-0 truncate">{contact.이름}</td>
                        <td className="px-1 py-3 text-xs text-gray-600 text-center max-w-0 truncate">{contact.부서 || '-'}</td>
                        <td className="px-1 py-3 text-xs text-gray-600 text-center max-w-0 truncate">{contact.직책 || '-'}</td>
                        <td className="px-1 py-3 text-xs text-gray-600 text-center max-w-0 truncate">{contact.휴대전화 || '-'}</td>
                        <td className="px-1 py-3 text-xs text-gray-600 text-center max-w-0 truncate">{contact.이메일 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 최근 등록한 계약 리스트 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 flex justify-between items-center border-b-2 border-blue-600">
                <h2 className="text-lg font-bold text-blue-600">최근 등록한 계약</h2>
                <Link to="/contract-history" className="text-sm text-blue-600 hover:text-blue-800 transition font-medium">전체보기 →</Link>
              </div>
              <div className="h-[275px] overflow-y-auto overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[600px] table-fixed">
                  <colgroup>
                    <col className="w-[12%]" />
                    <col className="w-[25%]" />
                    <col className="w-[25%]" />
                    <col className="w-[15%]" />
                    <col className="w-[23%]" />
                  </colgroup>
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">사업구분</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">기업명</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">프로젝트명</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">사업기간</th>
                      <th className="px-1 py-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentContracts.map((contract, index) => (
                      <tr 
                        key={contract.id} 
                        className={`hover:bg-blue-50 transition cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        onClick={() => navigate(`/contract-history?highlightCustomerId=${contract.customerId}&highlightContractId=${contract.id}`)}
                      >
                        <td className="px-1 py-2 text-center">
                          <span className="px-2 py-1 rounded text-xs inline-block whitespace-nowrap" style={{ backgroundColor: `${getBusinessTypeColor(contract.사업구분)}20`, color: getBusinessTypeColor(contract.사업구분) }}>
                            {contract.사업구분}
                          </span>
                        </td>
                        <td className="px-1 py-2 text-xs text-gray-900 text-center max-w-0 truncate">{contract.기업명}</td>
                        <td className="px-1 py-2 text-xs text-gray-600 text-center max-w-0 truncate">{contract.프로젝트명}</td>
                        <td className="px-1 py-2 text-xs text-gray-600 text-center max-w-0 truncate ">{contract.사업기간}</td>
                        <td className="px-1 py-2 text-xs text-gray-900 text-center max-w-0 truncate">{contract.계약금액}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}