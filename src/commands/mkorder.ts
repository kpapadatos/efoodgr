import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as EFood from '..';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('mkorder')
        .description('Places the order.')
        .action(handler)
        .consoleHandler = handler;
}

async function handler(cmd: any) {
    console.log('Placing order...');

    if (session.store.paymentMethod === 'piraeus.creditcard') {
        const cards = await session.getCreditCards();

        session.store.paymentToken =
            cards.filter((card) => card.hashcode === session.store.paymentHashcode)[0].id;
    }

    await session.validateOrder();

    const orderId = await session.submitOrder();

    if (orderId) {
        let orderStatus: any;

        do {
            orderStatus = await session.getOrderStatus(orderId);
            await new Promise((r) => setTimeout(r, 3e3));
        } while (orderStatus.status === 'submitted');

        if (orderStatus.status === 'accepted') {
            console.log(c.green(`Order complete! Delivery time: ${orderStatus.delivery_time}'`));
        } else {
            console.log(c.red('Order failed.'));
        }
    } else {
        console.log(c.red('Order failed. No orderId.'));
    }
}
