import { Request, Response, NextFunction } from "express";
import OrgModel from "../../entity/models/organizerModel";


const organizerBlock = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const email = req.body.email;

        const organizer = await OrgModel.findOne({ email });

        if (organizer && organizer.isBlocked) {
            return res.status(403).json({ error: 'Your account is blocked. Please contact support' });
        }
        next()
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default organizerBlock;