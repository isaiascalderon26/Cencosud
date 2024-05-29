

export interface ITicketType{
  type: "ADULT" | "CHILD" | "INFANT",
  price: number,
  name: string,
}

interface IOur{
  open: number,
  close: number
}

interface IOpeningHour{
  day: number,
  hours: IOur[]
}

export interface IReservationContexts{
  id:string,
  ticket_types: ITicketType[],
  opening_hours: IOpeningHour[],
  metadata?: Record<string, unknown>
}
