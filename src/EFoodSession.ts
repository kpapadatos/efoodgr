const oc = require('./overwriteCookies');

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
        if (!this.cache.env.cart || (this.cache.env.cart && !this.cache.env.cart.length))
            return this.log(`Your cart is empty!`);
        method.apply(this, arguments);
    }
}

function RequiresStore(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = function() {
        if (!this.cache.env.store)
            return this.log(`You haven't selected a store!`);
        method.apply(this, arguments);
    }
}

function RequiresAddress(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = function() {
        if (!this.cache.env.address)
            return this.log(`You haven't set an address!`);
        method.apply(this, arguments);
    }
}

function RequiresAuth(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = function() {
        if (!this.cache.user.id)
            return this.log(`You are not logged in!`);
        method.apply(this, arguments);
    }
}

export default class EFoodSession {

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

        this.options = options;

        if (options.persistentCache) {
            try {
                this.cache = require(cachePath);
            } catch (err) { }
        }

        if (!this.cache)
            this.cache = { cookies: [], user: '', env: {} }

    }

    @RequiresStore
    @RequiresAuth
    async getItem(itemCode) {

        this.log(`Getting item [cyan]${itemCode}[/cyan] info...`);

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

        for (let option of options) {
            this.log(`[cyan][${option.id}] ${option.title}[/cyan]`);

            for (let choice of option.choices)
                this.log(`    [cyan][${choice.id}] [${choice.price.trim()}€] ${choice.title}[/cyan]`);
        }

    }

    @RequiresAddress
    @RequiresCart
    @RequiresAuth
    async makeOrder() {

      this.log('Placing order...');

      let items = this.cache.env.cart.items;

      requestOptions.path = '/api/cart/add_item';
      requestOptions.method = 'post';

      for(let item of items)
         await this.request(requestOptions, qs.stringify(item));

      this.log('Cart updated. Sending final order request...');

      requestOptions.path = '/api/orders/send';

      let response: any = await this.request(requestOptions, qs.stringify({
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

      if(!response.success)
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

      while(!isUploaded) {
         let response = await new Promise<any>(r =>
            setTimeout(() => this.request(requestOptions).then(r), 3e3)
         );

         console.log(response);
         console.log(response.isUploaded);
         console.log(requestOptions.path);

         !isUploaded && this.log('Not approved yet. Checking again...');
         isUploaded = response.isUploaded == 1;
      }


      this.log('[green]Order complete![/green]');

    }

    @RequiresAuth
    async dropCart() {

      this.cache.env.cart = {};
      await this.updateCache();

      this.log('Cart emptied.');

    }

    @RequiresAuth
    async addAddress(addressOptions) {

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

      let response: any = await this.request(requestOptions, JSON.stringify(data));
      if(response.error_code != 'success')
        return this.log(`[red]There was an error adding this address: [/red] ${response.message}`)

      this.log('[green]Success![/green]');

    }

    @RequiresCart
    @RequiresAuth
    async getCart(itemOptions) {

        if (!this.cache.env.cart)
            this.cache.env.cart = { items: [] };

        this.log(`Shop Id: [cyan]${this.cache.env.cart.shop_id}[/cyan]`);

        this.cache.env.cart.items.forEach(i => this.log(`[cyan]${JSON.stringify(i)}[/cyan]`));

    }

    @RequiresStore
    @RequiresAuth
    async addToCart(itemOptions) {

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
            itemOptions.config.split('::').forEach(option =>
                item[`options[${option.split(':')[0]}][]`] = option.split(':')[1].split(',')
            );

        await this.updateCache();
        this.log(`[green]Done.[/green]`);

    }

    @RequiresStore
    @RequiresAuth
    async getMenu() {

        this.log(`Getting menu for [cyan]${this.cache.env.store}[/cyan] ...`);

        requestOptions.path = `/menu?shop_id=${this.cache.env.store}`;
        requestOptions.method = 'get';

        let response: any = await this.request(requestOptions);

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
        this.log(`Setting store to [cyan]${storeId}[/cyan] ...`);
        this.cache.env.store = storeId;
        await this.updateCache();
        this.log(`[green]Success![/green]`);
    }

    @RequiresAddress
    @RequiresAuth
    async listStores() {

        this.log(`Getting stores for address [cyan]${this.cache.env.address}[/cyan] ...`);

        requestOptions.path = `/shops?user_address=${this.cache.env.address}&delivery_type=0`;
        requestOptions.method = 'get';

        let response: any = await this.request(requestOptions);

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

    }

    async updateCache() {
        if (this.options.persistentCache)
            return await new Promise(r => fs.writeFile(cachePath, JSON.stringify(this.cache), r));
    }

    @RequiresAuth
    async setAddress(addressId) {

        this.log(`Setting user address to [cyan]${addressId}[/cyan] ...`);

        this.cache.env.address = addressId;
        await this.updateCache();

        this.log(`[green]Success![/green]`)

    }

    async logout() {

        this.log(`Deleting all local data...`);

        this.cache.user = {};
        this.cache.cookies = [];
        await new Promise(r => fs.unlink(cachePath, r));

        this.log('[green]Success![/green]');

    }

    @RequiresAuth
    async getUserAddresses() {

        this.log('Getting addresses...');

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
                title: response.split('title">')[1].split('<')[0]
            });

        }

        for (let address of addresses)
            this.log(`[cyan][${address.id}] ${address.title}[/cyan]`);

    }

    @RequiresAuth
    getUser() {

        let u = this.cache.user;
        this.log(`Logged in as [cyan][${u.id}] ${u.firstName} ${u.lastName} (${u.email})[/cyan].`);

    }

    async login(username, password) {

        this.log(`Logging in as [cyan]${username}[/cyan] ...`);

        let data = qs.stringify({
            email: username,
            pass: password
        });

        requestOptions.path = '/api/users/login';
        requestOptions.method = 'POST';

        let response: any = await this.request(requestOptions, data);

        if (response.success) {

            this.cache.user = response.user;

            await this.updateCache();

            this.log(`[green]Success![/green]`);

        }
        else this.log(`[red]Login failed:[/red] ${response.error.err_msg}`);

    }

    async request(options: any, data?: any) {
        options.headers['Cookie'] = this.cache.cookies.join('');
        return await new Promise(resolve => {
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
