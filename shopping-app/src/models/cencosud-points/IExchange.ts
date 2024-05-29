interface ExchangeAmount {
    from: number;
    to: number;

}
interface ExchangeContent {
    title: string;
    subtitle: string;
    image: string;
    description: string;
    html_terms: string;
}
interface ExchangeValidity {
    start_at: Date;
    end_at: Date;
}
export default interface  IExchange {
    id:string;
    exchange_method: 'AUTOBAGS';
    exchange_amount: ExchangeAmount;
    content: ExchangeContent;
    tags: string[];
    metadata: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
    validity: ExchangeValidity
}

export interface IExchangeCategory{
    id: string,
    key: string,
    name: string
}



