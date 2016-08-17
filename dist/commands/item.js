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
        .command('item [itemCode]')
        .alias('i')
        .description('Gets menu item info.')
        .action(handler);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function handler(itemCode) {
    return __awaiter(this, void 0, void 0, function* () {
        session.log(`Getting item [cyan]${itemCode}[/cyan] info...`);
        let itemOptions = yield session.getItem(itemCode);
        for (let option of itemOptions) {
            session.log(`[cyan][${option.id}] ${option.title}[/cyan]`);
            for (let choice of option.choices)
                session.log(`    [cyan][${choice.id}] [${choice.price.trim()}€] ${choice.title}[/cyan]`);
        }
    });
}
;
