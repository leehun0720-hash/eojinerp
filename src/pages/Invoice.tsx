import React, { useState } from 'react';
import { useStore } from '../store';
import { Printer, Save, Plus, Trash2, Edit2 } from 'lucide-react';
import { InvoiceItem, InvoiceHistory } from '../types';

export default function Invoice() {
  const { buyers, products, materials, exchangeRate, invoiceHistories, setInvoiceHistories } = useStore();
  
  const [invoiceCustomer, setInvoiceCustomer] = useState(buyers[0]?.company || '');
  const [isVat, setIsVat] = useState(true);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', name: '24FW 남성 방한 자켓', material: 'poly', qty: 500, price: 33.5 }
  ]);
  const [editingInvoiceNo, setEditingInvoiceNo] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const subtotalUsd = invoiceItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const vatUsd = isVat ? subtotalUsd * 0.1 : 0;
  const totalUsd = subtotalUsd + vatUsd;

  const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatKrw = (num: number) => Math.floor(num).toLocaleString('ko-KR');

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { id: Date.now().toString(), name: '', material: 'etc', qty: 0, price: 0 }]);
  };

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'name') {
          const product = products.find(p => p.name === value);
          if (product) {
            updatedItem.price = product.price;
            updatedItem.material = product.material;
          }
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const saveInvoice = () => {
    if (totalUsd === 0) return;
    
    let invoiceNo = editingInvoiceNo;
    if (!invoiceNo) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const countStr = String(invoiceHistories.length + 1).padStart(2, '0');
      invoiceNo = `INV-${todayStr}-${countStr}`;
    }

    const newHistory: InvoiceHistory = {
      invoiceNo,
      customerName: invoiceCustomer,
      isVat,
      items: invoiceItems,
      totalUsd,
      date: new Date().toLocaleDateString()
    };

    if (editingInvoiceNo) {
      setInvoiceHistories(invoiceHistories.map(h => h.invoiceNo === editingInvoiceNo ? newHistory : h));
      setEditingInvoiceNo(null);
    } else {
      setInvoiceHistories([newHistory, ...invoiceHistories]);
    }
    
    // Reset form after save
    setInvoiceItems([{ id: Date.now().toString(), name: '', material: 'poly', qty: 0, price: 0 }]);
  };

  const loadInvoice = (history: InvoiceHistory) => {
    setEditingInvoiceNo(history.invoiceNo);
    setInvoiceCustomer(history.customerName);
    setIsVat(history.isVat);
    setInvoiceItems(history.items);
  };

  const deleteInvoice = (invoiceNo: string) => {
    setInvoiceHistories(invoiceHistories.filter(h => h.invoiceNo !== invoiceNo));
    if (editingInvoiceNo === invoiceNo) {
      setEditingInvoiceNo(null);
      setInvoiceItems([{ id: Date.now().toString(), name: '', material: 'poly', qty: 0, price: 0 }]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-light tracking-widest text-slate-800 mb-1">INVOICE</h1>
          <p className="text-slate-400 text-sm">견적서 작성 및 관리 {editingInvoiceNo && <span className="text-blue-500 font-bold ml-2">({editingInvoiceNo} 수정 중)</span>}</p>
        </div>
        <div className="flex gap-3">
          {editingInvoiceNo && (
            <button onClick={() => {
              setEditingInvoiceNo(null);
              setInvoiceItems([{ id: Date.now().toString(), name: '', material: 'poly', qty: 0, price: 0 }]);
            }} className="flex items-center bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 transition">
              새 견적 작성
            </button>
          )}
          <button onClick={saveInvoice} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            <Save size={16} className="mr-2" /> 견적 저장
          </button>
          <button onClick={() => handlePrint()} className="flex items-center bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition">
            <Printer size={16} className="mr-2" /> PDF 인쇄
          </button>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-slate-800">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">INVOICE</h2>
            <p className="text-slate-500 font-medium">No. {editingInvoiceNo || `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-XX`}</p>
            <p className="text-slate-500 font-medium">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-slate-800 mb-1">주식회사 이어진(eojinkorea)</h3>
            <p className="text-slate-600 text-sm">경기도 부천시 원미구 송내대로73번길 46. 7층</p>
            <p className="text-slate-600 text-sm">(7F. 46, Songnae-daero 73beon-gil, Wonmi-gu, Bucheon-si, Gyeonggi-do, Republic of Korea)</p>
            <p className="text-slate-600 text-sm">leesh@eojinkorea.com</p>
            <p className="text-slate-600 text-sm">01094917480</p>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To:</h4>
          <select 
            className="text-xl font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none print:appearance-none print:border-none cursor-pointer print:cursor-default"
            value={invoiceCustomer}
            onChange={(e) => setInvoiceCustomer(e.target.value)}
          >
            {buyers.map(c => (
              <option key={c.id} value={c.company}>{c.company}</option>
            ))}
          </select>
        </div>

        <div className="mb-8">
          <table className="w-full text-left">
            <thead className="border-b-2 border-slate-800 text-slate-800">
              <tr>
                <th className="py-3 font-bold">품목명</th>
                <th className="py-3 font-bold w-32">원단</th>
                <th className="py-3 font-bold text-right w-24">수량</th>
                <th className="py-3 font-bold text-right w-32">단가($)</th>
                <th className="py-3 font-bold text-right w-40">금액($)</th>
                <th className="py-3 w-10 print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 group">
                  <td className="py-3">
                    <div className="print:hidden">
                      <input 
                        type="text" 
                        list="product-list"
                        className="w-full bg-transparent outline-none font-medium text-slate-800 border-b border-transparent focus:border-blue-500" 
                        value={item.name}
                        onChange={(e) => updateInvoiceItem(item.id, 'name', e.target.value)}
                        placeholder="품목명 입력"
                      />
                    </div>
                    <div className="hidden print:block font-medium text-slate-800">
                      {item.name || '\u00A0'}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="print:hidden">
                      <select 
                        className="w-full bg-transparent outline-none text-slate-600 border-b border-transparent focus:border-blue-500"
                        value={item.material}
                        onChange={(e) => updateInvoiceItem(item.id, 'material', e.target.value)}
                      >
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="hidden print:block text-slate-600">
                      {materials.find(m => m.id === item.material)?.name || '\u00A0'}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="print:hidden">
                      <input 
                        type="number" 
                        className="w-full bg-transparent text-right outline-none text-slate-800 border-b border-transparent focus:border-blue-500" 
                        value={item.qty || ''}
                        onChange={(e) => updateInvoiceItem(item.id, 'qty', Number(e.target.value))}
                      />
                    </div>
                    <div className="hidden print:block text-right text-slate-800">
                      {item.qty ? item.qty.toLocaleString() : '\u00A0'}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end print:hidden">
                      <span className="text-slate-400 mr-1">$</span>
                      <input 
                        type="number" 
                        className="w-20 bg-transparent text-right outline-none text-slate-800 border-b border-transparent focus:border-blue-500" 
                        value={item.price || ''}
                        onChange={(e) => updateInvoiceItem(item.id, 'price', Number(e.target.value))}
                      />
                    </div>
                    <div className="hidden print:block text-right text-slate-800">
                      ${item.price ? formatNum(item.price) : '\u00A0'}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="font-bold text-slate-800">${formatNum(item.qty * item.price)}</div>
                    <div className="text-xs text-slate-400">₩{formatKrw(item.qty * item.price * exchangeRate)}</div>
                  </td>
                  <td className="py-3 text-center print:hidden">
                    <button onClick={() => removeInvoiceItem(item.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <datalist id="product-list">
            {products.map(p => <option key={p.id} value={p.name} />)}
          </datalist>

          <div className="mt-4 print:hidden">
            <button onClick={addInvoiceItem} className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-800 transition">
              <Plus size={16} className="mr-1" /> 항목 추가
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start pt-6 border-t-2 border-slate-800">
          <div className="mb-6 md:mb-0">
            <label className="flex items-center text-slate-700 font-medium cursor-pointer print:hidden">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2" 
                checked={isVat}
                onChange={(e) => setIsVat(e.target.checked)}
              />
              부가세(VAT 10%) 포함
            </label>
            <div className="hidden print:block text-slate-600 font-medium">
              {isVat ? '* 부가세(VAT 10%) 포함' : '* 영세율 적용'}
            </div>
            <p className="text-xs text-slate-400 mt-2">환율: 1 USD = {exchangeRate.toLocaleString()} KRW</p>
          </div>
          
          <div className="w-full md:w-80">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600 font-medium">공급가액:</span>
              <div className="text-right">
                <div className="font-bold text-slate-800">${formatNum(subtotalUsd)}</div>
                <div className="text-xs text-slate-400">₩{formatKrw(subtotalUsd * exchangeRate)}</div>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
              <span className="text-slate-600 font-medium">부가세:</span>
              <div className="text-right">
                <div className="font-bold text-slate-800">${formatNum(vatUsd)}</div>
                <div className="text-xs text-slate-400">₩{formatKrw(vatUsd * exchangeRate)}</div>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-bold text-slate-900 text-lg">총 합계:</span>
              <div className="text-right">
                <div className="font-black text-2xl text-blue-700">${formatNum(totalUsd)}</div>
                <div className="text-sm font-bold text-slate-500">₩{formatKrw(totalUsd * exchangeRate)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 print:hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">견적서 발행 이력</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">견적 번호</th>
                <th className="px-6 py-4 font-medium">고객사</th>
                <th className="px-6 py-4 font-medium">발행일</th>
                <th className="px-6 py-4 font-medium text-right">총 금액($)</th>
                <th className="px-6 py-4 font-medium text-center w-24">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoiceHistories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">발행된 견적서가 없습니다.</td>
                </tr>
              ) : (
                invoiceHistories.map((history, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-800">{history.invoiceNo}</td>
                    <td className="px-6 py-4 text-slate-600">{history.customerName}</td>
                    <td className="px-6 py-4 text-slate-600">{history.date}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">${formatNum(history.totalUsd)}</td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button onClick={() => loadInvoice(history)} className="text-blue-500 hover:text-blue-700 transition p-1"><Edit2 size={16}/></button>
                      <button onClick={() => deleteInvoice(history.invoiceNo)} className="text-rose-500 hover:text-rose-700 transition p-1"><Trash2 size={16}/></button>
                    </td>
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
