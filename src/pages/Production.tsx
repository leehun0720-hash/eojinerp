import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit, X } from 'lucide-react';
import { KanbanCard } from '../types';

export default function Production() {
  const { kanbanCards, setKanbanCards, buyers } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('cardId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: KanbanCard['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('cardId');
    setKanbanCards(kanbanCards.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCard: KanbanCard = {
      id: editingCard ? editingCard.id : `card-${Date.now()}`,
      title: formData.get('title') as string,
      customer: formData.get('customer') as string,
      status: formData.get('status') as KanbanCard['status'],
      date: formData.get('date') as string,
      details: formData.get('details') as string,
    };

    if (editingCard) setKanbanCards(kanbanCards.map(c => c.id === newCard.id ? newCard : c));
    else setKanbanCards([...kanbanCards, newCard]);
    setIsModalOpen(false);
  };

  const openModal = (card?: KanbanCard) => {
    setEditingCard(card || null);
    setIsModalOpen(true);
  };

  const columns: { id: KanbanCard['status'], title: string, color: string, border: string }[] = [
    { id: 'waiting', title: '발주 대기', color: 'bg-slate-100', border: 'border-l-slate-400' },
    { id: 'material', title: '원단/부자재 입고', color: 'bg-indigo-50', border: 'border-l-indigo-400' },
    { id: 'sewing', title: '재단/봉제 진행', color: 'bg-blue-50', border: 'border-l-blue-500' },
    { id: 'inspection', title: '검수 및 포장', color: 'bg-emerald-50', border: 'border-l-emerald-500' },
  ];

  const handleDelete = () => {
    if (editingCard) {
      setKanbanCards(kanbanCards.filter(c => c.id !== editingCard.id));
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500 font-medium">카드를 드래그 앤 드롭하여 공정 상태를 변경할 수 있습니다.</p>
        <button onClick={() => openModal()} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors">
          <Plus size={16} className="mr-2" /> 카드 추가
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden flex-1 pb-4">
        {columns.map(col => {
          const colCards = kanbanCards.filter(c => c.status === col.id);
          return (
            <div key={col.id} className={`${col.color} rounded-xl w-[320px] flex-shrink-0 flex flex-col box-border`}>
              <div className="p-4 border-b border-black/5 flex justify-between items-center rounded-t-xl z-10">
                <h4 className="font-bold text-slate-700">{col.title}</h4>
                <span className="bg-black/10 text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold">{colCards.length}</span>
              </div>
              <div 
                className="flex-1 overflow-y-auto p-3 space-y-3"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {colCards.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm font-medium">카드를 이 곳으로 드래그 하세요</div>
                ) : (
                  colCards.map(card => (
                    <div 
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing border-l-4 ${col.border} hover:shadow-md transition`}
                    >
                      <div className="text-xs font-medium text-slate-400 mb-1.5 flex justify-between">
                        <span>#{card.id.split('-')[1]?.slice(-4) || card.id.slice(-4)}</span>
                        <span className={card.date < new Date().toISOString().slice(0,10) ? 'text-rose-500' : ''}>{card.date || '미정'}</span>
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm mb-3">{card.title}</h5>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                        <span className="text-xs bg-slate-100 font-medium px-2 py-1 rounded text-slate-600">{card.customer}</span>
                        <button onClick={() => openModal(card)} className="text-slate-300 hover:text-blue-500 transition p-1"><Edit size={14}/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingCard ? '생산 카드 수정' : '새 생산 카드 추가'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">프로젝트/품목명 *</label>
                <input name="title" defaultValue={editingCard?.title} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">고객사 *</label>
                <select name="customer" defaultValue={editingCard?.customer} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  {buyers.map(b => <option key={b.id} value={b.company}>{b.company}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">예정 일정 (마감일)</label>
                <input type="date" name="date" defaultValue={editingCard?.date} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">상세 내용</label>
                <textarea name="details" defaultValue={editingCard?.details} rows={3} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">보드 위치</label>
                <select name="status" defaultValue={editingCard?.status || 'waiting'} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-6">
                {editingCard ? (
                  <button type="button" onClick={handleDelete} className="text-rose-500 hover:text-rose-700 text-sm font-medium px-2 py-1">삭제</button>
                ) : <div></div>}
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">취소</button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">저장</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
