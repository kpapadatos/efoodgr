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
            yield handler({ username, password });
        });
    };
}
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Logging in as ${c.cyan(cmd.username)} ...`);
        let success = yield session.login(cmd.username, cmd.password);
        if (success)
            console.log(c.green(`Success!`));
        else
            console.log(c.red(`Login failed.`));
    });
}
;
