import React from 'react';
import { Item, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryProps {
  items: Item[];
  transactions: Transaction[];
}

const Summary: React.FC<SummaryProps> = ({ items, transactions }) => {
  const totalStock = items.reduce((acc, item) => acc + item.stock, 0);
  const lowStockItems = items.filter(item => item.stock <= item.minStock);
  const recentIn = transactions.filter(t => t.type === 'MASUK').length;
  const recentOut = transactions.filter(t => t.type === 'KELUAR').length;

  // Prepare chart data: Top 5 items by stock quantity
  const chartData = [...items]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 7)
    .map(item => ({
      name: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
      stok: item.stock,
      min: item.minStock
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Dashboard Ringkasan</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Item (SKU)</p>
              <h3 className="text-3xl font-bold text-slate-800">{items.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Stok Menipis</p>
              <h3 className={`text-3xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {lowStockItems.length}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${lowStockItems.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Transaksi Masuk</p>
              <h3 className="text-3xl font-bold text-emerald-600">{recentIn}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Transaksi Keluar</p>
              <h3 className="text-3xl font-bold text-orange-600">{recentOut}</h3>
            </div>
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Level Stok Barang Tertinggi</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="stok" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.stok <= entry.min ? '#ef4444' : '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Peringatan Stok Minim</h3>
          {lowStockItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-10">
              <Package size={48} className="mb-2 opacity-50" />
              <p>Semua stok aman</p>
            </div>
          ) : (
            <div className="overflow-y-auto h-64 pr-2">
              <ul className="space-y-3">
                {lowStockItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-red-600 font-bold">{item.stock} {item.unit}</span>
                      <p className="text-xs text-red-400">Min: {item.minStock}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;