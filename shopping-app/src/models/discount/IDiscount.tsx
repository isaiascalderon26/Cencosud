interface ICouponValidity {
    start_at: Date;
    end_at: Date;
}

interface IDiscountStats {
    total_burned: number;
}
  
interface  IDetails {
    value: number;
    max_value: number;
    time: number;
}

interface IDiscountDetail {
    type: 'AMOUNT' | 'PERCENT';
    details: IDetails;
}

/**
* Discount
*/
export interface IDiscount {
    id: string;
    coupon_id: string;
    code: string;
    title: string;
    description: string;
    url_image: string;
    priority: number;
    selectable: boolean;
    max_to_burn: number;
    apply_to: Record<string, unknown>;
    validity: ICouponValidity;
    stats: IDiscountStats;
    state_name?: "AVALAIBLE" | "REDEEMED" | "EXPIRED";
    discount: IDiscountDetail;
    created_at: Date;
    updated_at: Date;
}