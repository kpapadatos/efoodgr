<img src="https://avatars2.githubusercontent.com/u/15088210?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# efoodgr
An unofficial tool to manage your efood.gr account and place orders.

## Contents
* [Installation](#installation)
* [EFoodSession class](#efoodsession-class)
* [CLI usage](#cli-usage)
* [Console usage](#console-usage)
* [Build](#build)
* [Contribute](#contribute)
* [License](#license)

### Installation
`npm i -g efoodgr`

### EFoodSession class
Usage:
```ts
import EFoodSession from 'efoodgr';

// Persistent cache stores session cookies in process.env.USERPROFILE
let session = new EFoodSession({ persistentCache: true });

(async function main() {

  await session.login('your.email@efood.gr', 'your-password');
  
  let addresses = await session.getUserAddresses();
  
  await session.setAddress(addresses[0].id);
  
  let nearbyStores = await session.getStores();
  
  await session.setStore(nearbyStores[0].id);
  
  let menu = await session.getMenu();
  
  let menuItem = menu[0];
  
  // TODO write the rest of this process...
  // ... add items with session.addCart(itemOptions)
  
  await session.makeOrder();

})();

```

### CLI Usage
  `efood <command> [options]`

  Get help for each command with
  `efood <command> --help`

  Commands:

    login|l [options]              Log in with your efood.gr account.
    menu                           Gets the menu of the selected store.
    dropaddr [addressId]           Removes address from your account.
    setstore [storeId]             Sets the store.
    addaddress|addaddr [options]   Adds an address to your account.
    addcart|ac [options]           Adds cart entry.
    mkorder                        Places the order.
    dropcart                       Empties the cart.
    lscart                         Lists all cart items.
    item|i [itemCode]              Gets menu item info.
    ls                             Lists stores for current address.
    logout|lo                      Removes all local data.
    setaddr [addressId]            Sets the current address.
    lsaddr                         Lists the current user's addresses.
    user|u                         Shows current user info.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

### Console usage
Just type `efood` to enter the console and then `help` to see available commands. Not all commands exist/behave the same in the console environment.

### Build
If you want to build this package into a standalone binary for your OS, you can use [nexe](https://github.com/jaredallard/nexe)
```sh
npm i -g nexe
git clone https://github.com/raelgor/efoodgr
cd efoodgr
npm i
nexe -i bin/efood.js -o efood.exe
```

#### Notes
- It may take some time as it downloads the latest NodeJS source and builds it.
- If you get some errors about 'try-thread-sleep' and 'thread-sleep' modules missing, you may need to create their folders in node_modules with a dummy `package.json` to fool browserify that they exist.

### Contribute
Feel free to propose changes and/or add features. Future plans include:

- Payment method support (PayPal/Credit card)
- Order presets
- Use API instead of scrapping
- Tests

#### Guidelines
This is a nodejs/typescipt/gulp project and should remain so. Before you go into trouble writing in different technologies, email me first at kosmas.papadatos@gmail.com

### License
(The MIT License)

Copyright (c) 2015 Kosmas Papadatos <kosmas.papadatos@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
