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
        .command('lscart')
        .description('Lists all cart items.')
        .action(handler)
        .consoleHandler = handler;
}
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Getting cart contents...\n');
        let cart = session.store.cart;
        let store = yield session.getStore();
        let cartItems = (yield Promise.all(session.store.cart.products
            .map(p => session.getMenuItemOptions(p.product_id)
            .then(r => `[${p.total}€] ${r.data.name}`))));
        console.log(`Store: ${c.cyan(store.information.title)}`);
        console.log('\nCart contents');
        for (let cartItem of cartItems)
            console.log(c.cyan(cartItem));
        console.log();
    });
}
;
