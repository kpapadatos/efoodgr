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
        .command('mkorder')
        .description('Places the order.')
        .action(handler)
        .consoleHandler = handler;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        session.log('Placing order...');
        yield session.makeOrder({
            onCartUpdated() {
                session.log('Cart updated. Sending final order request...');
            },
            onOrderRequestError(response) {
                session.log(`An error occured while placing the order: [red]${JSON.stringify(response)}[/red]`);
            },
            onOrderPlaced() {
                session.log(`Order placed. Awaiting approval...`);
            },
            onNotApprovedYet() {
                session.log('Not approved yet. Checking again...');
            }
        });
        session.log('[green]Order complete![/green]');
    });
}
;
