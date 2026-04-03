import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit, Trash2, X, Save, RefreshCw } from 'lucide-react';
import { OutsourceEstimate, ProfitSheet } from '../types';

export default function Finance() {
  const { 
    invoiceHistories, suppliers, outsourceEstimates, setOutsourceEstimates, 
    profitSheets, setProfitSheets, exchangeRate 
  } = useStore();

  const [isOutsourceModalOpen, setIsOutsourceModalOpen] = useState(false);
  const [editingOutsource, setEditingOutsource] = useState<OutsourceEstimate | null>(null);

  const [loadedInvoiceNo, setLoadedInvoiceNo] = useState('');
  const [simRevenue, setSimRevenue] = useState(0);
  const [simCost, setSimCost] = useState(0);
  const [simLogistics, setSimLogistics] = useState(0);
  const [editingProfitSheetId, setEditingProfitSheetId] = useState<number | null>(null);

  const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatKrw = (num: number) => Math.floor(num).toLocaleString('ko-KR');

  const simProfit = simRevenue - simCost - simLogistics;
  const simMargin = simRevenue > 0 ? ((simProfit / simRevenue) * 100).toFixed(1) : '0.0';

  // Outsource Modal Handlers
  const handleOutsourceSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEst: OutsourceEstimate = {
      id: editingOutsource ? editingOutsource.id : Date.now(),
      invoiceNo: formData.get('invoiceNo') as string,
      supplier: formData.get('supplier') as string,
      details: formData.get('details') as string,
      costUsd: Number(formData.get('costUsd')),
    };

    if (editingOutsource) setOutsourceEstimates(outsourceEstimates.map(o => o.id === newEst.id ? newEst : o));
    else setOutsourceEstimates([...outsourceEstimates, newEst]);
    setIsOutsourceModalOpen(false);
  };

  const openOutsourceModal = (est?: OutsourceEstimate) => {
    setEditingOutsource(est || null);
    setIsOutsourceModalOpen(true);
  };

  const deleteOutsource = (id: number) => {
    setOutsourceEstimates(outsourceEstimates.filter(o => o.id !== id));
  };

  // Simulator Handlers
  const loadEstimate = (invoiceNo: string) => {
    setLoadedInvoiceNo(invoiceNo);
    setEditingProfitSheetId(null);
    if (!invoiceNo) {
      setSimRevenue(0);
      setSimCost(0);
      setSimLogistics(0);
      return;
    }
    const inv = invoiceHistories.find(h => h.invoiceNo === invoiceNo);
    if (inv) {
      setSimRevenue(inv.totalUsd);
      const relatedOutsource = outsourceEstimates.filter(o => o.invoiceNo === invoiceNo).reduce((sum, o) => sum + o.costUsd, 0);
      setSimCost(relatedOutsource > 0 ? relatedOutsource : inv.totalUsd * 0.45); // Dummy cost if none
      setSimLogistics(0);
    }
  };

  const editProfitSheet = (sheet: ProfitSheet) => {
    setLoadedInvoiceNo(sheet.invoiceNo);
    setSimRevenue(sheet.revenue);
    setSimCost(sheet.cost);
    setSimLogistics(sheet.logistics);
    setEditingProfitSheetId(sheet.id);
  };

  const saveProfitSheet = () => {
    if (!loadedInvoiceNo) {
      console.warn('견적서를 불러온 후 저장할 수 있습니다.');
      return;
    }
    const inv = invoiceHistories.find(h => h.invoiceNo === loadedInvoiceNo);
    
    const newSheet: ProfitSheet = {
      id: editingProfitSheetId || Date.now(),
      invoiceNo: loadedInvoiceNo,
      customerName: inv?.customerName || '알 수 없음',
      revenue: simRevenue,
      cost: simCost,
      logistics: simLogistics,
      profit: simProfit,
      margin: simMargin + '%',
      date: new Date().toLocaleString()
    };
    
    if (editingProfitSheetId) {
      setProfitSheets(profitSheets.map(p => p.id === editingProfitSheetId ? newSheet : p));
      setEditingProfitSheetId(null);
    } else {
      setProfitSheets([newSheet, ...profitSheets]);
    }
  };

  const deleteProfitSheet = (id: number) => {
    setProfitSheets(profitSheets.filter(p => p.id !== id));
    if (editingProfitSheetId === id) {
      setEditingProfitSheetId(null);
      setLoadedInvoiceNo('');
      setSimRevenue(0);
      setSimCost(0);
      setSimLogistics(0);
    }
  };

  return (
    <div className="space-y-8">
      {/* Outsourcing Estimates */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800">외주업체 견적(원가) 관리</h3>
          <button onClick={() => openOutsourceModal()} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            <Plus size={16} className="mr-1" /> 새 외주 견적 등록
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">프로젝트/견적서 연동</th>
                <th className="px-4 py-3">외주업체 (협력사)</th>
                <th className="px-4 py-3">품목 내용</th>
                <th className="px-4 py-3 text-right">총 외주 견적가($)</th>
                <th className="px-4 py-3 text-center w-24">관리</th>
              </tr>
            </thead>
            <tbody>
              {outsourceEstimates.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">등록된 외주 견적이 없습니다.</td></tr>
              ) : (
                outsourceEstimates.map(est => (
                  <tr key={est.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{est.invoiceNo || '미연결'}</td>
                    <td className="px-4 py-3 text-indigo-700 font-semibold">{est.supplier}</td>
                    <td className="px-4 py-3">{est.details}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">${formatNum(est.costUsd)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openOutsourceModal(est)} className="text-blue-500 hover:text-blue-700 transition p-1"><Edit size={16}/></button>
                      <button onClick={() => deleteOutsource(est.id)} className="text-rose-500 hover:text-rose-700 transition p-1"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-800">프로젝트 단일 영업이익</h3>
              <p className="text-xs text-slate-500">견적가(매출) 및 외주원가 연결</p>
            </div>
            <select 
              className="border border-slate-300 rounded-lg p-2 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={loadedInvoiceNo}
              onChange={(e) => loadEstimate(e.target.value)}
            >
              <option value="">-- 발행된 견적서 불러오기 --</option>
              {invoiceHistories.map(h => <option key={h.invoiceNo} value={h.invoiceNo}>{h.invoiceNo} ({h.customerName})</option>)}
            </select>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-slate-700 font-bold">1. 총 매출액 (견적가)</span>
              <div className="flex flex-col items-end">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
                  <span className="text-slate-400 ml-2 font-medium">$</span>
                  <input type="number" className="bg-transparent p-2 text-right font-bold text-blue-700 outline-none w-36" value={simRevenue} onChange={e => setSimRevenue(Number(e.target.value))} />
                </div>
                <span className="text-xs text-slate-400 mt-1">₩{formatKrw(simRevenue * exchangeRate)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-rose-50/30 p-4 rounded-xl border border-rose-100 shadow-sm">
              <span className="text-slate-600 font-medium">2. 제품 생산 원가 <span className="text-rose-500 font-bold">(-)</span></span>
              <div className="flex flex-col items-end">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
                  <span className="text-slate-400 ml-2 font-medium">$</span>
                  <input type="number" className="bg-transparent p-2 text-right outline-none w-36 text-slate-700 font-medium" value={simCost} onChange={e => setSimCost(Number(e.target.value))} />
                </div>
                <span className="text-xs text-slate-400 mt-1">₩{formatKrw(simCost * exchangeRate)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-rose-50/30 p-4 rounded-xl border border-rose-100 shadow-sm">
              <span className="text-slate-600 font-medium">3. 총 물류/통관비 <span className="text-rose-500 font-bold">(-)</span></span>
              <div className="flex flex-col items-end">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
                  <span className="text-slate-400 ml-2 font-medium">$</span>
                  <input type="number" className="bg-transparent p-2 text-right outline-none w-36 text-slate-700 font-medium" value={simLogistics} onChange={e => setSimLogistics(Number(e.target.value))} />
                </div>
                <span className="text-xs text-slate-400 mt-1">₩{formatKrw(simLogistics * exchangeRate)}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="flex justify-between items-end mb-3">
                <span className="text-lg font-bold text-slate-800">최종 영업이익</span>
                <div className="text-right">
                  <div className="text-4xl font-black text-emerald-600 tracking-tight">${formatNum(simProfit)}</div>
                  <div className="text-sm font-semibold text-slate-500 mt-1">₩{formatKrw(simProfit * exchangeRate)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 p-4 rounded-xl font-bold border border-emerald-200/50 shadow-sm mt-5">
                <span>최종 예상 이익률 (Margin)</span>
                <span className="text-2xl">{simMargin}%</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={saveProfitSheet} className="flex items-center justify-center bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition w-full">
                <Save size={16} className="mr-2" /> {editingProfitSheetId ? '수정된 영업이익 산출표 저장하기' : '조회된 단일 영업이익 저장하기'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-700 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-8 border-b border-slate-600 pb-4">기업 재무 요약 대시보드 (2026)</h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-300">Q1 (1~3월) 매출 목표 달성률</span>
                  <span className="font-bold text-blue-400">85%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-400 to-cyan-300 h-3 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-300">Q2 (4~6월) 수주 확보율</span>
                  <span className="font-bold text-indigo-400">42%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-400 h-3 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-700/50 rounded-xl border border-slate-600 text-center">
              <p className="text-sm font-semibold text-slate-400 mb-2">올해 누적 매출액</p>
              <p className="text-2xl font-bold text-white tracking-widest">₩455M</p>
            </div>
            <div className="p-6 bg-slate-700/50 rounded-xl border border-slate-600 text-center">
              <p className="text-sm font-semibold text-slate-400 mb-2">연 평균 이익률</p>
              <p className="text-2xl font-bold text-emerald-400">32.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profit History */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">저장된 프로젝트 단일 영업이익 내역</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">저장일시</th>
                <th className="px-4 py-3">연결 견적(프로젝트)</th>
                <th className="px-4 py-3 text-right">총 매출액($)</th>
                <th className="px-4 py-3 text-right">제품 원가($)</th>
                <th className="px-4 py-3 text-right">물류/통관비($)</th>
                <th className="px-4 py-3 text-right text-emerald-600">최종 영업이익($)</th>
                <th className="px-4 py-3 text-right">이익률(%)</th>
                <th className="px-4 py-3 text-center w-24">관리</th>
              </tr>
            </thead>
            <tbody>
              {profitSheets.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">저장된 단일 영업이익 내역이 없습니다.</td></tr>
              ) : (
                profitSheets.map(sheet => (
                  <tr key={sheet.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-xs text-slate-500">{sheet.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{sheet.invoiceNo} <br/><span className="text-xs text-indigo-600">{sheet.customerName}</span></td>
                    <td className="px-4 py-3 text-right text-blue-700 font-semibold">${formatNum(sheet.revenue)}</td>
                    <td className="px-4 py-3 text-right text-rose-500 font-medium">${formatNum(sheet.cost)}</td>
                    <td className="px-4 py-3 text-right text-rose-500 font-medium">${formatNum(sheet.logistics)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-bold">${formatNum(sheet.profit)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-bold"><span className="bg-emerald-50 px-2 py-1 rounded">{sheet.margin}</span></td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button onClick={() => editProfitSheet(sheet)} className="text-blue-500 hover:text-blue-700 transition p-1"><Edit size={16}/></button>
                      <button onClick={() => deleteProfitSheet(sheet.id)} className="text-rose-500 hover:text-rose-700 transition p-1"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOutsourceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingOutsource ? '외주 견적 수정' : '새 외주 견적 등록'}</h3>
              <button onClick={() => setIsOutsourceModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleOutsourceSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">연결될 견적서(매출) 번호</label>
                <select name="invoiceNo" defaultValue={editingOutsource?.invoiceNo} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">-- 해당 견적서 선택 --</option>
                  {invoiceHistories.map(h => <option key={h.invoiceNo} value={h.invoiceNo}>{h.invoiceNo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">수주/외주업체 선택 *</label>
                <select name="supplier" defaultValue={editingOutsource?.supplier} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">-- 협력사 선택 --</option>
                  {suppliers.map(s => <option key={s.id} value={s.company}>{s.company}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">품목 및 내역 요약 *</label>
                <input name="details" defaultValue={editingOutsource?.details} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">외주 원가 총액 ($) *</label>
                <input type="number" step="0.01" name="costUsd" defaultValue={editingOutsource?.costUsd} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsOutsourceModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">취소</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
