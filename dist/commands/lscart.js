"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var session;
function default_1(program, s) {
    session = s;
    program
        .command('lscart')
        .description('Lists all cart items.')
        .action(handler)
        .consoleHandler = handler;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        let cart = session.getCart(cmd);
        session.log(`Shop Id: [cyan]${cart.shop_id}[/cyan]`);
        cart.items.forEach(i => session.log(`[cyan]${JSON.stringify(i)}[/cyan]`));
    });
}
;
