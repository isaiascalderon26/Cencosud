import { IDiscount } from "../discount/IDiscount";

interface PaymentMethodDetail {
  card_token: string;
  card_type: string;
  user_id: string;
}

interface PaymentMethod {
  kind?: string;
  details: PaymentMethodDetail;
}

interface Amount {
  total: number;
  subtotal: number;
  tax?: number;
  discount?:number; 
}

interface LineItems {
  id: string;
  description: string;
  price: number;
  quantity: number;
}

interface Transaction {
  currency?: string;
  amount: Amount;
  line_items: LineItems[];
}

interface Payer {
  email: string;
  full_name: string;
  document_type: string;
  document_number: string;
  country: string;
}

export default interface IPaymentIntention {
  id: string;
  state: 'CREATED' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  payment_flow: 'AUTOPASS' | 'AUTOPASS-RESOLUTION' | 'AUTOSCAN' | 'SKY-COSTANERA' | 'SKY-COSTANERA-REFUND' | 'FOODIE' | 'AUTOBAGS';
  payer: Payer;
  payment_method: PaymentMethod;
  transaction: Transaction;
  discounts?: IDiscount[];
  metadata: Record<string, unknown>;
  created_at: Date
  updated_at: Date
}

export type ICreatePaymentIntention = Omit<IPaymentIntention, 'id' | 'state' | 'created_at' | 'updated_at'>
