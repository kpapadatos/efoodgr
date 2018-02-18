/**
 * Describes the location of an address with information
 * that is possibly provided by Google Maps.
 */
export interface Region {
    area: string;
    area_slug: string;
    city: string;
    is_served: boolean;
    latitude: number;
    longitude: number;
}
