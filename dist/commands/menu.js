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
        .command('menu')
        .description('Gets the menu of the selected store.')
        .action(handler);
}
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Getting menu for ${c.cyan(session.store.storeId)} ...`);
        let store = yield session.getStore();
        let items = store.menu.categories;
        for (let item of items)
            for (let product of item.items)
                console.log(c.cyan(`[${product.code}] [${product.price}€] ${product.name}`));
    });
}
;
