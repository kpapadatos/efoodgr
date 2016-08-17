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
        .command('addaddress')
        .alias('addaddr')
        .description('Adds an address to your account.')
        .option('--lat [lat]', 'Address latitude.')
        .option('--lon [lon]', 'Address longitude.')
        .option('--street [street]', 'Street name.')
        .option('--sn [sn]', 'Street number.')
        .option('--zip [zip]', 'Zip code.')
        .option('-f, --floor [floor]', 'Floor to deliver to.')
        .option('-n, --name [name]', 'Name on the doorbell.')
        .action(handler);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        session.log(`Adding address to your account...`);
        let response = yield session.addAddress(cmd);
        if (response.error_code != 'success')
            return session.log(`[red]There was an error adding this address: [/red] ${response.message}`);
        session.log('[green]Success![/green]');
    });
}
;
