"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const c = require("chalk");
const inquirer = require("inquirer");
var session;
function default_1(program, s) {
    session = s;
    program
        .command('setstore [storeId]')
        .description('Sets the store.')
        .action(handler)
        .consoleHandler = function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Getting stores for address ${c.cyan(session.store.addressId)} ...`);
            let addresses = yield session.getUserAddresses();
            let address = addresses.filter(a => a.id == session.store.addressId)[0];
            let shops = yield session.getStores({
                latitude: address.latitude,
                longitude: address.longitude,
                onlyOpen: true
            });
            let listOptions = [];
            for (let shop of shops)
                listOptions.push(`[${shop.average_rating}*] [${shop.minimum_order}€] [${shop.delivery_eta}min] ${shop.title}`);
            yield new Promise(resolve => inquirer.prompt([{
                    name: 'setstore',
                    message: 'Select a store',
                    type: 'list',
                    choices: listOptions
                }]).then(function (input) {
                return __awaiter(this, void 0, void 0, function* () {
                    let storeId = shops[listOptions.indexOf(input.setstore)].id;
                    console.log(`Setting store to ${c.cyan(storeId)} ...`);
                    yield session.setStore(storeId);
                    console.log(c.green(`Success!`));
                    resolve();
                });
            }));
        });
    };
}
exports.default = default_1;
function handler(storeId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Setting store to ${c.cyan(storeId)} ...`);
        yield session.setStore(storeId);
        console.log(c.green(`Success!`));
    });
}
;
