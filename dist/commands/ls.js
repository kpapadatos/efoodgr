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
var session;
function default_1(program, s) {
    session = s;
    program
        .command('ls')
        .description('Lists stores for current address.')
        .action(handler)
        .consoleHandler = handler;
}
exports.default = default_1;
function handler() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Getting stores for address ${c.cyan(session.store.addressId)} ...`);
        let addresses = yield session.getUserAddresses();
        let address = addresses.filter(a => a.id == session.store.addressId)[0];
        let shops = yield session.getStores({
            latitude: address.latitude,
            longitude: address.longitude,
            onlyOpen: true
        });
        for (let shop of shops)
            console.log(c.cyan(`[${shop.id}] [${shop.average_rating}*] [${shop.minimum_order}€] [${shop.delivery_eta}min] ${shop.title}`));
    });
}
;
