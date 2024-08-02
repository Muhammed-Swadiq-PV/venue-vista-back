import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { AdmUseCases } from '../../../usecases/AdmUseCases';
import { generateAdmAccessToken } from "../../../utils/tokenUtils";
import { generateAdmRefreshToken } from "../../../utils/tokenUtils";
import { saveRefreshToken } from "../../../usecases/RefreshTokenUseCases";
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export class AdmController {
    private admUseCases: AdmUseCases;

    constructor(admUseCases: AdmUseCases) {
        this.admUseCases = admUseCases;
    }

    async signinAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;

            // console.log(req.body, 'admin req.body in controller')
            const admin = await this.admUseCases.signin(email, password);

            if (!admin) {
                throw new Error('Admin not found');
            }

 
            const accessToken = generateAdmAccessToken(admin, JWT_SECRET as string);
            const refreshToken = generateAdmRefreshToken(admin, REFRESH_TOKEN_SECRET as string);
      
            await saveRefreshToken( email, refreshToken, 'admin');
            res.status(200).json({ admin, accessToken, refreshToken });
        } catch (error: any) {
            console.error('Error signing in admin:', error.message);
            if (error.message === 'Admin not found' || error.message === 'Invalid password') {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to sign in' });
            }
        }
    }

    async fetchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // console.log('request coming in controller');
            const users = await this.admUseCases.fetchUsers();
            res.status(200).json(users);
        } catch (error: any) {
            console.error('Error fetching users:', error.message);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    async blockUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // console.log( 'is that blocked')
            const { id } = req.params;
            const { isBlocked } = req.body;

            const updatedUser = await this.admUseCases.blockUser(id, isBlocked);

            if (updatedUser) {
                res.status(200).json(updatedUser);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error: any) {
            // console.error('Error updating user status:', error.message);
            res.status(500).json({ error: 'Failed to update user status' });
        }
    }

    async fetchOrganizers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await this.admUseCases.fetchOrganizers();
            res.status(200).json(users);
        } catch (error: any) {
            res.status(500).json({ error: 'failed to fetch organizers' });
        }
    }

    async blockOrganizers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { isBlocked } = req.body;

            const updatedOrganizer = await this.admUseCases.blockOrganizer(id, isBlocked);
            if (updatedOrganizer) {
                res.status(200).json(updatedOrganizer);
            } else {
                res.status(404).json({ error: 'organizer not found' });
            }
        } catch (error: any) {
            res.status(500).json({ error: 'failed to update organizer status' });
        }
    }

}
