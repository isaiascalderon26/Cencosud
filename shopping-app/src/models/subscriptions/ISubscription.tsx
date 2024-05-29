export default interface ISubscription{
    id: string;
    user_id: string;
    state:  'ACTIVED' | 'PAUSED' | 'CANCELLED' | 'REMOVED';
    service: string;
    service_details?: Record<string,any>;
    remove_reason?: { type: string; details: string};
    created_at: string;
    updated_at: string;
}

export type ICreateSubscription = Omit<ISubscription, 'id' | 'state' | 'created_at' | 'updated_at'>;