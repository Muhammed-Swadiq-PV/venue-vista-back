import { Router } from 'express';
import { UserController } from '../../Controller/Controllers/user/UserController';
import { UserUseCases } from '../../usecases/UserUseCases';

import OrgPostModel from '../../entity/models/OrgPostModel';

import { MongoDBUserRepository } from '../repository/MongoDBUserRepository';
import { MongoDBOrgRepository } from '../repository/MongoDBOrgRepository';
import { authenticateJWT } from '../middleware/orgJWTmiddle';
import checkBlock from '../middleware/checkBlock';

const userRepository = new MongoDBUserRepository();
const orgRepository = new MongoDBOrgRepository(OrgPostModel);

const userUseCases = new UserUseCases(userRepository , orgRepository);
const userController = new UserController(userUseCases);

const router: Router = Router();

router.post('/signup', userController.createUser);
router.post('/google-auth', userController.createGoogleUser)


router.post('/verify', userController.verifyUser);
router.post('/resend-otp' , userController.resendOtp)

router.post('/signin', checkBlock, userController.signInUser);

router.post('/signin-google', checkBlock, userController.signInGoogle);

router.get('/posts/latest', checkBlock, authenticateJWT, (req,res,next) => {
  userController.mainEventHallDetails(req,res,next);
});

router.get('/event-hall/:id', checkBlock, authenticateJWT, (req, res, next) => {
  userController.singleHallDetails(req, res, next);
});

export default router;
