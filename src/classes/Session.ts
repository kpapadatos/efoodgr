import { get, post } from 'request-promise-native';
import * as Models from '../models/index';
import { ICreditCard } from '../models/index';
import { SessionStore } from './SessionStore';

export class Session {
    public APIEndpoint = 'https://api.e-food.gr';

    public store: SessionStore = new SessionStore();

    public setPayment(paymentOptions: { paymentToken: string; paymentHashcode: string; paymentMethod: string; }): void {
        this.store.paymentHashcode = paymentOptions.paymentHashcode;
        this.store.paymentToken = paymentOptions.paymentToken;
        this.store.paymentMethod = paymentOptions.paymentMethod;
    }

    public async login(email: string, password: string): Promise<boolean> {
        const response = await post(`${this.APIEndpoint}/api/v1/user/login`, {
            body: { email, password },
            json: true
        }) as Models.ILoginResponse;

        if (response.status === 'ok') {
            this.store.sessionId = response.data.session_id;
            this.store.user = response.data.user as Models.IUser;
        }

        return response.status === 'ok';
    }

    public get isAuthenticated(): boolean {
        return Boolean(this.store.sessionId);
    }

    /**
     * Validates an authenticated session by testing its `sessionId`
     * with a statistics call.
     */
    public async validate(): Promise<boolean> {
        const response = await get({
            headers: { 'x-core-session-id': this.store.sessionId },
            json: true,
            uri: `${this.APIEndpoint}/api/v1/user/statistics`
        });

        return response.status === 'ok';
    }

    public async getUserAddresses(): Promise<Models.IAddress[]> {
        const response: Models.IAPIResponse = await get({
            headers: { 'x-core-session-id': this.store.sessionId },
            json: true,
            uri: `${this.APIEndpoint}/api/v1/user/clients/address`
        }) as Models.IAPIResponse;

        return response.data as Models.IAddress[];
    }

    public setAddress(addressId: number): void {
        this.store.addressId = addressId;
    }

    public async getStores(parameters: {
        latitude: number;
        longitude: number;
        onlyOpen: boolean;
    }): Promise<Models.IStore[]> {
        const response: Models.IAPIResponse = await get({
            headers: { 'x-core-session-id': this.store.sessionId },
            json: true,
            uri: `${this.APIEndpoint}/api/v1/restaurants/?filters=%7B%0A%0A%7D&latitude=${parameters.latitude}&longitude=${parameters.longitude}&mode=filter&version=3`
        }) as Models.IAPIResponse;

        return response.data.restaurants as Models.IStore[];
    }

    /**
     * Submits the order and returns an order number.
     */
    public async submitOrder(): Promise<string> {
        const response: Models.IAPIResponse = await post({
            body: this.compileOrder(),
            headers: { 'x-core-session-id': this.store.sessionId },
            json: true,
            uri: `${this.APIEndpoint}/api/v1/order/submit/`
        }) as Models.IAPIResponse;

        return response.status === 'ok' && response.data.order_id;
    }

    /**
     * Gets an order status by Id.
     */
    public async getOrderStatus(orderId: string): Promise<string> {
        const response: Models.IAPIResponse = await get({
            headers: { 'x-core-session-id': this.store.sessionId },
            json: true,
            uri: `${this.APIEndpoint}/api/v1/order/status/${orderId}/`
        }) as Models.IAPIResponse;

        return response.data;
    }

    /**
     * Sets the `storeId` for the current store.
     * @param storeId The store's Id.
     */
    public setStore(storeId: number) {
        if (storeId !== this.store.storeId) {
            this.store.cart = new Models.Cart();
        }

        this.store.storeId = storeId;
    }

    /**
     * Gets the menu of a store.
     */
    public async getStore(): Promise<Models.IStore> {
        const response: Models.IAPIResponse = await get({
            headers: { 'x-core-session-id': this.store.sessionId },
            json: true,
            uri: `${this.APIEndpoint}/api/v1/restaurants/${this.store.storeId}`
        }) as Models.IAPIResponse;

        return response.data as Models.IStore;
    }

    /**
     * Returns the cached user object of this session.
     */
    public getUser(): Models.IUser {
        return this.store.user;
    }

    /**
     * Returns options for an item.
     * @param itemCode Item code (not to be confused with Id).
     */
    public async getMenuItemOptions(itemCode: string): Promise<any> {
        const response: Models.IAPIResponse = await get({
            headers: { 'x-core-session-id': this.store.sessionId },
            json: true,
            uri: `${this.APIEndpoint}/api/v1/restaurants/menuitem/?item_code=${itemCode}&restaurant_id=${this.store.storeId}`
        }) as Models.IAPIResponse;

        return response;
    }

    /**
     * Adds a menu item to the cart.
     * @param itemOptions Menu item configuration.
     */
    public addToCart(itemOptions: {
        offer: number;
        comment: string;
        price: number;
        quantity: number;
        item: string;
        config: string;
    }): void {
        this.store.cart.products.push({
            comment: itemOptions.comment,
            description: '',
            materials: itemOptions.config ? itemOptions.config.split(',') : [],
            offer: itemOptions.offer || null,
            price: itemOptions.price || 0,
            product_id: itemOptions.item,
            quantity: itemOptions.quantity || 1,
            total: itemOptions.price || 0
        });
    }

    /**
     * Makes a `validate` request with the current
     * cart and settings
     */
    public async validateOrder(): Promise<boolean> {
        const response: Models.IAPIResponse = await post({
            body: this.compileOrder(),
            headers: { 'x-core-session-id': this.store.sessionId },
            json: true,
            uri: `${this.APIEndpoint}/api/v1/order/validate/`
        }) as Models.IAPIResponse;

        return response.status === 'ok';
    }

    /**
     * Compiles a submittable `Order` object from the cart
     * cart and configuration.
     */
    public compileOrder(): Models.IOrder {
        const order: Models.IOrder = {
            address_id: this.store.addressId,
            amount: this.store.cart.products.map((p) => p.total).reduce((c, e, i) => c += e, 0),
            coupons: [],
            created: '',
            delivery_type: this.store.deliveryType,
            discount: [],
            payment_method: this.store.paymentMethod,
            products: this.store.cart.products,
            restaurant_id: this.store.storeId
        };

        if (this.store.paymentToken) {
            order.payment_token = this.store.paymentToken;
        }

        return order;
    }

    public async getCreditCards(): Promise<Models.ICreditCard[]> {
        const response: Models.IAPIResponse = await get({
            headers: { 'x-core-session-id': this.store.sessionId },
            json: true,
            uri: `${this.APIEndpoint}/api/v1/ext/piraeus/methods/`
        }) as Models.IAPIResponse;

        return response.data as ICreditCard[];
    }

    /**
     * Logs the user out by deleting any local data.
     */
    public async logout() {
        this.store = new SessionStore();
    }
}
