'use strict';

var qs = require('querystring');
var https = require('https');
var uc = require('./overwriteCookies.js');
var options = {
  hostname: 'www.e-food.gr',
  port: 443,
  path: '/api/users/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
	 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
  }
};

module.exports.Session = class EFoodSession {

  constructor(config) {

    this.config = config;
    this.cookies = [];

  }

  get cookieString() {
    return this.cookies.join('');
  }

  // login
  login() {

    return new Promise((resolve) => {

      let data = qs.stringify({

        email: this.config.email,
        pass: this.config.pass

      });

      options.path = '/api/users/login';
      options.method = 'POST';

      this._post(options, data).then(resolve);

    });

  }

  // calculate_price
  calculate_price(itemInfo) {

    return new Promise((resolve) => {

      let data = qs.stringify(itemInfo);

      options.path = '/api/menu/calculate_price';
      options.method = 'POST';

      this._post(options, data).then(resolve);

    });

  }

  // add_item
  add_item(itemInfo, cookie) {

    return new Promise((resolve) => {

      let data = qs.stringify(itemInfo);

      options.path = '/api/cart/add_item';
      options.headers['Cookie'] = this.cookieString;
      options.method = 'POST';

      this._post(options, data).then(resolve);

    });

  }

  // get
  get(info, cookie) {

    return new Promise((resolve) => {

      let data = '';

      options.path = '/api/cart/get?' + qs.stringify(info);
      options.headers['Cookie'] = this.cookieString;
      options.method = 'GET';

      this._post(options, data).then(resolve);

    });

  }

  // menu
  menu(info, cookie) {

    return new Promise((resolve) => {

      let data = '';

      options.path = '/menu?' + qs.stringify(info);
      options.headers['Cookie'] = this.cookieString;
      options.method = 'POST';

      this._post(options, data).then(resolve);

    });

  }

  // send
  send(info, cookie) {

    return new Promise((resolve) => {

      let data = qs.stringify(info);

      options.path = '/api/orders/send';
      options.headers['Cookie'] = this.cookieString;
      options.method = 'POST';

      this._post(options, data).then(resolve);

    });

  }

  // status
  status(info) {

    return new Promise((resolve) => {

      let data = '';

      options.path = '/api/orders/status?' + qs.stringify(info);
      options.headers['Cookie'] = this.cookieString;
      options.method = 'GET';

      this._post(options, data).then(resolve);

    });

  }

  // internal post
  _post(options, data) {

    return new Promise((resolve) => {

      options.headers['Content-Length'] = data.length;

      var request = https.request(options, (response) => {

        let data = '';

        // update cookies
        uc(response, this.cookies);

        response.on('data', (chunk) => data += chunk);
        response.on('error', resolve);
        response.on('end', () => {

          try {

            data = JSON.parse(data);

          } catch(err) {}

          resolve(data);

        });

      });

      request.on('error', resolve);
      request.write(data);
      request.end();

    });

  }

}
