import React from 'react';
import { useStore } from '../store';
import { Printer } from 'lucide-react';

export default function Contract() {
  const { buyers, exchangeRate, contractData, setContractData } = useStore();
  const { customer, productName, totalUsd, vatType, clause1, clause2, clause3, clause4, clause5, clause6, specialClause } = contractData;

  const updateField = (field: keyof typeof contractData, value: string | number) => {
    setContractData({ ...contractData, [field]: value });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatKrw = (num: number) => Math.floor(num).toLocaleString('ko-KR');

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 print:hidden">
        <h3 className="text-xl font-bold text-slate-800">표준 계약서 작성</h3>
        <div className="flex gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-semibold text-slate-600 whitespace-nowrap">계약자 지정:</label>
            <select 
              className="border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm w-48"
              value={customer}
              onChange={(e) => updateField('customer', e.target.value)}
            >
              {buyers.map(b => <option key={b.id} value={b.company}>{b.company}</option>)}
            </select>
          </div>
          <button onClick={() => handlePrint()} className="flex items-center bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 shadow-sm transition">
            <Printer size={16} className="mr-2" /> PDF 인쇄
          </button>
        </div>
      </div>
      
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-10 pb-4 border-b-2 border-slate-800">물품 공급 계약서</h2>
        
        <p className="mb-6 text-slate-700">
          <strong className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded print:bg-transparent print:text-slate-800">{customer}</strong>(이하 "갑"이라 한다)와 
          <strong> (주)이어진</strong>(이하 "을"이라 한다)는 다음과 같이 물품 공급에 관한 계약을 체결한다.
        </p>

        <table className="w-full mb-8 border border-slate-300 text-sm">
          <tbody>
            <tr>
              <th className="border border-slate-300 bg-slate-50 p-3 w-1/4 text-left align-middle">계약 금액</th>
              <td className="border border-slate-300 p-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center print:hidden">
                  <span className="font-bold text-lg text-slate-800 mr-1">$</span>
                  <input 
                    type="number" 
                    className="font-bold text-lg text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-32 px-1 transition-colors" 
                    value={totalUsd}
                    onChange={(e) => updateField('totalUsd', Number(e.target.value))}
                  />
                </div>
                <div className="hidden print:flex items-center">
                  <span className="font-bold text-lg text-slate-800 mr-1">$</span>
                  <span className="font-bold text-lg text-slate-800 px-1">{formatNum(totalUsd)}</span>
                </div>
                <span className="text-slate-500 text-sm">(₩{formatKrw(totalUsd * exchangeRate)})</span>
                <div className="print:hidden">
                  <select 
                    className="text-xs font-semibold text-rose-500 bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none transition-colors appearance-none cursor-pointer flex-shrink-0"
                    value={vatType}
                    onChange={(e) => updateField('vatType', e.target.value)}
                  >
                    <option value="VAT 포함">VAT 포함</option>
                    <option value="VAT 별도">VAT 별도</option>
                    <option value="영세율">영세율</option>
                  </select>
                </div>
                <div className="hidden print:block text-xs font-semibold text-rose-500">
                  {vatType}
                </div>
              </td>
            </tr>
            <tr>
              <th className="border border-slate-300 bg-slate-50 p-3 text-left align-middle">제품명</th>
              <td className="border border-slate-300 p-3">
                <div className="print:hidden">
                  <input 
                    type="text" 
                    className="font-medium text-blue-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-full px-1 transition-colors" 
                    value={productName}
                    onChange={(e) => updateField('productName', e.target.value)}
                  />
                </div>
                <div className="hidden print:block font-medium text-blue-700 px-1">
                  {productName || '\u00A0'}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="space-y-4 mb-8 text-sm text-slate-700 leading-relaxed">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">제 1 조 [일반 계약조항 및 공급 조건]</h3>
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg print:bg-transparent print:border-none print:p-0 print:mb-4">
            <h4 className="font-bold text-slate-800 mb-2">1. 목적</h4>
            <textarea className="w-full p-3 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y print:hidden" rows={2} value={clause1} onChange={e => updateField('clause1', e.target.value)} />
            <div className="hidden print:block whitespace-pre-wrap">{clause1}</div>
          </div>
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg print:bg-transparent print:border-none print:p-0 print:mb-4">
            <h4 className="font-bold text-slate-800 mb-2">2. 품질 보증 및 오차 범위</h4>
            <textarea className="w-full p-3 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y print:hidden" rows={2} value={clause2} onChange={e => updateField('clause2', e.target.value)} />
            <div className="hidden print:block whitespace-pre-wrap">{clause2}</div>
          </div>
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg print:bg-transparent print:border-none print:p-0 print:mb-4">
            <h4 className="font-bold text-slate-800 mb-2">3. 운송 및 인도 조건</h4>
            <textarea className="w-full p-3 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y print:hidden" rows={2} value={clause3} onChange={e => updateField('clause3', e.target.value)} />
            <div className="hidden print:block whitespace-pre-wrap">{clause3}</div>
          </div>
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg print:bg-transparent print:border-none print:p-0 print:mb-4">
            <h4 className="font-bold text-slate-800 mb-2">4. 납기 지연 및 지체상금</h4>
            <textarea className="w-full p-3 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y print:hidden" rows={2} value={clause4} onChange={e => updateField('clause4', e.target.value)} />
            <div className="hidden print:block whitespace-pre-wrap">{clause4}</div>
          </div>
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg print:bg-transparent print:border-none print:p-0 print:mb-4">
            <h4 className="font-bold text-slate-800 mb-2">5. 대금 결제 조건</h4>
            <textarea className="w-full p-3 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y print:hidden" rows={2} value={clause5} onChange={e => updateField('clause5', e.target.value)} />
            <div className="hidden print:block whitespace-pre-wrap">{clause5}</div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">제 2 조 [제품 세부내용]</h3>
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg print:bg-transparent print:border-none print:p-0">
            <textarea className="w-full p-3 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y print:hidden" rows={4} value={clause6} onChange={e => updateField('clause6', e.target.value)} />
            <div className="hidden print:block whitespace-pre-wrap">{clause6}</div>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">제 3 조 [특약조항]</h3>
          <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-lg print:bg-transparent print:border-none print:p-0">
            <textarea className="w-full p-3 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y print:hidden" rows={3} value={specialClause} onChange={e => updateField('specialClause', e.target.value)} />
            <div className="hidden print:block whitespace-pre-wrap">{specialClause}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-300">
          <div>
            <p className="font-bold mb-4 text-slate-800">"갑" (구매자)</p>
            <p className="text-sm mb-1 text-slate-700">상호: <span className="font-medium">{customer}</span></p>
            <p className="text-sm mb-6 text-slate-700">주소: 서울시 서초구 헌릉로 12</p>
            <div className="h-16 border-b border-slate-400 relative">
              <span className="absolute bottom-2 left-0 text-sm text-slate-500">서명 (인)</span>
            </div>
          </div>
          <div>
            <p className="font-bold mb-4 text-slate-800">"을" (공급자)</p>
            <p className="text-sm mb-1 text-slate-700">상호: (주)이어진</p>
            <p className="text-sm mb-6 text-slate-700">주소: 서울시 강남구 테헤란로 123</p>
            <div className="h-16 border-b border-slate-400 relative">
              <span className="absolute bottom-2 left-0 text-sm text-slate-500">서명 (인)</span>
              <div className="absolute bottom-0 right-4 w-12 h-12 border-2 border-red-500 text-red-500 rounded-full flex items-center justify-center text-xs font-bold transform -rotate-12 opacity-80">
                이어진<br/>인(印)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
