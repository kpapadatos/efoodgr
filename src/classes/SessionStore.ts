import * as Models from '../models/index';

export class SessionStore {
    /**
     * Primary authentication identifier.
     */
    public sessionId: string;
    /**
     * The authenticated user's information.
     */
    public user: Models.IUser;
    /**
     * The selected address for this session.
     */
    public addressId: number;
    /**
     * The currently selected store.
     */
    public storeId: number;
    /**
     * The current cart.
     */
    public cart: Models.Cart = new Models.Cart();
    /**
     * Payment method selected.
     */
    public paymentMethod: string = 'cash';
    /**
     * Delivery type.
     */
    public deliveryType: string = 'delivery';
    /**
     * Payment token used for credit card payments.
     */
    public paymentToken: string;
    /**
     * A unique identifier for the credit card to be used.
     */
    public paymentHashcode: string;
}
