export interface IBurned {
    store: string;
    burn_date: Date;
}

export interface IAssignedUser {
    id: string;
    email?: string;
    full_name?: string;
    document_number?: string;
}

export interface IAssigned {
    user: IAssignedUser;
    assignment_date: Date;
    expiration_date: Date;
}

export default interface IDiscountCode {
    id: string;
    code: string;
    promotion: string;
    banners: string[];
    disabled: boolean;
    validity_start_date: Date;
    validity_end_date: Date;
    assignment_validity_time: number;
    burned?: IBurned;
    assigned?: IAssigned;
    promotion_url?: string;
    active_days?: number;
    created_at: Date;
    updated_at: Date;
  }