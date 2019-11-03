import { expect } from 'chai';
import * as request from 'request-promise-native';
import { restore, stub } from 'sinon';
import { IAddress, IStore } from '../models';
import { Session } from './Session';

describe('Session', () => {
    let session: Session;
    let addresses: IAddress[];
    let address: IAddress;
    let stores: IStore[];
    let store: IStore;
    let storeWithMenu: IStore;

    beforeEach(() => restore());

    it('should instantiate', () => {
        session = new Session();
    });

    it('should log in', async () => {
        stub(request, 'post').callsFake((options: any) => {
            return Promise.resolve(require('../fixtures/loginResponse')) as request.RequestPromise;
        });

        const isSuccess = await session.login('kosmas.papadatos@gmail.com', '1234567890');

        expect(isSuccess).to.be.true;
    });

    it('should get addresses', async () => {
        addresses = await session.getUserAddresses();

        expect(addresses).to.not.be.empty;
    });

    it('should set address', async () => {
        address = addresses[0];
        await session.setAddress(address.id);
    });

    it('should get stores', async () => {
        stores = await session.getStores({
            latitude: address.latitude,
            longitude: address.longitude,
            onlyOpen: true
        });

        expect(stores).to.not.be.empty;
    });

    it('should set store', async () => {
        store = stores[0];
        await session.setStore(store.id);
    });

    it('should get store with menu', async () => {
        storeWithMenu = await session.getStore();
    });
});
