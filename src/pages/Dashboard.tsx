import React from 'react';
import { useStore } from '../store';
import { ArrowUp } from 'lucide-react';

export default function Dashboard() {
  const { invoiceHistories, profitSheets, exchangeRate } = useStore();

  const totalRevenue = profitSheets.reduce((sum, sheet) => sum + sheet.revenue, 0);
  const totalProfit = profitSheets.reduce((sum, sheet) => sum + sheet.profit, 0);
  const activeContracts = profitSheets.length;

  const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatKrw = (num: number) => Math.floor(num).toLocaleString('ko-KR');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <h3 className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider relative z-10">금월 총 매출</h3>
          <div className="flex flex-col relative z-10">
            <span className="text-4xl font-black text-slate-800 tracking-tight mb-1">${formatNum(totalRevenue)}</span>
            <span className="text-sm text-slate-400 font-medium">환산: ₩{formatKrw(totalRevenue * exchangeRate)}</span>
          </div>
          <p className="text-emerald-500 text-sm mt-4 font-bold flex items-center relative z-10"><ArrowUp size={16} className="mr-1"/>12% 지난달 대비</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <h3 className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider relative z-10">진행 중인 프로젝트</h3>
          <div className="flex flex-col h-[52px] justify-center relative z-10">
            <span className="text-4xl font-black text-slate-800 tracking-tight">{activeContracts}건</span>
          </div>
          <p className="text-indigo-500 text-sm mt-4 font-bold relative z-10">3건 납품 대기 중</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <h3 className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider relative z-10">이번 달 누적 영업이익</h3>
          <div className="flex flex-col relative z-10">
            <span className="text-4xl font-black text-slate-800 tracking-tight mb-1">${formatNum(totalProfit)}</span>
            <span className="text-sm text-slate-400 font-medium">환산: ₩{formatKrw(totalProfit * exchangeRate)}</span>
          </div>
          <p className="text-emerald-500 text-sm mt-4 font-bold flex items-center relative z-10"><ArrowUp size={16} className="mr-1"/>8.5% 지난달 대비</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">최근 영업이익 산출 내역</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-xl">프로젝트명</th>
                <th className="px-6 py-4 font-semibold">고객사</th>
                <th className="px-6 py-4 font-semibold text-right">매출액($)</th>
                <th className="px-6 py-4 font-semibold text-right text-emerald-600">영업이익($)</th>
                <th className="px-6 py-4 font-semibold rounded-tr-xl">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profitSheets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">활동 내역이 없습니다.</td>
                </tr>
              ) : (
                profitSheets.slice(0, 5).map((sheet, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5 font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{sheet.invoiceNo}</td>
                    <td className="px-6 py-5 font-medium">{sheet.customerName}</td>
                    <td className="px-6 py-5 text-right font-medium text-blue-700">${formatNum(sheet.revenue)}</td>
                    <td className="px-6 py-5 text-right font-bold text-emerald-600">${formatNum(sheet.profit)}</td>
                    <td className="px-6 py-5 text-slate-500 font-medium">{sheet.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
