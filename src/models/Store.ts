import { IMenuCategories } from '.';
import { IOffer } from './Menu';

/**
 * Represents a store listing.
 */
export interface IStore extends IStoreInformation {
    information?: IStoreInformation;

    offers: IOffer[];

    menu: {
        categories: IMenuCategories[];
    };
}

export interface IStoreInformation {
    id: number;
    title: string;
    average_rating: number;
    delivery_eta: number;
    minimum_order: number;
    workphone: string;
    delivery_cost: number;
    has_pickup: boolean;
    has_credit: boolean;
    has_delivery: boolean;
    has_cash_on_delivery: boolean;
    is_open: boolean;
    auto_closed: { status: string };
    chain_id: number;
    message: string;
    logo: string;
    num_ratings: number;
    basic_cuisine: string;
    cuisines: string[];
    is_new: boolean;
    address: {
        street: string;
        zip: string;
        longitude: number;
        latitude: number;
        city: string;
        area: string;
        slug: string;
        description: string;
    };
    has_offers: boolean;
    is_favorite: boolean;
    description: string;
    distance: number;
    timetable: Array<{
        day: string;
        times: string;
    }>;
    is_promoted: boolean;
    offer_tags: string[];
    has_discounts: boolean;
    slug: string;
    rank: number;
    is_chain_model: boolean;
    youtube_embed_url: string;
    cover: string;
    offer: {
        id: number;
        title: string;
        description: string;
        tag: string;
        icon: string;
        logo: string;
    };
}
