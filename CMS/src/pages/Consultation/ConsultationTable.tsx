//import { Consultation } from '../hooks/useConsultations';
import { ConsultationWithCompany } from "../../types/consultation";
interface ConsultationTableProps {
  consultations: ConsultationWithCompany[];
}

export function ConsultationTable({ consultations }: ConsultationTableProps) {
  return (
    <div className="bg-white rounded-lg  overflow-hidden">
      <div className="overflow-x-auto">
        <div className="max-h-[600px] overflow-y-auto scrollbar-hide">
          <table className="w-full">
            <thead className="bg-blue-600 text-white sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left">No.</th>
                <th className="px-6 py-4 text-left">기업명</th>
                <th className="px-6 py-4 text-left">작성자</th>
                <th className="px-6 py-4 text-left">상담일자</th>
                <th className="px-6 py-4 text-left">상담내용</th>
                <th className="px-6 py-4 text-left">상담결과</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {consultations.map((consultation, index) => (
                <tr key={consultation.id} className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-[150px] truncate">{consultation.기업명}</td>
                  <td className="px-6 py-4 max-w-[100px] truncate">{consultation.작성자}</td>
                  <td className="px-6 py-4 max-w-[100px] truncate">{consultation.상담일자}</td>
                  <td className="px-6 py-4 max-w-[300px] truncate">{consultation.상담내용}</td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}