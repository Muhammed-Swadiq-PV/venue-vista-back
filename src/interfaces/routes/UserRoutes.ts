import { Router } from 'express';
import { UserController } from '../controller/UserController';
import { UserUseCases } from '../../usecases/UserUseCases';
import { MongoDBUserRepository } from '../../frameworks/repository/MongoDBUserRepository';

const userRepository = new MongoDBUserRepository();
const userUseCases = new UserUseCases(userRepository);
const userController = new UserController(userUseCases);

const router: Router = Router();

router.post('/signup', userController.createUser);

export default router;
