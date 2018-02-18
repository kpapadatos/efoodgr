import { Region } from './Region';

/**
 * Represents an e-food.gr user address.
 */
export interface Address {
    /**
     * This is a string with the entire address' info as a title.
     */
    description: string;

    /**
     * Extra info that goes with every order to this address (e.g. change
     * for 50 euro notes)
     */
    details: string;

    /**
     * Doorbell name.
     */
    doorbell_name: string;

    /**
     * Floor number.
     */
    floor: string;

    /**
     * Unique ID for this address entry.
     */
    id: number;

    /**
     * Whether or not this is the default address for this account.
     */
    is_default: boolean;

    /**
     * This field seems to always be false.
     */
    is_served: boolean;

    /**
     * The phone provided for this address.
     */
    landphone: string;

    /**
     * Same latitude as `Region.latitude`.
     */
    latitude: number;

    /**
     * Same longitude as `Region.longitude`.
     */
    longitude: number;

    /**
     * Street name.
     */
    street: string;

    /**
     * Street number.
     */
    street_number: string;

    /**
     * ZIP postal code.
     */
    zip: string;

    /**
     * A region descriptor, possibly provided by
     * Google Maps.
     */
    region: Region;
}