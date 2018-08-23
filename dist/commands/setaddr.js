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
        .command('setaddr [addressId]')
        .description('Sets the current address.')
        .action(handler)
        .consoleHandler = function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (session.store.sessionId === undefined)
                console.log(`You need to login to perform this action. Run ${c.cyan(`login`)} first.`);
            return;
            console.log(`Getting user addresses ...`);
            let addresses = yield session.getUserAddresses();
            let choices = [];
            for (let address of addresses)
                choices.push(`[${address.id}] ${address.description}`);
            let input = yield inquirer.prompt([{
                    name: 'setaddr',
                    message: 'Select current address',
                    type: 'list',
                    choices
                }]);
            let addressId = addresses[choices.indexOf(input.setaddr)].id;
            console.log(`Setting address to ${c.cyan(addressId)} ...`);
            yield session.setAddress(addressId);
            console.log(c.green(`Success!`));
        });
    };
}
exports.default = default_1;
function handler(addressId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Setting user address to ${c.cyan(addressId)} ...`);
        yield session.setAddress(addressId);
        console.log(c.green(`Success!`));
    });
}
;
