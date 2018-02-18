import * as EFood from '../index';
import * as inquirer from 'inquirer';
import * as c from 'chalk';

var session: EFood.Session;

export default function (program, s: EFood.Session) {

    session = s;

    program
        .command('payment')
        .description('Sets the payment.')
        .option('-t, --type [paymentTime]', 'Payment type.')
        .option('--token [paymentToken]', 'Payment token, if not paying with cash.')
        .option('--hash [paymentHashcode]', 'Payment hashcode.')
        .action(handler)
        .consoleHandler = async function () {

            console.log(`Getting payment methods ...`);

            let store = await session.getStore();
            let choices = [];

            if (store.information.has_cash_on_delivery)
                choices.push('Cash');

            if (store.information.has_credit)
                choices.push('Credit card');

            let input = await inquirer.prompt([{
                name: 'method',
                message: 'Select a payment method',
                type: 'list',
                choices
            }]);

            if(input.method == 'Cash') {
                session.setPayment({
                    paymentMethod: 'cash',
                    paymentToken: null,
                    paymentHashcode: null
                });
            }

            if (input.method == 'Credit card') {
                let cards = await session.getCreditCards();

                let input = await inquirer.prompt([{
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

        };

}

async function handler(cmd) {
    console.log(`Setting payment method...`);
    session.store.paymentMethod = cmd.type;
    session.store.paymentToken = cmd.token;
    session.store.paymentHashcode = cmd.hash;
    console.log(c.green(`Done.`));
};
