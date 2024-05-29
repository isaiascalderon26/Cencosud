import { ITicketType } from "../reservation-contexts/IReservationContexts";

export interface IReservationSlot{
  enabled: boolean,
  start: Date,
  end: Date,
  ticket_types: ITicketType[],

}
