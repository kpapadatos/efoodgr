export declare class Cart {
    coupons: string[];
    deliveryType: string;
    paymentMethod: string;
    products: CartProduct[];
}
export interface CartProduct {
    product_id: string;
    quantity: number;
    price: number;
    offer: number;
    total: number;
    materials: string[];
    description: string;
    comment: string;
}
