import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Partner } from '../types';

export default function Partners() {
  const { buyers, setBuyers, suppliers, setSuppliers } = useStore();
  const [activeTab, setActiveTab] = useState<'buyer' | 'supplier'>('buyer');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPartner: Partner = {
      id: editingPartner ? editingPartner.id : Date.now(),
      company: formData.get('company') as string,
      contact: formData.get('contact') as string,
      phone: formData.get('phone') as string,
      note: formData.get('note') as string,
    };

    if (activeTab === 'buyer') {
      if (editingPartner) setBuyers(buyers.map(b => b.id === newPartner.id ? newPartner : b));
      else setBuyers([...buyers, newPartner]);
    } else {
      if (editingPartner) setSuppliers(suppliers.map(s => s.id === newPartner.id ? newPartner : s));
      else setSuppliers([...suppliers, newPartner]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (activeTab === 'buyer') setBuyers(buyers.filter(b => b.id !== id));
    else setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const openModal = (partner?: Partner) => {
    setEditingPartner(partner || null);
    setIsModalOpen(true);
  };

  const currentList = activeTab === 'buyer' ? buyers : suppliers;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex border-b border-slate-200">
        <button 
          className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'buyer' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('buyer')}
        >구매자(고객사) 관리</button>
        <button 
          className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'supplier' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('supplier')}
        >외주사(협력사) 관리</button>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">{activeTab === 'buyer' ? '구매자 목록' : '협력사 목록'}</h3>
          <button onClick={() => openModal()} className="flex items-center bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition">
            <Plus size={16} className="mr-1" /> {activeTab === 'buyer' ? '고객사 추가' : '협력사 추가'}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">회사명</th>
                <th className="px-4 py-3">{activeTab === 'buyer' ? '담당자' : '담당 공정'}</th>
                <th className="px-4 py-3">연락처</th>
                <th className="px-4 py-3">비고</th>
                <th className="px-4 py-3 w-24">관리</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-4 font-medium text-slate-800">{p.company}</td>
                  <td className="px-4 py-4">{p.contact}</td>
                  <td className="px-4 py-4">{p.phone}</td>
                  <td className="px-4 py-4 text-slate-500">{p.note}</td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button onClick={() => openModal(p)} className="text-blue-500 hover:text-blue-700 transition p-1"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(p.id)} className="text-rose-500 hover:text-rose-700 transition p-1"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{activeTab === 'buyer' ? '고객사 정보' : '협력사 정보'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">회사명 *</label>
                <input name="company" defaultValue={editingPartner?.company} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{activeTab === 'buyer' ? '담당자 *' : '담당 공정 *'}</label>
                <input name="contact" defaultValue={editingPartner?.contact} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">연락처 *</label>
                <input name="phone" defaultValue={editingPartner?.phone} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">비고</label>
                <input name="note" defaultValue={editingPartner?.note} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">취소</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
