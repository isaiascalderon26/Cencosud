export interface  ISlot {
    id?: string;
    schedule_id: string;
    start: string;
    end: string;
    enabled: boolean;
    ticket_avalaible: number;
}