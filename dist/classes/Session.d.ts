import * as Models from '../models/index';
/**
 * Represents an authenticated session with e-food.gr.
 */
export declare class Session {
    private options;
    /**
     * The path to save session data.
     */
    PersistentStorePath: string;
    /**
     * The API origin of e-food.gr.
     */
    EFoodAPIOrigin: string;
    store: SessionStore;
    constructor(options?: SessionOptions);
    setPayment(paymentOptions: {
        paymentToken: string;
        paymentHashcode: string;
        paymentMethod: string;
    }): void;
    /**
     * Attempts to authenticate and store a `sessionId` on success.
     * @param email The user's email.
     * @param password The user's password.
     */
    login(email: string, password: string): Promise<boolean>;
    /**
     * Returns authentication status based on the existence
     * of a session token in `this.store`.
     */
    readonly isAuthenticated: boolean;
    /**
     * Validates an authenticated session by testing its `sessionId`
     * with a statistics call.
     */
    validate(): Promise<boolean>;
    /**
     * Returns an array with the user's addresses.
     */
    getUserAddresses(): Promise<Models.Address[]>;
    /**
     * Sets the default address for the current session.
     */
    setAddress(addressId: number): void;
    /**
     * Returns stores for the given coordinates.
     * @param parameters Location parameters and filters.
     */
    getStores(parameters: {
        latitude: number;
        longitude: number;
        onlyOpen: boolean;
    }): Promise<Models.Store[]>;
    /**
     * Submits the order and returns an order number.
     */
    submitOrder(): Promise<string>;
    /**
     * Gets an order status by Id.
     */
    getOrderStatus(orderId: string): Promise<string>;
    /**
     * Sets the `storeId` for the current store.
     * @param storeId The store's Id.
     */
    setStore(storeId: number): void;
    /**
     * Gets the menu of a store.
     */
    getStore(): Promise<Models.Store>;
    /**
     * Returns the cached user object of this session.
     */
    getUser(): Models.User;
    /**
     * Returns options for an item.
     * @param itemCode Item code (not to be confused with Id).
     */
    getMenuItemOptions(itemCode: any): Promise<any>;
    /**
     * Adds a menu item to the cart.
     * @param itemOptions Menu item configuration.
     */
    addToCart(itemOptions: {
        offer: number;
        comment: string;
        price: number;
        quantity: number;
        item: string;
        config: string;
    }): void;
    /**
     * Makes a `validate` request with the current
     * cart and settings
     */
    validateOrder(): Promise<boolean>;
    /**
     * Compiles a submittable `Order` object from the cart
     * cart and configuration.
     */
    compileOrder(): Models.Order;
    getCreditCards(): Promise<Models.CreditCard[]>;
    /**
     * Writes the current `this.store` object to the `PersistentStorePath` as json.
     */
    updatePersistentStore(): Promise<{}>;
    /**
     * Logs the user out by deleting any local data.
     */
    logout(): Promise<void>;
}
/**
 * Efood session options.
 */
export declare class SessionOptions {
    /**
     * If set to true, the session will attempt to write session
     * information in the `EFood.CachePath` location so that it can be reused.
     */
    persistent: boolean;
}
/**
 * Contains information about this session. This object is saved
 * if `EFood.SessionOptions.persistent` is set to true.
 */
export declare class SessionStore {
    /**
     * Primary authentication identifier.
     */
    sessionId: string;
    /**
     * The authenticated user's information.
     */
    user: Models.User;
    /**
     * The selected address for this session.
     */
    addressId: number;
    /**
     * The currently selected store.
     */
    storeId: number;
    /**
     * The current cart.
     */
    cart: Models.Cart;
    /**
     * Payment method selected.
     */
    paymentMethod: string;
    /**
     * Delivery type.
     */
    deliveryType: string;
    /**
     * Payment token used for credit card payments.
     */
    paymentToken: string;
    /**
     * A unique identifier for the credit card to be used.
     */
    paymentHashcode: string;
}
