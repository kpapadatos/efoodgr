import * as request from 'request-promise-native';
import * as fs from 'fs';
import * as Models from '../models/index';
import { CreditCard } from '../models/index';

/**
 * Represents an authenticated session with e-food.gr.
 */
export class Session {

    /** 
     * The path to save session data.
     */
    public PersistentStorePath = `${process.env.USERPROFILE}/.cache.efoodgr.json`;

    /**
     * The API origin of e-food.gr.
     */
    public EFoodAPIOrigin = 'https://api.e-food.gr';

    public store: SessionStore = new SessionStore();

    constructor(private options: SessionOptions = new SessionOptions()) {

        // Try to load the last session if persistent was set to true
        if (options.persistent) {
            try {
                this.store = require(this.PersistentStorePath) as SessionStore;
            } catch (err) {
                // No file found or the file was corrupted
            }
        }

    }

    @Persist
    public setPayment(paymentOptions: { paymentToken: string; paymentHashcode: string; paymentMethod: string; }): void {
        this.store.paymentHashcode = paymentOptions.paymentHashcode;
        this.store.paymentToken = paymentOptions.paymentToken;
        this.store.paymentMethod = paymentOptions.paymentMethod;
    }

    /**
     * Attempts to authenticate and store a `sessionId` on success.
     * @param email The user's email.
     * @param password The user's password.
     */
    @Persist
    public async login(email: string, password: string): Promise<boolean> {

        let response: Models.APIResponse = await request({
            method: 'post',
            json: true,
            uri: `${this.EFoodAPIOrigin}/api/v1/user/login`,
            body: { email, password }
        }) as Models.APIResponse;

        if (response.status == 'ok') {
            this.store.sessionId = response.data.session_id;
            this.store.user = response.data.user as Models.User;
        }

        return response.status == 'ok';

    }

    /**
     * Returns authentication status based on the existence
     * of a session token in `this.store`.
     */
    public get isAuthenticated(): boolean {
        return Boolean(this.store.sessionId);
    }

    /**
     * Validates an authenticated session by testing its `sessionId`
     * with a statistics call.
     */
    @Authorize
    public async validate(): Promise<boolean> {

        let response = await request({
            method: 'get',
            json: true,
            uri: `${this.EFoodAPIOrigin}/api/v1/user/statistics`,
            headers: { 'x-core-session-id': this.store.sessionId }
        });

        return response.status == 'ok';

    }

    /**
     * Returns an array with the user's addresses.
     */
    @Authorize
    public async getUserAddresses(): Promise<Models.Address[]> {
        let response: Models.APIResponse = await request({
            method: 'get',
            json: true,
            uri: `${this.EFoodAPIOrigin}/api/v1/user/clients/address`,
            headers: { 'x-core-session-id': this.store.sessionId }
        }) as Models.APIResponse;

        return response.data as Models.Address[];
    }

    /**
     * Sets the default address for the current session.
     */
    @Authorize
    @Persist
    public setAddress(addressId: number): void {
        this.store.addressId = addressId;
    }

    /**
     * Returns stores for the given coordinates.
     * @param parameters Location parameters and filters.
     */
    @Authorize
    @RequiresAddress
    public async getStores(parameters: { latitude: number, longitude: number, onlyOpen: boolean }): Promise<Models.Store[]> {
        let response: Models.APIResponse = await request({
            method: 'get',
            json: true,
            uri: `${this.EFoodAPIOrigin}/api/v1/restaurants/?filters=%7B%0A%0A%7D&latitude=${parameters.latitude}&longitude=${parameters.longitude}&mode=filter&version=3`,
            headers: { 'x-core-session-id': this.store.sessionId }
        }) as Models.APIResponse;

        return response.data.restaurants as Models.Store[];
    }

    /**
     * Submits the order and returns an order number.
     */
    @Authorize
    @RequiresAddress
    @RequiresStore
    @RequiresCart
    public async submitOrder(): Promise<string> {
        let response: Models.APIResponse = await request({
            method: 'post',
            json: true,
            uri: `${this.EFoodAPIOrigin}/api/v1/order/submit/`,
            body: this.compileOrder(),
            headers: { 'x-core-session-id': this.store.sessionId }
        }) as Models.APIResponse;

        return response.status == 'ok' && response.data.order_id;
    }

    /**
     * Gets an order status by Id.
     */
    @Authorize
    public async getOrderStatus(orderId: string): Promise<string> {
        let response: Models.APIResponse = await request({
            method: 'get',
            json: true,
            uri: `${this.EFoodAPIOrigin}/api/v1/order/status/${orderId}/`,
            headers: { 'x-core-session-id': this.store.sessionId }
        }) as Models.APIResponse;

        return response.data;
    }

    /**
     * Sets the `storeId` for the current store.
     * @param storeId The store's Id.
     */
    @Authorize
    @RequiresAddress
    @Persist
    public setStore(storeId: number) {
        if(storeId != this.store.storeId)
            this.store.cart = new Models.Cart();

        this.store.storeId = storeId;
    }

    /**
     * Gets the menu of a store.
     */
    @Authorize
    @RequiresAddress
    @RequiresStore
    public async getStore(): Promise<Models.Store> {
        let response: Models.APIResponse = await request({
            method: 'get',
            json: true,
            uri: `${this.EFoodAPIOrigin}/api/v1/restaurants/${this.store.storeId}`,
            headers: { 'x-core-session-id': this.store.sessionId }
        }) as Models.APIResponse;

        return response.data as Models.Store;
    }

