"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const inquirer = require('inquirer');
var session;
function default_1(program, s) {
    session = s;
    program
        .command('setaddr [addressId]')
        .description('Sets the current address.')
        .action(handler)
        .consoleHandler = function () {
        return __awaiter(this, void 0, void 0, function* () {
            session.log(`Getting user addresses ...`);
            let addresses = yield session.getUserAddresses();
            let choices = [];
            for (let address of addresses)
                choices.push(`[${address.id}] ${address.title}`);
            let input = yield inquirer.prompt([{
                    name: 'setaddr',
                    message: 'Select current address',
                    type: 'list',
                    choices: choices
                }]);
            let addressId = addresses[choices.indexOf(input.setaddr)].id;
            session.log(`Setting address to [cyan]${addressId}[/cyan] ...`);
            yield session.setAddress(addressId);
            session.log(`[green]Success![/green]`);
        });
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function handler(addressId) {
    return __awaiter(this, void 0, void 0, function* () {
        session.log(`Setting user address to [cyan]${addressId}[/cyan] ...`);
        yield session.setAddress(addressId);
        session.log(`[green]Success![/green]`);
    });
}
;
