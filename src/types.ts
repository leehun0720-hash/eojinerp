export type Tab = 'dashboard' | 'partners' | 'invoice' | 'products' | 'materials' | 'contract' | 'production' | 'shipping' | 'finance';

export interface Partner {
  id: number;
  company: string;
  contact: string;
  phone: string;
  note: string;
}

export interface Product {
  id: number;
  name: string;
  material: string;
  price: number;
}

export interface Material {
  id: string;
  name: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  material: string;
  qty: number;
  price: number;
}

export interface InvoiceHistory {
  invoiceNo: string;
  customerName: string;
  isVat: boolean;
  items: InvoiceItem[];
  totalUsd: number;
  date: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  customer: string;
  status: 'waiting' | 'material' | 'sewing' | 'inspection';
  date: string;
  details: string;
}

export interface OutsourceEstimate {
  id: number;
  invoiceNo: string;
  supplier: string;
  details: string;
  costUsd: number;
}

export interface ShippingData {
  id: string;
  invoiceNo: string;
  freight: number;
  duty: number;
  clearance: number;
  inland: number;
  incoterms: string;
  status: string;
}

export interface ContractData {
  customer: string;
  productName: string;
  totalUsd: number;
  vatType: string;
  clause1: string;
  clause2: string;
  clause3: string;
  clause4: string;
  clause5: string;
  clause6: string;
  specialClause: string;
}

export interface ProfitSheet {
  id: number;
  invoiceNo: string;
  customerName: string;
  revenue: number;
  cost: number;
  logistics: number;
  profit: number;
  margin: string;
  date: string;
}
