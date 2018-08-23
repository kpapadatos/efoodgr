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
const inquirer = require("inquirer");
const c = require("chalk");
var session;
function default_1(program, s) {
    session = s;
    program
        .command('payment')
        .description('Sets the payment.')
        .option('-t, --type [paymentTime]', 'Payment type.')
        .option('--token [paymentToken]', 'Payment token, if not paying with cash.')
        .option('--hash [paymentHashcode]', 'Payment hashcode.')
        .action(handler)
        .consoleHandler = function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Getting payment methods ...`);
            let store = yield session.getStore();
            let choices = [];
            if (store.information.has_cash_on_delivery)
                choices.push('Cash');
            if (store.information.has_credit)
                choices.push('Credit card');
            let input = yield inquirer.prompt([{
                    name: 'method',
                    message: 'Select a payment method',
                    type: 'list',
                    choices
                }]);
            if (input.method == 'Cash') {
                session.setPayment({
                    paymentMethod: 'cash',
                    paymentToken: null,
                    paymentHashcode: null
                });
            }
            if (input.method == 'Credit card') {
                let cards = yield session.getCreditCards();
                let input = yield inquirer.prompt([{
                        name: 'card',
                        message: 'Select a card',
                        type: 'list',
                        choices: cards.map(c => `[${c.card_type}] ${c.card_number}`)
                    }]);
                let selectedCard = cards.filter(c => `[${c.card_type}] ${c.card_number}` == input.card)[0];
                session.setPayment({
                    paymentMethod: 'piraeus.creditcard',
                    paymentToken: selectedCard.id,
                    paymentHashcode: selectedCard.hashcode
                });
            }
            console.log(c.green(`Done.`));
        });
    };
}
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Setting payment method...`);
        session.store.paymentMethod = cmd.type;
        session.store.paymentToken = cmd.token;
        session.store.paymentHashcode = cmd.hash;
        console.log(c.green(`Done.`));
    });
}
;
