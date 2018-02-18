import { CartProduct } from ".";

export interface Order {
    created: string;
    payment_method: string;
    discount: any[];
    delivery_type: string;
    restaurant_id: number;
    coupons: any[];
    amount: number;
    address_id: number;
    products: CartProduct[];
    payment_token?: string;
}