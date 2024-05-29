interface ILineItem {
    id: string,
    description: string,
    price: number,
    quantity: number
}
interface IReservationCart{
    list_tickets : ILineItem[],
    total_tickets: number,
    total_price: number
}

export interface IReservationSlot{
    enabled: boolean,
    start: Date,
    end: Date,
  }

export default interface ITicketPayment {
    reservation_code: string;
    reservation_slot: IReservationSlot;
    tickets: IReservationCart;
    date?: string;
    name: string;
    rut: string;
    code_qr: string;
    code_qr_data: any;
    total_discount?: number;
}