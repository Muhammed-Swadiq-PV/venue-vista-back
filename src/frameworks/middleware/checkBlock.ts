
import { Request, Response, NextFunction } from 'express';
import UserModel from '../../entity/models/userModel';

const checkBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (user && user.isBlocked) {
      return res.status(403).json({ error: 'Your account is blocked. Please contact support.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default checkBlock;
