import React, { useState } from 'react';
import { useStore } from '../store';
import { ShippingData } from '../types';
import { Plus, Trash2, Save } from 'lucide-react';

export default function Shipping() {
  const { exchangeRate, shippingList, setShippingList, invoiceHistories } = useStore();
  const [selectedId, setSelectedId] = useState<string>('');

  const currentShipping = shippingList.find(s => s.id === selectedId) || null;

  const handleCreate = () => {
    const newId = `ship-${Date.now()}`;
    const newShipping: ShippingData = {
      id: newId,
      invoiceNo: '',
      freight: 0,
      duty: 0,
      clearance: 0,
      inland: 0,
      incoterms: 'fob',
      status: '출고 대기'
    };
    setShippingList([newShipping, ...shippingList]);
    setSelectedId(newId);
  };

  const handleDelete = (id: string) => {
    setShippingList(shippingList.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId('');
  };

  const updateField = (field: keyof ShippingData, value: string | number) => {
    if (!currentShipping) return;
    setShippingList(shippingList.map(s => s.id === currentShipping.id ? { ...s, [field]: value } : s));
  };

  const totalUsd = currentShipping ? currentShipping.freight + currentShipping.duty + currentShipping.clearance + currentShipping.inland : 0;

  const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatKrw = (num: number) => Math.floor(num).toLocaleString('ko-KR');

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-800">물류 및 수출 통관 관리</h3>
          <button onClick={handleCreate} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            <Plus size={16} className="mr-1" /> 새 물류 등록
          </button>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-sm text-slate-600 border-collapse min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">연결 견적서</th>
                <th className="px-4 py-3">무역 조건</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">총 비용($)</th>
                <th className="px-4 py-3 text-center w-24">관리</th>
              </tr>
            </thead>
            <tbody>
              {shippingList.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">등록된 물류 정보가 없습니다.</td></tr>
              ) : (
                shippingList.map(ship => {
                  const total = ship.freight + ship.duty + ship.clearance + ship.inland;
                  return (
                    <tr key={ship.id} className={`border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer ${selectedId === ship.id ? 'bg-blue-50/50' : ''}`} onClick={() => setSelectedId(ship.id)}>
                      <td className="px-4 py-3 font-medium text-slate-800">{ship.invoiceNo || '미연결'}</td>
                      <td className="px-4 py-3 uppercase">{ship.incoterms}</td>
                      <td className="px-4 py-3"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{ship.status}</span></td>
                      <td className="px-4 py-3 text-right font-bold text-slate-700">${formatNum(total)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(ship.id); }} className="text-rose-500 hover:text-rose-700 transition p-1"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {currentShipping && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-slate-200">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">연결 견적서</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={currentShipping.invoiceNo}
                    onChange={(e) => updateField('invoiceNo', e.target.value)}
                  >
                    <option value="">-- 선택 --</option>
                    {invoiceHistories.map(h => <option key={h.invoiceNo} value={h.invoiceNo}>{h.invoiceNo}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">무역 조건 (Incoterms)</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={currentShipping.incoterms}
                    onChange={(e) => updateField('incoterms', e.target.value)}
                  >
                    <option value="fob">FOB (본선인도조건)</option>
                    <option value="cif">CIF (운임보험료포함조건)</option>
                    <option value="ddp">DDP (관세지급인도조건)</option>
                    <option value="exw">EXW (공장인도조건)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">상태 추적</label>
                  <select 
                    className="w-full border border-blue-200 rounded-lg p-2.5 bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700"
                    value={currentShipping.status}
                    onChange={(e) => updateField('status', e.target.value)}
                  >
                    <option>출고 대기</option>
                    <option>내륙 운송 중</option>
                    <option>출항 완료 (On Board)</option>
                    <option>목적항 통관 중</option>
                    <option>납품 완료</option>
                  </select>
                </div>
              </div>

              <h4 className="font-bold text-slate-800 mb-4">상세 물류 비용 입력 (USD $)</h4>
              <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex items-center">
                  <label className="w-2/5 text-sm font-medium text-slate-600">국제 운송비 (Freight)</label>
                  <div className="w-3/5 flex items-center border border-slate-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="pl-3 text-slate-400 font-medium">$</span>
                    <input type="number" className="w-full p-2.5 text-right outline-none bg-transparent font-medium text-slate-800" value={currentShipping.freight} onChange={e => updateField('freight', Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="w-2/5 text-sm font-medium text-slate-600">관세 (Duty & Tax)</label>
                  <div className="w-3/5 flex items-center border border-slate-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="pl-3 text-slate-400 font-medium">$</span>
                    <input type="number" className="w-full p-2.5 text-right outline-none bg-transparent font-medium text-slate-800" value={currentShipping.duty} onChange={e => updateField('duty', Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="w-2/5 text-sm font-medium text-slate-600">수출입 통관 수수료</label>
                  <div className="w-3/5 flex items-center border border-slate-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="pl-3 text-slate-400 font-medium">$</span>
                    <input type="number" className="w-full p-2.5 text-right outline-none bg-transparent font-medium text-slate-800" value={currentShipping.clearance} onChange={e => updateField('clearance', Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="w-2/5 text-sm font-medium text-slate-600">내륙 운송비 (Inland)</label>
                  <div className="w-3/5 flex items-center border border-slate-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="pl-3 text-slate-400 font-medium">$</span>
                    <input type="number" className="w-full p-2.5 text-right outline-none bg-transparent font-medium text-slate-800" value={currentShipping.inland} onChange={e => updateField('inland', Number(e.target.value))} />
                  </div>
                </div>
                <div className="pt-5 mt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800">총 비용 합계</span>
                  <div className="text-right">
                    <div className="font-black text-2xl text-rose-500 tracking-tight">${formatNum(totalUsd)}</div>
                    <div className="text-xs text-slate-500 mt-1">₩{formatKrw(totalUsd * exchangeRate)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 h-full">
                <h4 className="font-bold text-indigo-800 mb-6">배송 정보 요약</h4>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-indigo-200">
                  <div className="relative flex items-center">
                    <div className={`w-10 h-10 rounded-full ${currentShipping.status !== '출고 대기' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'} flex items-center justify-center z-10 shadow`}>1</div>
                    <div className={`ml-4 ${currentShipping.status !== '출고 대기' ? 'bg-white' : 'bg-white/50'} p-4 rounded border border-slate-100 shadow-sm flex-1`}>
                      <div className={`font-bold ${currentShipping.status !== '출고 대기' ? 'text-slate-800' : 'text-slate-400'}`}>공장 출고</div>
                      <div className="text-sm text-slate-600">인천 물류센터</div>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <div className={`w-10 h-10 rounded-full ${currentShipping.status === '출항 완료 (On Board)' || currentShipping.status === '목적항 통관 중' || currentShipping.status === '납품 완료' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'} flex items-center justify-center z-10 shadow`}>2</div>
                    <div className={`ml-4 ${currentShipping.status === '출항 완료 (On Board)' || currentShipping.status === '목적항 통관 중' || currentShipping.status === '납품 완료' ? 'bg-white border-blue-200 ring-1 ring-blue-500/20' : 'bg-white/50 border-slate-100'} p-4 rounded border shadow-sm flex-1`}>
                      <div className={`font-bold ${currentShipping.status === '출항 완료 (On Board)' || currentShipping.status === '목적항 통관 중' || currentShipping.status === '납품 완료' ? 'text-blue-700' : 'text-slate-400'}`}>출항 완료</div>
                      <div className="text-sm text-slate-600">인천항 -&gt; LA항</div>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <div className={`w-10 h-10 rounded-full ${currentShipping.status === '목적항 통관 중' || currentShipping.status === '납품 완료' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'} flex items-center justify-center z-10 shadow`}>3</div>
                    <div className={`ml-4 ${currentShipping.status === '목적항 통관 중' || currentShipping.status === '납품 완료' ? 'bg-white border-emerald-200 ring-1 ring-emerald-500/20' : 'bg-white/50 border-slate-100'} p-4 rounded border shadow-sm flex-1`}>
                      <div className={`font-bold ${currentShipping.status === '목적항 통관 중' || currentShipping.status === '납품 완료' ? 'text-emerald-700' : 'text-slate-400'}`}>도착 및 통관</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
