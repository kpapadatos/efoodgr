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
const oc = require('./overwriteCookies');
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
            return this.log(`Your cart is empty!`);
        method.apply(this, arguments);
    };
}
function RequiresStore(target, propertyName, descriptor) {
    let method = descriptor.value;
    descriptor.value = function () {
        if (!this.cache.env.store)
            return this.log(`You haven't selected a store!`);
        method.apply(this, arguments);
    };
}
function RequiresAddress(target, propertyName, descriptor) {
    let method = descriptor.value;
    descriptor.value = function () {
        if (!this.cache.env.address)
            return this.log(`You haven't set an address!`);
        method.apply(this, arguments);
    };
}
function RequiresAuth(target, propertyName, descriptor) {
    let method = descriptor.value;
    descriptor.value = function () {
        if (!this.cache.user.id)
            return this.log(`You are not logged in!`);
        method.apply(this, arguments);
    };
}
class EFoodSession {
    constructor(options = {
            verbose: true,
            persistentCache: false
        }) {
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
            this.log(`Getting item [cyan]${itemCode}[/cyan] info...`);
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
            for (let option of options) {
                this.log(`[cyan][${option.id}] ${option.title}[/cyan]`);
                for (let choice of option.choices)
                    this.log(`    [cyan][${choice.id}] [${choice.price.trim()}€] ${choice.title}[/cyan]`);
            }
        });
    }
    makeOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('Placing order...');
            let items = this.cache.env.cart.items;
            requestOptions.path = '/api/cart/add_item';
            requestOptions.method = 'post';
            for (let item of items)
                yield this.request(requestOptions, qs.stringify(item));
            this.log('Cart updated. Sending final order request...');
            requestOptions.path = '/api/orders/send';
            let response = yield this.request(requestOptions, qs.stringify({
                orderid: 0,
                restaurantid: this.cache.env.cart.shop_id,
                addressid: this.cache.env.address,
                userid: this.cache.user.id,
                deliverytype: 0,
                actions: 0,
                //  amount: getResponse.cart.total_sum,
                cellphone: this.cache.user.cellphone,
                doorbellname: `${this.cache.user.firstName} ${this.cache.user.lastName}`,
                //  floor: config.floor,
                phone: this.cache.user.cellphone,
                notes: '',
                coupon_code: '',
                paymenttype: 'cash'
            }));
            if (!response.success)
                return this.log(`An error occured while placing the order: [red]${JSON.stringify(response)}[/red]`);
            this.log(`Order placed. Awaiting approval...`);
            let statusInfo = {
                order_id: response.order.id,
                simple: 1,
                t: new Date().getTime()
            };
            requestOptions.path = '/api/orders/status?' + qs.stringify(statusInfo);
            requestOptions.method = 'get';
            let isUploaded;
            while (!isUploaded) {
                let response = yield new Promise(r => setTimeout(() => this.request(requestOptions).then(r), 3e3));
                console.log(response);
                console.log(response.isUploaded);
                console.log(requestOptions.path);
                !isUploaded && this.log('Not approved yet. Checking again...');
                isUploaded = response.isUploaded == 1;
            }
            this.log('[green]Order complete![/green]');
        });
    }
    dropCart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.env.cart = {};
            yield this.updateCache();
            this.log('Cart emptied.');
        });
    }
    dropAddress(addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Removing address [cyan]${addressId}[/cyan] from your account...`);
            let requestOptions = {
                hostname: 'api.e-food.gr',
                path: `/api/v1/user/address/${addressId}/delete?_=${new Date().getTime()}`,
                method: 'get',
                headers: {
                    'x-efood-session-id': this.cache.user.sid
                }
            };
            let response = yield this.request(requestOptions);
            if (response.error_code != 'success')
                return this.log(`[red]Error removing address:[/red] ${response.message}`);
            this.log(`[green]Success![/green]`);
        });
    }
    addAddress(addressOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Adding address to your account...`);
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
            let response = yield this.request(requestOptions, JSON.stringify(data));
            if (response.error_code != 'success')
                return this.log(`[red]There was an error adding this address: [/red] ${response.message}`);
            this.log('[green]Success![/green]');
        });
    }
    getCart(itemOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cache.env.cart)
                this.cache.env.cart = { items: [] };
            this.log(`Shop Id: [cyan]${this.cache.env.cart.shop_id}[/cyan]`);
            this.cache.env.cart.items.forEach(i => this.log(`[cyan]${JSON.stringify(i)}[/cyan]`));
        });
    }
    addToCart(itemOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Adding item to cart...`);
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
            this.log(`[green]Done.[/green]`);
        });
    }
    getMenu() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Getting menu for [cyan]${this.cache.env.store}[/cyan] ...`);
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
            for (let item of items)
                this.log(`[cyan][IT_${item.id}] [${item.price}€] ${item.name}[/cyan]`);
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
            this.log(`Setting store to [cyan]${storeId}[/cyan] ...`);
            this.cache.env.store = storeId;
            yield this.updateCache();
            this.log(`[green]Success![/green]`);
        });
    }
    listStores() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Getting stores for address [cyan]${this.cache.env.address}[/cyan] ...`);
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
            for (let shop of shops)
                this.log(`[cyan][${shop.id}] [${shop.rating}*] [${shop.min}€] [${shop.eta}min] ${shop.name}[/cyan]`);
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
            this.log(`Setting user address to [cyan]${addressId}[/cyan] ...`);
            this.cache.env.address = addressId;
            yield this.updateCache();
            this.log(`[green]Success![/green]`);
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Deleting all local data...`);
            this.cache.user = {};
            this.cache.cookies = [];
            yield new Promise(r => fs.unlink(cachePath, r));
            this.log('[green]Success![/green]');
        });
    }
    getUserAddresses() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('Getting addresses...');
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
                    title: response.split('title">')[1].split('<')[0]
                });
            }
            for (let address of addresses)
                this.log(`[cyan][${address.id}] ${address.title}[/cyan]`);
        });
    }
    getUser() {
        let u = this.cache.user;
        this.log(`Logged in as [cyan][${u.id}] ${u.firstName} ${u.lastName} (${u.email})[/cyan].`);
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Logging in as [cyan]${username}[/cyan] ...`);
            let data = qs.stringify({
                email: username,
                pass: password
            });
            requestOptions.path = '/api/users/login';
            requestOptions.method = 'POST';
            let response = yield this.request(requestOptions, data);
            if (response.success) {
                this.cache.user = response.user;
                yield this.updateCache();
                this.log(`[green]Success![/green]`);
            }
            else
                this.log(`[red]Login failed:[/red] ${response.error.err_msg}`);
        });
    }
    request(options, data) {
        return __awaiter(this, void 0, void 0, function* () {
            options.headers['Cookie'] = this.cache.cookies.join('');
            return yield new Promise(resolve => {
                if (data && !options.headers['content-type'])
                    options.headers['Content-Length'] = data.length;
                var request = https.request(options, (response) => {
                    let data = '';
                    if (response.statusCode == 301) {
                        options.path = response.headers.location.split('.gr')[1];
                        return this.request(options, data).then(resolve);
                    }
                    // Update cookies
                    oc(response, this.cache.cookies);
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
], EFoodSession.prototype, "listStores", null);
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
