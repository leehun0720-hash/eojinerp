import React, { useState } from 'react';
import { useStore } from '../store';
import { Trash2, Edit2, X, Check } from 'lucide-react';

export default function Materials() {
  const { materials, setMaterials, products } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name.trim()) return;
    
    setMaterials([...materials, { id: `mat-${Date.now()}`, name }]);
    e.currentTarget.reset();
  };

  const handleDelete = (id: string) => {
    if (products.some(p => p.material === id)) {
      // Instead of alert, we could use a toast, but for now just return
      console.warn('이 원단을 사용 중인 제품이 있어 삭제할 수 없습니다.');
      return;
    }
    setMaterials(materials.filter(m => m.id !== id));
  };

  const startEdit = (m: { id: string, name: string }) => {
    setEditingId(m.id);
    setEditName(m.name);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    setMaterials(materials.map(m => m.id === editingId ? { ...m, name: editName } : m));
    setEditingId(null);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">원단(자재) 관리</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="font-bold text-slate-700 text-sm mb-3">등록된 원단 목록</h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">원단명</th>
                  <th className="px-4 py-3 text-center w-24">관리</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(m => (
                  <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {editingId === m.id ? (
                        <input 
                          type="text" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)} 
                          className="border border-slate-300 rounded px-2 py-1 w-full"
                          autoFocus
                        />
                      ) : (
                        m.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      {editingId === m.id ? (
                        <>
                          <button onClick={saveEdit} className="text-emerald-500 hover:text-emerald-700 transition p-1"><Check size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 transition p-1"><X size={16}/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(m)} className="text-blue-500 hover:text-blue-700 transition p-1"><Edit2 size={16}/></button>
                          <button onClick={() => handleDelete(m.id)} className="text-rose-500 hover:text-rose-700 transition p-1"><Trash2 size={16}/></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
          <h4 className="font-bold text-slate-700 text-sm mb-4">새 원단 추가</h4>
          <form onSubmit={handleAdd}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">원단명 (예: Silk, Linen 등) *</label>
              <input name="name" type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="추가할 원단 이름을 입력하세요" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">원단 추가하기</button>
          </form>
        </div>
      </div>
    </div>
  );
}
