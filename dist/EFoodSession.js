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
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const overwriteCookies_1 = require('./overwriteCookies');
const EventEmitter2_1 = require('EventEmitter2');
const chalk = require('chalk');
const qs = require('querystring');
const fs = require('fs');
const https = require('https');
var cachePath = `${process.env.USERPROFILE}/cache.efoodgr.json`;
var requestOptions = {
    hostname: 'www.e-food.gr',
    port: 443,
    method: 'post',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
    }
};
function RequiresCart(target, propertyName, descriptor) {
    let method = descriptor.value;
    descriptor.value = function () {
        if (!this.cache.env.cart || (this.cache.env.cart && !this.cache.env.cart.items || !this.cache.env.cart.items.length))
            throw new Error(`Your cart is empty!`);
        return method.apply(this, arguments);
    };
}
function RequiresStore(target, propertyName, descriptor) {
    let method = descriptor.value;
    descriptor.value = function () {
        if (!this.cache.env.store)
            throw new Error(`You haven't selected a store!`);
        return method.apply(this, arguments);
    };
}
function RequiresAddress(target, propertyName, descriptor) {
    let method = descriptor.value;
    descriptor.value = function () {
        if (!this.cache.env.address)
            throw new Error(`You haven't set an address!`);
        return method.apply(this, arguments);
    };
}
function RequiresAuth(target, propertyName, descriptor) {
    let method = descriptor.value;
    descriptor.value = function () {
        if (!this.cache.user.id)
            throw new Error(`You are not logged in!`);
        return method.apply(this, arguments);
    };
}
class EFoodSession extends EventEmitter2_1.EventEmitter2 {
    constructor(options = {
            verbose: true,
            persistentCache: false
        }) {
        super();
        this.options = options;
        if (options.persistentCache) {
            try {
                this.cache = require(cachePath);
            }
            catch (err) { }
        }
        if (!this.cache)
            this.cache = { cookies: [], user: '', env: {} };
    }
    getItem(itemCode) {
        return __awaiter(this, void 0, void 0, function* () {
            requestOptions.path = `/popup/menu_item?item_code=${itemCode}&shop_id=${this.cache.env.store}`;
            requestOptions.method = 'get';
            let response = yield this.request(requestOptions);
            let delimiter = 'id="option_';
            let options = [];
            while (response.split(delimiter).length > 1) {
                let next = response.split(delimiter);
                next.shift();
                let tmp = next[0].split('id="choice_');
                let option = {
                    id: next[0].split('"')[0],
                    title: next[0].split(/option-name[^\>]+>/)[1].split('<')[0],
                    choices: []
                };
                options.push(option);
                tmp.shift();
                tmp.forEach(choice => option.choices.push({
                    id: choice.split('"')[0],
                    title: choice.split(/choice-title"[ ]*>/)[1].split('<')[0],
                    price: choice.split('choice-price">')[1].split('&')[0]
                }));
                response = next.join(delimiter);
            }
            return options;
        });
    }
    makeOrder(callbacks = {
            onCartUpdated: () => { },
            onOrderRequestError: () => { },
            onOrderPlaced: () => { },
            onNotApprovedYet: () => { }
        }) {
        return __awaiter(this, void 0, void 0, function* () {
            let items = this.cache.env.cart.items;
            let userAddresses = yield this.getUserAddresses();
            let address = userAddresses.filter(a => a.id === this.cache.env.address)[0];
            requestOptions.path = '/api/cart/add_item';
            requestOptions.method = 'post';
            for (let item of items)
                yield this.request(requestOptions, qs.stringify(item));
            callbacks.onCartUpdated();
            requestOptions.path = '/api/orders/send';
            let response = yield this.request(requestOptions, qs.stringify({
                orderid: 0,
                restaurantid: this.cache.env.cart.shop_id,
                addressid: this.cache.env.address,
                userid: this.cache.user.id,
                deliverytype: 0,
                actions: 0,
                cellphone: this.cache.user.cellphone,
                doorbellname: address.doorbellname,
                floor: address.floor,
                phone: this.cache.user.cellphone,
                notes: '',
                coupon_code: '',
                paymenttype: 'cash'
            }));
            yield this.updateCache();
            if (!response.success)
                return callbacks.onOrderRequestError(response);
            callbacks.onOrderPlaced();
            let statusInfo = {
                order_id: response.order.id,
                simple: 1,
                t: new Date().getTime()
            };
            let isUploaded;
            while (!isUploaded) {
                statusInfo.t = new Date().getTime();
                let requestOptions = {
                    path: '/api/orders/status?' + qs.stringify(statusInfo),
                    method: 'get',
                    hostname: 'www.e-food.gr',
                    port: 443,
                    headers: {
                        'x-efood-session-id': this.cache.user.sid
                    }
                };
                let response = yield this.request(requestOptions);
                yield new Promise(r => setTimeout(r, 3e3));
                !isUploaded && callbacks.onNotApprovedYet();
                isUploaded = response.isUploaded >= 1;
            }
            yield this.updateCache();
        });
    }
    dropCart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.env.cart = {};
            yield this.updateCache();
        });
    }
    dropAddress(addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            let requestOptions = {
                hostname: 'api.e-food.gr',
                path: `/api/v1/user/address/${addressId}/delete?_=${new Date().getTime()}`,
                method: 'get',
                headers: {
                    'x-efood-session-id': this.cache.user.sid
                }
            };
            return yield this.request(requestOptions);
        });
    }
    addAddress(addressOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = {
                id: '',
                latitude: addressOptions.lat,
                longitude: addressOptions.lon,
                street: addressOptions.street,
                street_number: addressOptions.sn,
                zip: addressOptions.zip,
                floor: addressOptions.floor,
                doorbell_name: addressOptions.name
            };
            let requestOptions = {
                hostname: 'api.e-food.gr',
                path: '/api/v1/user/address',
                method: 'post',
                headers: {
                    'content-type': 'application/json',
                    'x-efood-session-id': this.cache.user.sid
                }
            };
            return yield this.request(requestOptions, JSON.stringify(data));
        });
    }
    getCart(itemOptions) {
        if (!this.cache.env.cart)
            this.cache.env.cart = { items: [] };
        return this.cache.env.cart;
    }
    addToCart(itemOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let item = {
                shop_id: this.cache.env.store,
                item_code: itemOptions.item,
                quantity: itemOptions.quantity || 1
            };
            if (!this.cache.env.cart)
                this.cache.env.cart = { items: [] };
            if (this.cache.env.cart.shop_id != this.cache.env.store)
                this.cache.env.cart = { items: [] };
            this.cache.env.cart.shop_id = this.cache.env.store;
            this.cache.env.cart.items.push(item);
            itemOptions.config &&
                itemOptions.config.split('::').forEach(option => item[`options[${option.split(':')[0]}][]`] = option.split(':')[1].split(','));
            yield this.updateCache();
        });
    }
    getMenu() {
        return __awaiter(this, void 0, Promise, function* () {
            requestOptions.path = `/menu?shop_id=${this.cache.env.store}`;
            requestOptions.method = 'get';
            let response = yield this.request(requestOptions);
            let delimiter = 'id="IT_';
            let items = [];
            while (response.split(delimiter).length > 1) {
                let next = response.split(delimiter);
                next.shift();
                response = next.join(delimiter);
                items.push({
                    id: response.split('"')[0],
                    name: response.split('itemprop="name">')[1].split('<')[0],
                    price: response.split(/itemprop="price"[^>]*>/)[1].split('<')[0]
                });
            }
            return items;
        });
    }
    log(text) {
        if (!this.options.verbose)
            return;
        var pattern = /\[([a-z]+)\](.+)\[\/\1\]/;
        while (text && text.match && text.match(pattern))
            text = text.replace(pattern, (...args) => chalk[args[1]](args[2]));
        console.log(text);
    }
    setStore(storeId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.env.store = storeId;
            yield this.updateCache();
        });
    }
    getStores() {
        return __awaiter(this, void 0, void 0, function* () {
            requestOptions.path = `/shops?user_address=${this.cache.env.address}&delivery_type=0`;
            requestOptions.method = 'get';
            let response = yield this.request(requestOptions);
            let delimiter = 'shop-open';
            let shops = [];
            while (response.split(delimiter).length > 1) {
                let next = response.split(delimiter);
                next.shift();
                response = next.join(delimiter);
                shops.push({
                    id: response.split('data-shopid="')[1].split('"')[0],
                    name: response.split('data-shop-name="')[1].split('"')[0],
                    min: response.split('data-shop-minimum-amount="')[1].split('"')[0],
                    rating: response.split('data-shop-rating="')[1].split('"')[0],
                    eta: response.split('data-shop-delivery-eta="')[1].split('"')[0]
                });
            }
            return shops;
        });
    }
    updateCache() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.options.persistentCache)
                return yield new Promise(r => fs.writeFile(cachePath, JSON.stringify(this.cache), r));
        });
    }
    setAddress(addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.env.address = addressId;
            yield this.updateCache();
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.user = {};
            this.cache.cookies = [];
            yield new Promise(r => fs.unlink(cachePath, r));
        });
    }
    getUserAddresses() {
        return __awaiter(this, void 0, void 0, function* () {
            requestOptions.path = '/account/addresses';
            requestOptions.method = 'get';
            let response = yield this.request(requestOptions);
            let delimiter = 'data-address-id="';
            let addresses = [];
            while (response.split(delimiter).length > 1) {
                let next = response.split(delimiter);
                next.shift();
                response = next.join(delimiter);
                if (response.split('"')[0][0] === "'")
                    continue;
                addresses.push({
                    id: response.split('"')[0],
                    title: response.split('title">')[1].split('<')[0],
                    doorbellname: response.split('address-info-left">Κουδούνι')[1].split('address-info-right">')[1].split('<')[0].trim(),
                    floor: response.split('address-info-left">Όροφος')[1].split('address-info-right">')[1].split('<')[0].trim()
                });
            }
            return addresses;
        });
    }
    getUser() {
        return this.cache.user;
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = qs.stringify({
                email: username,
                pass: password
            });
            requestOptions.path = '/api/users/login';
            requestOptions.method = 'post';
            let response = yield this.request(requestOptions, data);
            if (response.success) {
                this.cache.user = response.user;
                yield this.updateCache();
            }
            return response;
        });
    }
    request(options, data) {
        return __awaiter(this, void 0, Promise, function* () {
            options.headers['Cookie'] = this.cache.cookies.join('');
            return yield new Promise(resolve => {
                delete options.headers['Content-Length'];
                if (data && !options.headers['content-type'])
                    options.headers['Content-Length'] = data.length;
                var request = https.request(options, (response) => {
                    let data = '';
                    if (response.statusCode == 301) {
                        options.path = response.headers.location.split('.gr')[1];
                        return this.request(options, data).then(resolve);
                    }
                    // Update cookies
                    overwriteCookies_1.default(response, this.cache.cookies);
                    response.on('data', chunk => data += chunk);
                    response.on('error', resolve);
                    response.on('end', () => {
                        try {
                            data = JSON.parse(data);
                        }
                        catch (err) { }
                        resolve(data);
                    });
                });
                request.on('error', resolve);
                data &&
                    request.write(data);
                request.end();
            });
        });
    }
}
__decorate([
    RequiresStore,
    RequiresAuth
], EFoodSession.prototype, "getItem", null);
__decorate([
    RequiresAddress,
    RequiresCart,
    RequiresAuth
], EFoodSession.prototype, "makeOrder", null);
__decorate([
    RequiresAuth
], EFoodSession.prototype, "dropCart", null);
__decorate([
    RequiresAuth
], EFoodSession.prototype, "dropAddress", null);
__decorate([
    RequiresAuth
], EFoodSession.prototype, "addAddress", null);
__decorate([
    RequiresCart,
    RequiresAuth
], EFoodSession.prototype, "getCart", null);
__decorate([
    RequiresStore,
    RequiresAuth
], EFoodSession.prototype, "addToCart", null);
__decorate([
    RequiresStore,
    RequiresAuth
], EFoodSession.prototype, "getMenu", null);
__decorate([
    RequiresAddress,
    RequiresAuth
], EFoodSession.prototype, "setStore", null);
__decorate([
    RequiresAddress,
    RequiresAuth
], EFoodSession.prototype, "getStores", null);
__decorate([
    RequiresAuth
], EFoodSession.prototype, "setAddress", null);
__decorate([
    RequiresAuth
], EFoodSession.prototype, "getUserAddresses", null);
__decorate([
    RequiresAuth
], EFoodSession.prototype, "getUser", null);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EFoodSession;
