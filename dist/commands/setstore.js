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
        .command('setstore [storeId]')
        .description('Sets the store.')
        .action(handler)
        .consoleHandler = function () {
        return __awaiter(this, void 0, void 0, function* () {
            session.log(`Getting stores for address [cyan]${session.cache.env.address}[/cyan] ...`);
            let shops = yield session.getStores();
            let listOptions = [];
            for (let shop of shops)
                listOptions.push(`[${shop.rating}*] [${shop.min}€] [${shop.eta}min] ${shop.name}`);
            yield new Promise(resolve => inquirer.prompt([{
                    name: 'setstore',
                    message: 'Select a store',
                    type: 'list',
                    choices: listOptions
                }]).then(function (input) {
                return __awaiter(this, void 0, void 0, function* () {
                    let storeId = shops[listOptions.indexOf(input.setstore)].id;
                    session.log(`Setting store to [cyan]${storeId}[/cyan] ...`);
                    yield session.setStore(storeId);
                    session.log(`[green]Success![/green]`);
                    resolve();
                });
            }));
        });
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function handler(storeId) {
    return __awaiter(this, void 0, void 0, function* () {
        session.log(`Setting store to [cyan]${storeId}[/cyan] ...`);
        yield session.setStore(storeId);
        session.log(`[green]Success![/green]`);
    });
}
;
