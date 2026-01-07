export interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  lastUpdated: string;
}

export enum TransactionType {
  IN = 'MASUK',
  OUT = 'KELUAR'
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  date: string;
  notes: string;
}

export interface StockOpname {
  id: string;
  itemId: string;
  itemName: string;
  systemStock: number;
  actualStock: number;
  difference: number;
  date: string;
  notes: string;
  status: 'Pending' | 'Resolved';
}

export type ViewState = 'SUMMARY' | 'INCOMING' | 'OUTGOING' | 'STOCK' | 'OPNAME';
