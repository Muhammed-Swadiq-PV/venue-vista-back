
export interface OrgEntity {
    id ?: String;
    name: string;
    email: string;
    password?: string;
    otp?: String;
    isVerified?: boolean;
    token?: string;
    isGoogle?: boolean;
}
