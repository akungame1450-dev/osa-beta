import React, { useState } from 'react';
import { Item, StockOpname } from '../types';
import { Search, Filter, ClipboardList, History, Save, X, Package, AlertCircle, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';

interface StockOpnameProps {
  items: Item[];
  opnameHistory: StockOpname[];
  onSaveOpname: (itemId: string, actualStock: number, notes: string) => void;
  onDeleteOpname?: (opnameId: string) => void;
}

const StockOpnameView: React.FC<StockOpnameProps> = ({ items, opnameHistory, onSaveOpname, onDeleteOpname }) => {
  const [activeTab, setActiveTab] = useState<'INPUT' | 'HISTORY'>('INPUT');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [actualStock, setActualStock] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');

  // Delete Confirmation State
  const [opnameToDelete, setOpnameToDelete] = useState<StockOpname | null>(null);

  const categories = Array.from(new Set(items.map(i => i.category)));

  // Filter Items Logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? item.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Filter History Logic
  const filteredHistory = opnameHistory.filter(h => {
     const matchesSearch = h.itemName.toLowerCase().includes(searchTerm.toLowerCase());
     return matchesSearch;
  });

  const handleOpenOpname = (item: Item) => {
    setSelectedItem(item);
    setActualStock(''); // Reset to empty or set to item.stock if you want default
    setNotes('');
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setActualStock('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem && actualStock !== '') {
      onSaveOpname(selectedItem.id, Number(actualStock), notes);
      handleCloseModal();
    }
  };

  const confirmDeleteOpname = () => {
    if (opnameToDelete && onDeleteOpname) {
      onDeleteOpname(opnameToDelete.id);
      setOpnameToDelete(null);
    }
  };

  const difference = selectedItem && actualStock !== '' 
    ? Number(actualStock) - selectedItem.stock 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Stock Opname</h2>
           <p className="text-slate-500 text-sm mt-1">Lakukan penyesuaian stok sistem dengan fisik gudang.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('INPUT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'INPUT' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ClipboardList size={18} /> Input Opname
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'HISTORY' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History size={18} /> Riwayat
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={activeTab === 'INPUT' ? "Cari barang untuk opname (SKU/Nama)..." : "Cari riwayat..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
            />
          </div>
          
          {activeTab === 'INPUT' && (
            <div className="relative md:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white w-full cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {activeTab === 'INPUT' ? (
          /* --- INPUT TAB: LIST OF ITEMS --- */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Barang</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Stok Sistem</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{item.sku}</td>
                      <td className="px-6 py-4 text-sm text-slate-800 font-semibold">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-mono font-bold text-slate-700">
                        {item.stock} <span className="text-slate-400 font-normal text-xs">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <button
                          onClick={() => handleOpenOpname(item)}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-sm transition-colors border border-indigo-100"
                        >
                          Lakukan Opname
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                       <Search size={48} className="mx-auto mb-2 opacity-30" />
                       <p>Data barang tidak ditemukan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* --- HISTORY TAB: LOGS --- */
          <div className="overflow-x-auto">
             <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Barang</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Sistem</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Fisik</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Selisih</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Catatan</th>
                  {onDeleteOpname && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.length > 0 ? (
                  filteredHistory.slice().reverse().map((op) => (
                    <tr key={op.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {new Date(op.date).toLocaleDateString('id-ID')}
                        <div className="text-xs text-slate-400">{new Date(op.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{op.itemName}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-500">{op.systemStock}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-800 font-bold bg-slate-50/50">{op.actualStock}</td>
                      <td className={`px-6 py-4 text-sm text-right font-medium ${op.difference < 0 ? 'text-red-600' : op.difference > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {op.difference > 0 ? '+' : ''}{op.difference}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 italic truncate max-w-xs">{op.notes || '-'}</td>
                      {onDeleteOpname && (
                        <td className="px-6 py-4 text-sm text-center">
                          <button 
                             onClick={() => setOpnameToDelete(op)}
                             className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                             title="Hapus Riwayat"
                          >
                             <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={onDeleteOpname ? 7 : 6} className="px-6 py-12 text-center text-slate-400">
                       <History size={48} className="mx-auto mb-2 opacity-30" />
                       <p>Belum ada riwayat opname.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL FORM OPNAME */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                <ClipboardList size={20} /> Form Stock Opname
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="p-2 bg-white rounded border border-slate-200 text-slate-400">
                    <Package size={24} />
                 </div>
                 <div>
                    <p className="text-sm text-slate-500">Barang</p>
                    <p className="font-bold text-slate-800 text-lg">{selectedItem.name}</p>
                    <p className="text-xs text-slate-400">SKU: {selectedItem.sku} • Kategori: {selectedItem.category}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Stok Sistem</label>
                    <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono font-bold text-lg text-center">
                       {selectedItem.stock}
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 text-indigo-600">Stok Fisik (Real)</label>
                    <input
                      type="number"
                      min="0"
                      autoFocus
                      value={actualStock}
                      onChange={(e) => setActualStock(Number(e.target.value))}
                      className="w-full p-3 bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 font-mono font-bold text-lg text-center"
                      placeholder="0"
                      required
                    />
                 </div>
              </div>

              {/* Difference Indicator */}
              {actualStock !== '' && (
                 <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    difference === 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                    'bg-amber-50 border-amber-100 text-amber-700'
                 }`}>
                    <span className="text-sm font-medium flex items-center gap-2">
                       {difference === 0 ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                       {difference === 0 ? 'Stok Sesuai' : 'Terdapat Selisih'}
                    </span>
                    <span className="font-bold font-mono">
                       {difference > 0 ? '+' : ''}{difference} {selectedItem.unit}
                    </span>
                 </div>
              )}

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Catatan Penyesuaian</label>
                 <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Contoh: Barang rusak, hilang, atau salah hitung..."
                    required
                 ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                 <button
                   type="button"
                   onClick={handleCloseModal}
                   className="flex-1 py-3 px-4 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                 >
                   Batal
                 </button>
                 <button
                   type="submit"
                   disabled={actualStock === ''}
                   className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                 >
                   <Save size={18} /> Simpan Opname
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL FOR OPNAME */}
      {opnameToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-6 text-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <AlertTriangle size={32} />
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Riwayat Opname?</h3>
               <p className="text-sm text-slate-500 mb-6">
                 Anda akan menghapus data opname untuk <strong>{opnameToDelete.itemName}</strong> pada tanggal {new Date(opnameToDelete.date).toLocaleDateString('id-ID')}. 
                 Stok barang akan dikembalikan (di-revert) sesuai selisih opname ini.
               </p>
               <div className="flex gap-3">
                  <button
                    onClick={() => setOpnameToDelete(null)}
                    className="flex-1 py-2.5 px-4 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDeleteOpname}
                    className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Ya, Hapus
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockOpnameView;