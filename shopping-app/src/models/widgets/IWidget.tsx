import { ICallback } from "./ICallback";

export interface ILink {
    icon: string;
    url: string;
}
interface IBaseMedia {
    type: 'IMAGE' | 'VIDEO'| 'MOVIE';
    url: string;
    urlDefault: string;
}

export interface IImageMedia extends IBaseMedia {
    type: 'IMAGE'
}
export interface IVideoMedia extends IBaseMedia {
    type: 'VIDEO'
}
export interface IMovieMedia extends IBaseMedia {
    type: 'MOVIE'
}

export type IMedia = IMovieMedia | IVideoMedia | IImageMedia;

export interface BaseWidget {
    id: string;
    type: 'BANNER' | 'MAP' | 'SOCIAL_LINKS' | 'CARROUSEL' | 'STORE_LIST';
    enabled: boolean;
    priority: number;
    tags: string[];
    created_at: Date;
    updated_at: Date
}

export interface IBannerWidget extends BaseWidget {
    type: 'BANNER',
    title: string;
    image: string;
    callback: ICallback;
}

export interface IMapWidget extends BaseWidget {
    type: 'MAP'
    title: string;
    image: string;
    callback: ICallback
}

export interface ISocialLinksWidget extends BaseWidget {
    type: 'SOCIAL_LINKS'
    links: ILink[];
}

export interface ICarrouselItem {
    media: IMedia;
    callback: ICallback;

    badgeText?: string,
    bodyText?: string,
}
export interface ICarrouselWidget extends BaseWidget {
    type: 'CARROUSEL'
    title: string;
    orientation: 'VERTICAL' | 'HORIZONTAL';
    items: ICarrouselItem[];
    see_more?: {
        message: string;
        callback: ICallback;
    }
    rows?: number
    source? : string;
}



type IWidget = IBannerWidget | IMapWidget | ISocialLinksWidget | ICarrouselWidget;

export default IWidget;
