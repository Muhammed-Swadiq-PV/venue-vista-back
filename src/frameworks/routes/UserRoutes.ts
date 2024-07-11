import { Router } from 'express';
import { UserController } from '../../Controller/Controllers/user/UserController';
import { UserUseCases } from '../../usecases/UserUseCases';
import { MongoDBUserRepository } from '../repository/MongoDBUserRepository';

const userRepository = new MongoDBUserRepository();
const userUseCases = new UserUseCases(userRepository);
const userController = new UserController(userUseCases);

const router: Router = Router();

router.post('/signup', userController.createUser);
router.post('/signin', userController.signInUser);

export default router;
