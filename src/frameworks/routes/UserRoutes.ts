import { Router } from 'express';
import { UserController } from '../../Controller/Controllers/user/UserController';
import { UserUseCases } from '../../usecases/UserUseCases';
import { MongoDBUserRepository } from '../repository/MongoDBUserRepository';
import { authenticateJWT } from '../middleware/orgJWTmiddle';

const userRepository = new MongoDBUserRepository();
const userUseCases = new UserUseCases(userRepository);
const userController = new UserController(userUseCases);

const router: Router = Router();

router.post('/signup', userController.createUser);
router.post('/google-auth', userController.createGoogleUser)


router.post('/verify', userController.verifyUser);
router.post('/resend-otp' , userController.resendOtp)
router.post('/signin', userController.signInUser);
router.post('/signin-google', userController.signInGoogle);

export default router;
