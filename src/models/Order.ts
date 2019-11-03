import { ICartProduct } from '.';

export interface IOrder {
    created: string;
    payment_method: string;
    discount: any[];
    delivery_type: string;
    restaurant_id: number;
    coupons: any[];
    amount: number;
    address_id: number;
    products: ICartProduct[];
    payment_token?: string;
}
