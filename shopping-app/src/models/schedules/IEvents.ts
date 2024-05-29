export interface IEvents{
    id: string;
    date: string;
    title: string;
    image: string;
    tag: string;
    isScheduled: boolean;
    type: "SCHEDULING" | "INSCRIPTION";
}