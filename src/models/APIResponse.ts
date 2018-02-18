/**
 * The base API response model.
 */
export interface APIResponse {
    data: any;
    error_code: string;
    message: string;
    provisioning: {};
    status: string;
}