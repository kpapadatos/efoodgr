import { IAPIResponse } from './APIResponse';

export interface ILoginResponse extends IAPIResponse {
    data:
    {
        session_id: string;
        user: {
            cellphone: string;
            consents: Array<{
                timestamp: number;
                type: 'is_adult' | 'is_dob_verified';
                value: boolean;
            }>;
            date_of_birth: string;
            email: string;
            first_name: string;
            first_name_in_vocative: string;
            id: number;
            last_name: string;
            user_name: string;
            verified: true;
        }
    };
}
