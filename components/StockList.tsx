import React, { useState, useRef } from 'react';
import { Item } from '../types';
import { Search, Filter, Upload, FileDown, Trash2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { read, utils, write } from 'xlsx';

interface StockListProps {
  items: Item[];
  onImportItems?: (items: any[]) => void;
  onDeleteItem: (id: string) => void;
}

const StockList: React.FC<StockListProps> = ({ items, onImportItems, onDeleteItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = Array.from(new Set(items.map(i => i.category)));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? item.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleDownloadTemplate = () => {
    const templateData = [
      { PLU: 'CONTOH-001', Nama: 'Nama Barang Contoh', Kategori: 'Umum', Stok: 10, Unit: 'Pcs', MinimalStok: 5 },
      { PLU: 'CONTOH-002', Nama: 'Barang Lain', Kategori: 'Elektronik', Stok: 50, Unit: 'Unit', MinimalStok: 10 },
    ];
    
    const ws = utils.json_to_sheet(templateData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Template");
    
    const wbout = utils.sheet_to_csv(ws);
    const blob = new Blob([wbout], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_stok.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportData = () => {
    const exportData = filteredItems.map(item => ({
      'PLU': item.sku,
      'Nama Barang': item.name,
      'Kategori': item.category,
      'Stok Fisik': item.stock,
      'Unit': item.unit,
      'Min. Stok': item.minStock,
      'Terakhir Update': new Date(item.lastUpdated).toLocaleDateString('id-ID')
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data Stok");

    // Generate XLSX file
    const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Stok_Gudang_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = utils.sheet_to_json(ws);

        const formattedData = data.map((row: any) => ({
          sku: row['PLU'] || row['plu'] || row['SKU'] || row['sku'],
          name: row['Nama'] || row['Name'] || row['nama'],
          category: row['Kategori'] || row['Category'] || row['kategori'],
          stock: Number(row['Stok'] || row['Stock'] || row['stok'] || 0),
          unit: row['Unit'] || row['Satuan'] || row['unit'],
          minStock: Number(row['MinimalStok'] || row['MinStock'] || row['min'] || 0)
        })).filter(item => item.sku && item.name);

        if (formattedData.length > 0 && onImportItems) {
           onImportItems(formattedData);
        } else {
           alert("Data tidak valid atau format kolom tidak sesuai template.");
        }
      } catch (error) {
        console.error(error);
        alert("Gagal membaca file. Pastikan format CSV atau Excel benar.");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Daftar Stok Barang</h2>
           <p className="text-slate-500 text-sm mt-1">Kelola database barang, pencarian, dan import data.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
           <div className="flex gap-2">
              <input 
                type="file" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <button 
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium whitespace-nowrap flex-1 sm:flex-none"
                title="Download Data Excel"
              >
                <FileSpreadsheet size={18} /> Download Data
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium whitespace-nowrap flex-1 sm:flex-none"
              >
                <Upload size={18} /> Import
              </button>
              <button 
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium whitespace-nowrap flex-1 sm:flex-none"
                title="Download Template CSV"
              >
                <FileDown size={18} /> Template
              </button>
           </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan PLU atau Nama Barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
            />
          </div>
          
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">PLU</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Barang</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Stok Fisik</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  return (
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
                          onClick={() => setItemToDelete(item)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Barang"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                       <Search size={48} className="text-slate-200 mb-2" />
                       <p className="font-medium text-slate-500">Barang tidak ditemukan</p>
                       <p className="text-sm">Coba kata kunci lain atau import data baru.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-6 text-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <AlertTriangle size={32} />
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Barang?</h3>
               <p className="text-sm text-slate-500 mb-6">
                 Anda akan menghapus barang <strong>{itemToDelete.name}</strong>. 
                 Data transaksi terkait akan tetap tersimpan di riwayat, namun barang ini akan hilang dari daftar stok.
               </p>
               <div className="flex gap-3">
                  <button
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 py-2.5 px-4 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDelete}
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

export default StockList;