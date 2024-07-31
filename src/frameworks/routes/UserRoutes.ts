import { Router } from 'express';
import { UserController } from '../../Controller/Controllers/user/UserController';
import { UserUseCases } from '../../usecases/UserUseCases';

import OrgPostModel from '../../entity/models/OrgPostModel';

import { MongoDBUserRepository } from '../repository/MongoDBUserRepository';
import { MongoDBOrgRepository } from '../repository/MongoDBOrgRepository';
import { authenticateJWT } from '../middleware/orgJWTmiddle';

const userRepository = new MongoDBUserRepository();
const orgRepository = new MongoDBOrgRepository(OrgPostModel);

const userUseCases = new UserUseCases(userRepository , orgRepository);
const userController = new UserController(userUseCases);

const router: Router = Router();

router.post('/signup', userController.createUser);
router.post('/google-auth', userController.createGoogleUser)


router.post('/verify', userController.verifyUser);
router.post('/resend-otp' , userController.resendOtp)
router.post('/signin', userController.signInUser);
router.post('/signin-google', userController.signInGoogle);

router.get('/posts/latest', authenticateJWT, (req,res,next) => {
  userController.mainEventHallDetails(req,res,next);
})

export default router;
