import { Request, Response, NextFunction } from 'express';
import { UserUseCases } from '../../usecases/UserUseCases';

export class UserController {
  private userUseCases: UserUseCases;

  constructor(userUseCases: UserUseCases) {
    this.userUseCases = userUseCases;
  }

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Recieved signup request:', req.body);

      const { name, email, password,} = req.body;
      const user = await this.userUseCases.createUser({ name, email, password });

      console.log('User created successfully:', user);

      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  };
}
