"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
const fs = require("fs");
const Models = require("../models/index");
/**
 * Represents an authenticated session with e-food.gr.
 */
class Session {
    constructor(options = new SessionOptions()) {
        this.options = options;
        /**
         * The path to save session data.
         */
        this.PersistentStorePath = `${process.env.USERPROFILE}/.cache.efoodgr.json`;
        /**
         * The API origin of e-food.gr.
         */
        this.EFoodAPIOrigin = 'https://api.e-food.gr';
        this.store = new SessionStore();
        // Try to load the last session if persistent was set to true
        if (options.persistent) {
            try {
                this.store = require(this.PersistentStorePath);
            }
            catch (err) {
                // No file found or the file was corrupted
            }
        }
    }
    setPayment(paymentOptions) {
        this.store.paymentHashcode = paymentOptions.paymentHashcode;
        this.store.paymentToken = paymentOptions.paymentToken;
        this.store.paymentMethod = paymentOptions.paymentMethod;
    }
    /**
     * Attempts to authenticate and store a `sessionId` on success.
     * @param email The user's email.
     * @param password The user's password.
     */
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request({
                method: 'post',
                json: true,
                uri: `${this.EFoodAPIOrigin}/api/v1/user/login`,
                body: { email, password }
            });
            if (response.status == 'ok') {
                this.store.sessionId = response.data.session_id;
                this.store.user = trimName(response.data.user);
            }
            return response.status == 'ok';
        });
    }
    /**
     * Returns authentication status based on the existence
     * of a session token in `this.store`.
     */
    get isAuthenticated() {
        return Boolean(this.store.sessionId);
    }
    /**
     * Validates an authenticated session by testing its `sessionId`
     * with a statistics call.
     */
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request({
                method: 'get',
                json: true,
                uri: `${this.EFoodAPIOrigin}/api/v1/user/statistics`,
                headers: { 'x-core-session-id': this.store.sessionId }
            });
            return response.status == 'ok';
        });
    }
    /**
     * Returns an array with the user's addresses.
     */
    getUserAddresses() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request({
                method: 'get',
                json: true,
                uri: `${this.EFoodAPIOrigin}/api/v1/user/clients/address`,
                headers: { 'x-core-session-id': this.store.sessionId }
            });
            return response.data;
        });
    }
    /**
     * Sets the default address for the current session.
     */
    setAddress(addressId) {
        this.store.addressId = addressId;
    }
    /**
     * Returns stores for the given coordinates.
     * @param parameters Location parameters and filters.
     */
    getStores(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request({
                method: 'get',
                json: true,
                uri: `${this.EFoodAPIOrigin}/api/v1/restaurants/?filters=%7B%0A%0A%7D&latitude=${parameters.latitude}&longitude=${parameters.longitude}&mode=filter&version=3`,
                headers: { 'x-core-session-id': this.store.sessionId }
            });
            return response.data.restaurants;
        });
    }
    /**
     * Submits the order and returns an order number.
     */
    submitOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request({
                method: 'post',
                json: true,
                uri: `${this.EFoodAPIOrigin}/api/v1/order/submit/`,
                body: this.compileOrder(),
                headers: { 'x-core-session-id': this.store.sessionId }
            });
            return response.status == 'ok' && response.data.order_id;
        });
    }
    /**
     * Gets an order status by Id.
     */
    getOrderStatus(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request({
                method: 'get',
                json: true,
                uri: `${this.EFoodAPIOrigin}/api/v1/order/status/${orderId}/`,
                headers: { 'x-core-session-id': this.store.sessionId }
            });
            return response.data;
        });
    }
    /**
     * Sets the `storeId` for the current store.
     * @param storeId The store's Id.
     */
    setStore(storeId) {
        if (storeId != this.store.storeId)
            this.store.cart = new Models.Cart();
        this.store.storeId = storeId;
    }
    /**
     * Gets the menu of a store.
     */
    getStore() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request({
                method: 'get',
                json: true,
                uri: `${this.EFoodAPIOrigin}/api/v1/restaurants/${this.store.storeId}`,
                headers: { 'x-core-session-id': this.store.sessionId }
            });
            return response.data;
        });
    }
    /**
     * Returns the cached user object of this session.
     */
    getUser() {
        return this.store.user;
    }
    /**
     * Returns options for an item.
     * @param itemCode Item code (not to be confused with Id).
     */
    getMenuItemOptions(itemCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request({
                method: 'get',
                json: true,
                uri: `${this.EFoodAPIOrigin}/api/v1/restaurants/menuitem/?item_code=${itemCode}&restaurant_id=${this.store.storeId}`,
                headers: { 'x-core-session-id': this.store.sessionId }
            });
            return response;
        });
    }
    /**
     * Adds a menu item to the cart.
     * @param itemOptions Menu item configuration.
     */
    addToCart(itemOptions) {
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
    validateOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request({
                method: 'post',
                json: true,
                uri: `${this.EFoodAPIOrigin}/api/v1/order/validate/`,
                body: this.compileOrder(),
                headers: { 'x-core-session-id': this.store.sessionId }
            });
            return response.status == 'ok';
        });
    }
    /**
     * Compiles a submittable `Order` object from the cart
     * cart and configuration.
     */
    compileOrder() {
        let order = {
            created: '',
            payment_method: this.store.paymentMethod,
            discount: [],
            delivery_type: this.store.deliveryType,
            restaurant_id: this.store.storeId,
            coupons: [],
            amount: this.store.cart.products.map(p => p.total).reduce((c, e, i) => { ; return c += e; }, 0),
            address_id: this.store.addressId,
            products: this.store.cart.products
        };
        if (this.store.paymentToken)
            order.payment_token = this.store.paymentToken;
        return order;
    }
    getCreditCards() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield request({
                method: 'get',
                json: true,
                uri: `${this.EFoodAPIOrigin}/api/v1/ext/piraeus/methods/`,
                headers: { 'x-core-session-id': this.store.sessionId }
            });
            return response.data;
        });
    }
    /**
     * Writes the current `this.store` object to the `PersistentStorePath` as json.
     */
    updatePersistentStore() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.options.persistent)
                return yield new Promise(r => fs.writeFile(this.PersistentStorePath, JSON.stringify(this.store), r));
        });
    }
    /**
     * Logs the user out by deleting any local data.
     */
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.store = new SessionStore();
        });
    }
}
__decorate([
    Persist
], Session.prototype, "setPayment", null);
__decorate([
    Persist
], Session.prototype, "login", null);
__decorate([
    Authorize
], Session.prototype, "validate", null);
__decorate([
    Authorize
], Session.prototype, "getUserAddresses", null);
__decorate([
    Authorize,
    Persist
], Session.prototype, "setAddress", null);
__decorate([
    Authorize,
    RequiresAddress
], Session.prototype, "getStores", null);
__decorate([
    Authorize,
    RequiresAddress,
    RequiresStore,
    RequiresCart
], Session.prototype, "submitOrder", null);
__decorate([
    Authorize
], Session.prototype, "getOrderStatus", null);
__decorate([
    Authorize,
    RequiresAddress,
    Persist
], Session.prototype, "setStore", null);
__decorate([
    Authorize,
    RequiresAddress,
    RequiresStore
], Session.prototype, "getStore", null);
__decorate([
    Authorize
], Session.prototype, "getUser", null);
__decorate([
    Authorize,
    RequiresAddress,
    RequiresStore
], Session.prototype, "getMenuItemOptions", null);
__decorate([
    Authorize,
    RequiresAddress,
    RequiresStore,
    Persist
], Session.prototype, "addToCart", null);
__decorate([
    Authorize,
    RequiresAddress,
    RequiresStore,
    RequiresCart
], Session.prototype, "validateOrder", null);
__decorate([
    Authorize,
    RequiresCart,
    RequiresAddress,
    RequiresStore
], Session.prototype, "compileOrder", null);
__decorate([
    Authorize
], Session.prototype, "getCreditCards", null);
__decorate([
    Persist
], Session.prototype, "logout", null);
exports.Session = Session;
/**
 * Efood session options.
 */
