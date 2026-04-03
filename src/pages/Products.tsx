import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Product } from '../types';

export default function Products() {
  const { products, setProducts, materials } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: formData.get('name') as string,
      material: formData.get('material') as string,
      price: Number(formData.get('price')),
    };

    if (editingProduct) setProducts(products.map(p => p.id === newProduct.id ? newProduct : p));
    else setProducts([...products, newProduct]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const openModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-800">제품(품목) 관리단가표</h3>
        <button onClick={() => openModal()} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Plus size={16} className="mr-1" /> 새 제품 등록
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 border-collapse min-w-[600px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">품목명</th>
              <th className="px-4 py-3">기본 원단</th>
              <th className="px-4 py-3 text-right">기본 단가($)</th>
              <th className="px-4 py-3 text-center w-32">관리</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const matName = materials.find(m => m.id === p.material)?.name || '기타';
              return (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3">{matName}</td>
                  <td className="px-4 py-3 text-right text-blue-600 font-semibold">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openModal(p)} className="text-blue-500 hover:text-blue-700 transition p-1"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(p.id)} className="text-rose-500 hover:text-rose-700 transition p-1"><Trash2 size={16}/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">품목 정보</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">품목명 *</label>
                <input name="name" defaultValue={editingProduct?.name} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">기본 원단 *</label>
                <select name="material" defaultValue={editingProduct?.material || 'poly'} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">단가($) *</label>
                <input type="number" step="0.01" name="price" defaultValue={editingProduct?.price} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
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
