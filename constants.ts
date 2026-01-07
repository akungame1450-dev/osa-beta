import { Item, Transaction, StockOpname, TransactionType } from './types';

export const INITIAL_ITEMS: Item[] = [
  { id: '1', sku: 'ELEC-001', name: 'Laptop Gaming X1', category: 'Elektronik', stock: 15, unit: 'Unit', minStock: 5, lastUpdated: new Date().toISOString() },
  { id: '2', sku: 'ELEC-002', name: 'Mouse Wireless', category: 'Aksesoris', stock: 42, unit: 'Pcs', minStock: 10, lastUpdated: new Date().toISOString() },
  { id: '3', sku: 'FURN-001', name: 'Kursi Ergonomis', category: 'Furniture', stock: 3, unit: 'Unit', minStock: 5, lastUpdated: new Date().toISOString() },
  { id: '4', sku: 'ATK-001', name: 'Kertas A4 Rim', category: 'ATK', stock: 120, unit: 'Rim', minStock: 20, lastUpdated: new Date().toISOString() },
  { id: '5', sku: 'ELEC-003', name: 'Monitor 24 Inch', category: 'Elektronik', stock: 8, unit: 'Unit', minStock: 5, lastUpdated: new Date().toISOString() },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', itemId: '2', itemName: 'Mouse Wireless', type: TransactionType.IN, quantity: 20, date: new Date(Date.now() - 86400000).toISOString(), notes: 'Restock mingguan' },
  { id: 't2', itemId: '3', itemName: 'Kursi Ergonomis', type: TransactionType.OUT, quantity: 2, date: new Date(Date.now() - 172800000).toISOString(), notes: 'Penggunaan internal' },
];

export const INITIAL_OPNAMES: StockOpname[] = [];
