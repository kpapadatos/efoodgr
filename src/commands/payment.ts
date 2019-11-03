import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as inquirer from 'inquirer';
import * as EFood from '../index';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('payment')
        .description('Sets the payment.')
        .option('-t, --type [paymentTime]', 'Payment type.')
        .option('--token [paymentToken]', 'Payment token, if not paying with cash.')
        .option('--hash [paymentHashcode]', 'Payment hashcode.')
        .action(handler)
        .consoleHandler = async () => {
            console.log(`Getting payment methods ...`);

            const store = await session.getStore();
            const choices = [];

            if (store.information.has_cash_on_delivery) {
                choices.push('Cash');
            }

            if (store.information.has_credit) {
                choices.push('Credit card');
            }

            const input = await inquirer.prompt([{
                choices,
                message: 'Select a payment method',
                name: 'method',
                type: 'list'
            }]);

            if (input.method === 'Cash') {
                session.setPayment({
                    paymentHashcode: null,
                    paymentMethod: 'cash',
                    paymentToken: null
                });
            }

            if (input.method === 'Credit card') {
                const cards = await session.getCreditCards();

                const cardInput = await inquirer.prompt([{
                    choices: cards.map((card) => `[${card.card_type}] ${card.card_number}`),
                    message: 'Select a card',
                    name: 'card',
                    type: 'list'
                }]);

                const selectedCard = cards.find((card) => `[${card.card_type}] ${card.card_number}` === cardInput.card);

                session.setPayment({
                    paymentHashcode: selectedCard.hashcode,
                    paymentMethod: 'piraeus.creditcard',
                    paymentToken: selectedCard.id
                });
            }

            console.log(c.green(`Done.`));
        };
}

async function handler(cmd: any) {
    console.log(`Setting payment method...`);
    session.store.paymentMethod = cmd.type;
    session.store.paymentToken = cmd.token;
    session.store.paymentHashcode = cmd.hash;
    console.log(c.green(`Done.`));
}