    /**
     * Returns the cached user object of this session.
     */
    @Authorize
    public getUser(): Models.User {
        return this.store.user;
    }

    /**
     * Returns options for an item.
     * @param itemCode Item code (not to be confused with Id).
     */
    @Authorize
    @RequiresAddress
    @RequiresStore
    public async getMenuItemOptions(itemCode): Promise<any> {
        let response: Models.APIResponse = await request({
            method: 'get',
            json: true,
            uri: `${this.EFoodAPIOrigin}/api/v1/restaurants/menuitem/?item_code=${itemCode}&restaurant_id=${this.store.storeId}`,
            headers: { 'x-core-session-id': this.store.sessionId }
        }) as Models.APIResponse;

        return response;
    }

    /**
     * Adds a menu item to the cart.
     * @param itemOptions Menu item configuration.
     */
    @Authorize
    @RequiresAddress
    @RequiresStore
    @Persist
    public addToCart(itemOptions: { offer: number, comment: string, price: number, quantity: number, item: string, config: string }): void {
        this.store.cart.products.push({
            product_id: itemOptions.item,
            price: itemOptions.price || 0,
            total: itemOptions.price || 0,
            quantity: itemOptions.quantity || 1,
            offer: itemOptions.offer || null,
            materials: itemOptions.config ? itemOptions.config.split(',') : [],
            description: "",
            comment: itemOptions.comment
        });
    }

    /**
     * Makes a `validate` request with the current 
     * cart and settings
     */
    @Authorize
    @RequiresAddress
    @RequiresStore
    @RequiresCart
    public async validateOrder(): Promise<boolean> {
        let response: Models.APIResponse = await request({
            method: 'post',
            json: true,
            uri: `${this.EFoodAPIOrigin}/api/v1/order/validate/`,
            body: this.compileOrder(),
            headers: { 'x-core-session-id': this.store.sessionId }
        }) as Models.APIResponse;

        return response.status == 'ok';
    }

    /**
     * Compiles a submittable `Order` object from the cart
     * cart and configuration.
     */
    @Authorize
    @RequiresCart
    @RequiresAddress
    @RequiresStore
    public compileOrder(): Models.Order {
        let order: Models.Order = {
            created: '',
            payment_method: this.store.paymentMethod,
            discount: [],
            delivery_type: this.store.deliveryType,
            restaurant_id: this.store.storeId,
            coupons: [],
            amount: this.store.cart.products.map(p => p.total).reduce((c, e, i) => { ; return c += e; }, 0),
            address_id: this.store.addressId,
            products: this.store.cart.products
        }

        if (this.store.paymentToken)
            order.payment_token = this.store.paymentToken

        return order;
    }

    @Authorize
    public async getCreditCards(): Promise<Models.CreditCard[]> {
        let response: Models.APIResponse = await request({
            method: 'get',
            json: true,
            uri: `${this.EFoodAPIOrigin}/api/v1/ext/piraeus/methods/`,
            headers: { 'x-core-session-id': this.store.sessionId }
        }) as Models.APIResponse;

        return response.data as CreditCard[];
    }

    /**
     * Writes the current `this.store` object to the `PersistentStorePath` as json.
     */
    public async updatePersistentStore() {
        if (this.options.persistent)
            return await new Promise(r => fs.writeFile(this.PersistentStorePath, JSON.stringify(this.store), r));
    }

    /**
     * Logs the user out by deleting any local data.
     */
    @Persist
    public async logout() {
        this.store = new SessionStore();
    }

}

/**
 * Efood session options.
 */
export class SessionOptions {

    /**
     * If set to true, the session will attempt to write session
     * information in the `EFood.CachePath` location so that it can be reused.
     */
    public persistent: boolean = false;

}

/**
 * Contains information about this session. This object is saved
 * if `EFood.SessionOptions.persistent` is set to true.
 */
export class SessionStore {

    /**
     * Primary authentication identifier.
     */
    public sessionId: string;

    /**
     * The authenticated user's information.
     */
    public user: Models.User;

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

/**
 * This decorator makes sure that the persistent store will be updated after the
 * execution of this function.
 */
function Persist(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    var method = descriptor.value;
    descriptor.value = function () {
        var session: Session = this;
        var result = method.apply(session, arguments);
        if (result instanceof Promise)
            result.then(() => {
                session.updatePersistentStore();
            });
        else
            session.updatePersistentStore();
        return result;
    }
}

/**
 * This decorator makes sure that the session is authenticated.
 */
function Authorize(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    var method = descriptor.value;
    descriptor.value = function () {
        var session: Session = this;
        if (!session.isAuthenticated)
            throw new Error("This action requires authentication.");
        return method.apply(session, arguments);
    }
}

/**
 * This decorator makes sure that an address has been selected.
 */
function RequiresAddress(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    var method = descriptor.value;
    descriptor.value = function () {
        var session: Session = this;
        if (session.store.addressId == null)
            throw new Error("This action requires that an address is selected.");
        return method.apply(session, arguments);
    }
}

/**
 * This decorator makes sure that an address has been selected.
 */
function RequiresStore(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    var method = descriptor.value;
    descriptor.value = function () {
        var session: Session = this;
        if (session.store.storeId == null)
            throw new Error("This action requires that a store is selected.");
        return method.apply(session, arguments);
    }
}

/**
 * This decorator makes sure that an address has been selected.
 */
function RequiresCart(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    var method = descriptor.value;
    descriptor.value = function () {
        var session: Session = this;
        if (!session.store.cart.products.length)
            throw new Error("This action requires a cart with at least 1 product.");
        return method.apply(session, arguments);
    }
}