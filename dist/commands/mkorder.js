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
        .command('mkorder')
        .description('Places the order.')
        .action(handler)
        .consoleHandler = handler;
}
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Placing order...');
        if (session.store.paymentMethod == 'piraeus.creditcard') {
            let cards = yield session.getCreditCards();
            session.store.paymentToken =
                cards.filter(c => c.hashcode == session.store.paymentHashcode)[0].id;
        }
        yield session.validateOrder();
        let orderId = yield session.submitOrder();
        if (orderId) {
            let orderStatus;
            do {
                orderStatus = yield session.getOrderStatus(orderId);
                yield new Promise(r => setTimeout(r, 3e3));
            } while (orderStatus.status == 'submitted');
            if (orderStatus.status == 'accepted')
                console.log(c.green(`Order complete! Delivery time: ${orderStatus.delivery_time}'`));
            else
                console.log(c.red('Order failed.'));
        }
        else
            console.log(c.red('Order failed. No orderId.'));
    });
}
;
