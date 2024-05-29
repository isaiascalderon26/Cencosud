interface IHours {
    open: number;
    close: number;
}

export interface IMall {
    id: string;
    name: string;
}

interface IOpeningHours {
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    hours: IHours[];
}

export interface ISchedulingContext {
    id: string;
    url_image: string;
    schedule_name: string;
    schedule_detail?: string;
    mall: IMall[];
    type: 'SCHEDULING' | 'INSCRIPTION';
    start_date: Date;
    end_date: Date;
    opening_hours: IOpeningHours[];
    interval_slot: number;
    interval_slot_quantity: number;
    closeddays: Date[];
    created_at: Date;
    updated_at: Date;
    avatar_image?: string;
}



