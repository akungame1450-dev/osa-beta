import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, LogIn, LogOut, Package, ClipboardCheck, Menu, X, Boxes } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'SUMMARY', label: 'Ringkasan', icon: <LayoutDashboard size={20} /> },
    { id: 'STOCK', label: 'Data Stok', icon: <Package size={20} /> },
    { id: 'INCOMING', label: 'Barang Masuk', icon: <LogIn size={20} /> },
    { id: 'OUTGOING', label: 'Barang Keluar', icon: <LogOut size={20} /> },
    { id: 'OPNAME', label: 'Stok Opname', icon: <ClipboardCheck size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static top-0 left-0 z-30 h-full w-64 bg-slate-900 text-white transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shrink-0">
              <Boxes size={20} />
            </div>
            <h1 className="text-lg font-bold tracking-wide leading-tight">Inventory Gudang GS</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onChangeView(item.id as ViewState);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                ADM
             </div>
             <div>
                <p className="text-sm font-medium text-white">Admin Gudang</p>
                <p className="text-xs text-slate-500">Online</p>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;