import { Request, Response, NextFunction } from "express";
import { AdmUseCases } from '../../../usecases/AdmUseCases';

export class AdmController {
    private admUseCases: AdmUseCases;

    constructor(admUseCases: AdmUseCases) {
        this.admUseCases = admUseCases;
    }

    async signinAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            console.log(req.body, 'admin req.body in controller')
            const admin = await this.admUseCases.signin(email, password);
            res.status(200).json({ admin });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
