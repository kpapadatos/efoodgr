export class Cart {
    public coupons: string[];
    public deliveryType: string;
    public paymentMethod: string;
    public products: ICartProduct[] = [];
}

export interface ICartProduct {
    product_id: string;
    quantity: number;
    price: number;
    offer: number;
    total: number;
    materials: string[];
    description: string;
    comment: string;
}
