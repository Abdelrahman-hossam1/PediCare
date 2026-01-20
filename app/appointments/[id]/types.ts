export type Vaccine = {
  id: string;
  name: string;
  stock: number;
  defaultPrice: number;
};

export type InvoiceItem = {
  id: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
  vaccineId?: string | null;
};

export type Invoice = {
  id: string;
  subtotal: number;
  total: number;
  isPaid: boolean;
  items: InvoiceItem[];
};