class SessionOptions {
    constructor() {
        /**
         * If set to true, the session will attempt to write session
         * information in the `EFood.CachePath` location so that it can be reused.
         */
        this.persistent = false;
    }
}
exports.SessionOptions = SessionOptions;
/**
 * Contains information about this session. This object is saved
 * if `EFood.SessionOptions.persistent` is set to true.
 */
class SessionStore {
    constructor() {
        /**
         * The current cart.
         */
        this.cart = new Models.Cart();
        /**
         * Payment method selected.
         */
        this.paymentMethod = 'cash';
        /**
         * Delivery type.
         */
        this.deliveryType = 'delivery';
    }
}
exports.SessionStore = SessionStore;
/**
 * This decorator makes sure that the persistent store will be updated after the
 * execution of this function.
 */
function Persist(target, propertyName, descriptor) {
    var method = descriptor.value;
    descriptor.value = function () {
        var session = this;
        var result = method.apply(session, arguments);
        if (result instanceof Promise)
            result.then(() => {
                session.updatePersistentStore();
            });
        else
            session.updatePersistentStore();
        return result;
    };
}
/**
 * This decorator makes sure that the session is authenticated.
 */
function Authorize(target, propertyName, descriptor) {
    var method = descriptor.value;
    descriptor.value = function () {
        var session = this;
        if (!session.isAuthenticated)
            throw new Error("This action requires authentication.");
        return method.apply(session, arguments);
    };
}
/**
 * This decorator makes sure that an address has been selected.
 */
function RequiresAddress(target, propertyName, descriptor) {
    var method = descriptor.value;
    descriptor.value = function () {
        var session = this;
        if (session.store.addressId == null)
            throw new Error("This action requires that an address is selected.");
        return method.apply(session, arguments);
    };
}
/**
 * This decorator makes sure that an address has been selected.
 */
function RequiresStore(target, propertyName, descriptor) {
    var method = descriptor.value;
    descriptor.value = function () {
        var session = this;
        if (session.store.storeId == null)
            throw new Error("This action requires that a store is selected.");
        return method.apply(session, arguments);
    };
}
/**
 * This decorator makes sure that an address has been selected.
 */
function RequiresCart(target, propertyName, descriptor) {
    var method = descriptor.value;
    descriptor.value = function () {
        var session = this;
        if (!session.store.cart.products.length)
            throw new Error("This action requires a cart with at least 1 product.");
        return method.apply(session, arguments);
    };
}
function trimName(user) {
    console.log(user);
    user.first_name = user.first_name.trim();
    user.last_name = user.last_name.trim();
    console.log(user);
    return user;
}
