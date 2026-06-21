//import { Contract } from '../hooks/useContracts';
import { ContractWithCompany } from "../../types/contract";
interface ContractTableProps {
  contracts: ContractWithCompany[];
}

export function ContractTable({ contracts }: ContractTableProps) {
  return (
    <div className="bg-white rounded-lg  overflow-hidden">
      <div className="overflow-x-auto">
        <div className="max-h-[600px] overflow-y-auto scrollbar-hide">
          <table className="w-full">
            <thead className="bg-blue-600 text-white sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left">No.</th>
                <th className="px-6 py-4 text-left">계약번호</th>
                <th className="px-6 py-4 text-left">기업명</th>
                <th className="px-6 py-4 text-left">계약일자</th>
                <th className="px-6 py-4 text-left">계약금액</th>
                <th className="px-6 py-4 text-left">시작일</th>
                <th className="px-6 py-4 text-left">종료일</th>
                <th className="px-6 py-4 text-left">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contracts.map((contract, index) => (
                <tr key={contract.id} className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-blue-600 max-w-[120px] truncate">{contract.계약번호}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-[150px] truncate">{contract.기업명}</td>
                  <td className="px-6 py-4 max-w-[100px] truncate">{contract.계약일}</td>
                  <td className="px-6 py-4 font-semibold max-w-[120px] truncate">{contract.계약금액}</td>
                  <td className="px-6 py-4 max-w-[100px] truncate">{contract.시작일}</td>
                  <td className="px-6 py-4 max-w-[100px] truncate">{contract.종료일}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}