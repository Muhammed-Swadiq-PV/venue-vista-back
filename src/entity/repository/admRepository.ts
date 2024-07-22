import { AdmEntity } from "../models/AdmEntity";

export interface admRepository{
    findAdminByEmail(email: string): Promise<AdmEntity | null>;
    validatePassword(email: string, password: string): Promise<boolean>;
}