import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { AdmUseCases } from '../../../usecases/AdmUseCases';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

export class AdmController {
    private admUseCases: AdmUseCases;

    constructor(admUseCases: AdmUseCases) {
        this.admUseCases = admUseCases;
    }

    async signinAdmin(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            const { email, password } = req.body;
            
            // console.log(req.body, 'admin req.body in controller')
            const admin = await this.admUseCases.signin(email, password);

            if (!admin) {
                throw new Error('Admin not found');
            }

            const token = jwt.sign(
                {  email: admin.email }, 
                JWT_SECRET,
                { expiresIn: '1h' } 
            );
            res.status(200).json({ admin , token});
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
}
