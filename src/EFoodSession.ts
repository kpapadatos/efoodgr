import oc from './overwriteCookies';
import { EventEmitter2 } from 'eventemitter2';
import * as chalk from 'chalk';
import * as qs from 'querystring';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

var cachePath = `${process.env.USERPROFILE}/cache.efoodgr.json`;
var requestOptions: any = {
    hostname: 'www.e-food.gr',
    port: 443,
    method: 'post',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
    }
};

interface EFoodSessionOptions {
    verbose?: boolean,
    persistentCache?: boolean
}

interface EFoodEnvironment {
    address?: string;
    store?: string;
    cart?: any;
}

function RequiresCart(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = function() {
        if (!this.cache.env.cart || (this.cache.env.cart && !this.cache.env.cart.items || !this.cache.env.cart.items.length))
            throw new Error(`Your cart is empty!`);
        return method.apply(this, arguments);
    }
}

function RequiresStore(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = function() {
        if (!this.cache.env.store)
            throw new Error(`You haven't selected a store!`);
        return method.apply(this, arguments);
    }
}

function RequiresAddress(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = function() {
        if (!this.cache.env.address)
            throw new Error(`You haven't set an address!`);
        return method.apply(this, arguments);
    }
}

function RequiresAuth(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = function() {
        if (!this.cache.user.id)
            throw new Error(`You are not logged in!`);
        return method.apply(this, arguments);
    }
}

export default class EFoodSession extends EventEmitter2 {

    cache: {
        cookies: string[];
        user: any;
        env: EFoodEnvironment;
    };

    options: EFoodSessionOptions;

    constructor(options: EFoodSessionOptions = {
        verbose: true,
        persistentCache: false
    }) {

        super();

        this.options = options;

        if (options.persistentCache) {
            try {
                this.cache = JSON.parse(fs.readFileSync(cachePath).toString('utf8'));
            } catch (err) { }
        }

        if (!this.cache)
            this.cache = { cookies: [], user: '', env: {} }

    }

    @RequiresStore
    @RequiresAuth
    async getItem(itemCode) {

        requestOptions.path = `/popup/menu_item?item_code=${itemCode}&shop_id=${this.cache.env.store}`;
        requestOptions.method = 'get';

        let response: any = await this.request(requestOptions);

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

            tmp.forEach(choice =>
                option.choices.push({
                    id: choice.split('"')[0],
                    title: choice.split(/choice-title"[ ]*>/)[1].split('<')[0],
                    price: choice.split('choice-price">')[1].split('&')[0]
                })
            );

            response = next.join(delimiter);

        }

        return options;

    }

    @RequiresAddress
    @RequiresCart
    @RequiresAuth
    async makeOrder(callbacks: {
        onCartUpdated?(): any,
        onOrderRequestError?(any): any,
        onOrderPlaced?(): any,
        onNotApprovedYet?(): any
    } = {
            onCartUpdated: () => { },
            onOrderRequestError: () => { },
            onOrderPlaced: () => { },
            onNotApprovedYet: () => { }
        }) {

        let items = this.cache.env.cart.items;

        let userAddresses = await this.getUserAddresses();
        let address = userAddresses.filter(a => a.id === this.cache.env.address)[0];

        requestOptions.path = '/api/cart/add_item';
        requestOptions.method = 'post';

        for (let item of items)
            await this.request(requestOptions, qs.stringify(item));

        callbacks.onCartUpdated();

        requestOptions.path = '/api/orders/send';

        let response = await this.request(requestOptions, qs.stringify({
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

        await this.updateCache();

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

            let response: any = await this.request(requestOptions);

            await new Promise(r => setTimeout(r, 3e3));

            !isUploaded && callbacks.onNotApprovedYet();
            isUploaded = response.isUploaded >= 1;

        }

        await this.updateCache();

    }

    @RequiresAuth
    async dropCart() {
        this.cache.env.cart = {};
        await this.updateCache();
    }

    @RequiresAuth
    async dropAddress(addressId) {

        let requestOptions = {
            hostname: 'api.e-food.gr',
            path: `/api/v1/user/address/${addressId}/delete?_=${new Date().getTime()}`,
            method: 'get',
            headers: {
                'x-efood-session-id': this.cache.user.sid
            }
        };

        return await this.request(requestOptions);

    }

    @RequiresAuth
    async addAddress(addressOptions) {

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

        return await this.request(requestOptions, JSON.stringify(data));

    }

    @RequiresCart
    @RequiresAuth
    getCart(itemOptions) {

        if (!this.cache.env.cart)
            this.cache.env.cart = { items: [] };

        return this.cache.env.cart

    }

    @RequiresStore
    @RequiresAuth
    async addToCart(itemOptions) {

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
            itemOptions.config.split('::').forEach(option =>
                item[`options[${option.split(':')[0]}][]`] = option.split(':')[1].split(',')
            );

        await this.updateCache();

    }

    @RequiresStore
    @RequiresAuth
    async getMenu(): Promise<any[]> {

        requestOptions.path = `/menu?shop_id=${this.cache.env.store}`;
        requestOptions.method = 'get';

        let response = await this.request(requestOptions);

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

    }

    log(text) {

        if (!this.options.verbose)
            return;

        var pattern = /\[([a-z]+)\](.+)\[\/\1\]/;

        while (text && text.match && text.match(pattern))
            text = text.replace(pattern, (...args) => chalk[args[1]](args[2]));

        console.log(text);

    }

    @RequiresAddress
    @RequiresAuth
    async setStore(storeId) {
        this.cache.env.store = storeId;
        await this.updateCache();
    }

    @RequiresAddress
    @RequiresAuth
    async getStores() {

        requestOptions.path = `/shops?user_address=${this.cache.env.address}&delivery_type=0`;
        requestOptions.method = 'get';

        let response = await this.request(requestOptions);

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

    }

    async updateCache() {
        if (this.options.persistentCache)
            return await new Promise(r => fs.writeFile(cachePath, JSON.stringify(this.cache), r));
    }

    @RequiresAuth
    async setAddress(addressId) {
        this.cache.env.address = addressId;
        await this.updateCache();
    }

    async logout() {
        this.cache.user = {};
        this.cache.cookies = [];
        await new Promise(r => fs.unlink(cachePath, r));
    }

    @RequiresAuth
    async getUserAddresses() {

        requestOptions.path = '/account/addresses';
        requestOptions.method = 'get';

        let response: any = await this.request(requestOptions);

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

    }

    @RequiresAuth
    getUser() {
        return this.cache.user;
    }

    async login(username, password) {

        let data = qs.stringify({
            email: username,
            pass: password
        });

        requestOptions.path = '/api/users/login';
        requestOptions.method = 'post';

        let response: any = await this.request(requestOptions, data);

        if (response.success) {
            this.cache.user = response.user;
            await this.updateCache();
        }

        return response;

    }

    async request(options: any, data?: any): Promise<any> {
        options.headers['Cookie'] = this.cache.cookies.join('');
        return await new Promise(resolve => {
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
                oc(response, this.cache.cookies);

                response.on('data', chunk => data += chunk);
                response.on('error', resolve);
                response.on('end', () => {
                    try {
                        data = JSON.parse(data);
                    } catch (err) { }
                    resolve(data);
                });
            });
            request.on('error', resolve);

            data &&
                request.write(data);

            request.end();
        });
    }

}
