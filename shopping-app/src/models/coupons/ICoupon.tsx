/**
* Coupon stats
*/
interface ICouponStats {
    total_activations: number;
}
  
interface IDetails {
    value: number;
    max_value: number;
}

interface IDiscountDetail {
    type: 'AMOUNT' | 'PERCENT';
    details: IDetails;
}
 
/**
* Coupon validity date range
*/

interface ICouponValidity {
    start_at: Date;
    end_at: Date;
}
/**
* Coupon activation info
*/
interface ICouponDiscountTemplate {
    title: string;
    description: string;
    url_image: string;
    priority: number;
    selectable: boolean;
    max_to_burn: number;
    discount: IDiscountDetail
    apply_to: Record<string, unknown>;
 }
 
/**
* Coupon activation info
*/
 interface ICouponActivation {
    method: 'AUTOMATIC' | 'MANUAL';
    max_activations: number;
    duration_minutes?: number;
}
 
/**
* Coupon
*/
export default interface ICoupon {
    id: string;
    code: string;
    activation: ICouponActivation;
    discount_template: ICouponDiscountTemplate;
    validity: ICouponValidity;
    stats: ICouponStats;
    created_at: Date;
    updated_at: Date; 
}