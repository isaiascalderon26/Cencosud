export interface IPromotion {
  brand_logo: string
  brand_name: string
  description: string
  image: string
  market_id: string
  objectID: string
  store: string
  title: string
  validity_end_date: string
  validity_start_date: string
  promotion_ur?: string
  active_days?: number
  
  id?: string
  keywords: string[]
  control: string
  meta_data: Record<string, unknown>
  order: number
}

export interface IPromotionMetaData {
  name_button?: string;
  display_disclaimer?: boolean;

}
