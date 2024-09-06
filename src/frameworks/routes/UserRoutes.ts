import { Router } from 'express';
import { UserController } from '../../Controller/Controllers/user/UserController';
import { UserUseCases } from '../../usecases/UserUseCases';

import OrgPostModel from '../../entity/models/OrgPostModel';

import { MongoDBUserRepository } from '../repository/MongoDBUserRepository';
import { MongoDBOrgRepository } from '../repository/MongoDBOrgRepository';
import { authenticateJWT } from '../middleware/orgJWTmiddle';
import checkBlock from '../middleware/checkBlock';
import OrgModel from '../../entity/models/organizerModel';
import BookingModel from '../../entity/models/weeklyBookingModel';
import { HallBookingRepository } from '../repository/hallBookingRepository';

const userRepository = new MongoDBUserRepository();
const orgRepository = new MongoDBOrgRepository( OrgModel ,OrgPostModel, BookingModel);
const bookingRepository = new HallBookingRepository();

const userUseCases = new UserUseCases(userRepository, orgRepository , bookingRepository);
const userController = new UserController(userUseCases);

const router: Router = Router();

router.post('/signup', userController.createUser);
router.post('/google-auth', userController.createGoogleUser)


router.post('/verify', userController.verifyUser);
router.post('/resend-otp', userController.resendOtp)

router.post('/signin', checkBlock, userController.signInUser);

router.post('/signin-google', checkBlock, userController.signInGoogle);

router.get('/posts/latest', checkBlock, authenticateJWT, (req, res, next) => {
  userController.mainEventHallDetails(req, res, next);
});

router.get('/event-halls', userController.searchEventHallByName)

router.get('/organizers', checkBlock, userController.getOrganizerByLocation);

router.post('/organizers/details', checkBlock, userController.completeDetailsOfNearestOrganizers);

router.get('/organizers/:id', authenticateJWT, checkBlock, (req, res, next) => {
  userController.getOrganizerName(req, res, next);
});

router.get('/orgname/:organizerId', authenticateJWT, checkBlock, (req, res, next) => {
  userController.getOrganizerNameAndRules(req, res, next);
});

router.get('/orgDetails/:postId', authenticateJWT, checkBlock, (req, res, next) => {
  userController.getOrganizerDetails(req, res, next);
});

router.get('/event-hall/:id', checkBlock, authenticateJWT, (req, res, next) => {
  userController.singleHallDetails(req, res, next);
});

router.get('/profile/:userId', checkBlock, userController.getProfile.bind(userController));

router.post('/profile/:userId', checkBlock,userController.postProfile.bind(userController));

router.get('/priceDetails/:organizerId/:selectedDate',authenticateJWT, checkBlock, userController.getPriceDetails.bind(userController));
router.post('/bookings', userController.createBooking.bind(userController));

// router.get('/bookings/:organizerId', userController.getBookingDetails.bind(userController) );

export default router;
