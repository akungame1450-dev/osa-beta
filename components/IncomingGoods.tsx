import React, { useState, useRef, useEffect } from 'react';
import { Item, Transaction, TransactionType } from '../types';
import { PlusCircle, Save, Clock, Eye, Trash2, X, Calendar, Package, FileText, Search, ChevronDown } from 'lucide-react';

interface IncomingGoodsProps {
  items: Item[];
  transactions: Transaction[];
  onAddTransaction: (itemId: string, qty: number, notes: string, type: TransactionType, date: string) => void;
  onDeleteTransaction: (id: string) => void;
}

const IncomingGoods: React.FC<IncomingGoodsProps> = ({ items, transactions, onAddTransaction, onDeleteTransaction }) => {
  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDate());
  const [viewDetail, setViewDetail] = useState<Transaction | null>(null);

  // Searchable Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      alert("Mohon pilih barang terlebih dahulu.");
      return;
    }
    if (quantity && Number(quantity) > 0 && date) {
      onAddTransaction(selectedItemId, Number(quantity), notes, TransactionType.IN, date);
      // Reset form
      setSelectedItemId('');
      setQuantity('');
      setNotes('');
      setDate(getTodayDate());
      setSearchTerm('');
    }
  };

  const selectedItem = items.find(i => i.id === selectedItemId);
  
  // Filter items for dropdown
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter only incoming transactions
  const incomingHistory = transactions.filter(t => t.type === TransactionType.IN);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in items-start">
      {/* Form Section - Left Column on Desktop */}
      <div className="xl:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-0">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
            <PlusCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Barang Masuk</h2>
            <p className="text-slate-500 text-xs">Catat penerimaan barang.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Barang</label>
            
            {/* Custom Searchable Trigger */}
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full p-2.5 border rounded-lg bg-white text-sm flex items-center justify-between cursor-pointer transition-all ${
                isDropdownOpen ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-400'
              }`}
            >
              <span className={selectedItemId ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                {selectedItem ? `${selectedItem.sku} - ${selectedItem.name}` : '-- Cari & Pilih Barang --'}
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden animate-fade-in">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Cari SKU atau Nama..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1 p-1">
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedItemId(item.id);
                            setIsDropdownOpen(false);
                            setSearchTerm(''); // Optional: Clear search on select
                          }}
                          className={`p-2.5 hover:bg-emerald-50 cursor-pointer rounded-lg text-sm transition-colors mb-0.5 ${
                            selectedItemId === item.id ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'text-slate-700'
                          }`}
                        >
                          <div className="font-semibold">{item.name}</div>
                          <div className="flex justify-between items-center mt-1">
                             <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.sku}</span>
                             <span className="text-xs text-slate-500">Stok: {item.stock} {item.unit}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-sm flex flex-col items-center">
                         <Search size={24} className="mb-1 opacity-20" />
                         <span>Tidak ditemukan</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {selectedItem && (
               <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                 <Package size={12} />
                 Stok saat ini: <span className="font-bold text-slate-700">{selectedItem.stock} {selectedItem.unit}</span>
               </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  placeholder="0"
                  required
                />
                {selectedItem && (
                  <span className="absolute right-3 top-2.5 text-slate-400 text-xs">{selectedItem.unit}</span>
                )}
              </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
               <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  required
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="No. PO atau Keterangan..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow-md text-sm"
          >
            <Save size={18} />
            Simpan Transaksi
          </button>
        </form>
      </div>

      {/* History Table Section - Right Column on Desktop */}
      <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
           <div className="flex items-center gap-2 text-slate-700">
             <Clock size={18} />
             <h3 className="font-semibold">Riwayat Barang Masuk</h3>
           </div>
           <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
             {incomingHistory.length}
           </span>
        </div>
        
        <div className="overflow-auto flex-1 max-h-[calc(100vh-200px)]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase bg-slate-50">Tanggal</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase bg-slate-50">Barang</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right bg-slate-50">Jumlah</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center bg-slate-50">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incomingHistory.length > 0 ? (
                incomingHistory.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-800">
                      <div className="font-semibold">{t.itemName}</div>
                      {t.notes && <div className="text-xs text-slate-400 font-normal truncate max-w-[250px]">{t.notes}</div>}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-bold text-emerald-600">
                      +{t.quantity}
                    </td>
                    <td className="px-6 py-3 text-sm text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setViewDetail(t)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <Package className="mx-auto mb-2 opacity-30" size={32} />
                      <p>Belum ada riwayat transaksi masuk.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {viewDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                <Package size={18} /> Detail Barang Masuk
              </h3>
              <button 
                onClick={() => setViewDetail(null)}
                className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex items-start gap-3">
                  <div className="mt-1 text-slate-400"><Calendar size={18} /></div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Tanggal & Waktu</p>
                    <p className="font-medium text-slate-800">{new Date(viewDetail.date).toLocaleString('id-ID')}</p>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <div className="mt-1 text-slate-400"><Package size={18} /></div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Barang</p>
                    <p className="font-medium text-slate-800">{viewDetail.itemName}</p>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <div className="mt-1 text-slate-400"><PlusCircle size={18} /></div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Jumlah Masuk</p>
                    <p className="font-bold text-emerald-600 text-lg">+{viewDetail.quantity}</p>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <div className="mt-1 text-slate-400"><FileText size={18} /></div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Catatan / Referensi</p>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1 text-sm">
                      {viewDetail.notes || '-'}
                    </p>
                  </div>
               </div>
               <div className="pt-2 text-xs text-slate-400 text-right">
                  ID: {viewDetail.id}
               </div>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setViewDetail(null)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomingGoods;