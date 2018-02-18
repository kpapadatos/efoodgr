/**
 * Menu items of a store.
 */
export interface MenuCategories {
    code: string;
    name: string;
    description: string;
    order: number;
    items: Product[];
}
export interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
    description: string;
    order: number;
    shortage: boolean;
    image: string;
    tags: string[];
    quick_add: boolean;
    personalized_options: any[];
    offer_line?: number;
}
export interface Offer {
    id: number;
    title: string;
    description: string;
    price: number;
    tag: string;
    mode: string;
    tiers: OfferTier[];
}
export interface OfferTier {
    offer_line: number;
    title: string;
    quantity: number;
    items: {
        code: string;
        name: string;
    }[];
}
export interface MenuItemOptions {
    id: number;
    code: string;
    restaurant_id: number;
    category_code: string;
    description: string;
    name: string;
    tags: string[];
    price: number;
    pickup_only: boolean;
    has_discount: boolean;
    is_available: boolean;
    need_server_calculation: boolean;
    image: string;
    allow_comments: boolean;
    special_instructions: string;
    excluded_from_minimum_order: boolean;
    personalized_options: any[];
    tiers: OptionTier[];
}
export interface OptionTier {
    code: number;
    name: string;
    order: number;
    type: string;
    maximum_selections: number;
    shortage: boolean;
    dependent_options: string[];
    free_options: number;
    options: Option[];
}
export interface Option {
    code: string;
    name: string;
    price: number;
    selected: boolean;
    shortage: boolean;
    extra: string;
    dependencies: {
        code: string;
        price: number;
        enabled: boolean;
    }[];
}
