/**
 * Represents an e-food.gr user as returned by the login call.
 */
export interface User {
    id: number;
    cellphone: string;
    email: string;
    first_name: string;
    last_name: string;
    user_name: string;
    verified: boolean;
}