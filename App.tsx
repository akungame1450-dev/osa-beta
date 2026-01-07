import React, { useState } from 'react';
import { Menu, Boxes } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Summary from './components/Summary';
import IncomingGoods from './components/IncomingGoods';
import OutgoingGoods from './components/OutgoingGoods';
import StockList from './components/StockList';
import StockOpnameView from './components/StockOpname';
import { Item, Transaction, StockOpname, ViewState, TransactionType } from './types';
import { INITIAL_ITEMS, INITIAL_TRANSACTIONS, INITIAL_OPNAMES } from './constants';

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [opnames, setOpnames] = useState<StockOpname[]>(INITIAL_OPNAMES);
  const [currentView, setCurrentView] = useState<ViewState>('SUMMARY');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTransaction = (itemId: string, qty: number, notes: string, type: TransactionType, date?: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Process date: use provided date (treat as local start of day) or current timestamp
    const transactionDate = date 
      ? new Date(date + 'T00:00:00').toISOString() 
      : new Date().toISOString();

    // Create new transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      itemId,
      itemName: item.name,
      type,
      quantity: qty,
      date: transactionDate,
      notes
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Update Item Stock
    setItems(prevItems => prevItems.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          stock: type === TransactionType.IN ? i.stock + qty : i.stock - qty,
          lastUpdated: new Date().toISOString()
        };
      }
      return i;
    }));
    
    alert(`Transaksi ${type} berhasil disimpan!`);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini? Stok barang akan dikembalikan ke jumlah sebelum transaksi.")) {
      return;
    }

    // Revert Stock Logic
    setItems(prevItems => prevItems.map(i => {
      if (i.id === transaction.itemId) {
        const adjustment = transaction.type === TransactionType.IN ? -transaction.quantity : transaction.quantity;
        return {
          ...i,
          stock: i.stock + adjustment,
          lastUpdated: new Date().toISOString()
        };
      }
      return i;
    }));

    // Remove transaction from history
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    alert("Transaksi berhasil dihapus dan stok telah disesuaikan kembali.");
  };

  const handleOpname = (itemId: string, actualStock: number, notes: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const difference = actualStock - item.stock;

    const newOpname: StockOpname = {
      id: Date.now().toString(),
      itemId,
      itemName: item.name,
      systemStock: item.stock,
      actualStock,
      difference,
      date: new Date().toISOString(),
      notes,
      status: 'Resolved'
    };

    setOpnames(prev => [...prev, newOpname]);

    // Directly adjust stock to match physical count
    setItems(prevItems => prevItems.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          stock: actualStock,
          lastUpdated: new Date().toISOString()
        };
      }
      return i;
    }));

    alert('Stok opname berhasil disimpan. Stok telah disesuaikan.');
  };

  const handleDeleteOpname = (opnameId: string) => {
    const opname = opnames.find(o => o.id === opnameId);
    if (!opname) return;

    // Revert stock adjustment based on difference
    // If difference was +5 (stock increased), we subtract 5 to revert.
    // If difference was -5 (stock decreased), we subtract -5 (add 5) to revert.
    setItems(prevItems => prevItems.map(i => {
      if (i.id === opname.itemId) {
        return {
          ...i,
          stock: i.stock - opname.difference, 
          lastUpdated: new Date().toISOString()
        };
      }
      return i;
    }));

    setOpnames(prev => prev.filter(o => o.id !== opnameId));
    alert("Riwayat opname dihapus dan stok dikembalikan ke nilai sebelum opname.");
  };

  const handleImportItems = (newItems: any[]) => {
    let addedCount = 0;
    let updatedCount = 0;

    setItems(prevItems => {
      const updatedItems = [...prevItems];

      newItems.forEach(newItem => {
        const existingIndex = updatedItems.findIndex(i => i.sku === newItem.sku);
        
        if (existingIndex >= 0) {
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            ...newItem,
            id: updatedItems[existingIndex].id,
            stock: typeof newItem.stock === 'number' ? newItem.stock : updatedItems[existingIndex].stock,
            lastUpdated: new Date().toISOString()
          };
          updatedCount++;
        } else {
          updatedItems.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            sku: newItem.sku || `SKU-${Date.now()}`,
            name: newItem.name || 'Barang Baru',
            category: newItem.category || 'Umum',
            stock: typeof newItem.stock === 'number' ? newItem.stock : 0,
            unit: newItem.unit || 'Pcs',
            minStock: typeof newItem.minStock === 'number' ? newItem.minStock : 5,
            lastUpdated: new Date().toISOString()
          });
          addedCount++;
        }
      });
      return updatedItems;
    });

    alert(`Import Berhasil!\n${addedCount} barang baru ditambahkan.\n${updatedCount} barang diperbarui.`);
  };

  const handleDeleteItem = (itemId: string) => {
    // Confirmation is handled in the View component
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'SUMMARY':
        return <Summary items={items} transactions={transactions} />;
      case 'STOCK':
        return <StockList items={items} onImportItems={handleImportItems} onDeleteItem={handleDeleteItem} />;
      case 'INCOMING':
        return (
          <IncomingGoods 
            items={items} 
            transactions={transactions}
            onAddTransaction={handleTransaction} 
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'OUTGOING':
        return (
          <OutgoingGoods 
            items={items} 
            transactions={transactions}
            onAddTransaction={handleTransaction} 
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'OPNAME':
        return (
          <StockOpnameView 
            items={items} 
            opnameHistory={opnames} 
            onSaveOpname={handleOpname}
            onDeleteOpname={handleDeleteOpname} 
          />
        );
      default:
        return <Summary items={items} transactions={transactions} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-screen relative">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              <Boxes size={20} />
            </div>
            <span className="font-bold text-slate-800">Inventory Gudang GS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 hover:text-indigo-600">
            <Menu size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1920px] mx-auto w-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;