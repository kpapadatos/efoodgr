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
        .command('login')
        .alias('l')
        .description('Log in with your efood.gr account.')
        .option('-u, --username <user>', 'user identification')
        .option('-p, --password <password>', 'user password')
        .action(handler)
        .consoleHandler = function () {
        return __awaiter(this, void 0, void 0, function* () {
            let { username, password } = yield inquirer.prompt([
                {
                    name: 'username',
                    message: 'Enter the email address of your account:'
                },
                {
                    name: 'password',
                    type: 'password',
                    message: 'Enter your password:'
                }
            ]);
            yield handler({ username: username, password: password });
        });
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        session.log(`Logging in as [cyan]${cmd.username}[/cyan] ...`);
        let response = yield session.login(cmd.username, cmd.password);
        if (response.success)
            session.log(`[green]Success![/green]`);
        else
            session.log(`[red]Login failed:[/red] ${response.error.err_msg}`);
    });
}
;
